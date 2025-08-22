"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Package,
  Download,
  Terminal,
  Gamepad2,
  Wrench,
  Folder,
  Settings,
  GitBranch,
  Bug,
  Utensils as Extensions,
} from "lucide-react"
import { useState } from "react"

const packages = [
  {
    name: "cli-legend",
    description: "A fun command-line roguelike dungeon game",
    version: "1.0.0",
    installCmd: "npm i cli-legend",
    icon: Gamepad2,
    color: "from-green-600 to-emerald-600",
    features: ["ASCII Graphics", "Dungeon Exploration", "Turn-based Combat", "Inventory System"],
    downloads: "1.2k",
    size: "45.2 KB",
  },
  {
    name: "gamedev-simple-utils",
    description: "A simple utility package for game development",
    version: "1.0.0",
    installCmd: "npm i gamedev-simple-utils",
    icon: Wrench,
    color: "from-blue-600 to-cyan-600",
    features: ["Vector Math", "Collision Detection", "Animation Helpers", "Input Management"],
    downloads: "856",
    size: "32.1 KB",
  },
  {
    name: "dev-toolkit-sampark",
    description:
      "🛠 A Gen Z-inspired CLI toolkit for modern developers — from linting gently to yeeting your node_modules",
    version: "1.0.0",
    installCmd: "npm i dev-toolkit-sampark",
    icon: Terminal,
    color: "from-purple-600 to-pink-600",
    features: ["Smart Linting", "Project Cleanup", "Dev Shortcuts", "Gen Z Vibes"],
    downloads: "2.1k",
    size: "28.7 KB",
  },
]

export default function NPMPackagesSection() {
  const [activeTab, setActiveTab] = useState("package.json")
  const [selectedPackage, setSelectedPackage] = useState(packages[0])
  const [terminalOutput, setTerminalOutput] = useState("")

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setTerminalOutput(`Copied: ${text}`)
  }

  const runCommand = (cmd: string) => {
    setTerminalOutput(
      `$ ${cmd}\n✓ Package installed successfully!\n+ ${selectedPackage.name}@${selectedPackage.version}\nadded 1 package in 2.3s`,
    )
  }

  return (
    <div className="min-h-screen py-20 px-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            NPM Packages
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Interactive VSCode environment showcasing published packages
          </p>
        </motion.div>

        {/* Full VSCode Interface */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-[#1e1e1e] rounded-lg border border-gray-700 overflow-hidden shadow-2xl"
        >
          {/* VSCode Title Bar */}
          <div className="bg-[#323233] px-4 py-2 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-[#ff5f57] rounded-full"></div>
                <div className="w-3 h-3 bg-[#ffbd2e] rounded-full"></div>
                <div className="w-3 h-3 bg-[#28ca42] rounded-full"></div>
              </div>
              <span className="text-gray-300 text-sm">Visual Studio Code</span>
            </div>
            <div className="flex items-center space-x-4 text-gray-400 text-sm">
              <span>sampark-packages</span>
              <div className="flex space-x-2">
                <Settings className="h-4 w-4 cursor-pointer hover:text-white" />
                <Extensions className="h-4 w-4 cursor-pointer hover:text-white" />
              </div>
            </div>
          </div>

          {/* VSCode Menu Bar */}
          <div className="bg-[#2d2d30] border-b border-gray-700 px-4 py-1 text-sm text-gray-300">
            <div className="flex space-x-6">
              <span className="hover:bg-gray-600 px-2 py-1 rounded cursor-pointer">File</span>
              <span className="hover:bg-gray-600 px-2 py-1 rounded cursor-pointer">Edit</span>
              <span className="hover:bg-gray-600 px-2 py-1 rounded cursor-pointer">View</span>
              <span className="hover:bg-gray-600 px-2 py-1 rounded cursor-pointer">Go</span>
              <span className="hover:bg-gray-600 px-2 py-1 rounded cursor-pointer">Run</span>
              <span className="hover:bg-gray-600 px-2 py-1 rounded cursor-pointer">Terminal</span>
            </div>
          </div>

          <div className="flex h-[600px]">
            {/* Sidebar */}
            <div className="w-64 bg-[#252526] border-r border-gray-700 flex flex-col">
              {/* Activity Bar */}
              <div className="flex items-center p-3 border-b border-gray-700">
                <Folder className="h-5 w-5 text-blue-400 mr-2" />
                <span className="text-gray-300 font-medium">EXPLORER</span>
              </div>

              {/* File Tree */}
              <div className="flex-1 p-2 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center text-gray-300 hover:bg-gray-600 px-2 py-1 rounded cursor-pointer">
                    <Folder className="h-4 w-4 mr-2 text-blue-400" />
                    <span>packages</span>
                  </div>
                  {packages.map((pkg, index) => (
                    <div
                      key={index}
                      className="ml-4 flex items-center text-gray-400 hover:bg-gray-600 px-2 py-1 rounded cursor-pointer"
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      <pkg.icon className="h-4 w-4 mr-2" />
                      <span>{pkg.name}</span>
                    </div>
                  ))}
                  <div
                    className={`flex items-center px-2 py-1 rounded cursor-pointer ${activeTab === "package.json" ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600"}`}
                    onClick={() => setActiveTab("package.json")}
                  >
                    <Package className="h-4 w-4 mr-2 text-yellow-400" />
                    <span>package.json</span>
                  </div>
                  <div
                    className={`flex items-center px-2 py-1 rounded cursor-pointer ${activeTab === "terminal" ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600"}`}
                    onClick={() => setActiveTab("terminal")}
                  >
                    <Terminal className="h-4 w-4 mr-2 text-green-400" />
                    <span>terminal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
              {/* Tab Bar */}
              <div className="bg-[#2d2d30] border-b border-gray-700 flex">
                <div
                  className={`px-4 py-2 text-sm border-r border-gray-700 cursor-pointer flex items-center ${activeTab === "package.json" ? "bg-[#1e1e1e] text-white" : "text-gray-400 hover:text-white"}`}
                  onClick={() => setActiveTab("package.json")}
                >
                  <Package className="h-4 w-4 mr-2 text-yellow-400" />
                  package.json
                </div>
                <div
                  className={`px-4 py-2 text-sm border-r border-gray-700 cursor-pointer flex items-center ${activeTab === "terminal" ? "bg-[#1e1e1e] text-white" : "text-gray-400 hover:text-white"}`}
                  onClick={() => setActiveTab("terminal")}
                >
                  <Terminal className="h-4 w-4 mr-2 text-green-400" />
                  Terminal
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto">
                {activeTab === "package.json" && (
                  <div className="p-4 font-mono text-sm">
                    <div className="flex text-gray-500 text-xs mb-2">
                      <span className="w-8">1</span>
                      <span className="text-gray-300">{"{"}</span>
                    </div>
                    <div className="flex text-gray-500 text-xs mb-2">
                      <span className="w-8">2</span>
                      <span className="ml-4 text-blue-400">"name"</span>
                      <span className="text-gray-300">: </span>
                      <span className="text-green-400">"{selectedPackage.name}"</span>
                      <span className="text-gray-300">,</span>
                    </div>
                    <div className="flex text-gray-500 text-xs mb-2">
                      <span className="w-8">3</span>
                      <span className="ml-4 text-blue-400">"version"</span>
                      <span className="text-gray-300">: </span>
                      <span className="text-green-400">"{selectedPackage.version}"</span>
                      <span className="text-gray-300">,</span>
                    </div>
                    <div className="flex text-gray-500 text-xs mb-2">
                      <span className="w-8">4</span>
                      <span className="ml-4 text-blue-400">"description"</span>
                      <span className="text-gray-300">: </span>
                      <span className="text-green-400">"{selectedPackage.description}"</span>
                      <span className="text-gray-300">,</span>
                    </div>
                    <div className="flex text-gray-500 text-xs mb-2">
                      <span className="w-8">5</span>
                      <span className="ml-4 text-blue-400">"main"</span>
                      <span className="text-gray-300">: </span>
                      <span className="text-green-400">"index.js"</span>
                      <span className="text-gray-300">,</span>
                    </div>
                    <div className="flex text-gray-500 text-xs mb-2">
                      <span className="w-8">6</span>
                      <span className="ml-4 text-blue-400">"author"</span>
                      <span className="text-gray-300">: </span>
                      <span className="text-green-400">"Sampark Bhol"</span>
                      <span className="text-gray-300">,</span>
                    </div>
                    <div className="flex text-gray-500 text-xs mb-2">
                      <span className="w-8">7</span>
                      <span className="ml-4 text-blue-400">"keywords"</span>
                      <span className="text-gray-300">: [</span>
                    </div>
                    {selectedPackage.features.map((feature, index) => (
                      <div key={index} className="flex text-gray-500 text-xs mb-2">
                        <span className="w-8">{8 + index}</span>
                        <span className="ml-8 text-green-400">"{feature.toLowerCase().replace(" ", "-")}"</span>
                        <span className="text-gray-300">{index < selectedPackage.features.length - 1 ? "," : ""}</span>
                      </div>
                    ))}
                    <div className="flex text-gray-500 text-xs mb-2">
                      <span className="w-8">{8 + selectedPackage.features.length}</span>
                      <span className="ml-4 text-gray-300">]</span>
                    </div>
                    <div className="flex text-gray-500 text-xs">
                      <span className="w-8">{9 + selectedPackage.features.length}</span>
                      <span className="text-gray-300">{"}"}</span>
                    </div>
                  </div>
                )}

                {activeTab === "terminal" && (
                  <div className="p-4 bg-[#0c0c0c] text-green-400 font-mono text-sm h-full">
                    <div className="mb-4">
                      <span className="text-blue-400">sampark@portfolio</span>
                      <span className="text-white">:</span>
                      <span className="text-green-400">~/packages</span>
                      <span className="text-white">$ </span>
                    </div>

                    {/* Interactive Commands */}
                    <div className="space-y-2 mb-4">
                      <button
                        className="block text-left hover:bg-gray-800 px-2 py-1 rounded w-full"
                        onClick={() => runCommand(selectedPackage.installCmd)}
                      >
                        <span className="text-yellow-400">→</span> {selectedPackage.installCmd}
                      </button>
                      <button
                        className="block text-left hover:bg-gray-800 px-2 py-1 rounded w-full"
                        onClick={() =>
                          setTerminalOutput(
                            `Package: ${selectedPackage.name}\nVersion: ${selectedPackage.version}\nSize: ${selectedPackage.size}\nDownloads: ${selectedPackage.downloads}/week`,
                          )
                        }
                      >
                        <span className="text-yellow-400">→</span> npm info {selectedPackage.name}
                      </button>
                      <button
                        className="block text-left hover:bg-gray-800 px-2 py-1 rounded w-full"
                        onClick={() =>
                          setTerminalOutput(
                            "ls -la\ntotal 24\ndrwxr-xr-x  3 sampark  staff   96 Dec 22 10:30 .\ndrwxr-xr-x  5 sampark  staff  160 Dec 22 10:29 ..\n-rw-r--r--  1 sampark  staff  1.2K Dec 22 10:30 package.json\n-rw-r--r--  1 sampark  staff  2.1K Dec 22 10:30 README.md\ndrwxr-xr-x  3 sampark  staff   96 Dec 22 10:30 src",
                          )
                        }
                      >
                        <span className="text-yellow-400">→</span> ls -la
                      </button>
                    </div>

                    {/* Terminal Output */}
                    {terminalOutput && (
                      <div className="bg-gray-900 p-3 rounded border border-gray-700 whitespace-pre-wrap">
                        {terminalOutput}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Package Details Panel */}
            <div className="w-80 bg-[#252526] border-l border-gray-700 p-4">
              <div className="mb-4">
                <h3 className="text-white font-semibold mb-2 flex items-center">
                  <selectedPackage.icon className="h-5 w-5 mr-2" />
                  {selectedPackage.name}
                </h3>
                <p className="text-gray-400 text-sm mb-3">{selectedPackage.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Version:</span>
                    <span className="text-white">{selectedPackage.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Downloads:</span>
                    <span className="text-white">{selectedPackage.downloads}/week</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Size:</span>
                    <span className="text-white">{selectedPackage.size}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-white font-medium mb-2">Features</h4>
                <div className="space-y-1">
                  {selectedPackage.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className={`w-full bg-gradient-to-r ${selectedPackage.color} hover:opacity-90`}
                  onClick={() => window.open(`https://www.npmjs.com/package/${selectedPackage.name}`, "_blank")}
                >
                  <Package className="h-4 w-4 mr-2" />
                  View on NPM
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                  onClick={() => copyToClipboard(selectedPackage.installCmd)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Copy Install
                </Button>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="bg-[#007acc] px-4 py-1 flex justify-between items-center text-white text-xs">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <GitBranch className="h-3 w-3" />
                <span>main</span>
              </div>
              <div className="flex items-center space-x-1">
                <Bug className="h-3 w-3" />
                <span>0</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span>Ln 1, Col 1</span>
              <span>UTF-8</span>
              <span>JavaScript</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
