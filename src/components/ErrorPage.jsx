// src/components/ErrorPage.jsx
import { useRouteError } from "react-router-dom";
import { Alert, Container } from "react-bootstrap";

const ErrorPage = () => {
  const error = useRouteError();
  console.error(error);

  return (
    <Container className="mt-5 text-center">
      <Alert variant="danger">
        <h1>Oups !</h1>
        <p>Une erreur s'est produite.</p>
        <p>
          <i>{error.statusText || error.message}</i>
        </p>
      </Alert>
    </Container>
  );
};

export default ErrorPage;