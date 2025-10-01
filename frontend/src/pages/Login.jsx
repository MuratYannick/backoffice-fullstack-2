import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "../hooks/useForm";
import { useToast } from "../hooks/useToast";
import Button from "../components/ui/Button";
import ToastContainer from "../components/ui/Toast";
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { toasts, success, error, removeToast } = useToast();
  const [loading, setLoading] = useState(false);
  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);
  const validationRules = {
    email: {
      required: "Email requis",
    },
    password: {
      required: "Mot de passe requis",
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
      email: "",
      password: "",
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
      const result = await login(values.email, values.password);

      if (result.success) {
        success(`Bienvenue ${result.user.name} !`);

        // Rediriger vers la page d'origine ou dashboard
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
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
        className={`
 w-full border rounded-md px-3 py-2
 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
 ${
   errors[name] && touched[name]
     ? "border-red-500 bg-red-50"
     : "border-gray-300"
 }
 `}
        {...props}
      />
      {errors[name] && touched[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
      )}
    </div>
  );
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4
sm:px-6 lg:px-8"
    >
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="max-w-md w-full space-y-8">
        <div>
          <div
            className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center
justify-center"
          >
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
                d="M12
15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8
0v4h8z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion à votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              créez un nouveau compte
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
              placeholder="Votre mot de passe"
            />
          </div>
          <div>
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Se connecter
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
