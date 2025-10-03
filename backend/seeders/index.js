const { User, Article, Category, sequelize } = require("../models");
async function seedDatabase() {
  try {
    console.log("🌱 Initialisation des données de test...");

    // Création des catégories
    const categories = await Category.bulkCreate([
      {
        name: "Technologie",
        slug: "technologie",
        description: "Articles sur les dernières technologies",
        color: "#3B82F6",
      },
      {
        name: "Design",
        slug: "design",
        description: "Tendances et conseils en design",
        color: "#8B5CF6",
      },
      {
        name: "Business",
        slug: "business",
        description: "Stratégies et actualités business",
        color: "#10B981",
      },
    ]);

    // Création des utilisateurs
    const users = await User.bulkCreate([
      {
        name: "Alice Martin",
        email: "alice@example.com",
        role: "admin",
        password: "$2b$10$L.SNOl9m3fBFBIlxXoFmaeCdwOFdZx1t/Ll3TxmxTgwSse.TCij7O",
      },
      {
        name: "Bob Durand",
        email: "bob@example.com",
        role: "editor",
        password: "$2b$10$L.SNOl9m3fBFBIlxXoFmaeCdwOFdZx1t/Ll3TxmxTgwSse.TCij7O",
      },
      {
        name: "Claire Moreau",
        email: "claire@example.com",
        role: "author",
        password: "$2b$10$L.SNOl9m3fBFBIlxXoFmaeCdwOFdZx1t/Ll3TxmxTgwSse.TCij7O",
      },
    ]);

    // Création des articles
    const articles = await Article.bulkCreate([
      {
        title: "Introduction à React 18",
        slug: "introduction-react-18",
        summary: "Découvrez les nouvelles fonctionnalités de React 18",
        content: `React 18 apporte de nombreuses améliorations...

## Nouvelles fonctionnalités

- Concurrent Features
- Automatic Batching
- Suspense amélioré
- Strict Mode

## Installation

\`\`\`bash
npm install react@18 react-dom@18
\`\`\`

React 18 marque une étape importante dans l'évolution de cette bibliothèque.`,
        featuredImage: "https://picsum.photos/800/400?random=1",
        status: "published",
        publishedAt: new Date(),
        userId: users[0].id,
        categoryId: categories[0].id,
        viewCount: 156,
      },
      {
        title: "Design System avec Tailwind CSS",
        slug: "design-system-tailwind",
        summary: "Comment créer un design system cohérent avec Tailwind",
        content: `Un design system garantit la cohérence visuelle...

## Avantages d'un Design System

1. **Cohérence** : Interface unifiée
2. **Efficacité** : Développement plus rapide
3. **Maintenance** : Mises à jour centralisées

## Implementation avec Tailwind

\`\`\`css
@layer components {
  .btn-primary {
    @apply bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700;
  }
}
\`\`\`

Tailwind facilite la création et maintenance d'un design system.`,
        featuredImage: "https://picsum.photos/800/400?random=2",
        status: "published",
        publishedAt: new Date(Date.now() - 86400000), // Hier
        userId: users[1].id,
        categoryId: categories[1].id,
        viewCount: 89,
      },
      {
        title: "API REST avec Express.js",
        slug: "api-rest-express",
        summary: "Guide complet pour créer une API REST professionnelle",
        content: `Express.js simplifie la création d'APIs REST...

## Structure recommandée

\`\`\`
/routes
  /articles.js
  /users.js
/controllers
/middlewares
/models
\`\`\`

## Exemple de route

\`\`\`js
router.get('/articles', async (req, res) => {
  try {
    const articles = await Article.findAll()
    res.json({ success: true, data: articles })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})
\`\`\`

Une API bien structurée est la base d'une application robuste.`,
        featuredImage: "https://picsum.photos/800/400?random=3",
        status: "draft",
        userId: users[2].id,
        categoryId: categories[0].id,
        viewCount: 0,
      },
      {
        title: "Stratégies Growth Hacking 2024",
        slug: "growth-hacking-2024",
        summary: "Les meilleures stratégies pour faire croître votre startup",
        content: `Le growth hacking évolue constamment...

## Tendances 2024

- **AI-powered personalization**
- **Community-driven growth**
- **Product-led growth**
- **Retention-first approach**

## Métriques clés

1. **CAC** (Customer Acquisition Cost)
2. **LTV** (Lifetime Value)
3. **Retention Rate**
4. **Viral Coefficient**

Le growth hacking moderne privilégie la qualité à la quantité.`,
        featuredImage: "https://picsum.photos/800/400?random=4",
        status: "published",
        publishedAt: new Date(Date.now() - 172800000), // Il y a 2 jours
        userId: users[0].id,
        categoryId: categories[2].id,
        viewCount: 234,
      },
    ]);

    console.log("✅ Données de test créées avec succès");
    console.log(`📊 ${categories.length} catégories créées`);
    console.log(`👥 ${users.length} utilisateurs créés`);
    console.log(`📝 ${articles.length} articles créés`);
  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error);
  }
}

module.exports = { seedDatabase };
