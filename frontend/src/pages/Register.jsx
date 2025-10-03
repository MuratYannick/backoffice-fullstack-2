import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "../hooks/useForm";
import { useToast } from "../hooks/useToast";
import Button from "../components/ui/Button";
import ToastContainer from "../components/ui/Toast";

export default function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const { toasts, success, error, removeToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const validationRules = {
    name: {
      required: "Le nom est requis",
      minLength: 2,
    },
    email: {
      required: "L'email est requis",
      validate: (value) => {
        if (!/\S+@\S+\.\S+/.test(value)) {
          return "Email invalide";
        }
        return true;
      },
    },
    password: {
      required: "Le mot de passe est requis",
      minLength: 6,
    },
    confirmPassword: {
      required: "La confirmation est requise",
      validate: (value, allValues) => {
        if (value !== allValues.password) {
          return "Les mots de passe ne correspondent pas";
        }
        return true;
      },
    },
  };

  const {
    values,
    errors,
    touched,
    handleInputChange,
    handleInputBlur,
    validateForm,
  } = useForm(
    {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationRules
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        name: values.name,
        email: values.email,
        password: values.password,
        role: "author", // Rôle par défaut
      });

      if (result.success) {
        success("Inscription réussie ! Bienvenue " + result.user.name + " !");
        
        // Rediriger vers le dashboard
        navigate("/", { replace: true });
      } else {
        error(result.message);
      }
    } catch (err) {
      error("Une erreur inattendue s'est produite", err);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    name,
    label,
    type = "text",
    required = false,
    ...props
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        name={name}
        type={type}
        value={values[name]}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
          errors[name] && touched[name]
            ? "border-red-500 bg-red-50"
            : "border-gray-300"
        }`}
        {...props}
      />
      {errors[name] && touched[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créer un nouveau compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              connectez-vous à votre compte existant
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <InputField
              name="name"
              label="Nom complet"
              type="text"
              required
              placeholder="John Doe"
            />

            <InputField
              name="email"
              label="Adresse email"
              type="email"
              required
              placeholder="votre@email.com"
            />

            <InputField
              name="password"
              label="Mot de passe"
              type="password"
              required
              placeholder="Minimum 6 caractères"
            />

            <InputField
              name="confirmPassword"
              label="Confirmer le mot de passe"
              type="password"
              required
              placeholder="Confirmer votre mot de passe"
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              loading={loading}
              disabled={loading}
            >
              Créer mon compte azertyuiop
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}