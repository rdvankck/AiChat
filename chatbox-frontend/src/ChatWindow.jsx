
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- Icon Components ---
const GeminiLogo = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 9.5C14.5 8.67 14.17 7.9 13.67 7.33L12 5.67L10.33 7.33C9.83 7.9 9.5 8.67 9.5 9.5V14.5H14.5V9.5Z" /><path d="M9.5 14.5L5.67 18.33C5.1 18.9 4.33 19.23 3.5 19.23H2V22H3.5C5.16 22 6.75 21.35 7.9 20.2L12 16.1L9.5 14.5Z" /><path d="M14.5 14.5L18.33 18.33C18.9 18.9 19.67 19.23 20.5 19.23H22V22H20.5C18.84 22 17.25 21.35 16.1 20.2L12 16.1L14.5 14.5Z" /><path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.54 15.58 3.5 17L12 8.5L20.5 17C21.46 15.58 22 13.85 22 12C22 6.48 17.52 2 12 2Z" /></svg>
);
const SubmitIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 5V19L19 12L8 5Z"/></svg>
);
const MicIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z" /></svg>
);
const PromptCard = ({ title, onClick }) => (
    <div className="card" onClick={onClick}><p className="card-title">{title}</p></div>
);


// --- Custom Component for Rendering Code Blocks ---
const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const [copied, setCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';
    const codeText = String(children).replace(/\n$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(codeText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const customStyle = {
        ...vscDarkPlus,
        'pre[class*="language-"]': {
            ...vscDarkPlus['pre[class*="language-"]'],
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
        },
    };

    return !inline && match ? (
        <div className="code-block-wrapper">
            <div className="code-header">
                <span className="code-language">{language}</span>
                <button className="copy-btn" onClick={handleCopy}>
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <SyntaxHighlighter
                style={customStyle}
                language={language}
                // PreTag="div"  <-- THIS WAS THE BUG. IT IS NOW REMOVED.
                {...props}
            >
                {codeText}
            </SyntaxHighlighter>
        </div>
    ) : (
        <code className={className} {...props}>
            {children}
        </code>
    );
};


function ChatWindow({ messages, isTyping, inputValue, setInputValue, handleSendMessage }) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const chatWindowRef = useRef(null);
    const textAreaRef = useRef(null);

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

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

    const handleListen = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Sorry, your browser does not support Speech Recognition.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = 'tr-TR';
        recognition.interimResults = false;
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };
        recognition.onresult = (event) => {
            setInputValue(event.results[0][0].transcript);
        };
        recognition.start();
    };

    return (
        <div className="main-content">
            {messages.length === 0 ? (
                <div className="welcome-screen">
                    <div className="welcome-logo"><GeminiLogo /></div>
                    <h1>Hello, there</h1>
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
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            code: CodeBlock,
                                        }}
                                    >
                                        {message.text}
                                    </ReactMarkdown>
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
                        placeholder="Enter a prompt here or use the microphone"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(inputValue);
                            }
                        }}
                    />
                    <button type="button" className={`mic-btn ${isListening ? 'listening' : ''}`} onClick={handleListen}>
                        <MicIcon />
                    </button>
                    <button type="submit" disabled={!inputValue.trim() || isTyping}>
                        <SubmitIcon />
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChatWindow;