import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data } = await API.get('/certificates');
      setCertificates(data);
    } catch (error) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const handleRevoke = async (certificateId) => {
    if (!window.confirm('Are you sure you want to revoke this certificate?')) return;

    try {
      await API.patch(`/certificates/${certificateId}/revoke`);
      toast.success('Certificate revoked');
      fetchCertificates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Revoke failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-800">Admin Dashboard</h1>
            <p className="text-xs text-slate-500">Welcome, {user?.name}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/issue"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              + Issue Certificate
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-slate-800">Issued Certificates</h2>
          <p className="text-sm text-slate-500">{certificates.length} total</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">Loading certificates...</div>
        ) : certificates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center">
            <p className="text-slate-500 text-sm">No certificates issued yet.</p>
            <Link
              to="/admin/issue"
              className="inline-block mt-4 text-indigo-600 text-sm font-medium hover:underline"
            >
              Issue your first certificate →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left">
                    <th className="px-5 py-3.5 font-medium text-slate-600">Certificate ID</th>
                    <th className="px-5 py-3.5 font-medium text-slate-600">Student</th>
                    <th className="px-5 py-3.5 font-medium text-slate-600">Program</th>
                    <th className="px-5 py-3.5 font-medium text-slate-600">Batch</th>
                    <th className="px-5 py-3.5 font-medium text-slate-600">Department</th>
                    <th className="px-5 py-3.5 font-medium text-slate-600">Status</th>
                    <th className="px-5 py-3.5 font-medium text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert) => (
                    <tr key={cert._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                      <td className="px-5 py-4 font-medium text-slate-800">{cert.certificateId}</td>
                      <td className="px-5 py-4 text-slate-700">{cert.studentName}</td>
                      <td className="px-5 py-4 text-slate-600">{cert.program}</td>
                      <td className="px-5 py-4 text-slate-600">{cert.batch}</td>
                      <td className="px-5 py-4 text-slate-600">{cert.department}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            cert.isValid
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {cert.isValid ? 'Valid' : 'Revoked'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {cert.isValid && (
                          <button
                            onClick={() => handleRevoke(cert.certificateId)}
                            className="text-red-600 hover:text-red-700 text-xs font-medium"
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
    </div>
  );
};

export default AdminDashboard;