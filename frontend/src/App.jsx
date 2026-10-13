import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import IssueCertificate from './pages/IssueCertificate';
import ManageIssuers from './pages/ManageIssuers';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#0d131f',
            color: '#f1f5f9',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
            borderRadius: '12px',
            fontSize: '13px',
            fontFamily: 'var(--font-sans)',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#064e3b',
            },
            style: {
              border: '1px solid rgba(16, 185, 129, 0.35)',
            },
          },
          error: {
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#881337',
            },
            style: {
              border: '1px solid rgba(244, 63, 94, 0.35)',
            },
          },
        }}
      />
      <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-200">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/issue" element={<IssueCertificate />} />
            <Route path="/admin/issuers" element={<ManageIssuers />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;