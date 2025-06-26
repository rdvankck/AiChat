# AiChat - A Full-Stack AI Chat Application

A modern, full-stack, AI-powered chatbot application featuring a responsive user interface inspired by Gemini. It runs a local language model via Ollama, providing a private and powerful chat experience with persistent conversation history.

---

## Features

- **Modern UI/UX:** Sleek, dark-mode interface inspired by Gemini.
- **Persistent Chat History:** Conversations are automatically saved to the browser's Local Storage and loaded on startup.
- **Full Chat Management:**
    - Create new chats.
    - Automatically titles new chats based on the first prompt.
    - Rename, Pin, and Delete conversations.
- **Advanced Code Rendering:**
    - Full Markdown support for bot responses.
    - Syntax highlighting for dozens of programming languages in code blocks.
    - One-click "Copy" button for easy code snippet usage.
    - Word wrapping for long lines of code to prevent horizontal scrolling.
- **Advanced Input Methods:**
    - **Voice Input:** Use your microphone for speech-to-text to enter prompts.
- **Real-time Feedback:** "Bot is typing..." indicator while waiting for a response.

---

## Tech Stack

This is a full-stack project with a separate frontend and backend.

**Frontend:**
- **Framework:** React (bootstrapped with Vite)
- **Styling:** Plain CSS with CSS Variables
- **API Communication:** Axios
- **Markdown & Syntax Highlighting:** `react-markdown`, `react-syntax-highlighter`
- **Voice Recognition:** Web Speech API

**Backend:**
- **Framework:** Node.js with Express.js
- **Middleware:** `cors` for handling cross-origin requests.
- **API Communication:** `axios` (to communicate with the Ollama service)

**AI:**
- **Platform:** Ollama
- **Model:** `deepseek-coder` (or any other model supported by Ollama)

---

## Local Setup and Installation

To run this project locally, you will need Node.js, npm, and Ollama installed.

**1. Clone the Repository**
```bash
git clone [https://github.com/rdvankck/AiChat.git](https://github.com/rdvankck/AiChat.git)
cd AiChat

------

2. Setup Ollama & AI Model

Make sure your Ollama desktop application is running.

Pull the model that the backend is configured to use. By default, this is deepseek-coder.

Bash

ollama pull deepseek-coder
3. Setup Backend

Navigate to the backend directory and install its dependencies.

Bash

cd chatbot-backend
npm install
4. Setup Frontend

From the root AiChat directory, navigate to the frontend directory and install its dependencies.

Bash

cd ../chatbot-frontend
npm install
Running the Application
This project requires two terminals running simultaneously.

Terminal 1: Start the Backend Server

Bash

# Navigate to the backend folder
cd chatbot-backend

# Start the server
node index.js

# You should see: "Backend server is running at http://localhost:3000"
Terminal 2: Start the Frontend Development Server

Bash

# Navigate to the frontend folder
cd chatbot-frontend

# Start the Vite dev server
npm run dev

# You should see a message with the URL, usually http://localhost:5173
Now, open your browser and navigate to the frontend URL (e.g., http://localhost:5173) to use the chat application.

Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

License
This project is licensed under the MIT License.
