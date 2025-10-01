const API_BASE_URL = "http://localhost:3000/api";

class ApiService {
  constructor() {
    this.token = localStorage.getItem("token");
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Ajouter le token d'authentification si disponible
    if (this.token) {
      config.headers.Authorization = "Bearer ${this.token}";
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Si le token est expiré, le supprimer
        if (response.status === 401) {
          this.setToken(null);
        }
        throw new Error(data.message || "Erreur HTTP: ${response.status}");
      }

      return data;
    } catch (error) {
      console.error("Erreur API:", error);
      throw error;
    }
  }

  // ========== AUTHENTIFICATION ==========

  async register(userData) {
    const response = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return response;
  }

  async login(credentials) {
    const response = await this.request("/auth/login", {
      method: "Post",
      body: JSON.stringify(credentials),
    });
    return response;
  }

  async getProfile() {
    return this.request("/auth/me");
  }

  // ========== ARTICLES CRUD ==========

  // Articles
  async getArticles(params = {}) {
    const queryString = new URLSearchParams(params.toString())
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
      method: 'PUT',
      body: JSON.stringify(articleData)
    })
  }

  async deleteArticle(id) {
    return this.request(`/articles/${id}`, {
      method: "DELETE",
    });
  }

  // ========== AUTRES RESSOURCES ==========

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
    return this.request(`/categories/${id}`);
  }
}

export default new ApiService();
