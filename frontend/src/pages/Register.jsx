import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useForm } from '../hooks/useForm'
import { useToast } from '../hooks/useToast'
import Button from '../components/ui/Button'
import ToastContainer from '../components/ui/Toast'

export default function Register() {
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()
  const { toasts, success, error, removeToast } = useToast()
  const [loading, setLoading] = useState(false)

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  // Initialisation du formulaire avec validation
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validate: (values) => {
      const errors = {}
      
      // Validation du nom
      if (!values.name) {
        errors.name = 'Le nom est requis'
      } else if (values.name.length < 2) {
        errors.name = 'Le nom doit contenir au moins 2 caractères'
      }
      
      // Validation de l'email
      if (!values.email) {
        errors.email = 'L\'email est requis'
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Email invalide'
      }
      
      // Validation du mot de passe
      if (!values.password) {
        errors.password = 'Le mot de passe est requis'
      } else if (values.password.length < 6) {
        errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
      }
      
      // Validation de la confirmation
      if (!values.confirmPassword) {
        errors.confirmPassword = 'La confirmation est requise'
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas'
      }
      
      return errors
    },
    onSubmit: async (values) => {
      setLoading(true)
      
      try {
        // Appel à la fonction register du hook useAuth
        await register({
          name: values.name,
          email: values.email,
          password: values.password,
          role: 'author' // Rôle par défaut
        })
        
        success('Inscription réussie ! Vous pouvez maintenant vous connecter.')
        
        // Redirection vers la page de connexion après 1.5 secondes
        setTimeout(() => {
          navigate('/login')
        }, 1500)
        
      } catch (err) {
        error(err.message || 'Erreur lors de l\'inscription')
      } finally {
        setLoading(false)
      }
    }
  })

  // Composant pour les champs de formulaire
  const InputField = ({ name, label, type = 'text', ...props }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={values[name]}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`
          appearance-none relative block w-full px-3 py-2 
          border rounded-md placeholder-gray-400 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          sm:text-sm
          ${errors[name] && touched[name] 
            ? 'border-red-500 bg-red-50' 
            : 'border-gray-300'
          }
        `}
        {...props}
      />
      {errors[name] && touched[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
      )}
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créer un nouveau compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
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
              Créer mon compte
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}