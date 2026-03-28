import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function NavBar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">CARIP</h1>
        <div className="flex gap-6">
          <Link
            to="/"
            className={`${
              isActive('/') ? 'text-primary font-bold' : 'text-gray-700'
            } hover:text-primary font-medium`}
          >
            Dashboard
          </Link>
          <Link
            to="/alerts"
            className={`${
              isActive('/alerts') ? 'text-primary font-bold' : 'text-gray-700'
            } hover:text-primary font-medium`}
          >
            Alerts
          </Link>
          <Link
            to="/pep/PEP-KZ-00001"
            className={`${
              isActive('/pep') ? 'text-primary font-bold' : 'text-gray-700'
            } hover:text-primary font-medium`}
          >
            Sample PEP Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}
