import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';

// --- SVG Icon Components ---
const GeminiLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.5 9.5C14.5 8.67 14.17 7.9 13.67 7.33L12 5.67L10.33 7.33C9.83 7.9 9.5 8.67 9.5 9.5V14.5H14.5V9.5Z" />
    <path d="M9.5 14.5L5.67 18.33C5.1 18.9 4.33 19.23 3.5 19.23H2V22H3.5C5.16 22 6.75 21.35 7.9 20.2L12 16.1L9.5 14.5Z" />
    <path d="M14.5 14.5L18.33 18.33C18.9 18.9 19.67 19.23 20.5 19.23H22V22H20.5C18.84 22 17.25 21.35 16.1 20.2L12 16.1L14.5 14.5Z" />
    <path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.54 15.58 3.5 17L12 8.5L20.5 17C21.46 15.58 22 13.85 22 12C22 6.48 17.52 2 12 2Z" />
  </svg>
);

const SendIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" />
  </svg>
);

function App() {
  // --- State Management ---
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false); // To show the "Bot is typing..." indicator

  // --- Refs for DOM elements ---
  const chatWindowRef = useRef(null); // To control chat window scrolling
  const textAreaRef = useRef(null); // To control textarea height

  // Set the initial welcome message when the component mounts for the first time
  useEffect(() => {
    setMessages([{
      text: 'Hello there! How can I help you today?',
      sender: 'bot',
      timestamp: getFormattedTime()
    }]);
  }, []); // Empty dependency array means this runs only once on mount

  // Auto-scroll to the bottom of the chat window on new messages or when the bot is typing
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isTyping]); // Reruns whenever 'messages' or 'isTyping' state changes

  // Auto-adjust the height of the textarea based on its content
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '24px'; // Reset height
      const scrollHeight = textAreaRef.current.scrollHeight;
      textAreaRef.current.style.height = `${scrollHeight}px`; // Set to new scroll height
    }
  }, [inputValue]); // Reruns whenever the user types in the textarea

  // --- Helper Functions ---
  const getFormattedTime = () => {
    const date = new Date();
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // --- Core Logic: Handling Message Sending ---
  const handleSendMessage = async (promptText = inputValue) => {
    if (promptText.trim() === '') return; // Don't send empty messages

    const userMessage = {
      text: promptText,
      sender: 'user',
      timestamp: getFormattedTime(),
    };
    
    // If this is the first user message, replace the welcome message instead of appending
    const newMessages = messages.length === 1 && messages[0].text.includes('Hello') 
      ? [userMessage] 
      : [...messages, userMessage];

    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      // Send the prompt to the backend API
      const response = await axios.post('http://localhost:3000/api/chat', { prompt: promptText });

      const botMessage = {
        text: response.data.reply || "Something went wrong, I couldn't get a response.",
        sender: 'bot',
        timestamp: getFormattedTime(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error while making a request to the backend:", error);
      const errorMessage = {
        text: "Sorry, an error occurred while connecting to the AI server.",
        sender: 'bot',
        timestamp: getFormattedTime(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false); // Ensure the typing indicator is always removed
    }
  };

  // Handles the form submission event
  const handleFormSubmit = (e) => {
    e.preventDefault(); // Prevents the page from reloading
    handleSendMessage();
  };

  // --- Sub-components for better readability ---
  const PromptCard = ({ title, onClick }) => (
    <div className="card" onClick={onClick}>
      <p className="card-title">{title}</p>
    </div>
  );

  return (
    <div className="app-container">
      <div className="main-content">
        
        {/* --- Conditional Rendering: Welcome Screen or Chat Window --- */}
        {messages.length === 1 && messages[0].text.includes('Hello') ? (
          <div className="welcome-screen">
            <div className="welcome-logo"><GeminiLogo /></div>
            <h1>Hello, there</h1>
            <p>How can I help you today?</p>
            <div className="prompt-cards">
              <PromptCard title="Explain how to create a React component, with code" onClick={() => handleSendMessage("Explain how to create a React component, with code")} />
              <PromptCard title="What is asynchronous programming in JavaScript?" onClick={() => handleSendMessage("What is asynchronous programming in JavaScript?")}/>
              <PromptCard title="Suggest a color palette for a website" onClick={() => handleSendMessage("Suggest a color palette for a website")} />
              <PromptCard title="How to prepare a good CV, explain with bullet points" onClick={() => handleSendMessage("How to prepare a good CV, explain with bullet points")} />
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
            {/* This part is displayed while the bot is typing */}
            {isTyping && (
               <div className="message-wrapper bot">
                <div className="avatar gemini-logo"><GeminiLogo /></div>
                <div className="message">
                  <div className="message-text">
                    <div className="shimmer"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- Input Form Area --- */}
        <div className="input-area-container">
          <form className="input-form" onSubmit={handleFormSubmit}>
            <textarea
              ref={textAreaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter a prompt here"
              rows={1}
              onKeyDown={(e) => {
                // Send message on 'Enter' but allow new lines with 'Shift+Enter'
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button type="submit" disabled={!inputValue.trim() || isTyping}>
              <SendIcon />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;