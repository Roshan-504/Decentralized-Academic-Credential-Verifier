import { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contract';
import toast from 'react-hot-toast';
import { 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  GraduationCap, 
  Printer 
} from 'lucide-react';

const Home = () => {
  const [certificateId, setCertificateId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const sampleId = 'CERT-2027-CSE-001';

  const verifyCertificate = async () => {
    if (!certificateId.trim()) {
      toast.error('Please enter a Certificate ID');
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const data = await contract.verifyCertificate(certificateId.trim());

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
        issuedAt: new Date(Number(data[10]) * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#07090e] bg-mesh-pattern relative pb-16">
      
      {/* Hero / Search Section */}
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-10 text-center">
        
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight">
          Verify Academic Credentials
        </h1>

        <p className="mt-2.5 text-slate-400 text-sm max-w-md mx-auto">
          Verify academic certificates issued on the blockchain.
        </p>

        {/* Search Bar */}
        <div className="mt-8">
          <div className="flex gap-2 max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Enter Certificate ID (e.g. CERT-2027-CSE-001)"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verifyCertificate()}
              className="flex-1 bg-[#0c121e] text-slate-100 placeholder-slate-500 font-mono text-sm px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />

            <button
              onClick={verifyCertificate}
              disabled={loading}
              className="px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 active:scale-[0.99] text-slate-950 shadow-md shadow-amber-500/20 disabled:opacity-50 transition cursor-pointer shrink-0"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          {/* Sample ID Pill */}
          <div className="mt-3 text-xs text-slate-500">
            <span>Sample: </span>
            <button
              onClick={() => setCertificateId(sampleId)}
              className="font-mono text-amber-400/80 hover:text-amber-300 underline underline-offset-2 transition cursor-pointer"
            >
              {sampleId}
            </button>
          </div>
        </div>

      </div>

      {/* Verification Result Card */}
      {result && (
        <div className="max-w-3xl mx-auto px-4 animate-in fade-in duration-300">
          <div className="rounded-2xl bg-[#0c121e] border border-amber-500/25 shadow-2xl overflow-hidden print-card">
            
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between gap-4">
              <div>
                <p className="font-serif text-base font-bold text-slate-100">
                  {result.institute}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-xs text-amber-300">
                    {certificateId}
                  </span>
                  <button
                    onClick={() => copyToClipboard(certificateId)}
                    className="text-slate-400 hover:text-white transition"
                    title="Copy ID"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {result.isValid ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Valid
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-medium">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    Revoked
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                
                {/* Photo */}
                <div className="shrink-0 mx-auto sm:mx-0">
                  {result.photoHash ? (
                    <img
                      src={result.photoHash}
                      alt={result.studentName}
                      className="w-28 h-36 rounded-xl object-cover border border-amber-500/20 shadow-md"
                    />
                  ) : (
                    <div className="w-28 h-36 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-500 text-xs">
                      <GraduationCap className="w-6 h-6 mb-1 text-slate-600" />
                      No Photo
                    </div>
                  )}
                </div>

                {/* Details Grid */}
                <div className="flex-1 w-full space-y-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-slate-400">Student Name</span>
                    <h3 className="font-serif text-xl font-bold text-slate-100">
                      {result.studentName}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Program</span>
                      <span className="text-slate-200 font-medium">{result.program}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Department</span>
                      <span className="text-slate-200 font-medium">{result.department}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Course</span>
                      <span className="text-slate-200 font-medium">{result.course}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Batch</span>
                      <span className="text-amber-300 font-mono">{result.batch}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Year</span>
                      <span className="text-slate-200 font-mono">{result.year}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Grade / CGPA</span>
                      <span className="text-amber-400 font-mono font-semibold">{result.grade}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Issued On</span>
                      <span className="text-slate-300 font-mono">{result.issuedAt}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Footer Actions */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <a
                  href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium transition"
                >
                  <span>View Contract on Etherscan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Print</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Home;