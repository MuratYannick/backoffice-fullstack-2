import { Link, useLocation } from "react-router-dom";

export default function Navigation() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const linkClass = (path) => `
    px-4 py-2 rounded-md text-sm font-medium transition-colors
    ${
      isActive(path)
        ? "bg-blue-100 text-blue-700"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    }
  `;
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              📊 BackOffice
            </Link>
          </div>

          <div className="flex space-x-4">
            <Link to="/" className={linkClass("/")}>
              Accueil
            </Link>
            <Link to="/articles" className={linkClass("/articles")}>
              Articles
            </Link>
            <Link to="/users" className={linkClass("/users")}>
              Utilisateurs
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
