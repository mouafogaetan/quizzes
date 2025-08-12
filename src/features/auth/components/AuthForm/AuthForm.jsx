import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AuthForm = ({
  type,
  onSubmit,
  additionalFields = [],
  isLoading = false,
  error = null,
  hidePasswordField = false
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);

  const titles = {
    login: 'Connexion',
    register: 'Inscription',
    'forgot-password': 'Mot de passe oublié'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const credentials = { email };
    if (!hidePasswordField) {
      credentials.password = password;
    }
    
    // Ajout des champs supplémentaires aux credentials
    additionalFields.forEach(field => {
      if (field.type !== 'checkbox') {
        credentials[field.name] = e.target.elements[field.name]?.value;
      } else {
        credentials[field.name] = e.target.elements[field.name]?.checked;
      }
    });
    
    onSubmit(credentials);
  };

  useEffect(() => {
    if (error) {
      setErrors((prev) => [...prev, error]);

      const timer = setTimeout(() => {
        setErrors((prev) => prev.filter((err) => err !== error));
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="card shadow p-4 w-100" style={{ maxWidth: '500px' }}>
      <h3 className="text-center mb-2">{titles[type] || 'Authentification'}</h3>
      
      {type === 'login' && (
        <p className="text-center text-muted mb-4">Connectez-vous à votre compte</p>
      )}
      {type === 'register' && (
        <p className="text-center text-muted mb-4">Créez un nouveau compte</p>
      )}
      {type === 'forgot-password' && (
        <p className="text-center text-muted mb-4">Réinitialisez votre mot de passe</p>
      )}

      <form onSubmit={handleSubmit} className="w-100">
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Adresse email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {!hidePasswordField && (
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-control"
              id="password"
              required={type !== 'forgot-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Champs additionnels */}
        {additionalFields.map((field) => (
          <div className="mb-3" key={field.name}>
            {field.type === 'checkbox' ? (
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  disabled={isLoading}
                />
                <label className="form-check-label" htmlFor={field.name}>
                  {field.label}
                </label>
              </div>
            ) : (
              <>
                <label htmlFor={field.name} className="form-label">{field.label}</label>
                <input
                  type={field.type || 'text'}
                  className="form-control"
                  id={field.name}
                  name={field.name}
                  required={field.required !== false}
                  disabled={isLoading}
                />
              </>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              {type === 'login' 
                ? 'Connexion...' 
                : type === 'forgot-password'
                  ? 'Envoi en cours...'
                  : 'Inscription...'}
            </>
          ) : (
            type === 'login' 
              ? 'Se connecter' 
              : type === 'forgot-password'
                ? 'Envoyer le lien'
                : 'S\'inscrire'
          )}
        </button>
      </form>

      {/* Affichage des erreurs */}
      <div className="mt-3">
        {errors.map((err, index) => (
          <div key={index} className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
            <div>
              <strong>Erreur :</strong> {err.message || err.toString()}
            </div>
          </div>
        ))}
      </div>

      {/* Liens de navigation */}
      {/*<div className="mt-4 text-center">
        {type === 'login' && (
          <>
            <div className="mb-2">
              <Link to="/auth/forgot-password">Mot de passe oublié ?</Link>
            </div>
            <div>
              Pas encore de compte ? <Link to="/auth/register">S'inscrire</Link>
            </div>
          </>
        )}

        {type === 'register' && (
          <div>
            Déjà un compte ? <Link to="/auth/login">Se connecter</Link>
          </div>
        )}

        {type === 'forgot-password' && (
          <div>
            <Link to="/auth/login">Retour à la connexion</Link>
          </div>
        )}
      </div>*/}
    </div>
  );
};

export default AuthForm;