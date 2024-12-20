import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { auth } from '../firebase';
import { collection, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import '../styles/ThemeList.css';
import { FaCheckCircle, FaCircle, FaSpinner, FaPauseCircle } from 'react-icons/fa';
import emailjs from 'emailjs-com';

const currentUser = auth.currentUser;
const userEmail = currentUser?.email;


const statusIcons = {
  'à faire': { icon: <FaCircle style={{ color: 'gray' }} />, nextStatus: 'en cours' },
  'en cours': { icon: <FaSpinner style={{ color: 'blue' }} />, nextStatus: 'terminée' },
  'terminée': { icon: <FaCheckCircle style={{ color: 'green' }} />, nextStatus: 'suspendue' },
  'suspendue': { icon: <FaPauseCircle style={{ color: 'orange' }} />, nextStatus: 'à faire' },
};

function ThemeList({ setSelectedArticleId, setSelectedArticle }) {
  const [themes, setThemes] = useState([]);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchThemes = async () => {
      const unsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
        const themeData = [...new Set(snapshot.docs.map(doc => doc.data().theme))];
        setThemes(themeData);
      });

      return () => unsubscribe();
    };

    fetchThemes();
  }, []);

  const handleThemeClick = (theme) => {
    const q = collection(db, 'tasks');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filteredArticles = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(article => article.theme === theme)
        .sort((a, b) => b.date - a.date);
      setArticles(filteredArticles);
    });

    return () => unsubscribe();
  };

  const handleEdit = (article) => {
    setSelectedArticle(article);
  };

  const handleDelete = async (articleId) => {
    try {
      const articleRef = doc(db, 'tasks', articleId);

      await deleteDoc(articleRef);
      setArticles(prevArticles => prevArticles.filter(article => article.id !== articleId));
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche", error);
    }
  };

  const handleStatusChange = async (articleId, currentStatus) => {
    const nextStatus = statusIcons[currentStatus]?.nextStatus;
  
    if (!nextStatus) {
      console.error("Next status not found for current status:", currentStatus);
      return;
    }
  
    try {
      const articleRef = doc(db, 'tasks', articleId);
      await updateDoc(articleRef, { status: nextStatus });
  
      alert(`Statut mis à jour vers : ${nextStatus}`);
  
  
      // Send email using EmailJS
      emailjs
        .send(
          'service_8n05oit',
          'template_iu7gegw', // Replace with your EmailJS template ID
          {
            to_email: userEmail, // Use the current user's email
            task_status: nextStatus,
          },
          'JurOjVRsPBl1RIKyH' // Replace with your EmailJS user ID
        )
        .then(
          () => {
            alert(`Statut mis à jour vers : ${nextStatus} et email envoyé.`);
          },
          (error) => {
            console.error("Erreur lors de l'envoi de l'email :", error);
          }
        );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
    }
  };
  

  const handleReassignResponsable = async (articleId, newResponsableEmail) => {
    try {
      const articleRef = doc(db, 'tasks', articleId);
      await updateDoc(articleRef, {
        responsibleEmail: newResponsableEmail,
      });

      alert('Responsable mis à jour avec succès.');

      // Envoi d'une notification par email pour la réassignation
      emailjs
        .send(
          'service_8n05oit',
          'template_358tc6y', // Template pour la réassignation de tâches
          {
            to_email: newResponsableEmail
          },
          'JurOjVRsPBl1RIKyH'
        )
        .then(
          () => {
            alert(`Un email a été envoyé au nouvel utilisateur responsable (${newResponsableEmail}).`);
          },
          (error) => {
            console.error("Erreur lors de l'envoi de l'email :", error);
          }
        );
    } catch (error) {
      console.error("Erreur lors de la réassignation du responsable", error);
    }
  };

  const handleArticleClick = (articleId) => {
    setSelectedArticleId(articleId);
  };

  return (
    <div className="theme-list">
      <h2>Sélectionner un thème</h2>
      <div className="theme-sidebar">
        {themes.map((theme, index) => (
          <button key={index} onClick={() => handleThemeClick(theme)}>
            {theme}
          </button>
        ))}
      </div>
      <div className="article-list">
        <h2>Sélectionner une tâche</h2>
          {articles.map((article) => (
            <div 
              key={article.id} 
              className="article-item" 
              onClick={() => handleArticleClick(article.id)}
            >
              <h3>{article.title}</h3>

              {/* Status Icon */}
              <div 
                className="status-icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(article.id, article.status);
                }}
              >
                {statusIcons[article.status]?.icon}
              </div>

              <p>{article.description}</p>

              <div className="buttons-container">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(article); }} className="edit-button">Modifier</button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(article.id); }} className="delete-button">Supprimer</button>
                <button onClick={(e) => { e.stopPropagation(); handleReassignResponsable(article.id, 'newResponsableId'); }} className="reassign-button">
                  Réassigner Responsable
                </button>
              </div>
            <div className="task-meta">
              <p className="task-info">Date de soumission : {article.createdAt ? new Date(article.createdAt.seconds * 1000).toLocaleDateString() : 'Date inconnue'}</p>
              <p className="task-info">Utilisateur : {article.submittedBy}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ThemeList;
