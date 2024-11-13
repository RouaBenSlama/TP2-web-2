import React from 'react';
import '../styles/Sidebar.css';

const Sidebar = ({ themes, onSelectTheme }) => {
  return (
    <div className="sidebar">
      <h2>Thèmes</h2>
      <ul>
        {themes.map((theme) => (
          <li key={theme.id} onClick={() => onSelectTheme(theme)}>
            {theme.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
