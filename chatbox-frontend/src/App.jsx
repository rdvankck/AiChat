import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import './App.css';

function App() {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Load chats from localStorage on initial render
  useEffect(() => {
    let loadedChats = [];
    try {
      const savedChats = localStorage.getItem('chat_history');
      if (savedChats) {
        loadedChats = JSON.parse(savedChats);
        setChats(loadedChats);
      }
    } catch (error) {
      console.error("Failed to parse chats from localStorage", error);
    }
    
    const savedCurrentId = localStorage.getItem('current_chat_id');
    if(savedCurrentId && loadedChats.some(c => c.id === savedCurrentId)) {
      setCurrentChatId(savedCurrentId);
    } else if (loadedChats.length > 0) {
      setCurrentChatId(loadedChats[0].id);
    } else {
      handleNewChat(loadedChats); // Use a function to avoid direct state manipulation in initial load
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
        localStorage.setItem('chat_history', JSON.stringify(chats));
    } else {
        localStorage.removeItem('chat_history'); // Clean up if all chats are deleted
    }
    if (currentChatId) {
        localStorage.setItem('current_chat_id', currentChatId);
    } else {
        localStorage.removeItem('current_chat_id');
    }
  }, [chats, currentChatId]);

  const getFormattedTime = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // --- Chat Management Functions ---
  const handleNewChat = (currentChats = chats) => {
    const newChatId = Date.now().toString();
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      isPinned: false,
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
  };

  const handleSelectChat = (id) => setCurrentChatId(id);

  const handleDeleteChat = (idToDelete) => {
    const newChats = chats.filter(chat => chat.id !== idToDelete);
    setChats(newChats);

    if (currentChatId === idToDelete) {
        if (newChats.length > 0) {
            // Select the first chat from the remaining chats
            const firstChat = chats.find(c => c.id !== idToDelete);
            setCurrentChatId(firstChat ? firstChat.id : null);
        } else {
            // If no chats are left, create a new one
            handleNewChat([]); 
        }
    }
  };

  const handleRenameChat = (idToRename, newTitle) => {
    setChats(prevChats => prevChats.map(chat => 
        chat.id === idToRename ? { ...chat, title: newTitle } : chat
    ));
  };
  
  const handlePinChat = (idToPin) => {
    setChats(prevChats => prevChats.map(chat =>
        chat.id === idToPin ? { ...chat, isPinned: !chat.isPinned } : chat
    ));
  };

  const handleSendMessage = async (promptText) => {
    if (!promptText || promptText.trim() === '' || !currentChatId) return;

    const userMessage = { text: promptText, sender: 'user', timestamp: getFormattedTime() };
    
    setChats(prevChats => prevChats.map(chat => {
        if (chat.id === currentChatId) {
            const isFirstMessage = chat.messages.length === 0;
            const newTitle = isFirstMessage ? promptText.substring(0, 35) + (promptText.length > 35 ? '...' : '') : chat.title;
            return { ...chat, title: newTitle, messages: [...chat.messages, userMessage] };
        }
        return chat;
    }));

    setInputValue('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:3000/api/chat', { prompt: promptText });
      const botMessage = { text: response.data.reply, sender: 'bot', timestamp: getFormattedTime() };
      setChats(prevChats => prevChats.map(chat => 
        chat.id === currentChatId ? { ...chat, messages: [...chat.messages, botMessage] } : chat
      ));
    } catch (error) {
      console.error("Backend request failed:", error);
      const errorMessage = { text: "Sorry, failed to connect to the AI server.", sender: 'bot', timestamp: getFormattedTime() };
      setChats(prevChats => prevChats.map(chat =>
        chat.id === currentChatId ? { ...chat, messages: [...chat.messages, errorMessage] } : chat
      ));
    } finally {
      setIsTyping(false);
    }
  };

  // Memoized values to prevent unnecessary re-renders
  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0; // Keep original order for items with same pinned status
    });
  }, [chats]);
  
  const activeChatMessages = chats.find(chat => chat.id === currentChatId)?.messages || [];

  return (
    <div className="app-layout">
      <Sidebar 
        chats={sortedChats}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onPinChat={handlePinChat}
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