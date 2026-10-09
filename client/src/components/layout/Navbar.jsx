import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Button } from '../ui/Button.jsx';
import { Moon, Sun, LogOut, Plus, Menu } from 'lucide-react';

export function Navbar({ onOpenAddModal, onToggleMobileMenu }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <span className="text-xs font-medium text-slate-400">Welcome back,</span>
          <h2 className="text-sm font-bold text-white capitalize">{user?.name || 'Explorer'}</h2>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Quick Add Button */}
        <Button
          onClick={onOpenAddModal}
          size="sm"
          variant="primary"
          className="shadow-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Screen Time</span>
        </Button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-white rounded-xl border border-slate-800 hover:bg-slate-900 transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* User initials & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
