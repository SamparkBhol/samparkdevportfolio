"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! I'm Sampark's AI assistant. Ask me anything about his work!", sender: "bot" },
  ])
  const [inputValue, setInputValue] = useState("")
  const [soundEnabled, setSoundEnabled] = useState(false)

  useEffect(() => {
    if (isOpen && soundEnabled) {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    }
  }, [isOpen, soundEnabled])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user" as const,
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(inputValue),
        sender: "bot" as const,
      }
      setMessages((prev) => [...prev, botResponse])
    }, 1000)
  }

  const getBotResponse = (input: string) => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("project")) {
      return "Sampark has worked on amazing projects like Browser-LLM, LeafGuard AI, and DataWiz-Pro! Check out the projects section for more details."
    } else if (lowerInput.includes("skill")) {
      return "He's skilled in Python, JavaScript, AI/ML frameworks like TensorFlow and PyTorch, and has experience with React, Node.js, and cloud technologies!"
    } else if (lowerInput.includes("contact")) {
      return "You can reach Sampark at samparkaccess1234@gmail.com or +91-9938048383. He's also on LinkedIn and GitHub!"
    } else if (lowerInput.includes("research")) {
      return "Sampark has published research on energy-efficient protocols for wireless sensor networks and is working on novel AI research!"
    } else {
      return "That's interesting! Feel free to explore the portfolio to learn more about Sampark's work, or ask me about his projects, skills, or research!"
    }
  }

  return (
    <>
      <motion.div className="fixed bottom-6 right-6 z-50" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="relative cursor-pointer"
          style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(145deg, #e6e6e6, #c0c0c0)",
            borderRadius: "12px",
            boxShadow: isOpen
              ? "inset 2px 2px 5px #a0a0a0, inset -2px -2px 5px #ffffff"
              : "4px 4px 8px #a0a0a0, -4px -4px 8px #ffffff",
            border: "2px solid #999",
          }}
        >
          <div
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{
              background: isOpen ? "#ff0000" : "#660000",
              boxShadow: isOpen ? "0 0 6px #ff0000" : "none",
              animation: isOpen ? "pulse 2s infinite" : "none",
            }}
          />

          <div
            className="absolute top-3 left-3 right-3 bottom-3 rounded-lg flex items-center justify-center"
            style={{
              background: isOpen ? "#9bbc0f" : "#1a1a1a",
              border: "1px solid #666",
              boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.3)",
            }}
          >
            {isOpen ? <X size={20} className="text-black" /> : <MessageCircle size={20} className="text-green-400" />}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-24 right-6 z-50"
            style={{
              width: "320px",
              height: "480px",
              background: "linear-gradient(145deg, #e6e6e6, #c0c0c0)",
              borderRadius: "20px 20px 40px 40px",
              boxShadow: "8px 8px 16px #a0a0a0, -8px -8px 16px #ffffff",
              border: "3px solid #999",
            }}
          >
            <div className="relative p-4">
              <div
                className="text-center font-bold text-lg tracking-wider"
                style={{
                  color: "#333",
                  textShadow: "1px 1px 2px rgba(255,255,255,0.8)",
                  fontFamily: "monospace",
                }}
              >
                GAME BOY
              </div>
              <div
                className="absolute top-2 right-4 w-3 h-3 rounded-full"
                style={{
                  background: "#ff0000",
                  boxShadow: "0 0 8px #ff0000, inset 1px 1px 2px rgba(255,255,255,0.3)",
                  animation: "pulse 2s infinite",
                }}
              />
            </div>

            <div
              className="mx-6 mb-4 relative"
              style={{
                height: "280px",
                background: "#9bbc0f",
                border: "4px solid #1a1a1a",
                borderRadius: "8px",
                boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              {/* LCD grid overlay for authentic Game Boy look */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `
                    linear-gradient(90deg, transparent 49%, rgba(0,0,0,0.1) 50%, transparent 51%),
                    linear-gradient(0deg, transparent 49%, rgba(0,0,0,0.1) 50%, transparent 51%)
                  `,
                  backgroundSize: "2px 2px",
                }}
              />

              {/* Messages area */}
              <div className="p-3 h-full overflow-y-auto space-y-2">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-xs font-mono ${message.sender === "user" ? "text-right" : "text-left"}`}
                  >
                    <div
                      className={`inline-block max-w-xs p-2 ${
                        message.sender === "user" ? "bg-black bg-opacity-20 text-black rounded-lg" : "text-black"
                      }`}
                      style={{
                        textShadow: "0.5px 0.5px 1px rgba(255,255,255,0.3)",
                      }}
                    >
                      {message.text}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center px-6 mb-4">
              {/* D-pad */}
              <div className="relative">
                <div
                  className="w-12 h-12 relative"
                  style={{
                    background: "linear-gradient(145deg, #d0d0d0, #a0a0a0)",
                    borderRadius: "4px",
                  }}
                >
                  {/* Horizontal bar */}
                  <div
                    className="absolute top-4 left-1 right-1 h-4"
                    style={{
                      background: "linear-gradient(145deg, #c0c0c0, #909090)",
                      borderRadius: "2px",
                    }}
                  />
                  {/* Vertical bar */}
                  <div
                    className="absolute left-4 top-1 bottom-1 w-4"
                    style={{
                      background: "linear-gradient(145deg, #c0c0c0, #909090)",
                      borderRadius: "2px",
                    }}
                  />
                </div>
              </div>

              {/* A and B buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="w-8 h-8 rounded-full text-xs font-bold"
                  style={{
                    background: "linear-gradient(145deg, #d0d0d0, #a0a0a0)",
                    boxShadow: "2px 2px 4px #909090, -1px -1px 2px #ffffff",
                    color: "#333",
                  }}
                >
                  A
                </button>
                <button
                  className="w-8 h-8 rounded-full text-xs font-bold"
                  style={{
                    background: "linear-gradient(145deg, #d0d0d0, #a0a0a0)",
                    boxShadow: "2px 2px 4px #909090, -1px -1px 2px #ffffff",
                    color: "#333",
                  }}
                >
                  B
                </button>
              </div>
            </div>

            <div
              className="mx-6 mb-4 p-2"
              style={{
                background: "linear-gradient(145deg, #a0a0a0, #808080)",
                borderRadius: "4px",
                boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type message..."
                  className="flex-1 bg-white bg-opacity-90 border-none text-black placeholder-gray-600 font-mono text-xs h-8"
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="h-8 px-2"
                  style={{
                    background: "linear-gradient(145deg, #d0d0d0, #a0a0a0)",
                    color: "#333",
                    border: "none",
                  }}
                >
                  <Send size={12} />
                </Button>
              </div>
            </div>

            <div className="text-center pb-2">
              <div
                className="text-xs font-bold tracking-wider"
                style={{
                  color: "#666",
                  textShadow: "1px 1px 2px rgba(255,255,255,0.8)",
                }}
              >
                Nintendo
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  )
}
