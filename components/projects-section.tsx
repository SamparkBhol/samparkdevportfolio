"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, Play, Code, Brain, Leaf, BarChart3 } from "lucide-react"

const projects = [
  {
    id: 1,
    title: "Browser-LLM",
    description:
      "Engineered a cutting-edge client-side AI chatbot with WebGPU-accelerated LLM inference engine, enabling ChatGPT-like conversational AI entirely offline without backend infrastructure dependencies",
    features: [
      "Real-time token streaming and Web Workers architecture",
      "WebGPU-accelerated inference with sub-second response latency",
      "Open-source transformer models like Llama integration",
      "Optimized model quantization for browser environments",
    ],
    tech: ["WebGPU", "LLM", "Web Workers", "Llama", "TensorFlow.js"],
    link: "https://browser-llm-three.vercel.app/",
    github: "#",
    icon: Brain,
    color: "from-blue-600 to-cyan-600",
    video: "/ai-chatbot-interface.png",
  },
  {
    id: 2,
    title: "LeafGuard AI",
    description:
      "Comprehensive plant disease diagnosis web application using React frontend architecture and TensorFlow.js for client-side machine learning inference, enabling real-time agricultural AI assistance",
    features: [
      "CNN model trained on PlantVillage dataset (50,000+ images)",
      "87%+ accuracy for multi-class disease classification",
      "Sophisticated image preprocessing pipeline in JavaScript",
      "Real-time in-browser deep learning inference",
    ],
    tech: ["React", "TensorFlow.js", "CNN", "Computer Vision", "FastAPI"],
    link: "https://plant-project-stuff-trial-fork-git-2d5609-samparkbhols-projects.vercel.app/",
    github: "#",
    icon: Leaf,
    color: "from-green-600 to-emerald-600",
    video: "/plant-disease-detection-app.png",
  },
  {
    id: 3,
    title: "DataWiz-Pro",
    description:
      "Built comprehensive AI-powered analytics platform combining automated data processing, advanced machine learning modeling, and LLM-generated insights for end-to-end data science workflows",
    features: [
      "Scalable backend APIs using Python and FastAPI",
      "Multiple ML algorithms with hyperparameter optimization",
      "Data ingestion for CSV, JSON, XLSX formats",
      "LLM-generated insights and automated reporting",
    ],
    tech: ["Python", "FastAPI", "Machine Learning", "LLM", "Data Science"],
    link: "https://data-wiz-pro.vercel.app/",
    github: "#",
    icon: BarChart3,
    color: "from-purple-600 to-pink-600",
    video: "/data-analytics-dashboard.png",
  },
  {
    id: 4,
    title: "AssignoFast",
    description:
      "Smart assignment management app for students, designed to sync assignment data and timetables from Firebase while supporting offline access using SQLite",
    features: [
      "Flutter cross-platform development",
      "Firebase real-time synchronization",
      "SQLite offline support",
      "Kotlin-based Android widget for quick updates",
    ],
    tech: ["Flutter", "Firebase", "SQLite", "Kotlin", "Swift"],
    link: "https://assignofast.ieeecsvit.com/",
    github: "#",
    icon: Code,
    color: "from-orange-600 to-red-600",
    video: "/mobile-assignment-management-app.png",
  },
]

export default function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null)

  return (
    <div className="min-h-screen py-20 px-6 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Projects
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Cutting-edge applications showcasing advanced AI, machine learning, and full-stack development
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card
                className={`bg-gradient-to-br ${project.color}/10 border border-gray-700 hover:border-gray-500 transition-all duration-300 overflow-hidden h-full`}
              >
                <CardContent className="p-0">
                  {/* Project Preview */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={project.video || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${project.color}/20 to-transparent`} />

                    {/* Overlay Icons */}
                    <div className="absolute top-4 left-4">
                      <div className={`p-3 bg-gradient-to-br ${project.color}/80 rounded-lg`}>
                        <project.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    <div className="absolute top-4 right-4 flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-black/50 hover:bg-black/70 text-white border-none"
                        onClick={() => window.open(project.link, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-black/50 hover:bg-black/70 text-white border-none"
                        onClick={() => window.open(project.github, "_blank")}
                      >
                        <Github className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="lg"
                        className={`bg-gradient-to-r ${project.color} hover:scale-110 transition-transform duration-200`}
                        onClick={() => setSelectedProject(project.id)}
                      >
                        <Play className="h-6 w-6 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-3">{project.title}</h3>
                    <p className="text-gray-300 mb-4 leading-relaxed">{project.description}</p>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tech.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className={`px-3 py-1 bg-gradient-to-r ${project.color}/20 text-white rounded-full text-sm border border-gray-600`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Button
                        className={`bg-gradient-to-r ${project.color} hover:opacity-90 flex-1`}
                        onClick={() => window.open(project.link, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Live Demo
                      </Button>
                      <Button
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                        onClick={() => setSelectedProject(project.id)}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Project Detail Modal */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {(() => {
                  const project = projects.find((p) => p.id === selectedProject)
                  if (!project) return null

                  return (
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-3xl font-bold text-white">{project.title}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedProject(null)}
                          className="text-gray-400 hover:text-white"
                        >
                          ✕
                        </Button>
                      </div>

                      <div className="mb-6">
                        <img
                          src={project.video || "/placeholder.svg"}
                          alt={project.title}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      </div>

                      <p className="text-gray-300 mb-6 text-lg leading-relaxed">{project.description}</p>

                      <div className="mb-6">
                        <h4 className="text-xl font-semibold text-white mb-4">Key Features</h4>
                        <ul className="space-y-2">
                          {project.features.map((feature, index) => (
                            <li key={index} className="flex items-start text-gray-300">
                              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex space-x-4">
                        <Button
                          className={`bg-gradient-to-r ${project.color}`}
                          onClick={() => window.open(project.link, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Live
                        </Button>
                        <Button
                          variant="outline"
                          className="border-gray-600 text-gray-300 bg-transparent"
                          onClick={() => window.open(project.github, "_blank")}
                        >
                          <Github className="h-4 w-4 mr-2" />
                          Source Code
                        </Button>
                      </div>
                    </div>
                  )
                })()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-4">Explore More Projects</h3>
            <p className="text-gray-300 mb-6">
              Discover additional projects, contributions, and open-source work on my GitHub profile
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3"
              onClick={() => window.open("https://github.com/samparkbhol", "_blank")}
            >
              <Github className="h-5 w-5 mr-2" />
              View All Projects on GitHub
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
