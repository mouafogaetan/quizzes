import { useState } from 'react';
import AuthForm from '../components/AuthForm/AuthForm';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth} from "../../../firebase";
import { getFirebaseErrorMessage } from '../../../utils/firebaseErrors';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  const handleSubmit = async (credentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      navigate('/');
      console.log('Connexion réussie', credentials);
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <AuthForm
        type="login"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        additionalFields={[
          {
            name: "remember",
            type: "checkbox",
            label: "Se souvenir de moi"
          }
        ]}
      />
  );
};

export default LoginPage;