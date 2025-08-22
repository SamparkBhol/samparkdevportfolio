"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Code, Brain, Globe, Database, Cloud, Wrench } from "lucide-react"

const skillCategories = [
  {
    title: "Programming Languages",
    icon: Code,
    skills: ["Python", "JavaScript", "HTML5", "CSS3", "R", "Solidity", "SQL", "Golang"],
    color: "from-blue-600 to-cyan-600",
  },
  {
    title: "AI/ML Frameworks",
    icon: Brain,
    skills: [
      "TensorFlow",
      "PyTorch",
      "LangChain",
      "Langgraph",
      "LangFlow",
      "Haystack",
      "Hugging Face Transformers",
      "OpenCV",
      "MediaPipe",
      "Scikit-learn",
      "Pandas",
      "NumPy",
    ],
    color: "from-purple-600 to-pink-600",
  },
  {
    title: "Web Technologies",
    icon: Globe,
    skills: ["React", "Node.js", "Flask", "Django", "FastAPI", "Vite", "Three.js", "Flutter", "Postman"],
    color: "from-green-600 to-emerald-600",
  },
  {
    title: "Database & Cloud",
    icon: Database,
    skills: ["MySQL", "VectorDB", "Firebase Firestore", "SQLite", "Amazon Web Services", "Git", "MongoDB"],
    color: "from-orange-600 to-red-600",
  },
  {
    title: "Development Tools",
    icon: Wrench,
    skills: [
      "Figma",
      "Unreal Engine",
      "Godot Engine",
      "Orange",
      "n8n",
      "Ollama",
      "Matplotlib",
      "Spacy",
      "MCP",
      "Postman",
    ],
    color: "from-indigo-600 to-purple-600",
  },
  {
    title: "MLOps & Infrastructure",
    icon: Cloud,
    skills: ["MLOps", "Model Deployment", "Distributed Training", "WebGPU", "WebAssembly"],
    color: "from-teal-600 to-blue-600",
  },
]

export default function SkillsSection() {
  return (
    <div className="min-h-screen py-20 px-6 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg viewBox="0 0 1200 800" className="w-full h-full">
          <defs>
            <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a1a2e" />
              <stop offset="100%" stopColor="#16213e" />
            </linearGradient>
            <linearGradient id="mountainGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f3460" />
              <stop offset="100%" stopColor="#16213e" />
            </linearGradient>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4A90E2" />
              <stop offset="100%" stopColor="#1a1a2e" />
            </linearGradient>
            <linearGradient id="skillWave" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4A90E2" />
              <stop offset="50%" stopColor="#50C878" />
              <stop offset="100%" stopColor="#4A90E2" />
            </linearGradient>
          </defs>

          {/* Mountain silhouettes */}
          <path
            d="M0,600 L200,400 L400,500 L600,300 L800,450 L1000,350 L1200,500 L1200,800 L0,800 Z"
            fill="url(#mountainGradient)"
          />
          <path
            d="M0,650 L150,500 L350,550 L550,400 L750,500 L950,450 L1200,550 L1200,800 L0,800 Z"
            fill="url(#mountainGradient2)"
          />

          {/* Cherry blossom tree branches */}
          <path
            d="M100,200 Q200,150 300,200 Q400,250 500,200"
            stroke="#8B4513"
            strokeWidth="8"
            fill="none"
            opacity="0.3"
          />
          <path
            d="M700,300 Q800,250 900,300 Q1000,350 1100,300"
            stroke="#8B4513"
            strokeWidth="6"
            fill="none"
            opacity="0.3"
          />

          {/* More cherry blossom petals */}
          {[...Array(40)].map((_, i) => (
            <motion.g key={i}>
              <motion.path
                d="M0,0 Q2,-3 4,0 Q2,3 0,0 Q-2,3 -4,0 Q-2,-3 0,0"
                fill="#ffc0cb"
                transform={`translate(${Math.random() * 1200}, ${Math.random() * 800})`}
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.random() * 20 - 10, 0],
                  rotate: [0, 360],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: Math.random() * 3,
                }}
              />
            </motion.g>
          ))}

          {/* Traditional Japanese wave pattern */}
          <path
            d="M0,700 Q100,680 200,700 T400,700 T600,700 T800,700 T1000,700 T1200,700 V800 H0 Z"
            fill="url(#waveGradient)"
            opacity="0.2"
          />
        </svg>
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
            Technical Skills
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive expertise across modern development technologies and frameworks
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 relative">
          {skillCategories.map((category, index) => (
            <div key={index} className="relative">
              {/* Enhanced Torii Gate */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-20"
              >
                <svg width="100" height="50" viewBox="0 0 100 50" className="drop-shadow-lg">
                  {/* Enhanced Torii gate structure */}
                  <rect x="8" y="8" width="84" height="6" fill="#8B4513" rx="3" />
                  <rect x="6" y="18" width="88" height="4" fill="#A0522D" rx="2" />
                  <rect x="18" y="14" width="6" height="30" fill="#8B4513" rx="3" />
                  <rect x="76" y="14" width="6" height="30" fill="#8B4513" rx="3" />

                  {/* Decorative rope (shimenawa) */}
                  <path d="M25,25 Q50,20 75,25" stroke="#D2691E" strokeWidth="2" fill="none" />
                  <path d="M25,25 Q50,30 75,25" stroke="#D2691E" strokeWidth="2" fill="none" />

                  {/* Paper streamers (shide) */}
                  <rect x="35" y="27" width="2" height="8" fill="white" opacity="0.8" />
                  <rect x="48" y="27" width="2" height="8" fill="white" opacity="0.8" />
                  <rect x="61" y="27" width="2" height="8" fill="white" opacity="0.8" />

                  {/* Decorative elements */}
                  <circle cx="25" cy="35" r="2" fill="#FFD700" opacity="0.9" />
                  <circle cx="75" cy="35" r="2" fill="#FFD700" opacity="0.9" />
                </svg>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  className={`bg-gradient-to-br ${category.color}/10 border border-gray-700 hover:border-gray-500 transition-all duration-300 h-full group hover:scale-105 relative overflow-hidden backdrop-blur-sm`}
                >
                  <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-40 transition-opacity">
                    <svg width="40" height="40" viewBox="0 0 40 40">
                      <path d="M8,32 L32,8 M30,6 L34,10 M6,30 L10,34" stroke="white" strokeWidth="2" fill="none" />
                      <circle cx="9" cy="31" r="3" fill="white" />
                      <path d="M28,10 L30,8 L32,10 L30,12 Z" fill="white" />
                    </svg>
                  </div>

                  <CardContent className="p-6 relative">
                    <div className="flex items-center mb-6">
                      <div className={`p-3 bg-gradient-to-br ${category.color}/20 rounded-lg mr-4 relative`}>
                        <category.icon className="h-6 w-6 text-white" />
                        {/* Enhanced cherry blossom decoration */}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-400 rounded-full opacity-60">
                          <div className="absolute inset-1 bg-pink-300 rounded-full"></div>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white">{category.title}</h3>
                    </div>

                    <div className="space-y-3">
                      {category.skills.map((skill, skillIndex) => (
                        <motion.div
                          key={skillIndex}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: skillIndex * 0.05 }}
                          viewport={{ once: true }}
                          className="group/skill"
                        >
                          <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-500 hover:bg-gray-700/50 transition-all duration-300 relative overflow-hidden group-hover/skill:scale-105 group-hover/skill:shadow-lg">
                            {/* Japanese wave pattern background on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover/skill:opacity-10 transition-opacity">
                              <svg viewBox="0 0 100 20" className="w-full h-full">
                                <path d="M0,10 Q25,5 50,10 T100,10 Q75,15 50,10 T0,10 Z" fill="url(#skillWave)" />
                              </svg>
                            </div>

                            <div className="flex items-center justify-between relative z-10">
                              <span className="text-gray-300 group-hover/skill:text-white transition-colors font-medium">
                                {skill}
                              </span>

                              {/* Japanese-inspired skill indicator */}
                              <div className="flex items-center space-x-1">
                                <motion.div whileHover={{ scale: 1.2, rotate: 180 }} className="w-6 h-6 relative">
                                  <svg viewBox="0 0 24 24" className="w-full h-full">
                                    {/* Japanese mon (family crest) inspired design */}
                                    <circle
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1"
                                      className="text-gray-500 group-hover/skill:text-white"
                                    />
                                    <path
                                      d="M12,4 L16,12 L12,20 L8,12 Z"
                                      fill="currentColor"
                                      className={`text-gray-600 group-hover/skill:text-gradient-to-r group-hover/skill:${category.color.replace("from-", "text-").replace(" to-", " group-hover/skill:text-")}`}
                                    />
                                    <circle cx="12" cy="12" r="2" fill="currentColor" className="text-white" />
                                  </svg>
                                </motion.div>
                              </div>
                            </div>

                            {/* Floating cherry blossom on hover */}
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              whileHover={{ opacity: 1, scale: 1 }}
                              className="absolute top-1 right-1 text-pink-400 text-xs"
                            >
                              ✿
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Enhanced floating text with Japanese calligraphy style */}
        <div className="relative mt-20 h-32 overflow-hidden">
          <motion.div
            animate={{ x: [-1000, 1000] }}
            transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="absolute top-0 flex space-x-12 whitespace-nowrap"
          >
            {skillCategories
              .flatMap((cat) => cat.skills)
              .map((skill, index) => (
                <span
                  key={index}
                  className="text-3xl font-bold text-gray-600 hover:text-white transition-colors cursor-default relative"
                  style={{
                    fontFamily: "serif",
                    textShadow: "3px 3px 6px rgba(0,0,0,0.7)",
                    writingMode: index % 4 === 0 ? "vertical-rl" : "horizontal-tb",
                  }}
                >
                  {skill}
                  {/* Enhanced decorative elements */}
                  {index % 3 === 0 && <span className="absolute -top-3 -right-3 text-pink-400 text-sm">🌸</span>}
                  {index % 5 === 0 && <span className="absolute -bottom-2 -left-2 text-red-400 text-xs">⛩</span>}
                </span>
              ))}
          </motion.div>
        </div>

        {/* Enhanced samurai figure */}
        <div className="absolute top-1/4 right-10 opacity-20 group-hover:opacity-40 transition-opacity">
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <svg width="80" height="100" viewBox="0 0 80 100">
              {/* Enhanced samurai silhouette */}
              <path d="M40,15 L35,25 L45,25 Z" fill="white" />
              <rect x="38" y="25" width="4" height="35" fill="white" />
              <path d="M25,40 L55,40 L53,55 L27,55 Z" fill="white" />
              <rect x="36" y="60" width="8" height="25" fill="white" />
              <rect x="34" y="85" width="4" height="10" fill="white" />
              <rect x="42" y="85" width="4" height="10" fill="white" />

              {/* Katana */}
              <rect x="50" y="20" width="2" height="40" fill="white" />
              <rect x="49" y="18" width="4" height="4" fill="white" />

              {/* Armor details */}
              <path d="M30,45 L50,45 M30,50 L50,50" stroke="white" strokeWidth="1" />
            </svg>
          </motion.div>
        </div>

        {/* Additional Japanese elements */}
        <div className="absolute bottom-10 left-10 opacity-10">
          <svg width="60" height="60" viewBox="0 0 60 60">
            {/* Japanese fan */}
            <path d="M30,50 L10,20 Q30,15 50,20 Z" fill="white" />
            <path d="M30,50 L20,25 M30,50 L30,20 M30,50 L40,25" stroke="gray" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </div>
  )
}
