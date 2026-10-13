import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contract';
import toast from 'react-hot-toast';

const ManageIssuers = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [account, setAccount] = useState('');
  const [newIssuer, setNewIssuer] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleAddIssuer = async (e) => {
    e.preventDefault();

    if (!account) {
      toast.error('Connect MetaMask first');
      return;
    }

    if (!ethers.isAddress(newIssuer)) {
      toast.error('Invalid wallet address');
      return;
    }

    setLoading(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      toast.loading('Confirm transaction in MetaMask...');
      const tx = await contract.addIssuer(newIssuer);
      await tx.wait();

      toast.dismiss();
      toast.success('Issuer added successfully!');
      setNewIssuer('');
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error(error.reason || 'Failed to add issuer. Are you the Super Admin?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Manage Issuers</h1>
            <p className="text-sm text-slate-500 mt-1">
              Authorize other college wallets to issue certificates
            </p>
          </div>
          <Link to="/admin/dashboard" className="text-sm text-indigo-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Wallet */}
          <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Super Admin Wallet</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {account ? `${account.slice(0, 8)}...${account.slice(-6)}` : 'Not connected'}
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

          <form onSubmit={handleAddIssuer} className="p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                New Issuer Wallet Address
              </label>
              <input
                type="text"
                value={newIssuer}
                onChange={(e) => setNewIssuer(e.target.value)}
                required
                placeholder="0x..."
                className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Only the Super Admin (contract deployer) can add new issuers.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !account}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition"
            >
              {loading ? 'Adding Issuer...' : 'Add Issuer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageIssuers;