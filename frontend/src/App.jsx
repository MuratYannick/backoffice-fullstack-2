import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import Categories from "./pages/Categories";
import Users from "./pages/Users";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="articles" element={<Articles />} />
        <Route path="articles/:id" element={<ArticleDetail />} />
        <Route path="categories" element={<Categories />} />
        <Route path="users" element={<Users />} />
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
  );
}
export default App;
