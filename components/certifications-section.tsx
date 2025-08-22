"use client"

import { motion } from "framer-motion"
import {
  Award,
  Shield,
  Brain,
  Cloud,
  Zap,
  Folder,
  Settings,
  Search,
  ExternalLink,
  Download,
  Minimize2,
  Maximize2,
  X,
  Home,
  Wifi,
  Battery,
  Volume2,
} from "lucide-react"
import { useState, useEffect } from "react"

const certifications = [
  {
    title: "Generative AI Infrastructure Associate",
    issuer: "Oracle",
    icon: Brain,
    color: "from-red-600 to-orange-600",
    date: "2024",
    file: "oracle_genai_cert.pdf",
    link: "https://drive.google.com/file/d/1Tejy-561Vnc8G9anIur1ayzf0wFYCTGI/view",
    size: "2.4 MB",
  },
  {
    title: "Cloud Foundations Associate",
    issuer: "Oracle",
    icon: Cloud,
    color: "from-blue-600 to-cyan-600",
    date: "2024",
    file: "oracle_foundation_cert.pdf",
    link: "https://drive.google.com/file/d/10oyQhf3rD7HnHv3NYwNhy9JIWIdrOZ24/view",
    size: "1.8 MB",
  },
  {
    title: "Identity Security for AI Age (ISAA) Certification",
    issuer: "Saviynt",
    icon: Shield,
    color: "from-green-600 to-emerald-600",
    date: "2024",
    file: "saviynt_isaa_cert.pdf",
    link: "https://drive.google.com/file/d/1JIiLKb4FZheMo9TkICBUj9YOqX0DkC70/view",
    size: "3.1 MB",
  },
  {
    title: "Deep Learning with TensorFlow",
    issuer: "IBM Professional Certificate",
    icon: Brain,
    color: "from-purple-600 to-pink-600",
    date: "2023",
    file: "tensorflow_cert.pdf",
    link: "https://courses.cognitiveclass.ai/certificates/2752886f81c445d3b1e6a260dd508b57",
    size: "1.2 MB",
  },
  {
    title: "Transformer-based Natural Language Processing",
    issuer: "NVIDIA Deep Learning Institute",
    icon: Zap,
    color: "from-indigo-600 to-purple-600",
    date: "2023",
    file: "nvidia_nlp_cert.pdf",
    link: "https://drive.google.com/file/d/15jOc2py2i3BwMSgGT2Dsea2fR0EesIMb/view",
    size: "2.7 MB",
  },
]

export default function CertificationsSection() {
  const [selectedCert, setSelectedCert] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isMaximized, setIsMaximized] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect()
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    const osContainer = document.getElementById("os-container")
    if (osContainer) {
      osContainer.addEventListener("mousemove", handleMouseMove)
      return () => osContainer.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <div className="min-h-screen py-20 px-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`,
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Certifications
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Professional certifications in a realistic OS file explorer interface
          </p>
        </motion.div>

        <motion.div
          id="os-container"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className={`bg-gradient-to-b from-slate-800/95 to-slate-900/95 rounded-xl border border-slate-600 shadow-2xl overflow-hidden backdrop-blur-md transition-all duration-300 relative ${
            isMaximized ? "fixed inset-4 z-50" : "relative"
          }`}
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            cursor: "none",
          }}
        >
          <motion.div
            className="absolute pointer-events-none z-50"
            style={{
              left: mousePosition.x - 6,
              top: mousePosition.y - 2,
            }}
            animate={{
              left: mousePosition.x - 6,
              top: mousePosition.y - 2,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 3L10.5 17L13.5 11L19.5 8L3 3Z" fill="white" stroke="black" strokeWidth="1" />
              <path d="M3 3L10.5 17L13.5 11L19.5 8L3 3Z" fill="rgba(59, 130, 246, 0.8)" />
            </svg>
          </motion.div>

          <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white p-3 flex items-center justify-between border-b border-slate-500">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setSelectedCert(null)}
                  className="w-3 h-3 bg-red-500 rounded-full cursor-pointer shadow-sm hover:bg-red-400 flex items-center justify-center"
                >
                  <X className="h-2 w-2 text-red-900 opacity-0 hover:opacity-100" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  className="w-3 h-3 bg-yellow-500 rounded-full cursor-pointer shadow-sm hover:bg-yellow-400 flex items-center justify-center"
                >
                  <Minimize2 className="h-2 w-2 text-yellow-900 opacity-0 hover:opacity-100" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="w-3 h-3 bg-green-500 rounded-full cursor-pointer shadow-sm hover:bg-green-400 flex items-center justify-center"
                >
                  <Maximize2 className="h-2 w-2 text-green-900 opacity-0 hover:opacity-100" />
                </motion.button>
              </div>
              <div className="h-6 w-px bg-slate-500"></div>
              <Folder className="h-5 w-5 text-blue-400" />
              <span className="font-semibold text-sm">📁 /Users/SamparkBhol/Documents/Certifications</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-600/50 rounded-lg px-3 py-1.5 border border-slate-500">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search certificates..."
                  className="bg-transparent text-sm outline-none w-40 placeholder-gray-400"
                />
              </div>
              <motion.div whileHover={{ scale: 1.1 }}>
                <Settings className="h-5 w-5 cursor-pointer hover:text-blue-400 transition-colors" />
              </motion.div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-slate-700 to-slate-600 border-b border-slate-600 p-2 flex items-center space-x-1 text-sm text-gray-300">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(71, 85, 105, 0.8)" }}
              className="px-3 py-1.5 hover:bg-slate-600 rounded transition-all"
            >
              File
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(71, 85, 105, 0.8)" }}
              className="px-3 py-1.5 hover:bg-slate-600 rounded transition-all"
            >
              Edit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(71, 85, 105, 0.8)" }}
              className="px-3 py-1.5 hover:bg-slate-600 rounded transition-all"
            >
              View
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(71, 85, 105, 0.8)" }}
              className="px-3 py-1.5 hover:bg-slate-600 rounded transition-all"
            >
              Tools
            </motion.button>
            <div className="flex-1"></div>
            <div className="flex items-center space-x-4 text-xs">
              <span className="bg-slate-600 px-2 py-1 rounded">{certifications.length} items</span>
              <span className="text-green-400">● All verified</span>
              <span className="text-blue-400">🔒 Secure</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-slate-700 to-slate-600 border-b border-slate-600 p-3 flex items-center space-x-6 text-sm text-gray-300">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 hover:text-white hover:bg-slate-600 px-3 py-2 rounded transition-all"
            >
              <Folder className="h-4 w-4" />
              <span>New Folder</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 hover:text-white hover:bg-slate-600 px-3 py-2 rounded transition-all"
            >
              <Award className="h-4 w-4" />
              <span>Properties</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 hover:text-white hover:bg-slate-600 px-3 py-2 rounded transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Download All</span>
            </motion.button>
            <div className="h-6 w-px bg-slate-500"></div>
            <div className="flex items-center space-x-2">
              <span className="text-xs">View:</span>
              <select className="bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500">
                <option>Large Icons</option>
                <option>List</option>
                <option>Details</option>
              </select>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-b from-slate-800/90 to-slate-900/90 min-h-[500px] backdrop-blur-sm">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {certifications.map((cert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedCert(cert)}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex flex-col items-center p-4 rounded-lg hover:bg-slate-700/50 transition-all duration-300 border border-transparent hover:border-slate-600 hover:shadow-lg">
                    <div className="relative mb-3">
                      <motion.div
                        className={`p-4 bg-gradient-to-br ${cert.color} rounded-lg shadow-lg relative overflow-hidden`}
                        whileHover={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <cert.icon className="h-8 w-8 text-white relative z-10" />
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </motion.div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-800 flex items-center justify-center shadow-lg">
                        <span className="text-xs text-white font-bold">✓</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-medium text-white mb-1 line-clamp-2 leading-tight group-hover:text-blue-300 transition-colors">
                        {cert.title}
                      </p>
                      <p className="text-xs text-gray-400 mb-1">{cert.issuer}</p>
                      <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                        <span>{cert.date}</span>
                        <span>•</span>
                        <span>{cert.size}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-300 flex items-center space-x-2 mx-auto"
              >
                <ExternalLink className="h-5 w-5" />
                <span>Contact to Explore More Certifications</span>
              </motion.button>
            </motion.div>
          </div>

          <div className="bg-gradient-to-r from-slate-700 to-slate-600 border-t border-slate-600 p-2 flex justify-between items-center text-xs text-gray-300">
            <div className="flex items-center space-x-4">
              <motion.button whileHover={{ scale: 1.1 }} className="p-1.5 hover:bg-slate-600 rounded transition-colors">
                <Home className="h-4 w-4 text-blue-400" />
              </motion.button>
              <div className="h-4 w-px bg-slate-500"></div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 bg-slate-600/50 px-2 py-1 rounded border border-slate-500"
              >
                <Folder className="h-3 w-3 text-blue-400" />
                <span className="text-xs text-white">Certifications</span>
              </motion.div>
              <span className="bg-slate-600 px-2 py-0.5 rounded">{certifications.length} certificates</span>
              <span>•</span>
              <span className="text-green-400">All verified ✓</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Wifi className="h-3 w-3" />
                <Volume2 className="h-3 w-3" />
                <Battery className="h-3 w-3" />
              </div>
              <span className="font-mono text-xs">
                {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="text-xs">{currentTime.toLocaleDateString([], { month: "short", day: "numeric" })}</span>
              <div className="flex space-x-1">
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                ></motion.div>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </motion.div>

        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCert(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl border border-slate-600 p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Award className="h-6 w-6 text-blue-400" />
                  <span>Certificate Details</span>
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setSelectedCert(null)}
                  className="text-gray-400 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700"
                >
                  ×
                </motion.button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-700/50 p-3 rounded-lg">
                  <label className="text-sm text-gray-400 block mb-1">Title:</label>
                  <p className="text-white font-medium">{selectedCert.title}</p>
                </div>
                <div className="bg-slate-700/50 p-3 rounded-lg">
                  <label className="text-sm text-gray-400 block mb-1">Issuer:</label>
                  <p className="text-white">{selectedCert.issuer}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 p-3 rounded-lg">
                    <label className="text-sm text-gray-400 block mb-1">Date:</label>
                    <p className="text-white">{selectedCert.date}</p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded-lg">
                    <label className="text-sm text-gray-400 block mb-1">Size:</label>
                    <p className="text-white">{selectedCert.size}</p>
                  </div>
                </div>
                <div className="bg-slate-700/50 p-3 rounded-lg">
                  <label className="text-sm text-gray-400 block mb-1">File:</label>
                  <p className="text-blue-400 font-mono text-sm">{selectedCert.file}</p>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={selectedCert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-center transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View Certificate</span>
                </motion.a>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
