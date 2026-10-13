import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-base font-semibold text-slate-800 tracking-tight">
          CredentialChain
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link
            to="/"
            className={`${
              location.pathname === '/' ? 'text-indigo-600 font-medium' : 'text-slate-600 hover:text-slate-900'
            } transition`}
          >
            Verify
          </Link>
          <Link
            to="/admin/login"
            className={`${
              isAdmin ? 'text-indigo-600 font-medium' : 'text-slate-600 hover:text-slate-900'
            } transition`}
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;