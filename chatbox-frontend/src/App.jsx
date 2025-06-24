// src/App.jsx - REFACTORED TO MANAGE MULTIPLE CHATS

import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar'; // Import the new component
import ChatWindow from './ChatWindow'; // Import the new component
import './App.css';

function App() {
  // --- State Management for Multiple Chats ---
  const [chats, setChats] = useState([]); // Holds all chat objects {id, title, messages}
  const [currentChatId, setCurrentChatId] = useState(null); // ID of the currently active chat
  const [inputValue, setInputValue] = useState(''); // Input state is still managed here
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
        // Fallback to the most recent chat if the saved ID is invalid
        setCurrentChatId(parsedChats[0].id);
      } else {
        // If there are no chats, create a new one
        handleNewChat();
      }
    } else {
      // If no history exists, create the very first chat
      handleNewChat();
    }
  }, []); // Empty array ensures this runs only once

  // --- Save chats to localStorage whenever they change ---
  useEffect(() => {
    // Don't save the initial empty array
    if (chats.length > 0) {
        localStorage.setItem('chat_history', JSON.stringify(chats));
    }
    if (currentChatId) {
        localStorage.setItem('current_chat_id', currentChatId);
    }
  }, [chats, currentChatId]); // Reruns when chats or currentChatId changes


  // --- Helper Functions ---
  const getFormattedTime = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // --- Chat Management Functions ---
  const handleNewChat = () => {
    const newChatId = Date.now().toString(); // Simple unique ID
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      messages: [], // A new chat starts with no messages
    };
    setChats(prev => [newChat, ...prev]); // Add new chat to the beginning of the list
    setCurrentChatId(newChatId);
  };

  const handleSelectChat = (id) => {
    setCurrentChatId(id);
  };


  // --- Core Logic: Sending a Message ---
  const handleSendMessage = async (promptText) => {
    if (!promptText || promptText.trim() === '' || !currentChatId) return;

    const userMessage = { text: promptText, sender: 'user', timestamp: getFormattedTime() };
    
    // Find the current chat and add the user message
    const updatedChats = chats.map(chat => {
      if (chat.id === currentChatId) {
        // If it's a new chat, set its title from the first prompt
        const newTitle = chat.messages.length === 0 ? promptText.substring(0, 30) + '...' : chat.title;
        return { ...chat, title: newTitle, messages: [...chat.messages, userMessage] };
      }
      return chat;
    });
    setChats(updatedChats);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:3000/api/chat', { prompt: promptText });
      const botMessage = { text: response.data.reply, sender: 'bot', timestamp: getFormattedTime() };

      // Add the bot's response to the current chat
      const finalChats = chats.map(chat => {
        if (chat.id === currentChatId) {
          return { ...chat, messages: [...chat.messages, botMessage] };
        }
        return chat;
      });
      setChats(finalChats);

    } catch (error) {
      console.error("Backend request failed:", error);
      const errorMessage = { text: "Sorry, failed to connect to the AI server.", sender: 'bot', timestamp: getFormattedTime() };
      const errorChats = chats.map(chat => {
        if (chat.id === currentChatId) {
          return { ...chat, messages: [...chat.messages, errorMessage] };
        }
        return chat;
      });
      setChats(errorChats);
    } finally {
      setIsTyping(false);
    }
  };

  // Find the messages for the currently selected chat
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