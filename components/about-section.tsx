"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, Heart } from "lucide-react"

export default function AboutSection() {
  return (
    <div className="min-h-screen py-20 px-6 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            About Me
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            A dedicated 4th-year Computer Science student with expertise in software development, system reliability
            engineering, and AI research. Passionate about building scalable systems while exploring innovative AI
            solutions for real-world problems. Combines engineering fundamentals with research-driven approaches to
            deliver quality software solutions and advance technology through published research and practical
            implementations.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-1 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 h-full">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-purple-500/20 rounded-lg mr-4">
                    <Heart className="h-8 w-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Philosophy</h3>
                    <p className="text-purple-300">Core Beliefs</p>
                  </div>
                </div>

                <blockquote className="text-lg text-gray-300 italic leading-relaxed">
                  Technology is best when it brings people together and solves real-world problems. My approach combines
                  rigorous research with practical implementation to create solutions that matter.
                </blockquote>

                <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <p className="text-purple-300 text-sm font-medium">
                    Driven by curiosity, powered by innovation, guided by purpose.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <div className="relative">
            <div className="w-[500px] h-[300px] bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300 border border-white/20">
              {/* Material UI-style card header */}
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl flex items-center px-8">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">VIT UNIVERSITY</h3>
                    <p className="text-blue-100 text-sm">Student Identification</p>
                  </div>
                </div>
                <div className="ml-auto">
                  <div className="w-16 h-10 bg-white/20 rounded flex items-center justify-center">
                    <span className="text-white text-sm font-bold">ID</span>
                  </div>
                </div>
              </div>

              {/* Card content */}
              <div className="pt-24 p-8 h-full flex justify-between">
                <div className="flex-1">
                  <div className="space-y-4">
                    <div>
                      <p className="text-blue-200 text-sm uppercase tracking-wide">Student Name</p>
                      <h4 className="text-white font-bold text-2xl">Sampark Bhol</h4>
                    </div>

                    <div>
                      <p className="text-blue-200 text-sm uppercase tracking-wide">Program</p>
                      <p className="text-white font-medium text-lg">Computer Science & Engineering</p>
                    </div>

                    <div className="flex space-x-8">
                      <div>
                        <p className="text-blue-200 text-sm uppercase tracking-wide">Campus</p>
                        <p className="text-white text-lg">VIT Vellore</p>
                      </div>
                      <div>
                        <p className="text-blue-200 text-sm uppercase tracking-wide">Batch</p>
                        <p className="text-white text-lg">2022 - 2026</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile section */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center border-2 border-white/30">
                    <span className="text-white font-bold text-3xl">SB</span>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <span className="px-3 py-1 bg-green-500/80 text-white text-sm rounded font-medium text-center">
                      AI/ML Focus
                    </span>
                    <span className="px-3 py-1 bg-blue-500/80 text-white text-sm rounded font-medium text-center">
                      Research
                    </span>
                    <span className="px-3 py-1 bg-purple-500/80 text-white text-sm rounded font-medium text-center">
                      Innovation
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom stripe */}
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-b-2xl"></div>

              {/* Holographic effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl pointer-events-none"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
