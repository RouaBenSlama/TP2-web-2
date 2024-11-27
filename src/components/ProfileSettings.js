import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getDoc, setDoc, doc, updateDoc } from 'firebase/firestore';
import '../styles/ProfileSettings.css';

function ProfileSettings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [previewProfilePic, setPreviewProfilePic] = useState('');
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        setDisplayName(user.displayName || '');
        setPreviewProfilePic(user.photoURL || '');
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePic(file);
      setPreviewProfilePic(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!currentUser) return alert('Utilisateur non connecté.');

    try {
        let photoURL = previewProfilePic;
    
        if (newProfilePic) {
          const reader = new FileReader();
          reader.readAsDataURL(newProfilePic);
    
          await new Promise((resolve, reject) => {
            reader.onload = () => {
              photoURL = reader.result;
              resolve();
            };
            reader.onerror = reject;
          });
        }

        const base64Size = photoURL.length;
        const maxBase64Size = 1024 * 1024;

        if (base64Size > maxBase64Size) {
            return alert('L\'image est trop grande. La taille maximale est de 1 Mo.');
        }
    
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
    
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            displayName: displayName || currentUser.displayName || '',
            photoURL: photoURL || currentUser.photoURL || '',
            email: currentUser.email,
            createdAt: new Date().toISOString(),
          });
        } else {
          await updateDoc(userRef, {
            displayName: displayName || currentUser.displayName || '',
            photoURL: photoURL || currentUser.photoURL || '',
          });
        }
    
        await updateProfile(currentUser, { displayName, photoURL });
    
        alert('Profil mis à jour avec succès.');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        alert('Une erreur est survenue lors de la mise à jour du profil.');
      }
    };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!currentUser || !currentPassword || !newPassword) {
      return alert('Veuillez remplir tous les champs pour changer le mot de passe.');
    }

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      await updatePassword(currentUser, newPassword);
      alert('Mot de passe mis à jour avec succès.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      alert('Une erreur est survenue lors de la mise à jour du mot de passe. Vérifiez vos informations.');
    }
  };

  return (
    <div className="profile-settings-container">
      <h2>Paramètres du Profil</h2>
      <form onSubmit={handleUpdateProfile} className="profile-settings-form">
        <div className="profile-picture-section">
          <img
            src={previewProfilePic || 'https://via.placeholder.com/150'}
            alt="Profil"
            className="profile-preview"
          />
          <input type="file" accept="image/*" onChange={handleProfilePicChange} />
        </div>

        <div className="profile-info-section">
          <label htmlFor="displayName">Pseudo :</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Entrer votre pseudo"
          />
        </div>

        <button type="submit" className="update-profile-btn">Mettre à jour le profil</button>
      </form>

      <form onSubmit={handlePasswordChange} className="password-change-form">
        <h3>Changer le mot de passe</h3>
        <label htmlFor="currentPassword">Mot de passe actuel :</label>
        <input
          type="password"
          id="currentPassword"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Entrer votre mot de passe actuel"
          required
        />
        <label htmlFor="newPassword">Nouveau mot de passe :</label>
        <input
          type="password"
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Entrer un nouveau mot de passe"
          required
        />
        <button type="submit" className="change-password-btn">Changer le mot de passe</button>
      </form>
    </div>
  );
}

export default ProfileSettings;
