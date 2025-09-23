import { useState } from "react";
import ApiService from "../services/api";
import { useApi } from "../hooks/useApi";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
export default function Categories() {
  const { data, loading, error, refetch } = useApi(() =>
    ApiService.getCategories()
  );
  const [showForm, setShowForm] = useState(false);

  const categories = data?.data || [];
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
          <p className="text-gray-600">
            Organisez vos articles par thématiques
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annuler" : "Nouvelle Catégorie"}
        </Button>
      </div>
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg
                className="h-6 w-6 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.length}
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Articles</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.reduce(
                  (sum, cat) => sum + (cat.articleCount || 0),
                  0
                )}
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
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Moyenne</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.length > 0
                  ? Math.round(
                      categories.reduce(
                        (sum, cat) => sum + (cat.articleCount || 0),
                        0
                      ) / categories.length
                    )
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Grille des catégories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg shadow-md border bordergray-200 overflow-hidden hover:shadow-lg transition duration-200"
          >
            <div className="h-2" style={{ backgroundColor: category.color }} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {category.name}
                </h3>
                <Badge
                  variant="default"
                  style={{
                    backgroundColor: category.color + "20",
                    color: category.color,
                  }}
                >
                  {category.slug}
                </Badge>
              </div>

              {category.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <svg
                    className="h-4 w-4 mr-1"
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
                  {category.articleCount || 0} article
                  {(category.articleCount || 0) !== 1 ? "s" : ""}
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    Modifier
                  </Button>
                  <Button size="sm" variant="ghost">
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carte d'ajout */}
        <div
          className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition duration-200 cursor-pointer"
          onClick={() => setShowForm(true)}
        >
          <div className="flex flex-col items-center justify-center h-full p-6 textcenter">
            <svg
              className="h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ajouter une catégorie
            </h3>
            <p className="text-sm text-gray-500">
              Créez une nouvelle catégorie pour organiser vos articles
            </p>
          </div>
        </div>
      </div>
      {categories.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="h-16 w-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24
24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune catégorie
          </h3>
          <p className="text-gray-500 mb-4">
            Commencez par créer votre première catégorie
          </p>
          <Button onClick={() => setShowForm(true)}>Créer une catégorie</Button>
        </div>
      )}
    </div>
  );
}
