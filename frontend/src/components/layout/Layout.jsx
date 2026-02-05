import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, title }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* Sidebar fijo a la izquierda */}
      <Sidebar />

      {/* Área principal (Header + Contenido) */}
      {/* ml-64 para compensar el ancho del sidebar fijo */}
      <div className="flex-1 flex flex-col ml-64">
        
        {/* Header en la parte superior */}
        <Header title={title} />

        {/* Contenido que cambia según la página */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;