import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/api";
import { useApi } from "../hooks/useApi";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function Articles() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useApi(() =>
    ApiService.getArticles()
  );
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    userId: 1, // Temporaire
    categoryId: 1, // Temporaire
  });
  const articles = data?.data || [];
  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (value) => (
        <span className="text-gray-500 font-mono text-xs">#{value}</span>
      ),
    },
    {
      key: "title",
      label: "Titre",
      sortable: true,
      render: (value, row) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate">{value}</div>
          {row.summary && (
            <div className="text-sm text-gray-500 truncate">{row.summary}</div>
          )}
        </div>
      ),
    },
    {
      key: "author",
      label: "Auteur",
      sortable: true,
      render: (author) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-blue-600 font-medium text-sm">
              {author?.name?.charAt(0) || "?"}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {author?.name || "Inconnu"}
            </div>
            <div className="text-sm text-gray-500">{author?.role || ""}</div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Catégorie",
      sortable: true,
      render: (category) =>
        category ? (
          <Badge
            variant="primary"
            style={{
              backgroundColor: category.color + "20",
              color: category.color,
            }}
          >
            {category.name}
          </Badge>
        ) : (
          <Badge variant="default">Non classé</Badge>
        ),
    },
    {
      key: "status",
      label: "Statut",
      sortable: true,
      render: (status) => {
        const variants = {
          published: "success",
          draft: "warning",
          archived: "default",
        };
        const labels = {
          published: "Publié",
          draft: "Brouillon",
          archived: "Archivé",
        };
        return (
          <Badge variant={variants[status]}>{labels[status] || status}</Badge>
        );
      },
    },
    {
      key: "viewCount",
      label: "Vues",
      sortable: true,
      render: (count) => (
        <div className="flex items-center">
          <svg
            className="h-4 w-4 text-gray-400 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span className="text-sm text-gray-600">{count || 0}</span>
        </div>
      ),
    },
    {
      key: "publishedAt",
      label: "Publication",
      sortable: true,
      render: (date) =>
        date ? (
          <div className="text-sm text-gray-600">
            {new Date(date).toLocaleDateString("fr-FR")}
          </div>
        ) : (
          <span className="text-gray-400">Non publié</span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/articles/${row.id}`);
            }}
          >
            Voir
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implémenter la suppression
            }}
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ];
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ApiService.createArticle(formData);
      setFormData({
        title: "",
        summary: "",
        content: "",
        userId: 1,
        categoryId: 1,
      });
      setShowForm(false);
      refetch();
    } catch (error) {
      alert("Erreur lors de la création: " + error.message);
    }
  };
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600">
            Gérez vos articles de blog et publications
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annuler" : "Nouvel Article"}
        </Button>
      </div>
      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {articles.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Publiés</p>
              <p className="text-2xl font-bold text-gray-900">
                {articles.filter((a) => a.status === "published").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Brouillons</p>
              <p className="text-2xl font-bold text-gray-900">
                {articles.filter((a) => a.status === "draft").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vues totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {articles.reduce((sum, a) => sum + (a.viewCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Formulaire de création */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">
            Créer un nouvel article
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Résumé
                </label>
                <input
                  type="text"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenu
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="flex space-x-3">
              <Button type="submit" variant="primary">
                Créer l'article
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}
      {/* Tableau des articles */}
      <Table
        columns={columns}
        data={articles}
        loading={loading}
        onRowClick={(article) => navigate(`/articles/${article.id}`)}
        sortable={true}
      />
    </div>
  );
}
