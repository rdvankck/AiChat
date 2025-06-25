// src/Sidebar.jsx - UPDATED WITH NEW ICONS AND MENU STRUCTURE

import React, { useState, useRef, useEffect } from 'react';

// --- SVG Icon Components ---
const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>
);

const OptionsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
);

// NEW ICONS FOR THE OPTIONS MENU
const PinIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" /></svg>
);
const RenameIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
);
const DeleteIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
);


function Sidebar({ chats, currentChatId, onNewChat, onSelectChat, onDeleteChat, onRenameChat, onPinChat }) {
    const [openMenuId, setOpenMenuId] = useState(null);
    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState("");
    const menuRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);
    
    useEffect(() => {
        if (renamingId && inputRef.current) {
            inputRef.current.focus();
        }
    }, [renamingId]);

    const handleOptionsClick = (e, chatId) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === chatId ? null : chatId);
    };

    const handleRenameStart = (e, chat) => {
        e.stopPropagation();
        setRenamingId(chat.id);
        const currentTitle = chat.title.endsWith('...') ? chat.title.slice(0, -35) : chat.title;
        setRenameValue(currentTitle);
        setOpenMenuId(null);
    };

    const handleRenameSubmit = (e) => {
        e.preventDefault();
        if (renameValue.trim()) {
            onRenameChat(renamingId, renameValue.trim());
        }
        setRenamingId(null);
    };

    const handleDeleteClick = (e, chatId) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this chat?")) {
            onDeleteChat(chatId);
        }
        setOpenMenuId(null);
    };
    
    const handlePinClick = (e, chatId) => {
        e.stopPropagation();
        onPinChat(chatId);
        setOpenMenuId(null);
    };

    return (
        <div className="sidebar">
            <button className="new-chat-btn" onClick={onNewChat}><PlusIcon /> New Chat</button>
            <h2 className="history-title">Recent</h2>
            <ul className="chat-history-list">
                {chats.map((chat) => (
                    <li
                        key={chat.id}
                        className={`history-item ${chat.id === currentChatId ? 'active' : ''}`}
                        onClick={() => renamingId !== chat.id && onSelectChat(chat.id)}
                    >
                        {renamingId === chat.id ? (
                            <form onSubmit={handleRenameSubmit} style={{width: '100%'}}>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    onBlur={handleRenameSubmit}
                                    className="rename-input"
                                />
                            </form>
                        ) : (
                            <>
                                <span className="history-item-title">{chat.isPinned && '📌 '}{chat.title}</span>
                                <button className="chat-options-btn" onClick={(e) => handleOptionsClick(e, chat.id)}>
                                    <OptionsIcon />
                                </button>
                                {openMenuId === chat.id && (
                                    <div className="options-menu" ref={menuRef}>
                                        <button className="option-item" onClick={(e) => handlePinClick(e, chat.id)}>
                                            <PinIcon /> {chat.isPinned ? 'Unpin' : 'Pin'}
                                        </button>
                                        <button className="option-item" onClick={(e) => handleRenameStart(e, chat)}>
                                            <RenameIcon /> Rename
                                        </button>
                                        <button className="option-item delete" onClick={(e) => handleDeleteClick(e, chat.id)}>
                                            <DeleteIcon /> Delete
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Sidebar;