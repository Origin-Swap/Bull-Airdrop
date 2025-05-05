import { useState } from 'react';
import { Link } from 'react-router-dom';
import CustomConnectButton from './CustomConnectButton';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-100 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
        {/* Logo and Hamburger (mobile) */}
        <div className="flex items-center">
          <img src="/images/Logo1.png" className="w-6 h-6 mr-2" />
          <span className="text-black font-medium">Bullpad</span>

          {/* Mobile hamburger button */}
          <button
            className="md:hidden ml-4 text-gray-700 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-4">
          <Link to="/" className="text-black hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
            Airdrop
          </Link>
          <Link to="https://bullpad.org/" className="text-black hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
            Website
          </Link>
          <Link to="https://app.bullpad.org" className="text-black hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
            Trade
          </Link>
          <Link to="https://launch.bullpad.org/" className="text-black hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
            Launchpad
          </Link>
        </div>

        {/* Connect Button - Hidden on mobile when menu is open */}
        <div className={`${isMenuOpen ? 'hidden' : 'flex'} md:flex items-center`}>
          <CustomConnectButton />
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-gray-200 z-10 p-4 shadow-lg">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-black hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Airdrop
              </Link>
              <Link
                to="https://bullpad.org"
                className="text-black hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Website
              </Link>
              <Link
                to="https://app.bullpad.org"
                className="text-black hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Trade
              </Link>
              <Link
                to="https://launch.bullpad.org/"
                className="text-black hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Launchpad
              </Link>
              <div className="pt-2">
                <CustomConnectButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
