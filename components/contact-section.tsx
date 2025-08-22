"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone, Mail, Linkedin, Github, Download, Terminal } from "lucide-react"

const contactInfo = {
  phone: "+91-9938048383",
  email: "samparkaccess1234@gmail.com",
  linkedin: "https://www.linkedin.com/in/sampark-bhol-118560251",
  github: "https://github.com/SamparkBhol",
  resume: "https://drive.google.com/file/d/1Ewzcugo5h_64VlE5X11OkIV5vbzzFkG8/view?usp=sharing",
}

const languages = [
  { code: "en", text: "Available for work and collaboration" },
  { code: "ja", text: "仕事とコラボレーションが可能です" },
  { code: "da", text: "Tilgængelig for arbejde og samarbejde" },
  { code: "hi", text: "काम और सहयोग के लिए उपलब्ध" },
  { code: "or", text: "କାମ ଏବଂ ସହଯୋଗ ପାଇଁ ଉପଲବ୍ଧ" },
  { code: "ru", text: "Доступен для работы и сотрудничества" },
  { code: "sv", text: "Tillgänglig för arbete och samarbete" },
  { code: "de", text: "Verfügbar für Arbeit und Zusammenarbeit" },
]

// Terminal Games
const games = {
  snake: {
    name: "Snake Game",
    description: "Classic snake game with ASCII graphics",
  },
  hack: {
    name: "Hacker Simulator",
    description: "Hacker simulator for fun",
  },
}

export default function ContactSection() {
  const [terminalInput, setTerminalInput] = useState("")
  const [terminalOutput, setTerminalOutput] = useState([
    "> Welcome to Sampark's Terminal v2.0",
    '> Type "help" for available commands',
    '> Type "play snake" or "play hack" to start games',
    '> Type "joke" for programming jokes',
    '> Type "theme matrix" to switch themes',
    '> Type "cowsay Hello!" to make a cow say something',
    "",
  ])
  const [currentTheme, setCurrentTheme] = useState("default")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentGame, setCurrentGame] = useState("")
  const terminalRef = useRef<HTMLDivElement>(null)

  const jokes = [
    "Why do programmers prefer dark mode? Because light attracts bugs!",
    "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
    "Why do Java developers wear glasses? Because they can't C#!",
    "A SQL query goes into a bar, walks up to two tables and asks: 'Can I join you?'",
    "Why did the programmer quit his job? He didn't get arrays!",
  ]

  const handleTerminalCommand = (command: string) => {
    const cmd = command.toLowerCase().trim()
    let response = []

    if (cmd === "help") {
      response = [
        "Available commands:",
        "  help - Show this help message",
        "  clear - Clear terminal",
        "  play snake - Start snake game",
        "  play hack - Start hacker simulator",
        "  joke - Get a programming joke",
        "  theme matrix - Switch to Matrix theme",
        "  theme default - Switch to default theme",
        "  cowsay <message> - Make a cow say something",
        "  contact - Show contact information",
        "  skills - List technical skills",
        "  projects - List recent projects",
      ]
    } else if (cmd === "clear") {
      setTerminalOutput([])
      return
    } else if (cmd === "play snake") {
      setIsPlaying(true)
      setCurrentGame("snake")
      response = [
        "🐍 Starting Snake Game...",
        "┌─────────────────────┐",
        "│  ●●●○               │",
        "│                     │",
        "│         ◆           │",
        "│                     │",
        "└─────────────────────┘",
        "Use WASD to move! (Simulated)",
        "Score: 150 | High Score: 420",
        "Game Over! Snake hit the wall!",
      ]
    } else if (cmd === "play hack") {
      setIsPlaying(true)
      setCurrentGame("hack")
      response = [
        "💻 Initializing Hacker Simulator...",
        "Connecting to mainframe...",
        "Access granted: LEVEL 1 CLEARANCE",
        "> Scanning network topology...",
        "> Found 42 vulnerable endpoints",
        "> Deploying payload... ████████████ 100%",
        "> Backdoor established",
        "> Extracting data... 1337 files downloaded",
        "MISSION ACCOMPLISHED! 🎯",
        "(This is just for fun - no actual hacking!)",
      ]
    } else if (cmd === "joke") {
      response = [jokes[Math.floor(Math.random() * jokes.length)]]
    } else if (cmd === "theme matrix") {
      setCurrentTheme("matrix")
      response = ["Theme switched to Matrix mode 🕶️"]
    } else if (cmd === "theme default") {
      setCurrentTheme("default")
      response = ["Theme switched to default mode"]
    } else if (cmd.startsWith("cowsay ")) {
      const message = cmd.substring(7)
      response = [
        " " + "_".repeat(message.length + 2),
        `< ${message} >`,
        " " + "-".repeat(message.length + 2),
        "        \\   ^__^",
        "         \\  (oo)\\_______",
        "            (__)\\       )\\/\\",
        "                ||----w |",
        "                ||     ||",
      ]
    } else if (cmd === "contact") {
      response = [
        "Contact Information:",
        `📞 Phone: ${contactInfo.phone}`,
        `📧 Email: ${contactInfo.email}`,
        `💼 LinkedIn: ${contactInfo.linkedin}`,
        `🐙 GitHub: ${contactInfo.github}`,
        `📄 Resume: ${contactInfo.resume}`,
      ]
    } else if (cmd === "skills") {
      response = [
        "Technical Skills:",
        "🐍 Python | JavaScript | TypeScript",
        "🧠 TensorFlow | PyTorch | LangChain",
        "🌐 React | Node.js | FastAPI",
        "☁️ AWS | Firebase | MongoDB",
        "🛠️ Git | Docker | Kubernetes",
      ]
    } else if (cmd === "projects") {
      response = [
        "Recent Projects:",
        "🤖 Browser-LLM - Client-side AI chatbot",
        "🌱 LeafGuard AI - Plant disease detection",
        "📊 DataWiz-Pro - AI analytics platform",
        "📱 AssignoFast - Assignment management app",
      ]
    } else {
      response = [`Command not found: ${command}. Type "help" for available commands.`]
    }

    setTerminalOutput((prev) => [...prev, `> ${command}`, ...response, ""])
  }

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (terminalInput.trim()) {
      handleTerminalCommand(terminalInput)
      setTerminalInput("")
    }
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalOutput])

  const themeClasses = {
    default: "bg-gray-900 text-green-400 border-green-500",
    matrix: "bg-black text-green-300 border-green-400",
  }

  return (
    <div className="min-h-screen py-20 px-6 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      {/* Medieval Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border-4 border-amber-600 rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border-4 border-amber-600 transform rotate-45"></div>
        <div className="absolute bottom-40 left-1/4 w-16 h-16 border-4 border-amber-600 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Contact & Terminal
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get in touch through traditional means or explore the interactive terminal
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-500/30 h-full">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-amber-300 mb-6 flex items-center">
                  <Terminal className="h-6 w-6 mr-3" />
                  Contact Information
                </h3>

                <div className="space-y-6">
                  <div className="flex items-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <Phone className="h-6 w-6 text-blue-400 mr-4" />
                    <div>
                      <p className="text-gray-400 text-sm">Phone</p>
                      <p className="text-white font-medium">{contactInfo.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <Mail className="h-6 w-6 text-green-400 mr-4" />
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white font-medium">{contactInfo.email}</p>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => window.open(contactInfo.linkedin, "_blank")}
                    >
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </Button>
                    <Button
                      className="flex-1 bg-gray-800 hover:bg-gray-700"
                      onClick={() => window.open(contactInfo.github, "_blank")}
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                    onClick={() => window.open(contactInfo.resume, "_blank")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Interactive Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className={`${themeClasses[currentTheme]} h-full`}>
              <CardContent className="p-0">
                <div className="bg-gray-800 text-white p-3 flex items-center justify-between border-b border-gray-700">
                  <div className="flex items-center">
                    <div className="flex space-x-1 mr-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="font-mono text-sm">sampark@terminal:~$</span>
                  </div>
                  <div className="text-xs text-gray-400">Interactive Terminal</div>
                </div>

                <div ref={terminalRef} className="h-96 overflow-y-auto p-4 font-mono text-sm">
                  {terminalOutput.map((line, index) => (
                    <div key={index} className="mb-1">
                      {line}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleTerminalSubmit} className="border-t border-gray-700 p-4">
                  <div className="flex items-center">
                    <span className="mr-2 text-green-400">$</span>
                    <Input
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      className="flex-1 bg-transparent border-none text-green-400 focus:ring-0 font-mono"
                      placeholder="Type a command..."
                      autoComplete="off"
                    />
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Multilingual Footer Ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-hidden"
        >
          <div className="relative h-8">
            <motion.div
              animate={{ x: [-1000, 1000] }}
              transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="absolute top-0 flex space-x-16 whitespace-nowrap"
            >
              {languages.concat(languages).map((lang, index) => (
                <span key={index} className="text-lg font-medium text-gray-300 hover:text-white transition-colors">
                  {lang.text}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
