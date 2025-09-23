export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        🏠 Tableau de bord
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-blue-600 mb-2">Articles</h2>
          <p className="text-gray-600">Gérez vos article de blog</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-green-600 mb-2">
            Utilisateurs
          </h2>
          <p className="text-gray-600">Administration des utilisateurs</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-purple-600 mb-2">
            Statistiques
          </h2>
          <p className="text-gray-600">Analyses et métriques</p>
        </div>
      </div>
    </div>
  );
}
