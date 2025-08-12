export const getFirebaseErrorMessage = (error) => {
  if (!error || !error.code) return "Une erreur inconnue est survenue.";

  switch (error.code) {
    // Inscription / Connexion
    case 'auth/email-already-in-use':
      return "Cette adresse email est déjà utilisée par un autre compte.";
    case 'auth/invalid-credential':
        return "Email ou mot de passe invalide";
    case 'auth/invalid-email':
      return "L'adresse email est invalide.";
    case 'auth/operation-not-allowed':
      return "Cette opération n'est pas autorisée.";
    case 'auth/weak-password':
      return "Le mot de passe est trop faible.";
    case 'auth/user-disabled':
      return "Ce compte a été désactivé.";
    case 'auth/user-not-found':
      return "Aucun compte ne correspond à cet email.";
    case 'auth/wrong-password':
      return "Mot de passe incorrect.";
    case 'auth/too-many-requests':
      return "Trop de tentatives. Veuillez réessayer plus tard.";
    case 'auth/network-request-failed':
      return "Erreur réseau. Vérifiez votre connexion.";

    // Connexion via fournisseur
    case 'auth/account-exists-with-different-credential':
      return "Un compte existe déjà avec une autre méthode de connexion.";
    case 'auth/credential-already-in-use':
      return "Ces identifiants sont déjà utilisés par un autre compte.";
    case 'auth/popup-closed-by-user':
      return "La fenêtre de connexion a été fermée avant la finalisation.";
    case 'auth/popup-blocked':
      return "La fenêtre popup a été bloquée par le navigateur.";
    case 'auth/unauthorized-domain':
      return "Ce domaine n'est pas autorisé pour l'authentification.";

    // Multi-facteurs ou autres
    case 'auth/missing-verification-code':
      return "Le code de vérification est manquant.";
    case 'auth/invalid-verification-code':
      return "Le code de vérification est invalide.";
    case 'auth/missing-verification-id':
      return "L’identifiant de vérification est manquant.";
    case 'auth/invalid-verification-id':
      return "L’identifiant de vérification est invalide.";

    // Token expiré ou invalide
    case 'auth/id-token-expired':
    case 'auth/id-token-revoked':
    case 'auth/invalid-id-token':
      return "Votre session a expiré. Veuillez vous reconnecter.";

    // Cas par défaut
    default:
      console.error("Erreur Firebase non gérée :", error);
      return "Une erreur est survenue. Veuillez réessayer.";
  }
};
