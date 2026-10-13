import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contract';
import API from '../utils/api';
import toast from 'react-hot-toast';

const IssueCertificate = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [form, setForm] = useState({
    certificateId: '',
    studentName: '',
    program: 'B.Tech',
    batch: '',
    department: '',
    course: '',
    year: '',
    grade: '',
    institute: '',
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState('');

  useEffect(() => {
    if (!user) navigate('/admin/login');
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      toast.success('Wallet connected');
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const uploadToCloudinary = async () => {
    if (!photo) return '';

    const data = new FormData();
    data.append('file', photo);
    data.append('upload_preset', 'academic_certs'); // your preset name
    data.append('cloud_name', 'dqvxgvv6n');

    const res = await fetch('https://api.cloudinary.com/v1_1/dqvxgvv6n/image/upload', {
      method: 'POST',
      body: data,
    });

    const result = await res.json();
    return result.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!account) {
      toast.error('Please connect MetaMask first');
      return;
    }

    setLoading(true);

    try {
      // 1. Upload photo
      toast.loading('Uploading photo...');
      const photoUrl = await uploadToCloudinary();
      toast.dismiss();

      // 2. Blockchain transaction
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      toast.loading('Confirm transaction in MetaMask...');
      const tx = await contract.issueCertificate(
        form.certificateId,
        form.studentName,
        form.program,
        form.batch,
        form.department,
        form.course,
        form.year,
        form.grade,
        form.institute,
        photoUrl || ''
      );

      toast.loading('Waiting for blockchain confirmation...');
      await tx.wait();

      // 3. Save to backend
      await API.post('/certificates', {
        ...form,
        photoUrl,
        blockchainTxHash: tx.hash,
      });

      toast.dismiss();
      toast.success('Certificate issued successfully!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error(error.reason || error.message || 'Failed to issue certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-800">Issue Academic Certificate</h1>
          <p className="text-slate-500 text-sm mt-1">Fill the details and publish on blockchain</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Wallet Section */}
          <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Issuer Wallet</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {account
                  ? `${account.slice(0, 8)}...${account.slice(-6)}`
                  : 'Not connected'}
              </p>
            </div>
            {!account ? (
              <button
                onClick={connectWallet}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition"
              >
                Connect MetaMask
              </button>
            ) : (
              <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-medium">
                Connected
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Certificate ID
                  </label>
                  <input
                    type="text"
                    name="certificateId"
                    value={form.certificateId}
                    onChange={handleChange}
                    required
                    placeholder="CERT-2027-CSE-001"
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Student Name
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    value={form.studentName}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Program
                  </label>
                  <select
                    name="program"
                    value={form.program}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="MCA">MCA</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Management">Management</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Batch
                    </label>
                    <input
                      type="text"
                      name="batch"
                      value={form.batch}
                      onChange={handleChange}
                      required
                      placeholder="2027"
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      required
                      placeholder="Computer Science"
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Course / Specialization
                  </label>
                  <input
                    type="text"
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    required
                    placeholder="B.Tech in Computer Science"
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Year
                    </label>
                    <input
                      type="text"
                      name="year"
                      value={form.year}
                      onChange={handleChange}
                      required
                      placeholder="2027"
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Grade / CGPA
                    </label>
                    <input
                      type="text"
                      name="grade"
                      value={form.grade}
                      onChange={handleChange}
                      required
                      placeholder="8.7"
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Institute / College
                  </label>
                  <input
                    type="text"
                    name="institute"
                    value={form.institute}
                    onChange={handleChange}
                    required
                    placeholder="ABC Engineering College"
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Student Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer border border-dashed border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-600 hover:border-indigo-400 hover:bg-indigo-50 transition flex-1 text-center">
                      {photo ? photo.name : 'Choose Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                    {photoPreview && (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !account}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition"
              >
                {loading ? 'Issuing on Blockchain...' : 'Issue Certificate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IssueCertificate;