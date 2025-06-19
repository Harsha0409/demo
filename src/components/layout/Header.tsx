import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Logo } from '../common/Logo';
import { toast } from 'react-toastify';
import { authService } from '../../services/api';

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
  isAuthenticated: boolean;
  showLogout: boolean;
  setShowLogout: React.Dispatch<React.SetStateAction<boolean>>;
  onOpen: () => void;
  navigate: any;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({
  theme,
  toggleTheme,
  isAuthenticated,
  showLogout,
  setShowLogout,
  onOpen,
  navigate,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  return (
    <header
      className="fixed top-0 left-0 w-full h-12 flex items-center justify-between px-2 sm:px-5 bg-[var(--color-header-bg)] whitespace-nowrap z-40"
    >
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors duration-200"
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-5 sm:w-6 h-5 sm:h-6"
          >
            <path
              d="M18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4Z"
              fill="none"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-gray-700 dark:stroke-gray-300"
            />
            <path
              d="M9 4V20"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-gray-700 dark:stroke-gray-300"
            />
            <circle
              cx="6.5"
              cy="8"
              r="1"
              className="fill-gray-700 dark:fill-gray-300"
            />
            <circle
              cx="6.5"
              cy="12"
              r="1"
              className="fill-gray-700 dark:fill-gray-300"
            />
          </svg>
        </button>
        <Logo className="h-6 sm:h-8 w-auto" />
      </div>
      <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 text-center font-semibold text-base sm:text-lg">
        <span className="text-[#1765f3] dark:text-[#fbe822]">Ṧ</span>.AI
      </div>
      <div className="ml-auto flex items-center gap-1 flex-shrink-0">
        {isAuthenticated ? (
          <div className="relative">
            <div
              className="w-6 sm:w-6 h-5 sm:h-5 cursor-pointer"
              onClick={() => setShowLogout((prev) => !prev)}
            >
              {/* User icon SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <circle
                  cx="256"
                  cy="256"
                  r="256"
                  fill={theme === 'dark' ? '#FBE822' : '#1765F3'}
                />
                <circle
                  cx="256"
                  cy="192"
                  r="80"
                  fill={theme === 'dark' ? '#1765F3' : '#FBE822'}
                />
                <path
                  d="M256 288 C 160 288, 80 352, 80 432 L 432 432 C 432 352, 352 288, 256 288 Z"
                  fill={theme === 'dark' ? '#1765F3' : '#FBE822'}
                />
              </svg>
            </div>
            {showLogout && (
              <button
                onClick={async () => {
                  try {
                    await authService.logout();
                    window.dispatchEvent(new Event('storage'));
                    toast.success('Logged out successfully!');
                    setShowLogout(false);
                    navigate('/', { replace: true });
                    window.location.reload();
                  } catch (error) {
                    console.error('Logout error:', error);
                    toast.error('Failed to logout');
                  }
                }}
                className={`absolute top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 text-xs sm:text-sm rounded-lg font-medium transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-[#FBE822] text-[#1765F3] hover:bg-[#fcef4d]'
                    : 'bg-[#1765F3] text-[#FBE822] hover:bg-[#1e7af3]'
                }`}
              >
                Logout
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onOpen}
            className={`px-3 py-1 text-xs sm:text-sm rounded-lg font-medium transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-[#FBE822] text-[#1765F3] hover:bg-[#fcef4d]'
                : 'bg-[#1765F3] text-[#FBE822] hover:bg-[#1e7af3]'
            }`}
          >
            User Login
          </button>
        )}
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors duration-200"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <Moon size={20} className="text-gray-700" />
          ) : (
            <Sun size={20} className="text-gray-300" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header; 