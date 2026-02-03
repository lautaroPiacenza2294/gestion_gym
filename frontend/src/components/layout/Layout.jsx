import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, title }) => {
  return (
    <div className="layout">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar />

      {/* Área principal (Header + Contenido) */}
      <div className="main-area">
        {/* Header en la parte superior */}
        <Header title={title} />

        {/* Contenido que cambia según la página */}
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;