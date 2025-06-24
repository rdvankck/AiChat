// src/ChatWindow.jsx

import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Icon Components (copied from App.jsx) ---
const GeminiLogo = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 9.5C14.5 8.67 14.17 7.9 13.67 7.33L12 5.67L10.33 7.33C9.83 7.9 9.5 8.67 9.5 9.5V14.5H14.5V9.5Z" /><path d="M9.5 14.5L5.67 18.33C5.1 18.9 4.33 19.23 3.5 19.23H2V22H3.5C5.16 22 6.75 21.35 7.9 20.2L12 16.1L9.5 14.5Z" /><path d="M14.5 14.5L18.33 18.33C18.9 18.9 19.67 19.23 20.5 19.23H22V22H20.5C18.84 22 17.25 21.35 16.1 20.2L12 16.1L14.5 14.5Z" /><path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.54 15.58 3.5 17L12 8.5L20.5 17C21.46 15.58 22 13.85 22 12C22 6.48 17.52 2 12 2Z" /></svg>
);

const SendIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" /></svg>
);

const PromptCard = ({ title, onClick }) => (
    <div className="card" onClick={onClick}>
        <p className="card-title">{title}</p>
    </div>
);

function ChatWindow({
    messages,
    isTyping,
    inputValue,
    setInputValue,
    handleSendMessage
}) {

    const chatWindowRef = useRef(null);
    const textAreaRef = useRef(null);

    // Auto-scroll logic
    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // Textarea auto-height logic
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = '24px';
            const scrollHeight = textAreaRef.current.scrollHeight;
            textAreaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [inputValue]);
    
    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSendMessage(inputValue);
    };

    return (
        <div className="main-content">
            {/* Conditional Rendering: Welcome Screen or Chat Window */}
            {messages.length === 0 ? (
                <div className="welcome-screen">
                    <div className="welcome-logo"><GeminiLogo /></div>
                    <h1>Hello, Rıdvan</h1>
                    <p>How can I help you today?</p>
                    <div className="prompt-cards">
                        <PromptCard title="Explain how to create a React component, with code" onClick={() => handleSendMessage("Explain how to create a React component, with code")} />
                        <PromptCard title="What is asynchronous programming in JavaScript?" onClick={() => handleSendMessage("What is asynchronous programming in JavaScript?")} />
                    </div>
                </div>
            ) : (
                <div className="chat-window" ref={chatWindowRef}>
                    {messages.map((message, index) => (
                        <div key={index} className={`message-wrapper ${message.sender}`}>
                            <div className={`avatar ${message.sender === 'bot' ? 'gemini-logo' : ''}`}>
                                {message.sender === 'bot' ? <GeminiLogo /> : <span>R</span>}
                            </div>
                            <div className="message">
                                <div className="message-text">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                                </div>
                                <div className="message-time">{message.timestamp}</div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="message-wrapper bot">
                            <div className="avatar gemini-logo"><GeminiLogo /></div>
                            <div className="message"><div className="shimmer"></div></div>
                        </div>
                    )}
                </div>
            )}

            <div className="input-area-container">
                <form className="input-form" onSubmit={handleFormSubmit}>
                    <textarea
                        ref={textAreaRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter a prompt here"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(inputValue);
                            }
                        }}
                    />
                    <button type="submit" disabled={!inputValue.trim() || isTyping}>
                        <SendIcon />
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChatWindow;