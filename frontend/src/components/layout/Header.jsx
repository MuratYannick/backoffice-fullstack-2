import { useState } from "react";
import { Link } from "react-router-dom";
export default function Header({ onMenuToggle }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side - Menu toggle et Logo */}
        <div className="flex items-center">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100
focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4
6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <Link to="/" className="flex items-center ml-2">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justifycenter">
                <span className="text-white font-bold">B</span>
              </div>
            </div>
            <div className="hidden md:block ml-3">
              <span className="text-xl font-bold text-gray-900">
                BackOffice
              </span>
            </div>
          </Link>
        </div>
        {/* Center - Search bar (hidden on mobile) */}
        <div className="hidden md:block flex-1 max-w-lg mx-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointerevents-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21
21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Rechercher..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md
leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400
focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        {/* Right side - Notifications et User menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100
rounded-md"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15
17h5l-3.5-3.5a1.5 1.5 0 010-2.12l.707-.707a1 1 0 001.414 0L21 13.25V17z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2
2 4-4"
              />
            </svg>
          </button>
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center p-2 rounded-md text-gray-600 hover:text-gray-900
hover:bg-gray-100"
            >
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="User"
                className="h-8 w-8 rounded-full"
              />
              <span className="hidden md:block ml-2 text-sm font-medium">
                Admin
              </span>
            </button>
            {/* Dropdown */}
            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1
z-50"
              >
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700
hover:bg-gray-100"
                >
                  Mon profil
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-gray-700
hover:bg-gray-100"
                >
                  Paramètres
                </Link>
                <hr className="my-1" />
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700
hover:bg-gray-100"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
