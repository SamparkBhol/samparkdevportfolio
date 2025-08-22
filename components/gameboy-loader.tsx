"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const depressingQuotes = [
  "Loading another day of pretending everything is fine...",
  "Loading Portfolio...",
  "Buffering... just like my career prospects",
  "Initializing... the void in my soul",
  "Processing... my existential dread",
  "Compiling... reasons to keep coding",
  "Rendering... my shattered dreams",
  "Connecting... to the inevitable disappointment",
  "Loading the developer ecosystem...",
]

export default function GameboyLoader() {
  const [currentQuote, setCurrentQuote] = useState(0)
  const [progress, setProgress] = useState(0)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)

  const playStartupSound = () => {
    if (typeof window !== "undefined" && !audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      setAudioContext(ctx)

      // Classic Game Boy startup sound
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
      oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1) // E5
      oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2) // G5
      oscillator.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.3) // C6

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.5)
    }
  }

  useEffect(() => {
    playStartupSound()

    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % depressingQuotes.length)
    }, 2000)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100
        return prev + Math.random() * 2
      })
    }, 100)

    return () => {
      clearInterval(quoteInterval)
      clearInterval(progressInterval)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center">
      {/* Hacking Matrix Background */}
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-green-400 font-mono text-xs"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          >
            {Math.random() > 0.5 ? "01" : "10"}
          </motion.div>
        ))}
      </div>

      {/* Animated Grid Lines */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#00ff00" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Scanning Lines */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/10 to-transparent h-20"
        animate={{ y: ["-100px", "calc(100vh + 100px)"] }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      <motion.div
        className="relative z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Game Boy Body - More realistic colors and styling */}
        <div className="w-96 h-[500px] bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 rounded-3xl shadow-2xl border-4 border-gray-500 relative overflow-hidden">
          {/* Power LED */}
          <div className="absolute top-6 right-8 w-3 h-3 bg-red-500 rounded-full shadow-lg animate-pulse"></div>

          {/* Screen Bezel */}
          <div className="absolute top-20 left-8 right-8 h-40 bg-black rounded-lg border-4 border-gray-600 shadow-inner">
            {/* LCD Screen */}
            <div className="w-full h-full bg-gradient-to-b from-green-300 via-green-400 to-green-500 relative flex flex-col items-center justify-center overflow-hidden">
              {/* Screen reflection effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10"></div>

              {/* Game Boy branding */}
              <div className="absolute top-2 left-0 right-0 text-center">
                <div className="text-green-900 font-bold text-xs tracking-wider">GAME BOY</div>
              </div>

              {/* Loading content */}
              <div className="relative z-10 text-center px-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuote}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-green-900 font-mono text-xs mb-4 leading-tight"
                  >
                    {depressingQuotes[currentQuote]}
                  </motion.div>
                </AnimatePresence>

                {/* Progress bar */}
                <div className="w-32 h-3 bg-green-900/30 rounded mb-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-green-800 rounded flex items-center"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  >
                    <div className="w-full h-full bg-gradient-to-r from-green-700 to-green-600"></div>
                  </motion.div>
                </div>

                <div className="text-green-900 font-mono text-xs font-bold">{Math.floor(progress)}%</div>

                {/* Loading dots */}
                <div className="flex justify-center space-x-1 mt-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 bg-green-800 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>

              {/* Scanlines effect */}
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="w-full h-px bg-black/20" style={{ top: `${i * 5}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Nintendo branding */}
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-gray-700 font-bold text-sm tracking-wider">
            Nintendo
          </div>
          <div className="absolute top-[270px] left-1/2 transform -translate-x-1/2 text-gray-600 text-xs">GAME BOY</div>

          {/* D-Pad */}
          <div className="absolute bottom-32 left-12">
            <div className="relative w-16 h-16">
              <div className="absolute top-1/2 left-0 w-full h-5 bg-gradient-to-b from-gray-600 to-gray-800 transform -translate-y-1/2 rounded shadow-lg"></div>
              <div className="absolute left-1/2 top-0 w-5 h-full bg-gradient-to-r from-gray-600 to-gray-800 transform -translate-x-1/2 rounded shadow-lg"></div>
              <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-gray-700 transform -translate-x-1/2 -translate-y-1/2 rounded"></div>
            </div>
          </div>

          {/* A/B Buttons */}
          <div className="absolute bottom-32 right-12 flex space-x-6">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-b from-gray-500 to-gray-700 rounded-full shadow-lg border-2 border-gray-600"></div>
              <div className="absolute inset-1 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-sm font-bold">B</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-b from-gray-500 to-gray-700 rounded-full shadow-lg border-2 border-gray-600"></div>
              <div className="absolute inset-1 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-sm font-bold">A</span>
              </div>
            </div>
          </div>

          {/* Start/Select buttons */}
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-4 bg-gradient-to-b from-gray-600 to-gray-800 rounded-full shadow-lg"></div>
              <span className="text-gray-600 text-xs mt-1 font-bold">SELECT</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-4 bg-gradient-to-b from-gray-600 to-gray-800 rounded-full shadow-lg"></div>
              <span className="text-gray-600 text-xs mt-1 font-bold">START</span>
            </div>
          </div>

          {/* Speaker grille */}
          <div className="absolute top-[300px] left-12 grid grid-cols-6 gap-1">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 bg-gray-600 rounded-full shadow-inner"></div>
            ))}
          </div>

          {/* Volume wheel */}
          <div className="absolute left-2 top-32 w-6 h-6 bg-gradient-to-b from-gray-500 to-gray-700 rounded-full border-2 border-gray-600">
            <div className="absolute inset-1 bg-gray-600 rounded-full">
              <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-gray-400 transform -translate-x-1/2"></div>
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-full text-center">
          <div className="text-gray-600 font-mono text-sm mb-2">Press START to continue your pair</div>
          <div className="text-gray-500 text-xs">Loading the developer ecosystem...</div>
          <div className="text-gray-400 text-xs mt-1">
            // Why <span className="font-bold text-gray-600">SAMPARK BHOL</span> //more...
          </div>
        </div>
      </motion.div>
    </div>
  )
}
