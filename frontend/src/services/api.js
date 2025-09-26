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
      // 🔍 Log plus détaillé pour debug
      console.error('Erreur API détaillée:', data);
      
      // Si c'est une erreur de validation, afficher les détails
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map(err => `${err.field}: ${err.message}`).join(', ');
        throw new Error(`${data.message}: ${errorMessages}`);
      }
      
      throw new Error(data.message || "Erreur API");
    }

    return data;
  } catch (error) {
    console.error("Erreur API:", error);
    throw error;
  }
}

  // Articles
  async getArticles() {
    return this.request("/articles");
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
  
  async deleteArticle(id) {
    return this.request(`/articles/${id}`, {
      method: "DELETE"
    })
  }

  // Users
  async getUsers() {
    return this.request("/users");
  }

  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  //categories
  async getCategories() {
    return this.request("/categories");
  }

  async getCategory(id) {
    return this.request(`/categories/${id}`)
  }
}


export default new ApiService();
