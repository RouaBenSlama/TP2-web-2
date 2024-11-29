import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { auth } from '../firebase';
import '../styles/CreateArticle.css';

function CreateArticle({ selectedArticle, setSelectedArticle }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [theme, setTheme] = useState('');
  const [priority, setPriority] = useState('moyenne');
  const [comments, setComments] = useState('');
  const [commentTracking, setCommentTracking] = useState('');
  const [responsible, setResponsible] = useState('admin');
  const [status, setStatus] = useState('');

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (selectedArticle) {
      setTitle(selectedArticle.title);
      setDescription(selectedArticle.description);
      setTheme(selectedArticle.theme);
      setPriority(selectedArticle.priority);
      setComments(selectedArticle.comments);
      setCommentTracking(selectedArticle.commentTracking);
      setResponsible(selectedArticle.responsible);
      setStatus(selectedArticle.status);
    } else {
      setTitle('');
      setDescription('');
      setTheme('');
      setPriority('moyenne');
      setComments('');
      setCommentTracking('');
      setResponsible('admin');
      setStatus('à faire');
    }
  }, [selectedArticle]);

  const handleImageUpload = async () => {
    if (image) {
      const storageRef = storage.ref(`images/${image.name}`);
      await storageRef.put(image);
      const url = await storageRef.getDownloadURL();
      return url;
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const imageUrl = await handleImageUpload();

    const taskData = {
      title,
      description,
      imageUrl,
      theme,
      priority,
      comments,
      commentTracking,
      responsible,
      status,
      createdAt: serverTimestamp(),
      submittedBy: currentUser ? currentUser.displayName : 'Unknown User',
      dateSubmitted: serverTimestamp(),
    };

    if (selectedArticle) {
      await updateDoc(doc(db, 'tasks', selectedArticle.id), taskData);
    } else {
      await addDoc(collection(db, 'tasks'), taskData);
    }

    setTitle('');
    setDescription('');
    setImage(null);
    setTheme('');
    setPriority('moyenne');
    setComments('');
    setCommentTracking('');
    setResponsible('admin');
    setStatus('à faire');
    setSelectedArticle(null);
  };

  return (
    <div className="create-article-container">
      <form onSubmit={handleSubmit}>
        <h3>{selectedArticle ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}</h3>
        <input
          type="text"
          placeholder="Titre de la tâche"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description détaillée"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        <input
          type="text"
          placeholder="Thème"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          required
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)} required>
          <option value="faible">Faible</option>
          <option value="moyenne">Moyenne</option>
          <option value="élevée">Élevée</option>
        </select>
        <textarea
          placeholder="Commentaires"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} required>
          <option value="" disabled>
            Sélectionnez un statut
          </option>
          {TASK_STATUSES.map((statusOption) => (
            <option key={statusOption} value={statusOption}>
              {statusOption}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Suivi des commentaires (visible une fois assigné)"
          value={commentTracking}
          onChange={(e) => setCommentTracking(e.target.value)}
          disabled={responsible !== 'admin'}
        />
        <button type="submit">{selectedArticle ? 'Modifier' : 'Créer'}</button>
      </form>
    </div>
  );
}

export const TASK_STATUSES = ['À faire', 'En cours', 'Terminée', 'Suspendue'];
export default CreateArticle;
