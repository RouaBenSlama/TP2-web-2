import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import '../styles/ThemeList.css';

function ThemeList({ setSelectedArticleId, setSelectedArticle }) {
  const [themes, setThemes] = useState([]);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchThemes = async () => {
      const unsubscribe = onSnapshot(collection(db, 'articles'), (snapshot) => {
        const themeData = [...new Set(snapshot.docs.map(doc => doc.data().theme))];
        setThemes(themeData);
      });

      return () => unsubscribe();
    };

    fetchThemes();
  }, []);

  const handleThemeClick = (theme) => {
    const q = collection(db, 'articles');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filteredArticles = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(article => article.theme === theme);
      setArticles(filteredArticles);
    });

    return () => unsubscribe();
  };

  const handleEdit = (article) => {
    setSelectedArticle(article);
  };

  const handleDelete = async (articleId) => {
    try {
      await deleteDoc(doc(db, 'articles', articleId));
      setArticles(prevArticles => prevArticles.filter(article => article.id !== articleId));
    } catch (error) {
      console.error("Erreur lors de la suppression de l'article", error);
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
        <h2>Sélectionner un article</h2>
        {articles.map((article) => (
          <div 
            key={article.id} 
            className="article-item" 
            onClick={() => handleArticleClick(article.id)}
            style={{ cursor: 'pointer', padding: '10px', border: '1px solid #ccc', margin: '5px 0' }}
          >
            <h3>{article.title}</h3>
            <p>{article.description}</p>
            <button onClick={(e) => { e.stopPropagation(); handleEdit(article); }} className="edit-button">Modifier</button>
            <button onClick={(e) => { e.stopPropagation(); handleDelete(article.id); }} className="delete-button">Supprimer</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ThemeList;
