import { Outlet } from "react-router-dom";
import logo from "../../../../assets/images/logo.svg";

const AuthLayout = () => {
  return (
    <div className="container d-flex flex-column justify-content-center align-items-center min-vh-100">
      {/* Logo */}
      <img src={logo} alt="Logo" style={{ height: 60 }} className="mb-4" />

      {/* Contenu de la page (login/register/forgot) */}
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="mt-5 text-center text-muted small">
        © 2023 Votre Société. Tous droits réservés.
      </footer>
    </div>
  );
};

export default AuthLayout;
