import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/api";
import { useToast } from "../hooks/useToast";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ArticleForm from "../components/ArticleForm";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import ToastContainer from "../components/ui/Toast";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
export default function Articles() {
  const navigate = useNavigate();
  const { toasts, success, error, removeToast } = useToast();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);

  // États UI
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // États confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingArticle, setDeletingArticle] = useState(null);
  const [deleting, setDeleting] = useState(false);
  // Pagination et filtres
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  // const [filters, setFilters] = useState({
  const [filters] = useState({
    status: "",
    search: "",
  });
  const loadArticles = async (page = 1, newFilters = filters) => {
    try {
      setLoading(true);
      setLoadingError(null);

      const params = {
        page,
        limit: 10,
        ...newFilters,
      };

      const response = await ApiService.getArticles(params);
      setArticles(response.data || []);
      setPagination(response.pagination || {});
    } catch (err) {
      console.error("Erreur chargement articles:", err);
      setLoadingError(err.message);
      error("Erreur lors du chargement des articles");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadArticles();
  }, []);
  const handleCreateArticle = async (articleData) => {
    try {
      setSubmitting(true);
      const response = await ApiService.createArticle(articleData);

      setArticles((prev) => [response.data, ...prev]);
      setShowForm(false);
      success("Article créé avec succès");
    } catch (err) {
      console.error("Erreur création:", err);
      error(err.message || "Erreur lors de la création");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };
  const handleUpdateArticle = async (articleData) => {
    try {
      setSubmitting(true);
      const response = await ApiService.updateArticle(
        editingArticle.id,
        articleData
      );

      setArticles((prev) =>
        prev.map((article) =>
          article.id === editingArticle.id ? response.data : article
        )
      );

      setShowForm(false);
      setEditingArticle(null);
      success("Article modifié avec succès");
    } catch (err) {
      console.error("Erreur modification:", err);
      error(err.message || "Erreur lors de la modification");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };
  const handleDeleteArticle = async () => {
    try {
      setDeleting(true);
      await ApiService.deleteArticle(deletingArticle.id);

      setArticles((prev) =>
        prev.filter((article) => article.id !== deletingArticle.id)
      );

      setShowDeleteConfirm(false);
      setDeletingArticle(null);
      success("Article supprimé avec succès");
    } catch (err) {
      console.error("Erreur suppression:", err);
      error(err.message || "Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };
  const handleDuplicateArticle = async (article) => {
    try {
      const response = await ApiService.duplicateArticle(article.id);
      setArticles((prev) => [response.data, ...prev]);
      success("Article dupliqué avec succès");
    } catch (err) {
      console.error("Erreur duplication:", err);
      error(err.message || "Erreur lors de la duplication");
    }
  };
  const openEditForm = (article) => {
    setEditingArticle(article);
    setShowForm(true);
  };
  const openCreateForm = () => {
    setEditingArticle(null);
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditingArticle(null);
  };
  const openDeleteConfirm = (article) => {
    setDeletingArticle(article);
    setShowDeleteConfirm(true);
  };
  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeletingArticle(null);
  };
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
      render: (author) => (
        <div className="flex items-center">
          <div
            className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center
mr-3"
          >
            <span className="text-blue-600 font-medium text-sm">
              {author?.name?.charAt(0) || "?"}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {author?.name || "Inconnu"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Catégorie",
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
        const config = {
          published: { variant: "success", label: "Publié" },
          draft: { variant: "warning", label: "Brouillon" },
          archived: { variant: "default", label: "Archivé" },
        };
        const { variant, label } = config[status] || config.draft;
        return <Badge variant={variant}>{label}</Badge>;
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
              d="M15 12a3
3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458
12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477
0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span className="text-sm text-gray-600">{count || 0}</span>
        </div>
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
              openEditForm(row);
            }}
          >
            Modifier
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicateArticle(row);
            }}
          >
            Dupliquer
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteConfirm(row);
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ];
  if (loadingError && !loading) {
    return (
      <ErrorMessage message={loadingError} onRetry={() => loadArticles()} />
    );
  }
  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600">
            Gérez vos articles de blog et publications
          </p>
        </div>
        <Button onClick={openCreateForm}>Nouvel Article</Button>
      </div>
      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full wfull z-40">
          <div
            className="relative top-4 mx-auto p-5 border w-full max-w-4xl shadow-lg
rounded-md bg-white"
          >
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingArticle
                  ? "Modifier l'article"
                  : "Créer un nouvel article"}
              </h3>
            </div>
            <ArticleForm
              article={editingArticle}
              onSubmit={
                editingArticle ? handleUpdateArticle : handleCreateArticle
              }
              onCancel={closeForm}
              loading={submitting}
            />
          </div>
        </div>
      )}
      {/* Modal confirmation suppression */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Supprimer l'article"
        message={`Êtes-vous sûr de vouloir supprimer l'article "${deletingArticle?.title}"
? Cette action est irréversible.`}
        confirmText="Supprimer"
        onConfirm={handleDeleteArticle}
        onCancel={closeDeleteConfirm}
        loading={deleting}
      />
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
                  d="M9
12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0
01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {pagination.totalItems || 0}
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
                  d="M5
13l4 4L19 7"
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
                  d="M11
5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828
15H9v-2.828l8.586-8.586z"
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
                  d="M15
12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542
7-4.477 0-8.268-2.943-9.542-7z"
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
