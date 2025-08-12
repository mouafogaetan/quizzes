import { useState } from 'react';
import AuthForm from '../components/AuthForm/AuthForm';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (credentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (credentials.password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }
      
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      
      console.log('Inscription réussie', credentials);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <AuthForm
        type="register"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        additionalFields={[
          {
            name: "confirmPassword",
            type: "password",
            label: "Confirmez le mot de passe",
            required: true
          },
          {
            name: "username",
            type: "text",
            label: "Nom d'utilisateur",
            required: true
          },
          {
            name: "terms",
            type: "checkbox",
            label: "J'accepte les conditions d'utilisation",
            required: true
          }
        ]}
      />
  );
};

export default RegisterPage;