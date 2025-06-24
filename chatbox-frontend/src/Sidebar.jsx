// src/Sidebar.jsx

import React from 'react';

// Using inline SVG for the plus icon
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
  </svg>
);

function Sidebar({ chats, currentChatId, onNewChat, onSelectChat }) {
  return (
    <div className="sidebar">
      <button className="new-chat-btn" onClick={onNewChat}>
        <PlusIcon />
        New Chat
      </button>

      <h2 className="history-title">Recent</h2>
      <ul className="chat-history-list">
        {chats.map((chat) => (
          <li
            key={chat.id}
            className={`history-item ${chat.id === currentChatId ? 'active' : ''}`}
            onClick={() => onSelectChat(chat.id)}
          >
            {chat.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;