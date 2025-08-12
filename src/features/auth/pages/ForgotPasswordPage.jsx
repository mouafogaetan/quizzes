import { useState } from 'react';
import AuthForm from '../components/AuthForm/AuthForm';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (credentials) => {
    setIsLoading(true);
    setError(null);
    setEmail(credentials.email);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (!credentials.email.includes('@')) {
        throw new Error('Veuillez entrer une adresse email valide');
      }
      setSuccess(true);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="display-3 text-success mb-3">✓</div>
        <h3>Email envoyé !</h3>
        <p>
          Un lien de réinitialisation a été envoyé à <strong>{email}</strong>. 
          Veuillez vérifier votre boîte de réception.
        </p>
        <Link 
          to="/auth/login" 
          className="btn btn-outline-primary mt-3"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
      <AuthForm
        type="forgot-password"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        additionalFields={[]}
        hidePasswordField={true}
      />
  );
};

export default ForgotPasswordPage;