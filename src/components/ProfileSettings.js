import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getDoc, setDoc, doc, updateDoc } from 'firebase/firestore';
import { OpenAI } from 'openai'; // Import OpenAI API
import '../styles/ProfileSettings.css';

function ProfileSettings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [previewProfilePic, setPreviewProfilePic] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState('');

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

  let hasQuotaExceeded = false;

const generateInterventionPlan = async (taskDetails) => {
  if (hasQuotaExceeded) {
    alert("Quota atteint, veuillez réessayer plus tard.");
    return;
  }
    const openai = new OpenAI({
      apiKey: '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',
      dangerouslyAllowBrowser: true,
    });

    try {
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Générez un plan d'intervention d'une heure basé sur les détails de la tâche suivants :\n\nTitre : ${taskDetails.title}\nDescription : ${taskDetails.description}\nPriorité : ${taskDetails.priority}\n`
          }
        ],
      });

      const plan = chatCompletion.choices[0]?.message?.content;
      if (plan) {
        setGeneratedPlan(plan); // Enregistrer le plan généré dans l'état
      } else {
        throw new Error("Le contenu du plan d'intervention est vide.");
      }
    } catch (error) {
      if (error.response && error.response.status === 429) {
        alert("Vous avez atteint votre quota d'API. Veuillez réessayer plus tard.");
      } else {
      console.error("Erreur lors de la récupération du plan d'intervention :", error);
      }
    }
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();

    const taskDetails = {
      title: 'Nouvelle Tâche',
      description: 'Description de la tâche',
      priority: 'moyenne',
    };

    await generateInterventionPlan(taskDetails);
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

      {/* Section pour le plan d'intervention généré */}
      <div className="intervention-plan-section">
        <h3>Plan d'Intervention</h3>
        <textarea
          value={generatedPlan}
          onChange={(e) => setGeneratedPlan(e.target.value)} // Permet au responsable de modifier le plan
          rows="10"
          placeholder="Le plan d'intervention généré par ChatGPT sera affiché ici."
        />
        <button onClick={handleSubmitTask} className="submit-task-btn">Soumettre la Tâche</button>
      </div>
    </div>
  );
}

export default ProfileSettings;
