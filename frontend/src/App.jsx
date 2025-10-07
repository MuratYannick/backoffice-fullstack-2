import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages publiques
import Login from "./pages/Login";
import Register from "./pages/Register";

// Pages protégées
import Home from "./pages/Home";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import ArticleForm from "./pages/ArticleForm";
import Categories from "./pages/Categories";
import CategoryForm from "./pages/CategoryForm";
import Users from "./pages/Users";
import UserForm from "./pages/UserForm";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes protégées */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<Home />} />

          {/* Articles */}
          <Route path="articles">
            <Route index element={<Articles />} />
            <Route path=":id" element={<ArticleDetail />} />
            <Route
              path="new"
              element={
                <ProtectedRoute requiredRoles={["admin", "editor", "author"]}>
                  <ArticleForm />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id/edit"
              element={
                <ProtectedRoute
                  // eslint-disable-next-line
                  customPermissionCheck={(user) => {
                    // Logique de permission personnalisée sera implémentée dans le composant;
                    return true;
                  }}
                >
                  <ArticleForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="pending"
              element={
                <ProtectedRoute requiredRoles={["admin", "editor"]}>
                  <Articles status="pending" />
                </ProtectedRoute>
              }
            />
          </Route>
          {/* Catégories */}
          <Route path="categories">
            <Route
              index
              element={
                <ProtectedRoute requiredRoles={["admin", "editor"]}>
                  <Categories />
                </ProtectedRoute>
              }
            />
            <Route
              path="new"
              element={
                <ProtectedRoute requiredRoles={["admin", "editor"]}>
                  <CategoryForm />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id/edit"
              element={
                <ProtectedRoute requiredRoles={["admin", "editor"]}>
                  <CategoryForm />
                </ProtectedRoute>
              }
            />
          </Route>
          {/* Utilisateurs */}
          <Route path="users">
            <Route
              index
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="new"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <UserForm />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id/edit"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <UserForm />
                </ProtectedRoute>
              }
            />
          </Route>
          {/* Statistiques */}
          <Route
            path="statistics"
            element={
              <ProtectedRoute requiredRoles={["admin"]}>
                <Statistics />
              </ProtectedRoute>
            }
          />
          {/* Profil utilisateur */}
          <Route path="profile" element={<Profile />} />

          {/* Paramètres */}
          <Route path="settings" element={<Settings />} />
          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900">
                  Page non trouvée
                </h1>
                <p className="text-gray-600 mt-2">
                  La page que vous cherchez n'existe pas.
                </p>
              </div>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
export default App;
