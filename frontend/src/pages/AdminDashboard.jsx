import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { 
  FilePlus2, 
  Users, 
  Search, 
  RotateCcw, 
  Copy, 
  Check 
} from 'lucide-react';

const AdminDashboard = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [programFilter, setProgramFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [copiedId, setCopiedId] = useState(null);
  
  const [revokingCertId, setRevokingCertId] = useState(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const fetchCertificates = useCallback(async () => {
    try {
      const { data } = await API.get('/certificates');
      setCertificates(data);
    } catch {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }
    fetchCertificates();
  }, [navigate, user, fetchCertificates]);

  const filtered = useMemo(() => {
    let data = [...certificates];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (c) =>
          c.certificateId?.toLowerCase().includes(q) ||
          c.studentName?.toLowerCase().includes(q) ||
          c.department?.toLowerCase().includes(q)
      );
    }

    if (programFilter !== 'All') {
      data = data.filter((c) => c.program === programFilter);
    }

    if (batchFilter !== 'All') {
      data = data.filter((c) => c.batch === batchFilter);
    }

    if (statusFilter === 'Valid') {
      data = data.filter((c) => c.isValid === true);
    } else if (statusFilter === 'Revoked') {
      data = data.filter((c) => c.isValid === false);
    }

    return data;
  }, [searchQuery, programFilter, batchFilter, statusFilter, certificates]);

  const confirmRevoke = async () => {
    if (!revokingCertId) return;

    try {
      setIsRevoking(true);
      await API.patch(`/certificates/${revokingCertId}/revoke`);
      toast.success('Certificate revoked');
      setRevokingCertId(null);
      fetchCertificates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Revocation failed');
    } finally {
      setIsRevoking(false);
    }
  };

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('Copied ID');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setProgramFilter('All');
    setBatchFilter('All');
    setStatusFilter('All');
  };

  const uniqueBatches = [...new Set(certificates.map((c) => c.batch))].filter(Boolean);

  const totalCount = certificates.length;
  const activeCount = certificates.filter((c) => c.isValid).length;
  const revokedCount = certificates.filter((c) => !c.isValid).length;

  return (
    <div className="min-h-screen bg-[#07090e] bg-mesh-pattern pb-16">
      
      {/* Top Header */}
      <div className="border-b border-amber-500/15 bg-[#090e18]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
                Admin Dashboard
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Welcome, {user?.name || 'Admin'}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                to="/admin/issuers"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
              >
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Manage Issuers</span>
              </Link>

              <Link
                to="/admin/issue"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 shadow-md shadow-amber-500/20 transition cursor-pointer"
              >
                <FilePlus2 className="w-3.5 h-3.5 text-slate-950" />
                <span>+ Issue Certificate</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
            <span className="text-[11px] font-mono uppercase text-slate-400">Total Issued</span>
            <p className="text-2xl font-serif font-bold text-slate-100 mt-1 font-mono">{totalCount}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
            <span className="text-[11px] font-mono uppercase text-slate-400">Valid</span>
            <p className="text-2xl font-serif font-bold text-emerald-400 mt-1 font-mono">{activeCount}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
            <span className="text-[11px] font-mono uppercase text-slate-400">Revoked</span>
            <p className="text-2xl font-serif font-bold text-rose-400 mt-1 font-mono">{revokedCount}</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3.5 rounded-xl bg-[#0c121e] border border-slate-800 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute inset-y-0 left-3 my-auto text-slate-500" />
              <input
                type="text"
                placeholder="Search certificates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#080d16] text-slate-100 placeholder-slate-500 text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            {/* Selects */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                className="bg-[#080d16] border border-slate-800 text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none cursor-pointer"
              >
                <option value="All">All Programs</option>
                <option value="B.Tech">B.Tech</option>
                <option value="MCA">MCA</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Architecture">Architecture</option>
                <option value="Management">Management</option>
              </select>

              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="bg-[#080d16] border border-slate-800 text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none cursor-pointer"
              >
                <option value="All">All Batches</option>
                {uniqueBatches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#080d16] border border-slate-800 text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Valid">Valid</option>
                <option value="Revoked">Revoked</option>
              </select>

              {(searchQuery || programFilter !== 'All' || batchFilter !== 'All' || statusFilter !== 'All') && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 px-2 py-1.5 transition cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}

              <span className="text-slate-500 text-[11px] ml-auto">
                {filtered.length} of {certificates.length}
              </span>
            </div>

          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="rounded-xl bg-[#0c121e] border border-slate-800 py-16 text-center text-xs text-slate-400 font-mono">
            Loading certificates...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl bg-[#0c121e] border border-slate-800 py-16 text-center">
            <p className="text-xs text-slate-400">No certificates found.</p>
          </div>
        ) : (
          <div className="rounded-xl bg-[#0c121e] border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#090e18] text-slate-400 font-mono uppercase text-[10px]">
                    <th className="px-5 py-3">Certificate ID</th>
                    <th className="px-5 py-3">Student</th>
                    <th className="px-5 py-3">Program</th>
                    <th className="px-5 py-3">Batch</th>
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map((cert) => (
                    <tr key={cert._id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-amber-300 font-medium">
                            {cert.certificateId}
                          </span>
                          <button
                            onClick={() => copyToClipboard(cert.certificateId)}
                            className="text-slate-500 hover:text-white p-0.5"
                            title="Copy"
                          >
                            {copiedId === cert.certificateId ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-slate-200 font-medium">
                        {cert.studentName}
                      </td>

                      <td className="px-5 py-3.5 text-slate-300">
                        {cert.program}
                      </td>

                      <td className="px-5 py-3.5 text-slate-400 font-mono">
                        {cert.batch}
                      </td>

                      <td className="px-5 py-3.5 text-slate-400">
                        {cert.department}
                      </td>

                      <td className="px-5 py-3.5">
                        {cert.isValid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Revoked
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {cert.isValid && (
                          <button
                            onClick={() => setRevokingCertId(cert.certificateId)}
                            className="text-rose-400 hover:text-rose-300 text-xs font-medium cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Confirmation Modal */}
      {revokingCertId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-[#0d1422] border border-rose-500/30 p-5 shadow-2xl">
            <h3 className="font-serif text-base font-bold text-slate-100 text-center">
              Revoke Certificate?
            </h3>
            
            <p className="text-xs text-slate-300 text-center mt-2">
              Are you sure you want to revoke <span className="font-mono text-amber-300">{revokingCertId}</span>?
            </p>

            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRevokingCertId(null)}
                disabled={isRevoking}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRevoke}
                disabled={isRevoking}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 transition cursor-pointer disabled:opacity-50"
              >
                {isRevoking ? 'Revoking...' : 'Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;