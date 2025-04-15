'use client'
import { useState } from 'react'

export default function Home() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ sender: string; content: string }[]>([])

  const handleSend = async () => {
    if (!input.trim()) return
  
    const userMessage = { sender: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
  
    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })
  
      const data = await res.json()
      console.log('API response:', data)
  
      const botMessage = {
        sender: 'bot',
        content: data.response || data.error || 'No response received',
      }
  
      setMessages((prev) => [...prev, botMessage])
      setInput('')
    } catch (err) {
      console.error('Fetch error:', err)
      setMessages((prev) => [...prev, {
        sender: 'bot',
        content: 'Error connecting to backend',
      }])
    }
  }
  

  return (
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
        <h1 className="text-3xl font-bold text-white mb-2">💬 FinChat AI</h1>

        <div className="h-96 overflow-y-auto bg-gray-700 rounded-lg p-4 space-y-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-sm p-3 rounded-md text-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white ml-auto'
                  : 'bg-gray-300 text-gray-900 mr-auto'
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>

        <div className="flex space-x-2">
          <input
            className="flex-1 p-3 rounded-md bg-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none"
            placeholder="Ask about TFSAs, RRSPs, etc..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  )
}
// This is a simple chat interface using React and Next.js.
// It allows users to send messages and receive responses from a chatbot.
// The chat interface is styled using Tailwind CSS.
// The messages are displayed in a scrollable area, and the user can type their message in an input field.
// When the user sends a message, it is sent to a backend server (running on localhost:8000) using a POST request.
// The response from the server is then displayed in the chat interface.
// The chat interface is responsive and works well on different screen sizes.