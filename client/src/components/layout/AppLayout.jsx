import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';
import AddEditRecordModal from '../../features/screenTime/AddEditRecordModal.jsx';

export function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex shrink-0" />

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <Sidebar
            className="relative z-10 w-72 h-full"
            onItemClick={() => setIsMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Navbar
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openAddModal: () => setIsAddModalOpen(true) }} />
        </main>
      </div>

      {/* Global Quick Add Record Modal */}
      <AddEditRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaved={() => {
          setIsAddModalOpen(false);
          // Broadcast custom event so active page refreshes
          window.dispatchEvent(new CustomEvent('screentime-updated'));
        }}
      />
    </div>
  );
}

export default AppLayout;
