import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import Login from './components/Login';
import CreateArticle from './components/CreateArticle';
import ArticleChat from './components/ArticleChat';
import ThemeList from './components/ThemeList';
import ProfileSettings  from './components/ProfileSettings';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [view, setView] = useState('home');

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

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleGoHome = () => {
    setView('home');
  };

  return (
    <div className="App">
      {user ? (
        <div>
          <header>
            <h1>Gestion des tâches</h1>
            <div className="header-buttons">
              <button onClick={handleGoHome}>Accueil</button>
              <button onClick={() => handleViewChange('profileSettings')}>
                Paramètres du profil
              </button>
            </div>
            <button onClick={handleLogout}>Déconnexion</button>
          </header>

          <div className="content">
          {view === 'profileSettings' ? (
              <ProfileSettings />
            ) : (
              <>
            <aside className="sidebar">
              <CreateArticle selectedArticle={selectedArticle} setSelectedArticle={setSelectedArticle} />
            </aside>

            <div className="theme-container">
              <ThemeList setSelectedArticleId={handleSelectArticle} setSelectedArticle={setSelectedArticle} />
              <main className="main-content">
                {selectedArticleId ? (
                  <ArticleChat articleId={selectedArticleId} />
                ) : (
                  <h2 className='main-title'>Sélectionner une tâche pour accéder à une discussion</h2>
                )}
              </main>
            </div>
            </>
            )}
          </div>
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
