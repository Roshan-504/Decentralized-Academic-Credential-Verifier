import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contract';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { 
  Wallet, 
  Upload, 
  GraduationCap, 
  Trash2, 
  ArrowLeft 
} from 'lucide-react';

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

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview('');
  };

  const uploadToCloudinary = async () => {
    if (!photo) return '';

    const data = new FormData();
    data.append('file', photo);
    data.append('upload_preset', 'academic_certs');
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
      const photoToast = toast.loading('Uploading photo...');
      const photoUrl = await uploadToCloudinary();
      toast.dismiss(photoToast);

      // 2. Blockchain transaction
      const txToast = toast.loading('Confirm in MetaMask...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.issueCertificate(
        form.certificateId.trim(),
        form.studentName.trim(),
        form.program,
        form.batch.trim(),
        form.department.trim(),
        form.course.trim(),
        form.year.trim(),
        form.grade.trim(),
        form.institute.trim(),
        photoUrl || ''
      );

      toast.dismiss(txToast);
      const waitToast = toast.loading('Confirming on blockchain...');
      await tx.wait();
      toast.dismiss(waitToast);

      // 3. Save to backend
      await API.post('/certificates', {
        ...form,
        photoUrl,
        blockchainTxHash: tx.hash,
      });

      toast.success('Certificate issued successfully');
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
    <div className="min-h-screen bg-[#07090e] bg-mesh-pattern pb-16">
      
      {/* Top Header */}
      <div className="border-b border-amber-500/15 bg-[#090e18]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <Link
                to="/admin/dashboard"
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
                  Issue Certificate
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Publish a new credential to the blockchain
                </p>
              </div>
            </div>

            {/* Wallet Button */}
            <div>
              {account ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={connectWallet}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 shadow-md shadow-amber-500/20 transition cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5 text-slate-950" />
                  <span>Connect MetaMask</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="rounded-xl bg-[#0c121e] border border-slate-800 p-6 sm:p-7 shadow-xl">
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Identity */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase text-amber-400 font-semibold tracking-wider">
                    Student Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Certificate ID *
                      </label>
                      <input
                        type="text"
                        name="certificateId"
                        value={form.certificateId}
                        onChange={handleChange}
                        required
                        placeholder="CERT-2027-CSE-001"
                        className="w-full bg-[#080d16] text-slate-100 placeholder-slate-600 font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Student Name *
                      </label>
                      <input
                        type="text"
                        name="studentName"
                        value={form.studentName}
                        onChange={handleChange}
                        required
                        placeholder="Full Name"
                        className="w-full bg-[#080d16] text-slate-100 placeholder-slate-600 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic */}
                <div className="space-y-4 pt-4 border-t border-slate-800/80">
                  <h3 className="text-xs font-mono uppercase text-amber-400 font-semibold tracking-wider">
                    Academic Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Program *
                      </label>
                      <select
                        name="program"
                        value={form.program}
                        onChange={handleChange}
                        className="w-full bg-[#080d16] text-slate-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 transition cursor-pointer"
                      >
                        <option value="B.Tech">B.Tech</option>
                        <option value="MCA">MCA</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Architecture">Architecture</option>
                        <option value="Management">Management</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Department *
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        required
                        placeholder="Computer Science"
                        className="w-full bg-[#080d16] text-slate-100 placeholder-slate-600 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Course *
                      </label>
                      <input
                        type="text"
                        name="course"
                        value={form.course}
                        onChange={handleChange}
                        required
                        placeholder="B.Tech in CS"
                        className="w-full bg-[#080d16] text-slate-100 placeholder-slate-600 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Performance & Institute */}
                <div className="space-y-4 pt-4 border-t border-slate-800/80">
                  <h3 className="text-xs font-mono uppercase text-amber-400 font-semibold tracking-wider">
                    Performance & Institute
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Batch *
                      </label>
                      <input
                        type="text"
                        name="batch"
                        value={form.batch}
                        onChange={handleChange}
                        required
                        placeholder="2027"
                        className="w-full bg-[#080d16] text-slate-100 placeholder-slate-600 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Year *
                      </label>
                      <input
                        type="text"
                        name="year"
                        value={form.year}
                        onChange={handleChange}
                        required
                        placeholder="2027"
                        className="w-full bg-[#080d16] text-slate-100 placeholder-slate-600 font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Grade / CGPA *
                      </label>
                      <input
                        type="text"
                        name="grade"
                        value={form.grade}
                        onChange={handleChange}
                        required
                        placeholder="8.8"
                        className="w-full bg-[#080d16] text-slate-100 placeholder-slate-600 font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Institute / College *
                    </label>
                    <input
                      type="text"
                      name="institute"
                      value={form.institute}
                      onChange={handleChange}
                      required
                      placeholder="Institute Name"
                      className="w-full bg-[#080d16] text-slate-100 placeholder-slate-600 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="pt-4 border-t border-slate-800/80">
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Student Photo
                  </label>

                  <div className="flex items-center gap-4">
                    <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-dashed border-slate-800 hover:border-amber-500/40 rounded-lg bg-[#080d16] cursor-pointer transition text-xs text-slate-400 hover:text-white">
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span>{photo ? photo.name : 'Choose photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>

                    {photoPreview && (
                      <div className="relative shrink-0">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-12 h-14 rounded-lg object-cover border border-slate-700"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-rose-600 text-white"
                          title="Remove"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/dashboard')}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading || !account}
                    className="px-5 py-2.5 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 shadow-md shadow-amber-500/20 disabled:opacity-50 transition cursor-pointer"
                  >
                    {loading ? 'Issuing...' : 'Issue Certificate'}
                  </button>
                </div>

              </form>
            </div>
          </div>

          {/* Mini Preview */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-2 font-medium">
                Preview
              </span>

              <div className="rounded-xl bg-[#0c121e] border border-amber-500/20 p-5 shadow-xl">
                <div className="text-center pb-3 border-b border-slate-800">
                  <p className="font-serif text-xs font-bold text-slate-200">
                    {form.institute || 'Institute Name'}
                  </p>
                  <p className="text-[10px] font-mono text-amber-300 mt-0.5">
                    {form.certificateId || 'CERT-ID'}
                  </p>
                </div>

                <div className="py-4 text-center">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-14 h-16 rounded-lg object-cover mx-auto mb-2 border border-slate-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-600 flex items-center justify-center mx-auto mb-2 font-serif text-sm">
                      {form.studentName?.charAt(0) || '?'}
                    </div>
                  )}
                  <h4 className="font-serif text-sm font-bold text-slate-100">
                    {form.studentName || 'Student Name'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {form.course || 'Course'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-800 font-mono">
                  <div className="bg-[#080d16] p-2 rounded border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">PROGRAM</span>
                    <span className="text-slate-300 font-medium">{form.program}</span>
                  </div>
                  <div className="bg-[#080d16] p-2 rounded border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">BATCH</span>
                    <span className="text-slate-300">{form.batch || '—'}</span>
                  </div>
                  <div className="bg-[#080d16] p-2 rounded border border-slate-800/80 col-span-2">
                    <span className="text-slate-500 block text-[10px]">GRADE</span>
                    <span className="text-amber-400 font-bold">{form.grade || '—'}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default IssueCertificate;