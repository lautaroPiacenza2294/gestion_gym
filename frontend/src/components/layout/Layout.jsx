import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, title }) => {
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Área principal */}
      <div className="flex-1 flex flex-col ml-64">
        <Header title={title} />
        
        <main className="flex-1 p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;