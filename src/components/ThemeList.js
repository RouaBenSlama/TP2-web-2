import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import '../styles/ThemeList.css';
import { FaCheckCircle } from 'react-icons/fa';

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

  const handleMarkAsComplete = async (articleId) => {
    try {
      const articleRef = doc(db, 'tasks', articleId);
      await updateDoc(articleRef, {
        status: 'terminée',
        completedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'état de la tâche", error);
    }
  };

  const handleReassignResponsable = async (articleId, newResponsableId) => {
    try {
      const articleRef = doc(db, 'tasks', articleId);
      await updateDoc(articleRef, {
        responsableId: newResponsableId,
      });
      alert('Responsable mis à jour avec succès.');
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
            <p>{article.description}</p>

            {article.status !== 'terminée' && (
              <FaCheckCircle 
                onClick={(e) => { e.stopPropagation(); handleMarkAsComplete(article.id); }} 
                className="complete-icon" 
              />
            )}

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