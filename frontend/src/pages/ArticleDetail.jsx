import { useParams, Link, useNavigate } from "react-router-dom";
import ApiService from "../services/api";
import { useApi } from "../hooks/useApi";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useApi(
    () => ApiService.getArticle(id),
    [id]
  );

  const article = data?.data;

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!article) return <div>Article non trouvé</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/articles"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← Retour aux articles
        </Link>
      </div>

      <article className="bg-white rounded-lg shadow-md p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {article.title}
          </h1>
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <span>Par {article.author.name}</span>
            <span>•</span>
            <span>{article.createdAt}</span>
          </div>
        </header>

        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {article.content}
          </p>
        </div>

        <footer className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/articles/${id}/edit`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Modifier
            </button>
            <button
              onClick={() => {
                if (
                  confirm("Êtes-vous sûr de vouloir supprimer cet article ?")
                ) {
                  // Logique de suppression à implémenter
                  navigate("/articles");
                }
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </footer>
      </article>
    </div>
  );
}
