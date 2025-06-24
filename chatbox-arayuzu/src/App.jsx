// chatbot-arayuzu/src/App.jsx - NİHAİ KOD

import { useState, useEffect } from 'react';
import axios from 'axios'; // axios'u projemize dahil ettik
import './App.css';

function App() {

  const getFormattedTime = () => {
    const date = new Date();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [messages, setMessages] = useState([
    {
      text: 'Merhaba! Ben yerel yapay zeka modelin. Bana bir soru sor.',
      sender: 'bot',
      timestamp: getFormattedTime()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false); // YENİ: Bot'un yazma durumunu tutan state

  useEffect(() => {
    const chatWindow = document.querySelector('.chat-window');
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, [messages, isTyping]);


  // GÜNCELLENDİ: Bu fonksiyon artık backend'e gerçek bir API isteği atıyor!
  const handleSendMessage = async (e) => { // Fonksiyonu async yaptık
    e.preventDefault();
    if (inputValue.trim() === '') return;

    const userMessage = {
      text: inputValue,
      sender: 'user',
      timestamp: getFormattedTime(),
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    const currentInputValue = inputValue; // inputValue'u bir değişkene kaydet
    setInputValue('');
    setIsTyping(true); // Bot cevap vermeye hazırlanıyor

    // --- setTimeout SİLİNDİ, yerine try-catch ile API isteği geldi ---
    try {
      // Backend'imize POST isteği atıyoruz
      const response = await axios.post('http://localhost:3000/api/chat', {
        prompt: currentInputValue // Kullanıcının yazdığı metni gönder
      });

      const botMessage = {
        text: response.data.reply, // Backend'den gelen gerçek cevabı kullan
        sender: 'bot',
        timestamp: getFormattedTime(),
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);

    } catch (error) {
      console.error("Backend'e istek atarken hata oluştu:", error);
      const errorMessage = {
        text: "Üzgünüm, yapay zeka sunucusuna bağlanırken bir hata oluştu.",
        sender: 'bot',
        timestamp: getFormattedTime(),
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false); // Cevap gelse de gelmese de "yazıyor" durumunu bitir
    }
    // --- API isteği sonu ---
  };

  return (
    <div className="chatbot-container">
      <h1>Ai Chatbox</h1>
      <div className="chat-window">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <div className="message-text">{message.text}</div>
            <div className="message-time">{message.timestamp}</div>
          </div>
        ))}
        {/* YENİ: Bot yazarken bu kısım görünecek */}
        {isTyping && (
          <div className="message bot typing">
            <div className="message-text">Bot yazıyor...</div>
          </div>
        )}
      </div>
      <form className="input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Mesajını buraya yaz..."
          autoFocus
        />
        <button type="submit">Gönder</button>
      </form>
    </div>
  )
}

export default App;