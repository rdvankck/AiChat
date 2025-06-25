import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import './App.css';

function App() {
  // --- State Management for Multiple Chats ---
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // --- Load chats from localStorage on initial render ---
  useEffect(() => {
    const savedChats = localStorage.getItem('chat_history');
    const savedCurrentId = localStorage.getItem('current_chat_id');
    
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      setChats(parsedChats);
      
      if(savedCurrentId && parsedChats.some(c => c.id === savedCurrentId)) {
        setCurrentChatId(savedCurrentId);
      } else if (parsedChats.length > 0) {
        setCurrentChatId(parsedChats[0].id);
      } else {
        handleNewChat();
      }
    } else {
      handleNewChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Disabling eslint warning because handleNewChat dependency would cause a loop

  // --- Save chats to localStorage whenever they change ---
  useEffect(() => {
    if (chats.length > 0) {
        localStorage.setItem('chat_history', JSON.stringify(chats));
    }
    if (currentChatId) {
        localStorage.setItem('current_chat_id', currentChatId);
    }
  }, [chats, currentChatId]);


  // --- Helper Functions ---
  const getFormattedTime = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // --- Chat Management Functions ---
  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat = {
      id: newChatId,
      title: 'New Chat', // Initially titled "New Chat"
      messages: [],
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
  };

  const handleSelectChat = (id) => {
    setCurrentChatId(id);
  };


  // --- Core Logic: Sending a Message (WITH BUG FIX) ---
  const handleSendMessage = async (promptText) => {
    if (!promptText || promptText.trim() === '' || !currentChatId) return;

    const userMessage = { text: promptText, sender: 'user', timestamp: getFormattedTime() };
    
    // Step 1: Add user message and update title if it's the first message
    let preliminaryUpdatedChats;
    setChats(prevChats => {
      preliminaryUpdatedChats = prevChats.map(chat => {
        if (chat.id === currentChatId) {
          const isFirstMessage = chat.messages.length === 0;
          const newTitle = isFirstMessage ? promptText.substring(0, 35) + '...' : chat.title;
          return { ...chat, title: newTitle, messages: [...chat.messages, userMessage] };
        }
        return chat;
      });
      return preliminaryUpdatedChats;
    });

    setInputValue('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:3000/api/chat', { prompt: promptText });
      const botMessage = { text: response.data.reply, sender: 'bot', timestamp: getFormattedTime() };

      // Step 2: Add bot's response using a functional update to avoid stale state
      setChats(prevChats => prevChats.map(chat => {
        if (chat.id === currentChatId) {
          return { ...chat, messages: [...chat.messages, botMessage] };
        }
        return chat;
      }));

    } catch (error) {
      console.error("Backend request failed:", error);
      const errorMessage = { text: "Sorry, failed to connect to the AI server.", sender: 'bot', timestamp: getFormattedTime() };
      
      // Add error message using a functional update
      setChats(prevChats => prevChats.map(chat => {
        if (chat.id === currentChatId) {
          return { ...chat, messages: [...chat.messages, errorMessage] };
        }
        return chat;
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const activeChatMessages = chats.find(chat => chat.id === currentChatId)?.messages || [];

  return (
    <div className="app-layout">
      <Sidebar 
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />
      <div className="chat-area">
        <ChatWindow 
          messages={activeChatMessages}
          isTyping={isTyping}
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}

export default App;