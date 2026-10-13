import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contract';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  UserPlus, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Award,
  Wallet,
  Users,
  RotateCcw,
  AlertCircle,
  Pencil,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  X,
  ExternalLink
} from 'lucide-react';

const ManageIssuers = () => {
  const navigate = useNavigate();

  // Safely memoize authenticated user once on mount
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);

  const [issuers, setIssuers] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [onChainStatusMap, setOnChainStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [authorizingId, setAuthorizingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Edit modal state
  const [editingIssuer, setEditingIssuer] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', walletAddress: '', password: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete modal state
  const [deletingIssuer, setDeletingIssuer] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    walletAddress: '',
  });

  // Check on-chain authorization status using read-only RPC
  const checkOnChainStatuses = useCallback(async (issuersList) => {
    if (!Array.isArray(issuersList) || issuersList.length === 0) return;

    try {
      const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const statusResults = {};
      await Promise.all(
        issuersList.map(async (iss) => {
          if (iss.walletAddress && ethers.isAddress(iss.walletAddress)) {
            try {
              const isAuth = await contract.isAuthorized(iss.walletAddress);
              statusResults[iss._id] = Boolean(isAuth);
            } catch {
              statusResults[iss._id] = false;
            }
          } else {
            statusResults[iss._id] = false;
          }
        })
      );
      setOnChainStatusMap(statusResults);
    } catch (err) {
      console.error('Failed to query on-chain statuses:', err);
    }
  }, []);

  // Main data load
  const loadData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const [issuersRes, certsRes] = await Promise.allSettled([
        API.get('/auth/issuers'),
        API.get('/certificates'),
      ]);

      let loadedIssuers = [];
      if (issuersRes.status === 'fulfilled') {
        loadedIssuers = Array.isArray(issuersRes.value.data) ? issuersRes.value.data : [];
        setIssuers(loadedIssuers);
      } else {
        const err = issuersRes.reason;
        console.error('Failed to load issuers:', err);
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          toast.error(err.response?.data?.message || 'Session expired. Please log in again.');
          localStorage.removeItem('user');
          navigate('/admin/login');
          return;
        }
        setFetchError(err?.response?.data?.message || 'Unable to connect to server. Please try again.');
      }

      if (certsRes.status === 'fulfilled') {
        setCertificates(Array.isArray(certsRes.value.data) ? certsRes.value.data : []);
      }

      // Check on-chain statuses in parallel
      if (loadedIssuers.length > 0) {
        checkOnChainStatuses(loadedIssuers);
      }
    } catch (err) {
      console.error('Unexpected error loading data:', err);
      setFetchError('An unexpected error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  }, [navigate, checkOnChainStatuses]);

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }
    // Only admins can access this page
    if (user.role !== 'admin') {
      toast.error('Access restricted to Admin only');
      navigate('/admin/dashboard');
      return;
    }
    loadData();
  }, [user, navigate, loadData]);

  // Compute certificate count per issuer
  const issuerCertCount = useMemo(() => {
    const map = {};
    certificates.forEach((cert) => {
      const issuerId = typeof cert.issuedBy === 'object' && cert.issuedBy !== null
        ? cert.issuedBy._id
        : cert.issuedBy;
      if (issuerId) {
        map[issuerId] = (map[issuerId] || 0) + 1;
      }
    });
    return map;
  }, [certificates]);

  // 1. Create Issuer Handler
  const handleCreateIssuer = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email, and password are required');
      return;
    }

    if (form.walletAddress && !ethers.isAddress(form.walletAddress.trim())) {
      toast.error('Invalid Ethereum wallet address format');
      return;
    }

    setCreating(true);

    try {
      await API.post('/auth/create-issuer', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        walletAddress: form.walletAddress.trim(),
      });

      toast.success('Issuer account created');
      setForm({ name: '', email: '', password: '', walletAddress: '' });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create issuer');
    } finally {
      setCreating(false);
    }
  };

  // 2. Authorize on Blockchain (MetaMask addIssuer call)
  const handleAuthorizeOnChain = async (issuer) => {
    if (!issuer.walletAddress || !ethers.isAddress(issuer.walletAddress.trim())) {
      toast.error('Please add a valid wallet address for this issuer first');
      openEditModal(issuer);
      return;
    }

    if (!window.ethereum) {
      toast.error('Please install MetaMask to authorize issuers on-chain');
      return;
    }

    setAuthorizingId(issuer._id);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const signToast = toast.loading('Confirm signature in MetaMask...');
      const tx = await contract.addIssuer(issuer.walletAddress.trim());
      toast.dismiss(signToast);

      const waitToast = toast.loading('Confirming transaction on Sepolia...');
      await tx.wait();
      toast.dismiss(waitToast);

      toast.success('Issuer authorized on blockchain!');
      setOnChainStatusMap((prev) => ({ ...prev, [issuer._id]: true }));
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error(error.reason || error.message || 'On-chain authorization failed. Are you Super Admin?');
    } finally {
      setAuthorizingId(null);
    }
  };

  // 3. Edit Issuer Handlers
  const openEditModal = (issuer) => {
    setEditingIssuer(issuer);
    setEditForm({
      name: issuer.name || '',
      email: issuer.email || '',
      walletAddress: issuer.walletAddress || '',
      password: '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    if (!editForm.name || !editForm.email) {
      toast.error('Name and email are required');
      return;
    }

    if (editForm.walletAddress && !ethers.isAddress(editForm.walletAddress.trim())) {
      toast.error('Invalid Ethereum wallet address format');
      return;
    }

    setSavingEdit(true);

    try {
      await API.put(`/auth/issuers/${editingIssuer._id}`, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        walletAddress: editForm.walletAddress.trim(),
        password: editForm.password ? editForm.password : undefined,
      });

      toast.success('Issuer details updated');
      setEditingIssuer(null);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update issuer');
    } finally {
      setSavingEdit(false);
    }
  };

  // 4. Delete Issuer Handler
  const handleDeleteIssuer = async () => {
    if (!deletingIssuer) return;

    setIsDeleting(true);

    try {
      await API.delete(`/auth/issuers/${deletingIssuer._id}`);
      toast.success(`Issuer ${deletingIssuer.name} deleted`);
      setDeletingIssuer(null);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete issuer');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const authorizedCount = Object.values(onChainStatusMap).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#07090e] bg-mesh-pattern pb-16">
      
      {/* Top Header */}
      <div className="border-b border-amber-500/15 bg-[#090e18]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/admin/dashboard"
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
                  Manage Issuers
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete account & blockchain control for authorized issuers
                </p>
              </div>
            </div>

            <Link
              to="/admin/dashboard"
              className="text-xs text-amber-400 hover:text-amber-300 font-medium transition"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
            <span className="text-[11px] font-mono uppercase text-slate-400">Total Accounts</span>
            <p className="text-2xl font-serif font-bold text-slate-100 mt-1 font-mono">{issuers.length}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
            <span className="text-[11px] font-mono uppercase text-slate-400">On-Chain Authorized</span>
            <p className="text-2xl font-serif font-bold text-amber-400 mt-1 font-mono">{authorizedCount}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
            <span className="text-[11px] font-mono uppercase text-slate-400">Issued by Accounts</span>
            <p className="text-2xl font-serif font-bold text-emerald-400 mt-1 font-mono">{certificates.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Create Issuer Form (5 cols) */}
          <div className="lg:col-span-4">
            <div className="rounded-xl bg-[#0c121e] border border-slate-800 p-6 shadow-xl sticky top-24">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h2 className="font-serif text-sm font-bold text-slate-100">
                  Create Issuer
                </h2>
              </div>

              <form onSubmit={handleCreateIssuer} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Issuer Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="e.g. Faculty Registrar"
                    className="w-full bg-[#080d16] text-slate-100 placeholder-slate-600 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="issuer@college.edu"
                    className="w-full bg-[#080d16] text-slate-100 placeholder-slate-600 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      placeholder="••••••••"
                      className="w-full bg-[#080d16] text-slate-100 placeholder-slate-600 text-xs sm:text-sm pl-3.5 pr-10 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Wallet Address <span className="text-slate-500">(0x...)</span>
                  </label>
                  <input
                    type="text"
                    value={form.walletAddress}
                    onChange={(e) => setForm({ ...form, walletAddress: e.target.value })}
                    placeholder="0x..."
                    className="w-full bg-[#080d16] text-slate-100 placeholder-slate-600 font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full mt-2 py-2.5 px-4 rounded-lg font-semibold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 shadow-md shadow-amber-500/20 disabled:opacity-50 transition cursor-pointer"
                >
                  {creating ? 'Creating Issuer...' : 'Create Issuer Account'}
                </button>
              </form>
            </div>
          </div>

          {/* List of Issuers (8 cols) */}
          <div className="lg:col-span-8">
            <div className="rounded-xl bg-[#0c121e] border border-slate-800 shadow-xl overflow-hidden">
              
              {/* Table Header */}
              <div className="px-5 py-4 border-b border-slate-800 bg-[#090e18] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <h3 className="font-serif text-sm font-bold text-slate-100">
                    Issuers Registry
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-400">
                    {issuers.length} {issuers.length === 1 ? 'account' : 'accounts'}
                  </span>
                  <button
                    onClick={loadData}
                    disabled={loading}
                    className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
                    title="Refresh list"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-xs text-slate-400 font-mono">
                  Loading issuers...
                </div>
              ) : fetchError ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-rose-300 max-w-sm mx-auto">{fetchError}</p>
                  <button
                    onClick={loadData}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              ) : issuers.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-xs text-slate-300 font-medium">
                    No issuer accounts found
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Use the form on the left to add your first authorized issuer.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-[#090e18]/60 text-slate-400 font-mono uppercase text-[10px]">
                        <th className="px-5 py-3">Issuer Details</th>
                        <th className="px-5 py-3">Status Matrix</th>
                        <th className="px-5 py-3 text-center">Issued</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {issuers.map((issuer) => {
                        const certCount = issuerCertCount[issuer._id] || 0;
                        const isAuthorizedOnChain = onChainStatusMap[issuer._id] === true;
                        const hasWallet = Boolean(issuer.walletAddress && ethers.isAddress(issuer.walletAddress));
                        const isAuthorizing = authorizingId === issuer._id;

                        return (
                          <tr key={issuer._id} className="hover:bg-slate-800/20 transition-colors">
                            
                            {/* Issuer Profile & Wallet */}
                            <td className="px-5 py-4">
                              <div className="flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                  {issuer.name ? issuer.name.charAt(0).toUpperCase() : 'I'}
                                </div>
                                <div className="space-y-1">
                                  <p className="font-semibold text-slate-100">
                                    {issuer.name}
                                  </p>
                                  <p className="text-[11px] text-slate-400">
                                    {issuer.email}
                                  </p>
                                  {hasWallet ? (
                                    <div className="flex items-center gap-1 font-mono text-[10px] text-slate-300">
                                      <Wallet className="w-3 h-3 text-amber-400/80 shrink-0" />
                                      <span>
                                        {issuer.walletAddress.slice(0, 6)}...{issuer.walletAddress.slice(-4)}
                                      </span>
                                      <button
                                        onClick={() => copyToClipboard(issuer.walletAddress, issuer._id)}
                                        className="text-slate-500 hover:text-white p-0.5"
                                        title="Copy Wallet Address"
                                      >
                                        {copiedId === issuer._id ? (
                                          <Check className="w-3 h-3 text-emerald-400" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 italic block">
                                      No wallet linked
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Two Statuses: Backend Account + Blockchain Authorization */}
                            <td className="px-5 py-4">
                              <div className="space-y-1.5">
                                {/* Status 1: Backend Account */}
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-slate-500 font-mono">Backend:</span>
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Created
                                  </span>
                                </div>

                                {/* Status 2: Blockchain Authorization */}
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-slate-500 font-mono">Blockchain:</span>
                                  {isAuthorizedOnChain ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-400/10 text-amber-300 border border-amber-400/25">
                                      <ShieldCheck className="w-3 h-3 text-amber-400" />
                                      Authorized
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700">
                                      <ShieldAlert className="w-3 h-3 text-slate-500" />
                                      Not Authorized
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Certificates Count */}
                            <td className="px-5 py-4 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-900 text-slate-300 border border-slate-800">
                                <Award className="w-3 h-3 text-amber-400" />
                                <span>{certCount}</span>
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                
                                {/* Authorize on Blockchain Button (shown only if not yet authorized) */}
                                {!isAuthorizedOnChain && (
                                  <button
                                    onClick={() => handleAuthorizeOnChain(issuer)}
                                    disabled={isAuthorizing}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-950 bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 disabled:opacity-50 transition cursor-pointer shadow-sm"
                                    title="Authorize wallet address on Ethereum Sepolia contract"
                                  >
                                    {isAuthorizing ? (
                                      <>
                                        <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                        <span>Authorizing...</span>
                                      </>
                                    ) : (
                                      <>
                                        <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                                        <span>Authorize on Blockchain</span>
                                      </>
                                    )}
                                  </button>
                                )}

                                {/* Edit Button */}
                                <button
                                  onClick={() => openEditModal(issuer)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                                  title="Edit Issuer"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={() => setDeletingIssuer(issuer)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                                  title="Delete Issuer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>

                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* Edit Issuer Modal */}
      {editingIssuer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#0d1422] border border-amber-500/30 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="font-serif text-base font-bold text-slate-100 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-amber-400" />
                <span>Edit Issuer Details</span>
              </h3>
              <button
                onClick={() => setEditingIssuer(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  className="w-full bg-[#080d16] text-slate-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                  className="w-full bg-[#080d16] text-slate-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Wallet Address (0x...)
                </label>
                <input
                  type="text"
                  value={editForm.walletAddress}
                  onChange={(e) => setEditForm({ ...editForm, walletAddress: e.target.value })}
                  placeholder="0x..."
                  className="w-full bg-[#080d16] text-slate-100 font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  New Password <span className="text-slate-500">(Leave blank to keep unchanged)</span>
                </label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-[#080d16] text-slate-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 transition font-mono"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingIssuer(null)}
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 transition cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingIssuer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-xl bg-[#0d1422] border border-rose-500/30 p-5 shadow-2xl">
            <h3 className="font-serif text-base font-bold text-slate-100 text-center">
              Delete Issuer Account?
            </h3>
            
            <p className="text-xs text-slate-300 text-center mt-2">
              Are you sure you want to delete <span className="font-semibold text-amber-300">{deletingIssuer.name}</span> ({deletingIssuer.email})?
              <br />
              This will remove their login access from the system.
            </p>

            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeletingIssuer(null)}
                disabled={isDeleting}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteIssuer}
                disabled={isDeleting}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageIssuers;