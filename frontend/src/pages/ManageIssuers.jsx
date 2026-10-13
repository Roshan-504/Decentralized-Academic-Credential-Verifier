import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contract';
import toast from 'react-hot-toast';
import { 
  Wallet, 
  ArrowLeft, 
  ExternalLink, 
  ClipboardPaste, 
  Copy, 
  Check 
} from 'lucide-react';

const ManageIssuers = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [account, setAccount] = useState('');
  const [newIssuer, setNewIssuer] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);

  const checkExistingWallet = useCallback(async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }
    checkExistingWallet();
  }, [navigate, user, checkExistingWallet]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      toast.success('Wallet connected');
    } catch {
      toast.error('Connection rejected');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setNewIssuer(text.trim());
      }
    } catch {
      toast.error('Unable to paste');
    }
  };

  const handleAddIssuer = async (e) => {
    e.preventDefault();

    if (!account) {
      toast.error('Connect MetaMask first');
      return;
    }

    if (!ethers.isAddress(newIssuer.trim())) {
      toast.error('Invalid wallet address');
      return;
    }

    setLoading(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const txToast = toast.loading('Confirm in MetaMask...');
      const tx = await contract.addIssuer(newIssuer.trim());
      toast.dismiss(txToast);

      const waitToast = toast.loading('Confirming on blockchain...');
      await tx.wait();
      toast.dismiss(waitToast);

      toast.success('Issuer added successfully');
      setNewIssuer('');
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error(error.reason || 'Failed to add issuer. Are you the Super Admin?');
    } finally {
      setLoading(false);
    }
  };

  const copyContractAddress = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopiedContract(true);
    toast.success('Copied contract address');
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const isValidAddress = ethers.isAddress(newIssuer.trim());

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#07090e] bg-mesh-pattern relative py-10 px-4">
      <div className="max-w-lg mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
              Manage Issuers
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Authorize wallets to issue certificates
            </p>
          </div>

          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-xl bg-[#0c121e] border border-slate-800 shadow-xl overflow-hidden">
          
          {/* Wallet Bar */}
          <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-300">Admin Wallet</p>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                {account ? `${account.slice(0, 8)}...${account.slice(-6)}` : 'Not connected'}
              </p>
            </div>

            {!account ? (
              <button
                type="button"
                onClick={connectWallet}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 transition cursor-pointer"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect</span>
              </button>
            ) : (
              <span className="text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                Connected
              </span>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleAddIssuer} className="p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  New Issuer Address
                </label>
                <button
                  type="button"
                  onClick={handlePaste}
                  className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition cursor-pointer"
                >
                  <ClipboardPaste className="w-3 h-3" />
                  <span>Paste</span>
                </button>
              </div>

              <input
                type="text"
                value={newIssuer}
                onChange={(e) => setNewIssuer(e.target.value)}
                required
                placeholder="0x..."
                className="w-full bg-[#080d16] text-slate-100 placeholder-slate-600 font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 transition"
              />

              <p className="text-[11px] text-slate-500 mt-1.5">
                Only the contract owner can add new issuers.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !account || (newIssuer.trim() && !isValidAddress)}
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 shadow-md shadow-amber-500/20 disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? 'Adding...' : 'Add Issuer'}
            </button>
          </form>

          {/* Contract Footer */}
          <div className="px-6 py-3.5 border-t border-slate-800 bg-[#090e18] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-mono text-[11px]">Contract:</span>
              <span className="font-mono text-[11px] text-amber-300">
                {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
              </span>
              <button
                onClick={copyContractAddress}
                className="text-slate-500 hover:text-white p-0.5"
                title="Copy Address"
              >
                {copiedContract ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <a
              href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-300 transition"
            >
              <span>Etherscan</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ManageIssuers;