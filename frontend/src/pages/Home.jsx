import { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contract';
import toast from 'react-hot-toast';

const Home = () => {
  const [certificateId, setCertificateId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const verifyCertificate = async () => {
    if (!certificateId.trim()) {
      toast.error('Please enter Certificate ID');
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const data = await contract.verifyCertificate(certificateId);

      setResult({
        studentName: data[0],
        program: data[1],
        batch: data[2],
        department: data[3],
        course: data[4],
        year: data[5],
        grade: data[6],
        institute: data[7],
        photoHash: data[8],
        isValid: data[9],
        issuedAt: new Date(Number(data[10]) * 1000).toLocaleString(),
        issuedBy: data[11],
      });

      toast.success('Certificate verified');
    } catch (error) {
      console.error(error);
      toast.error('Certificate not found or invalid');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">
            Academic Credential Verification
          </h1>
          <p className="mt-3 text-slate-500 text-base max-w-lg mx-auto">
            Verify the authenticity of academic certificates issued on the blockchain.
          </p>

          <div className="mt-10 flex gap-3 max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Enter Certificate ID (e.g. CERT-2027-CSE-001)"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verifyCertificate()}
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
            <button
              onClick={verifyCertificate}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium px-6 py-3 rounded-xl text-sm transition shadow-sm"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Verification Result
                </p>
                <p className="text-sm text-slate-700 mt-0.5 font-medium">
                  {certificateId}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  result.isValid
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {result.isValid ? 'Valid Certificate' : 'Revoked'}
              </span>
            </div>

            <div className="p-8">
              <div className="flex flex-col sm:flex-row gap-8">
                {/* Photo */}
                <div className="flex-shrink-0">
                  {result.photoHash ? (
                    <img
                      src={result.photoHash}
                      alt={result.studentName}
                      className="w-32 h-40 object-cover rounded-xl border border-slate-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-32 h-40 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-sm">
                      No Photo
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Student Name</p>
                    <p className="text-sm font-medium text-slate-800">{result.studentName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Program</p>
                    <p className="text-sm font-medium text-slate-800">{result.program}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Batch</p>
                    <p className="text-sm font-medium text-slate-800">{result.batch}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Department</p>
                    <p className="text-sm font-medium text-slate-800">{result.department}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Course</p>
                    <p className="text-sm font-medium text-slate-800">{result.course}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Year</p>
                    <p className="text-sm font-medium text-slate-800">{result.year}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Grade / CGPA</p>
                    <p className="text-sm font-medium text-slate-800">{result.grade}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Institute</p>
                    <p className="text-sm font-medium text-slate-800">{result.institute}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium text-slate-500 mb-1">Issued On</p>
                    <p className="text-sm font-medium text-slate-800">{result.issuedAt}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-slate-500 mb-1">Issued On</p>
              <p className="text-sm font-medium text-slate-800">{result.issuedAt}</p>
            </div>

            <div className="sm:col-span-2 pt-2">
              <p className="text-xs font-medium text-slate-500 mb-1">Blockchain Proof</p>
              <a
                href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:underline font-medium"
              >
                View Contract on Etherscan →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;