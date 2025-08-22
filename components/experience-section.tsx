"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Zap, Code, Database } from "lucide-react"

const experiences = [
  {
    title: "AI and ML Intern",
    company: "CSM Technologies",
    location: "Odisha, India",
    period: "May 2025 – July 2025",
    description: [
      "Developed and deployed production-ready RAG-based Large Language Model systems using LangChain and LangFlow frameworks for enhanced natural language processing capabilities and conversational AI applications",
      "Implemented transformer architectures and advanced NLP techniques on confidential AI projects, focusing on scalable model optimization and distributed GPU training for large-scale machine learning pipelines",
      "Designed end to end Generative AI applications including intelligent chatbots with real-time inference, achieving improved response accuracy and reduced latency through architectural enhancements along with learning usage of VectorDB and embeddings",
    ],
    color: "from-blue-600 to-cyan-600",
  },
  {
    title: "DL and Software Intern",
    company: "National Informatics Centre, MeitY, Government of India",
    location: "Odisha, India",
    period: "May 2024 – July 2024",
    description: [
      "Researched and developed advanced anomaly detection algorithms using graph-based analysis methodologies and statistical modeling techniques for large-scale government datasets, achieving 95% accuracy improvement over baseline models",
      "Built and optimized predictive models using supervised and unsupervised machine learning algorithms, implementing feature engineering and hyperparameter tuning for enhanced model performance",
      "Conducted comprehensive data preprocessing including exploratory data analysis, feature selection, dimensionality reduction, and statistical hypothesis testing to extract actionable insights from complex multi dimensional datasets",
      "Collaborated with senior data scientists on production data mining projects using Orange software for advanced pattern recognition, interactive data visualization, and scalable predictive analytics solutions",
    ],
    color: "from-purple-600 to-pink-600",
  },
]

export default function ExperienceSection() {
  return (
    <div className="min-h-screen py-20 px-6 relative overflow-hidden">
      {/* Matrix Rain Background */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 via-black to-purple-900/20"></div>
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
            {Array.from({ length: 400 }).map((_, i) => (
              <motion.div
                key={i}
                className="border border-cyan-500/30"
                animate={{ opacity: [0.1, 0.5, 0.1] }}
                transition={{ duration: 2, delay: i * 0.01, repeat: Number.POSITIVE_INFINITY }}
              />
            ))}
          </div>
        </div>
        {/* Floating Code Particles */}
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-green-400 text-xs font-mono opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              delay: i * 0.1,
              repeat: Number.POSITIVE_INFINITY,
            }}
          >
            {["01", "10", "11", "00", "AI", "ML", "DL"][Math.floor(Math.random() * 7)]}
          </motion.div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {/* Cyberpunk-style title with neon glow */}
          <h2 className="text-6xl font-bold mb-6 relative">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              EXPERIENCE
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent blur-lg opacity-50">
              EXPERIENCE
            </div>
          </h2>
          <p className="text-xl text-cyan-300 max-w-3xl mx-auto font-mono">
            &gt; Navigating the digital frontier of AI and software development_
          </p>
        </motion.div>

        {/* Cyberpunk neural network visualization */}
        <div className="relative mb-20">
          <svg className="w-full h-96" viewBox="0 0 800 400">
            <defs>
              <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00ffff" />
                <stop offset="50%" stopColor="#ff00ff" />
                <stop offset="100%" stopColor="#ffff00" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Animated Neural Pathways */}
            <path
              d="M 100 200 Q 250 100 400 200 Q 550 300 700 200"
              fill="none"
              stroke="url(#neuralGradient)"
              strokeWidth="3"
              filter="url(#glow)"
              className="animate-pulse"
            />
            <path
              d="M 100 200 Q 250 300 400 200 Q 550 100 700 200"
              fill="none"
              stroke="url(#neuralGradient)"
              strokeWidth="2"
              filter="url(#glow)"
              opacity="0.7"
            />

            {/* Neural Nodes */}
            {[150, 300, 450, 600].map((x, i) => (
              <motion.circle
                key={i}
                cx={x}
                cy={200 + Math.sin(i) * 50}
                r="8"
                fill="url(#neuralGradient)"
                filter="url(#glow)"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, delay: i * 0.5, repeat: Number.POSITIVE_INFINITY }}
              />
            ))}
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotateY: 360 }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="text-center"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-50"></div>
                <Code className="h-16 w-16 text-white relative z-10" />
              </div>
              <p className="text-cyan-400 font-mono font-bold">&gt; Neural_Growth.exe</p>
            </motion.div>
          </div>
        </div>

        <div className="space-y-12">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              {/* Cyberpunk card styling with neon borders */}
              <Card className="bg-black/80 border border-cyan-500/50 hover:border-purple-500/80 transition-all duration-300 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-8 relative z-10">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-2xl font-bold text-cyan-400 mb-2 font-mono">{exp.title}</h3>
                      <p className="text-xl text-purple-300 font-semibold mb-2">{exp.company}</p>
                      <div className="flex flex-wrap gap-4 text-gray-400 font-mono text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-cyan-400" />
                          {exp.period}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-purple-400" />
                          {exp.location}
                        </div>
                      </div>
                    </div>
                    {/* Tech icons */}
                    <div className="flex gap-2">
                      <Zap className="h-6 w-6 text-yellow-400" />
                      <Database className="h-6 w-6 text-green-400" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {exp.description.map((desc, descIndex) => (
                      <motion.div
                        key={descIndex}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: descIndex * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-start"
                      >
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-4 flex-shrink-0 shadow-lg shadow-cyan-400/50"></div>
                        <p className="text-gray-300 leading-relaxed">{desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
