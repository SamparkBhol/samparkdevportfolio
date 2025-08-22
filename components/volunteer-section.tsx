"use client"

import { motion } from "framer-motion"
import {
  Users,
  Award,
  Zap,
  Play,
  Pause,
  Settings,
  Maximize2,
  Code,
  Database,
  Cpu,
  Monitor,
  Layers,
  GitBranch,
} from "lucide-react"
import { useState, useEffect } from "react"

const volunteerWork = [
  {
    organization: "IEEE Computer Society – VIT Vellore",
    role: "Event Organizer & Project Contributor",
    period: "2023 - Present",
    description:
      "Organized multiple technical events, hackathons, and workshops while contributing to collaborative chapter projects and promoting peer-to-peer learning.",
    achievements: [
      "Organized 5+ technical workshops",
      "Coordinated hackathons with 200+ participants",
      "Led collaborative chapter projects",
      "Promoted peer-to-peer learning initiatives",
    ],
    icon: Zap,
    color: "from-blue-600 to-cyan-600",
    engineType: "Physics Engine",
    components: ["RigidBody", "Collider", "EventTrigger", "ParticleSystem"],
  },
  {
    organization: "Association of Energy Engineers – VIT Vellore Student Chapter (AEE-VIT)",
    role: "Active Member & Event Participant",
    period: "2023 - 2024",
    description:
      "Participated in discussions and events focused on renewable energy, energy management systems, and sustainable engineering practices.",
    achievements: [
      "Active participation in energy forums",
      "Contributed to sustainability discussions",
      "Engaged in renewable energy projects",
      "Promoted sustainable engineering practices",
    ],
    icon: Award,
    color: "from-green-600 to-emerald-600",
    engineType: "Rendering Engine",
    components: ["MeshRenderer", "Material", "Shader", "LightSource"],
  },
]

export default function VolunteerSection() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [selectedObject, setSelectedObject] = useState(null)
  const [fps, setFps] = useState(60)
  const [memoryUsage, setMemoryUsage] = useState(245)

  useEffect(() => {
    const interval = setInterval(() => {
      setFps(Math.floor(Math.random() * 5) + 58)
      setMemoryUsage(Math.floor(Math.random() * 50) + 220)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

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
            Volunteer Affiliations
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Contributing to the community through active participation and leadership
          </p>
        </motion.div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg mb-8 overflow-hidden shadow-2xl">
          {/* Advanced Engine Menu Bar */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-750 border-b border-gray-600 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded flex items-center justify-center">
                  <Code className="h-3 w-3 text-white" />
                </div>
                <div className="text-white font-bold">Sampark Engine v2024.1</div>
              </div>
              <div className="flex space-x-4 text-sm text-gray-300">
                <span className="hover:text-white cursor-pointer">File</span>
                <span className="hover:text-white cursor-pointer">Edit</span>
                <span className="hover:text-white cursor-pointer">Assets</span>
                <span className="hover:text-white cursor-pointer">Build</span>
                <span className="hover:text-white cursor-pointer">Window</span>
                <span className="hover:text-white cursor-pointer">Tools</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <span>FPS: {fps}</span>
                <span>|</span>
                <span>Memory: {memoryUsage}MB</span>
              </div>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 hover:bg-gray-700 rounded transition-colors"
              >
                {isPlaying ? <Pause className="h-4 w-4 text-green-400" /> : <Play className="h-4 w-4 text-red-400" />}
              </button>
              <Settings className="h-4 w-4 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>

          <div className="flex h-[600px]">
            {/* Content Browser */}
            <div className="w-1/5 bg-gray-850 border-r border-gray-700 flex flex-col">
              <div className="p-3 border-b border-gray-700">
                <div className="text-white font-semibold mb-3 flex items-center justify-between">
                  Content Browser
                  <Layers className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-400 px-2 py-1">Volunteer Assets</div>
                  {volunteerWork.map((work, index) => (
                    <motion.div
                      key={index}
                      className={`cursor-pointer p-2 rounded text-sm transition-all duration-200 ${
                        selectedObject === index
                          ? "bg-blue-600 text-white shadow-lg"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                      onClick={() => setSelectedObject(index)}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center">
                        <div className="w-5 h-5 mr-2 flex items-center justify-center">
                          <work.icon className="h-3 w-3" />
                        </div>
                        <div>
                          <div className="font-medium">{work.organization.split(" – ")[0]}</div>
                          <div className="text-xs text-gray-400">{work.engineType}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Asset Details */}
              <div className="p-3 flex-1">
                <div className="text-white font-semibold mb-2 text-sm">Asset Details</div>
                {selectedObject !== null && (
                  <div className="space-y-2 text-xs">
                    <div className="bg-gray-800 p-2 rounded">
                      <div className="text-gray-400">Type:</div>
                      <div className="text-white">{volunteerWork[selectedObject].engineType}</div>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <div className="text-gray-400">Components:</div>
                      <div className="space-y-1 mt-1">
                        {volunteerWork[selectedObject].components.map((comp, i) => (
                          <div key={i} className="text-green-400 font-mono text-xs">
                            • {comp}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Viewport */}
            <div className="flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
              {/* Viewport Header */}
              <div className="absolute top-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-b border-gray-700 p-2 flex items-center justify-between z-10">
                <div className="flex items-center space-x-4">
                  <div className="text-white text-sm font-medium">Perspective Viewport</div>
                  <div className="flex space-x-2 text-xs text-gray-400">
                    <span>Lit</span>
                    <span>|</span>
                    <span>Realtime</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Monitor className="h-4 w-4 text-gray-400" />
                  <Maximize2 className="h-4 w-4 text-gray-400 hover:text-white cursor-pointer" />
                </div>
              </div>

              {/* 3D Scene with Advanced Visualization */}
              <div className="absolute inset-0 pt-12 flex items-center justify-center">
                <div className="relative w-80 h-80">
                  {/* Central Processing Hub */}
                  <motion.div
                    animate={{
                      rotateY: isPlaying ? 360 : 0,
                      scale: selectedObject !== null ? 1.1 : 1,
                    }}
                    transition={{
                      rotateY: { duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                      scale: { duration: 0.4 },
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div
                      className="w-24 h-24 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 rounded-xl shadow-2xl flex items-center justify-center transform-gpu relative"
                      style={{
                        boxShadow: "0 0 40px rgba(147, 51, 234, 0.6), inset 0 0 30px rgba(59, 130, 246, 0.4)",
                        transform: "rotateX(20deg) rotateY(20deg)",
                      }}
                    >
                      <Users className="h-12 w-12 text-white" />
                      {/* Pulsing Core */}
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        className="absolute inset-0 bg-gradient-to-br from-purple-400 to-cyan-400 rounded-xl"
                      />
                    </div>
                  </motion.div>

                  {/* Advanced Orbital System */}
                  {volunteerWork.map((work, index) => (
                    <motion.div
                      key={index}
                      animate={{
                        rotate: isPlaying ? (index % 2 === 0 ? 360 : -360) : 0,
                        scale: selectedObject === index ? 1.4 : 1,
                      }}
                      transition={{
                        rotate: {
                          duration: 12 + index * 4,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        },
                        scale: { duration: 0.4 },
                      }}
                      className="absolute inset-0"
                      style={{
                        transform: `scale(${1.3 + index * 0.5})`,
                      }}
                    >
                      <div className="relative w-full h-full">
                        <motion.div
                          animate={{
                            rotate: isPlaying ? (index % 2 === 0 ? -360 : 360) : 0,
                            y: isPlaying ? [0, -10, 0] : 0,
                          }}
                          transition={{
                            rotate: {
                              duration: 12 + index * 4,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "linear",
                            },
                            y: {
                              duration: 3 + index,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "easeInOut",
                            },
                          }}
                          className="absolute -top-4 left-1/2 transform -translate-x-1/2 cursor-pointer"
                          onClick={() => setSelectedObject(index)}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl shadow-2xl flex items-center justify-center transform-gpu transition-all duration-300 relative ${
                              selectedObject === index
                                ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                                : `bg-gradient-to-br ${work.color}`
                            }`}
                            style={{
                              boxShadow:
                                selectedObject === index
                                  ? "0 0 30px rgba(251, 191, 36, 0.8), 0 0 60px rgba(251, 191, 36, 0.4)"
                                  : "0 0 20px rgba(59, 130, 246, 0.4)",
                              transform: "rotateX(15deg) rotateY(15deg)",
                            }}
                          >
                            <work.icon className="h-5 w-5 text-white z-10" />
                            {/* Data Flow Effect */}
                            <motion.div
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 0.7, 0.3],
                                rotate: [0, 180, 360],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: index * 0.5,
                              }}
                              className="absolute inset-0 border-2 border-white/30 rounded-xl"
                            />
                          </div>
                        </motion.div>

                        {/* Enhanced Orbital Path with Data Streams */}
                        <div className="absolute inset-0 border border-dashed border-cyan-400/20 rounded-full" />
                        <motion.div
                          animate={{ rotate: isPlaying ? 360 : 0 }}
                          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className="absolute inset-0 border border-dotted border-purple-400/20 rounded-full"
                          style={{ transform: "rotate(45deg)" }}
                        />
                      </div>
                    </motion.div>
                  ))}

                  {/* Data Connection Lines */}
                  {selectedObject !== null && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 pointer-events-none"
                    >
                      {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            rotate: i * 45,
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            rotate: { duration: 0 },
                            scale: { duration: 2, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 },
                          }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="w-px h-32 bg-gradient-to-t from-transparent via-cyan-400/50 to-transparent" />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Advanced Grid System */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                    linear-gradient(rgba(147, 51, 234, 0.2) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(147, 51, 234, 0.2) 1px, transparent 1px)
                  `,
                  backgroundSize: "50px 50px, 50px 50px, 10px 10px, 10px 10px",
                }}
              />
            </div>

            {/* Advanced Properties Panel */}
            <div className="w-1/3 bg-gray-850 border-l border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <div className="text-white font-semibold mb-3 flex items-center justify-between">
                  Details Panel
                  <div className="flex space-x-1">
                    <Cpu className="h-4 w-4 text-gray-400" />
                    <Database className="h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {selectedObject !== null ? (
                  <div className="space-y-4">
                    {/* Transform Component */}
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium flex items-center">
                          <GitBranch className="h-4 w-4 mr-2" />
                          Transform
                        </h4>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="bg-gray-900 p-2 rounded">
                          <label className="text-gray-400 block mb-1">Position</label>
                          <div className="text-white font-mono">
                            <div>X: 0.0</div>
                            <div>Y: 0.0</div>
                            <div>Z: 0.0</div>
                          </div>
                        </div>
                        <div className="bg-gray-900 p-2 rounded">
                          <label className="text-gray-400 block mb-1">Rotation</label>
                          <div className="text-white font-mono">
                            <div>X: 20.0</div>
                            <div>Y: 20.0</div>
                            <div>Z: 0.0</div>
                          </div>
                        </div>
                        <div className="bg-gray-900 p-2 rounded">
                          <label className="text-gray-400 block mb-1">Scale</label>
                          <div className="text-white font-mono">
                            <div>X: 1.0</div>
                            <div>Y: 1.0</div>
                            <div>Z: 1.0</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Organization Component */}
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium">Organization Script</h4>
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="bg-gray-900 p-2 rounded">
                          <label className="text-gray-400 text-xs">Organization Name:</label>
                          <div className="text-white text-xs mt-1 font-mono">
                            {volunteerWork[selectedObject].organization}
                          </div>
                        </div>
                        <div className="bg-gray-900 p-2 rounded">
                          <label className="text-gray-400 text-xs">Role:</label>
                          <div className="text-white text-xs mt-1">{volunteerWork[selectedObject].role}</div>
                        </div>
                        <div className="bg-gray-900 p-2 rounded">
                          <label className="text-gray-400 text-xs">Duration:</label>
                          <div className="text-white text-xs mt-1">{volunteerWork[selectedObject].period}</div>
                        </div>
                      </div>
                    </div>

                    {/* Achievements System */}
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium">Achievement System</h4>
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                      <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                        {volunteerWork[selectedObject].achievements.map((achievement, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="text-green-400 font-mono bg-gray-900 p-2 rounded flex items-start"
                          >
                            <span className="text-green-500 mr-2">✓</span>
                            {achievement}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm text-center py-8">
                    <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Select an asset to view its properties and components
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Console/Output Log */}
          <div className="bg-gray-800 border-t border-gray-700 p-4 h-32">
            <div className="flex items-center justify-between mb-2">
              <div className="text-white font-semibold flex items-center">
                <Monitor className="h-4 w-4 mr-2" />
                Output Log
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                  Engine Running
                </span>
                <span>|</span>
                <span>Objects: {volunteerWork.length}</span>
                <span>|</span>
                <span>Draw Calls: {isPlaying ? Math.floor(Math.random() * 50) + 100 : 0}</span>
              </div>
            </div>
            <div className="text-xs font-mono space-y-1 max-h-20 overflow-y-auto">
              <div className="text-green-400">
                [INFO]{" "}
                {isPlaying
                  ? "▶ Volunteer simulation active - All systems operational"
                  : "⏸ Simulation paused - Systems on standby"}
              </div>
              <div className="text-blue-400">
                [SYSTEM] Physics engine initialized - {volunteerWork.length} volunteer objects loaded
              </div>
              <div className="text-yellow-400">
                [RENDER] Orbital mechanics calculated - Frame time: {(1000 / fps).toFixed(2)}ms
              </div>
              {selectedObject !== null && (
                <div className="text-cyan-400">
                  [DEBUG] Selected: {volunteerWork[selectedObject].organization.split(" – ")[0]} - Components active
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
