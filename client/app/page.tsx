'use client'
import { useEffect, useState } from 'react' // Import React hooks
import dayjs from 'dayjs' // Import dayjs for date formatting


type MessageType = {
  sender: string
  content: string
  timestamp?: string
}
// Define a type for the message object
// This type will be used to define the structure of messages in the chat
// The message object contains the sender (user or bot), content of the message, and an optional timestamp
const groupMessagesByDate = (messages: MessageType[]) => {
  const grouped: { [date: string]: MessageType[] } = {}

  messages.forEach((msg) => {
    const dateKey = dayjs(msg.timestamp).format('YYYY-MM-DD')
    if (!grouped[dateKey]) grouped[dateKey] = []
    grouped[dateKey].push(msg)
  })

  return grouped
}


export default function Home() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<MessageType[]>([])

  // ✅ Load chat history on first render
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:8000/history')
        const data = await res.json()
        setMessages(data.history)
      } catch (err) {
        console.error('Failed to load chat history', err)
      }
    }

    fetchHistory()
  }, [])

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
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          content: 'Error connecting to backend',
        },
      ])
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
        <h1 className="text-3xl font-bold text-white mb-2">FinChat AI</h1>

        <div className="h-96 overflow-y-auto bg-gray-700 rounded-lg p-4 space-y-4">
  {Object.entries(groupMessagesByDate(messages)).map(([date, msgs], i) => (
    <div key={i} className="space-y-2">
      {/* Date Header */}
      <div className="text-center text-sm text-gray-400 font-medium">
        {dayjs(date).format('MMMM D, YYYY')}
      </div>

      {/* Messages under that date */}
      {msgs.map((msg, idx) => (
  <div key={idx} className="space-y-1">
    <div
      className={`max-w-sm p-3 rounded-md text-sm ${
        msg.sender === 'user'
          ? 'bg-blue-600 text-white ml-auto'
          : 'bg-gray-300 text-gray-900 mr-auto'
      }`}
    >
      {msg.content}
    </div>
    {/* Add this if block to show the time */}
    {msg.timestamp && (
      <div
        className={`text-xs text-gray-400 ${
          msg.sender === 'user' ? 'text-right' : 'text-left'
        }`}
      >
        {new Date(msg.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    )}
  </div>
))}

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
          <button
  onClick={async () => {
    await fetch('http://localhost:8000/chat', { method: 'DELETE' })
    setMessages([])
  }}
  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
>
  Clear Chat
</button>

        </div>
      </div>
    </main>
  )
}
