import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { usePermissions } from "../ProtectedRoute";
import {
  Home,
  FileText,
  Users,
  Folder,
  BarChart3,
  Settings,
  ChevronDown,
  Plus,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

// eslint-disable-next-line
const SidebarItem = ({to, icon: Icon, label, badge = null, children = null}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + "/");
  if (children) {
    return (
      <div className="mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
        >
          <div className="flex items-center">
            <Icon className="mr-3 h-5 w-5" />
            {label}
          </div>
          <div className="flex items-center">
            {badge && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr2">
                {badge}
              </span>
            )}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </button>

        {isOpen && <div className="ml-8 mt-1 space-y-1">{children}</div>}
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) => `flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
    >
      <Icon className="mr-3 h-5 w-5" />
      {label}
      {badge && (
        <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </NavLink>
  );
};

// eslint-disable-next-line
const SubSidebarItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `flex items-center px-3 py-2 text-sm rounded-md ${isActive ? "bg-blue-50 text-blue-600 border-l-2 border-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}
  >
    <Icon className="mr-3 h-4 w-4" />
    {label}
  </NavLink>
);

export default function Sidebar({ isOpen, onClose }) {
  const {
    user,
    canManageUsers,
    canManageCategories,
    canCreateArticles,
    isAdmin,
    isEditor,
  } = usePermissions();

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray200">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justifycenter">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">
                BackOffice
              </span>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justifycenter">
                <span className="text-blue-600 font-medium">
                  {user?.name?.charAt(0) || "?"}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <SidebarItem to="/" icon={Home} label="Dashboard" />
            {/* Articles */}
            <SidebarItem to="/articles" icon={FileText} label="Articles">
              <SubSidebarItem to="/articles" icon={Eye} label="Voir tous" />
              {canCreateArticles && (
                <SubSidebarItem to="/articles/new" icon={Plus} label="Créer" />
              )}
              {(isAdmin || isEditor) && (
                <SubSidebarItem
                  to="/articles/pending"
                  icon={Edit}
                  label="En attente"
                />
              )}
            </SidebarItem>

            {/* Catégories */}
            {canManageCategories && (
              <SidebarItem to="/categories" icon={Folder} label="Catégories">
                <SubSidebarItem
                  to="/categories"
                  icon={Eye}
                  label="Voir toutes"
                />
                <SubSidebarItem
                  to="/categories/new"
                  icon={Plus}
                  label="Créer"
                />
              </SidebarItem>
            )}

            {/* Utilisateurs */}
            {canManageUsers && (
              <SidebarItem to="/users" icon={Users} label="Utilisateurs">
                <SubSidebarItem to="/users" icon={Eye} label="Voir tous" />
                <SubSidebarItem to="/users/new" icon={Plus} label="Créer" />
              </SidebarItem>
            )}

            {/* Statistiques */}
            {isAdmin && (
              <SidebarItem
                to="/statistics"
                icon={BarChart3}
                label="Statistiques"
              />
            )}

            {/* Paramètres */}
            <SidebarItem to="/settings" icon={Settings} label="Paramètres" />
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              © 2024 BackOffice App
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
