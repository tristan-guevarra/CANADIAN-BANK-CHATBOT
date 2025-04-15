'use client'
import { useEffect, useState } from 'react' // Import React hooks
import dayjs from 'dayjs' // Import dayjs for date formatting

type MessageType = { // Define the structure of a message
  sender: string
  content: string
  timestamp?: string
}

// Group messages by date
const groupMessagesByDate = (messages: MessageType[]) => { 
  const grouped: { [date: string]: MessageType[] } = {}
  messages.forEach((msg) => {
    const dateKey = dayjs(msg.timestamp).format('YYYY-MM-DD')
    if (!grouped[dateKey]) grouped[dateKey] = []
    grouped[dateKey].push(msg)
  })
  return grouped
}

export default function Home() { // Main component
  // State variables
  const [input, setInput] = useState('') // Input field state
  const [messages, setMessages] = useState<MessageType[]>([])
  const sessionId = 'default' // static session ID for now

  // Fetch existing chat history on first render
  useEffect(() => { // Fetch chat history
    const fetchHistory = async () => {
      try { // Fetch chat history from the backend
        const res = await fetch('http://localhost:8000/history')
        const data = await res.json()
        setMessages(data.history)
      } catch (err) { // Handle errors
        console.error('Failed to load chat history', err)
      }
    }

    fetchHistory() // Call the function to fetch chat history
  }, [])

  const handleSend = async () => { // Send message to the backend
    if (!input.trim()) return

    const now = new Date().toISOString() // Get current timestamp
    const userMessage = { sender: 'user', content: input, timestamp: now }

    setMessages((prev) => [...prev, userMessage]) // Update messages state with user message

    try {
      const res = await fetch('http://localhost:8000/chat', { // Send message to the backend
        method: 'POST', // Set method to POST
        headers: { 'Content-Type': 'application/json' }, // Set content type
        body: JSON.stringify({
          message: input,
          session_id: sessionId,
        }),
      })

      const data = await res.json() // Parse the response
      console.log('API response:', data) // Log the API response

      const botMessage = { // Create bot message
        sender: 'bot', // Set sender to bot
        content: data.response ?? data.error ?? 'No response received',
        timestamp: new Date().toISOString(), // Set timestamp
      }

      setMessages((prev) => [...prev, botMessage]) // Update messages state with bot message
      setInput('') // Clear input field
    } catch (err) { // Handle errors
      console.error('Fetch error:', err)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          content: 'Error connecting to backend',
          timestamp: new Date().toISOString(),
        },
      ])
    }
  }

  return ( // Render the component
    // JSX code
    // This is the main layout of the page
    // It uses Tailwind CSS for styling
    // The main container is a flexbox that centers its content
    // The background color is set to a dark gray
    // The text color is set to white
    // The container has a minimum height of the screen
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
        <h1 className="text-3xl font-bold text-white mb-2">FinChat AI</h1>

        <div className="h-96 overflow-y-auto bg-gray-700 rounded-lg p-4 space-y-4">
          {Object.entries(groupMessagesByDate(messages)).map(([date, msgs], i) => (
            <div key={i} className="space-y-2">
              <div className="text-center text-sm text-gray-400 font-medium">
                {dayjs(date).format('MMMM D, YYYY')}
              </div>

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
                  {msg.timestamp && (
                    <div
                      className={`text-xs text-gray-400 ${
                        msg.sender === 'user' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'UTC',
                      })} (UTC)
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex space-x-2"> {/* Input and button container */}
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
          </button> {/* Send button */}
          <button
            onClick={async () => {
              await fetch('http://localhost:8000/chat', { method: 'DELETE' })
              setMessages([])
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Clear Chat
          </button> {/* Clear chat button */}
        </div>
      </div> 
    </main> 
  )
} 
// End of the component

