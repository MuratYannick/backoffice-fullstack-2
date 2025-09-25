import { useState, useEffect } from "react";
import { useForm } from "../hooks/useForm";
import Button from "./ui/Button";
import ApiService from "../services/api";

const ArticleForm = ({
  article = null,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);

  const validationRules = {
    title: {
      required: "Le titre est requis",
      minLength: 3,
      maxLength: 255,
    },
    content: {
      required: "Le contenu est requis",
      minLength: 10,
    },
    userId: {
      required: "L'auteur est requis",
    },
  };

  const initialValues = {
    title: article?.title || "",
    summary: article?.summary || "",
    content: article?.content || "",
    status: article?.status || "draft",
    categoryId: article?.categoryId || "",
    userId: article?.userId || "",
  };

  const {
    values,
    errors,
    touched,
    handleInputChange,
    handleInputBlur,
    validateForm,
    // resetForm,
    // TODO
  } = useForm(initialValues, validationRules);
  useEffect(() => {
    // Charger les catégories et utilisateurs
    const loadData = async () => {
      try {
        const [categoriesRes, usersRes] = await Promise.all([
          ApiService.getCategories(),
          ApiService.getUsers(),
        ]);
        setCategories(categoriesRes.data || []);
        setUsers(usersRes.data || []);
      } catch (error) {
        console.error("Erreur chargement données:", error);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData = {
      ...values,
      categoryId: values.categoryId || null,
      userId: parseInt(values.userId),
    };
    await onSubmit(formData);
  };

  const InputField = ({
    name,
    label,
    type = "text",
    required = false,
    as: Component = "input",

    rows,
    children,
    ...props
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <Component
        name={name}
        type={type}
        value={values[name]}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        rows={rows}
        className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[name] && touched[name] ? "border-red-500 bg-red-50" : "border-gray-300"}`}
        {...props}
      >
        {children}
      </Component>

      {errors[name] && touched[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <InputField
            name="title"
            label="Titre"
            required
            placeholder="Entrez le titre de l'article"
          />

          <InputField
            name="summary"
            label="Résumé"
            placeholder="Résumé optionnel de l'article"
            maxLength="500"
          />

          <div className="grid grid-cols-2 gap-4">
            <InputField name="categoryId" label="Catégorie" as="select">
              <option value="">Sélectionner une catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </InputField>

            <InputField name="userId" label="Auteur" as="select" required>
              <option value="">Sélectionner un auteur</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </InputField>

          </div>
          <InputField name="status" label="Statut" as="select" required>
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
            <option value="archived">Archivé</option>
          </InputField>
        </div>

        <div>
          <InputField
            name="content"
            label="Contenu"
            as="textarea"
            rows={12}
            required
            placeholder="Rédigez le contenu de votre article..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </Button>

        <Button type="submit" loading={loading} disabled={loading}>
          {article ? "Modifier" : "Créer"} l'article
        </Button>
      </div>
    </form>
  );
};

export default ArticleForm;
