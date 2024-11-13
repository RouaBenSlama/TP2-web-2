import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import Login from './components/Login';
import CreateArticle from './components/CreateArticle';
import ArticleChat from './components/ArticleChat';
import ThemeList from './components/ThemeList';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
  };

  const handleSelectArticle = (articleId) => {
    setSelectedArticleId(articleId);
  };

  return (
    <div className="App">
      {user ? (
        <div>
          <header>
            <h1>Gestion de documents</h1>
            <button onClick={handleLogout}>Déconnexion</button>
          </header>

          <div className="content">
            <aside className="sidebar">
              <CreateArticle selectedArticle={selectedArticle} setSelectedArticle={setSelectedArticle} />
            </aside>

            <div className="theme-container">
              <ThemeList setSelectedArticleId={handleSelectArticle} setSelectedArticle={setSelectedArticle} />
              <main className="main-content">
                {selectedArticleId ? (
                  <ArticleChat articleId={selectedArticleId} />
                ) : (
                  <h2 className='main-title'>Sélectionner un article pour accéder à une discussion</h2>
                )}
              </main>
            </div>
          </div>
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
