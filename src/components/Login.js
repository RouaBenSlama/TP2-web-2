import React, { useState } from 'react';
import { auth, googleProvider, facebookProvider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, linkWithCredential, FacebookAuthProvider } from 'firebase/auth';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const googleSignIn = () => {
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const user = result.user;
        console.log('Utilisateur connecté avec Google:', user);
        const userData = {
          email: user.email,
          displayName: user.displayName || user.email,
        };
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
      })
      .catch((error) => {
        console.error('Erreur lors de la connexion avec Google:', error);
      });
  };

  const facebookSignIn = () => {
    signInWithPopup(auth, facebookProvider)
      .then((result) => {
        const user = result.user;
        console.log('Utilisateur connecté avec Facebook:', user);
        const userData = {
          email: user.email,
          displayName: user.displayName || user.email,
        };
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
      })
      .catch((error) => {
        if (error.code === 'auth/account-exists-with-different-credential') {
          const email = error.customData.email;
          fetchSignInMethodsForEmail(auth, email).then((methods) => {
            if (methods.includes('google.com')) {
              const credential = FacebookAuthProvider.credentialFromError(error);
              signInWithPopup(auth, googleProvider)
                .then((googleResult) => {
                  return linkWithCredential(googleResult.user, credential);
                })
                .then(() => {
                  console.log('Comptes Google et Facebook liés.');
                });
            }
          });
        } else {
          console.error('Erreur lors de la connexion avec Facebook:', error);
        }
      });
  };

  const handleEmailSignIn = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((result) => {
        const user = result.user;
        console.log('Utilisateur connecté avec un email:', user);
        const userData = {
          email: user.email,
          displayName: user.displayName || user.email,
        };
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
      })
      .catch((error) => {
        setError('Email ou mot de passe invalide. Veuillez réessayer.');
        console.error("Erreur lors de la connexion avec l'email", error);
      });
  };

  const handleEmailSignUp = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)
      .then((result) => {
        console.log('Compte créé avec un email:', result.user);
        const userData = {
          email: result.user.email,
          displayName: result.user.displayName || result.user.email,
        };
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
      })
      .catch((error) => {
        setError('Erreur lors de la création du compte. Veuillez réessayer.');
        console.error('Erreur lors de la création du compte', error);
      });
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      sessionStorage.removeItem('currentUser');
      console.log('Utilisateur déconnecté');
    });
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <h1>{isRegistering ? 'Créer un compte' : 'Connexion'}</h1>
        <form onSubmit={isRegistering ? handleEmailSignUp : handleEmailSignIn}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">{isRegistering ? 'Créer un compte' : 'Se connecter'}</button>
        </form>
        <button onClick={googleSignIn}>Se connecter avec Google</button>
        <button onClick={facebookSignIn}>Se connecter avec Facebook</button>
        <br />
        <p>
          {isRegistering ? 'Vous avez déjà un compte ?' : 'Pas encore de compte ?'}
          <span onClick={() => setIsRegistering(!isRegistering)} style={{ color: '#007bff', cursor: 'pointer' }}>
            {isRegistering ? ' Se connecter' : ' Créer un compte'}
          </span>
        </p>
        <button onClick={handleLogout} style={{ display: 'none' }}>Déconnexion</button>
      </div>
    </div>
  );
}

export default Login;
