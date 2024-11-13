import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { auth } from '../firebase';
import '../styles/Chat.css';

function ArticleChat({ articleId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [employeesRead, setEmployeesRead] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'articles', articleId, 'messages'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(newMessages);
    });
    return () => unsubscribe();
  }, [articleId]);

  useEffect(() => {
    const markAsRead = async () => {
      if (!currentUser || !currentUser.email) return;

      const readRef = collection(db, 'articles', articleId, 'employeesRead');
      const employeeExists = employeesRead.has(currentUser.email);

      if (!employeeExists) {
        await addDoc(readRef, { name: currentUser.email, readAt: new Date() });
        setEmployeesRead((prev) => new Set(prev).add(currentUser.email));
      }
    };

    markAsRead();
  }, [articleId, currentUser, employeesRead]);

  useEffect(() => {
    const q = query(collection(db, 'articles', articleId, 'employeesRead'), orderBy('readAt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const uniqueEmployees = new Set(snapshot.docs.map((doc) => doc.data().name));
      setEmployeesRead(uniqueEmployees);
    });
    return () => unsubscribe();
  }, [articleId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage || !currentUser) return;

    await addDoc(collection(db, 'articles', articleId, 'messages'), {
      text: newMessage,
      createdAt: new Date(),
      employeeName: currentUser.displayName || currentUser.email,
    });

    setNewMessage('');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="chat">
      <div className="chat-header">
        <h2>Discussion sur cet article</h2>
        <div className="dropdown-container">
          <button className="dropdown-btn" onClick={toggleDropdown}>
            Employés ayant lu cet article ▼
          </button>
          {isDropdownOpen && (
            <div className="dropdown-content">
              <ul>
                {[...employeesRead].map((employee, index) => (
                  <li key={index}>{employee}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="chat-window">
        {messages.map((message) => (
          <div key={message.id}>
            <p>
              <strong>{message.employeeName ? message.employeeName : 'Inconnu'}:</strong> {message.text}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Saisir un message"
        />
        <button type="submit">Envoyer</button>
      </form>
    </div>
  );
}

export default ArticleChat;
