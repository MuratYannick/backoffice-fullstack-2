const API_BASE_URL = "http://localhost:3000/api";
class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erreur HTTP: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("Erreur API:", error);
      throw error;
    }
  }

  // Articles CRUD
  async getArticles(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/articles?${queryString}`);
  }

  async getArticle(id) {
    return this.request(`/articles/${id}`);
  }

  async createArticle(articleData) {
    return this.request("/articles", {
      method: "POST",
      body: JSON.stringify(articleData),
    });
  }

  async updateArticle(id, articleData) {
    return this.request(`/articles/${id}`, {
      method: "PUT",
      body: JSON.stringify(articleData),
    });
  }

  async deleteArticle(id) {
    return this.request(`/articles/${id}`, {
      method: "DELETE",
    });
  }

  async duplicateArticle(id) {
    return this.request(`/articles/${id}/duplicate`, {
      method: "POST",
    });
  }

  // Autres ressources
  async getCategories() {
    return this.request("/categories");
  }

  async getUsers() {
    return this.request("/users");
  }
}
export default new ApiService();
