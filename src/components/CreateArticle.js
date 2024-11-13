import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import '../styles/CreateArticle.css';

function CreateArticle({ selectedArticle, setSelectedArticle }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [theme, setTheme] = useState('');

  useEffect(() => {
    if (selectedArticle) {
      setTitle(selectedArticle.title);
      setDescription(selectedArticle.description);
      setTheme(selectedArticle.theme);
    } else {
      setTitle('');
      setDescription('');
      setTheme('');
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

    if (selectedArticle) {
      const imageUrl = await handleImageUpload();
      await updateDoc(doc(db, 'articles', selectedArticle.id), {
        title,
        description,
        imageUrl,
        theme,
        updatedAt: serverTimestamp(),
      });
    } else {
      const imageUrl = await handleImageUpload();
      await addDoc(collection(db, 'articles'), {
        title,
        description,
        imageUrl,
        theme,
        createdAt: serverTimestamp(),
      });
    }

    setTitle('');
    setDescription('');
    setImage(null);
    setTheme('');
    setSelectedArticle(null);
  };

  return (
    <div className="create-article-container">
      <form onSubmit={handleSubmit}>
        <h3>{selectedArticle ? 'Modifier l\'article' : 'Créer un nouvel article'}</h3>
        <input type="text" placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        <input type="text" placeholder="Thème" value={theme} onChange={(e) => setTheme(e.target.value)} required />
        <button type="submit">{selectedArticle ? 'Modifier' : 'Créer'}</button>
      </form>
    </div>
  );
}

export default CreateArticle;
