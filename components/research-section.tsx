"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { BookOpen, ExternalLink, FileText, Lock, Award, ChevronLeft, ChevronRight } from "lucide-react"

const research = [
  {
    id: 1,
    title: "An Energy Efficient Hybrid Communication Protocol for Large Area Wireless Sensor Networks",
    journal: "Elsevier Procedia Computer Science (ICECMSN)",
    status: "Published",
    description:
      "Authored and published research on novel energy-efficient routing algorithm for Wireless Sensor Networks (WSN) capable of operating effectively across large-scale deployment areas with improved network lifetime. Focused on optimizing wireless communication algorithms for enhanced system efficiency in large-scale sensor deployments.",
    link: "https://www.sciencedirect.com/science/article/pii/S1877050925000596",
    type: "published",
    icon: Award,
    pages: [
      {
        title: "Abstract",
        content:
          "This research presents a novel energy-efficient hybrid communication protocol designed specifically for large area Wireless Sensor Networks (WSN). The proposed algorithm addresses the critical challenge of network lifetime optimization while maintaining reliable data transmission across extensive deployment areas.",
      },
      {
        title: "Methodology",
        content:
          "Our approach combines hierarchical clustering with adaptive routing mechanisms, implementing a dual-phase communication strategy that significantly reduces energy consumption. The protocol dynamically adjusts transmission power and routing paths based on network topology and energy levels.",
      },
      {
        title: "Results",
        content:
          "Experimental results demonstrate a 35% improvement in network lifetime compared to existing protocols, with maintained data delivery rates above 95%. The algorithm shows particular effectiveness in large-scale deployments with over 1000 sensor nodes.",
      },
    ],
  },
  {
    id: 2,
    title: "Novel Thesis & 2 Ongoing Research Papers",
    journal: "Details Confidential",
    status: "In Progress",
    description:
      "Working on a novel thesis related to AI and a different research project. Specifics are confidential due to ongoing work. These projects represent cutting-edge research in artificial intelligence and machine learning applications.",
    link: "#",
    type: "confidential",
    icon: Lock,
    pages: [
      {
        title: "Overview",
        content:
          "Currently developing groundbreaking research in artificial intelligence applications, focusing on novel approaches to machine learning optimization and neural network architectures. The work involves proprietary algorithms and methodologies.",
      },
      {
        title: "Research Areas",
        content:
          "The ongoing projects span multiple domains including deep learning optimization, computer vision applications, and natural language processing. Each project addresses specific challenges in AI implementation and scalability.",
      },
      {
        title: "Expected Impact",
        content:
          "Upon completion, these research contributions are expected to advance the state-of-the-art in AI applications, with potential implications for industry-scale implementations and academic research directions.",
      },
    ],
  },
]

export default function ResearchSection() {
  const [openBook, setOpenBook] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(0)

  const handlePageTurn = (direction: "next" | "prev") => {
    const paper = research.find((p) => p.id === openBook)
    if (!paper) return

    if (direction === "next" && currentPage < paper.pages.length - 1) {
      setCurrentPage(currentPage + 1)
    } else if (direction === "prev" && currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div className="min-h-screen py-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 via-black to-amber-900/20">
        {/* Floating ancient books */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -40, -20],
              rotate: [-5, 5, -5],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4,
              delay: i * 0.2,
              repeat: Number.POSITIVE_INFINITY,
            }}
          >
            <BookOpen className="h-8 w-8 text-amber-400" />
          </motion.div>
        ))}

        {/* Ancient scrolls background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-amber-600/20 flex items-center justify-center">
                <FileText className="h-4 w-4 text-amber-600" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-6xl font-bold mb-6 relative">
            <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-600 bg-clip-text text-transparent">
              Research Grimoire
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-600 bg-clip-text text-transparent blur-lg opacity-50">
              Research Grimoire
            </div>
          </h2>
          <p className="text-xl text-amber-300 max-w-3xl mx-auto font-serif italic">
            "Knowledge is the treasure of a wise man" - Ancient scrolls of academic wisdom
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {research.map((paper, index) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, rotateY: -15 }}
              whileInView={{ opacity: 1, rotateY: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="perspective-1000"
            >
              <div
                className={`relative cursor-pointer transition-all duration-700 transform-style-preserve-3d ${
                  openBook === paper.id ? "rotate-y-15 scale-105" : "hover:rotate-y-8 hover:scale-102"
                }`}
                onClick={() => {
                  setOpenBook(openBook === paper.id ? null : paper.id)
                  setCurrentPage(0)
                }}
              >
                {/* Enhanced Book Cover with leather texture */}
                <div
                  className={`w-full h-[450px] relative overflow-hidden rounded-lg shadow-2xl border-4 ${
                    paper.type === "published"
                      ? "bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900 border-amber-600"
                      : "bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 border-gray-600"
                  }`}
                  style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                                     radial-gradient(circle at 80% 50%, rgba(255,255,255,0.05) 0%, transparent 50%),
                                     linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)`,
                  }}
                >
                  {/* Leather binding spine with metal clasps */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-12 ${
                      paper.type === "published"
                        ? "bg-gradient-to-r from-amber-900 via-amber-800 to-amber-700"
                        : "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700"
                    } border-r-4 border-amber-600`}
                  >
                    {/* Metal clasps */}
                    <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-3 h-6 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-sm shadow-lg"></div>
                    <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-3 h-6 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-sm shadow-lg"></div>
                  </div>

                  {/* Book Content with enhanced styling */}
                  <div className="p-8 h-full flex flex-col justify-between ml-8">
                    <div>
                      <div className="flex items-center mb-6">
                        <paper.icon
                          className={`h-10 w-10 mr-4 ${
                            paper.type === "published" ? "text-amber-300" : "text-gray-300"
                          }`}
                        />
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${
                            paper.status === "Published"
                              ? "bg-green-500/20 text-green-300 border-green-500/50 shadow-lg shadow-green-500/20"
                              : "bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-lg shadow-orange-500/20"
                          }`}
                        >
                          {paper.status}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-6 leading-tight font-serif">{paper.title}</h3>

                      <p
                        className={`font-medium mb-6 text-lg ${
                          paper.type === "published" ? "text-amber-200" : "text-gray-200"
                        }`}
                      >
                        {paper.journal}
                      </p>

                      <p className="text-gray-300 text-sm leading-relaxed font-serif italic">
                        "{paper.description.substring(0, 120)}..."
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div
                        className={`flex items-center ${
                          paper.type === "published" ? "text-amber-300" : "text-gray-300"
                        }`}
                      >
                        <BookOpen className="h-6 w-6 mr-2" />
                        <span className="text-sm font-serif">Open Tome</span>
                      </div>

                      {paper.type === "published" && (
                        <Button
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/30"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(paper.link, "_blank")
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Read Scroll
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Enhanced book pages effect with realistic depth */}
                  <div className="absolute right-3 top-4 bottom-4 w-1 bg-white/30 rounded-sm shadow-sm"></div>
                  <div className="absolute right-5 top-6 bottom-6 w-1 bg-white/20 rounded-sm shadow-sm"></div>
                  <div className="absolute right-7 top-8 bottom-8 w-1 bg-white/10 rounded-sm shadow-sm"></div>
                  <div className="absolute right-9 top-10 bottom-10 w-1 bg-white/5 rounded-sm shadow-sm"></div>
                </div>

                {/* Enhanced shadow with multiple layers */}
                <div className="absolute inset-0 bg-black/30 rounded-lg transform translate-x-3 translate-y-3 -z-10 blur-sm"></div>
                <div className="absolute inset-0 bg-black/20 rounded-lg transform translate-x-6 translate-y-6 -z-20 blur-md"></div>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {openBook && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setOpenBook(null)}
            >
              <motion.div
                initial={{ rotateY: -90, scale: 0.8 }}
                animate={{ rotateY: 0, scale: 1 }}
                exit={{ rotateY: 90, scale: 0.8 }}
                className="bg-gradient-to-br from-amber-50 via-amber-25 to-yellow-50 text-black rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl border-4 border-amber-600 relative"
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundImage: `radial-gradient(circle at 10% 20%, rgba(255,248,220,0.8) 0%, transparent 50%),
                                   radial-gradient(circle at 90% 80%, rgba(255,248,220,0.6) 0%, transparent 50%),
                                   linear-gradient(45deg, transparent 48%, rgba(139,69,19,0.03) 50%, transparent 52%)`,
                }}
              >
                {(() => {
                  const paper = research.find((p) => p.id === openBook)
                  if (!paper) return null

                  return (
                    <>
                      {/* Book header with enhanced styling */}
                      <div className="p-8 border-b-2 border-amber-200 bg-gradient-to-r from-amber-100 to-yellow-100">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <paper.icon className="h-10 w-10 text-amber-700 mr-4" />
                            <span
                              className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${
                                paper.status === "Published"
                                  ? "bg-green-500/20 text-green-700 border-green-500/50"
                                  : "bg-orange-500/20 text-orange-700 border-orange-500/50"
                              }`}
                            >
                              {paper.status}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setOpenBook(null)}
                            className="text-gray-600 hover:text-black hover:bg-amber-200"
                          >
                            ✕
                          </Button>
                        </div>

                        <h3 className="text-3xl font-bold text-amber-900 mb-2 font-serif">{paper.title}</h3>
                        <p className="text-amber-700 font-medium text-lg font-serif italic">{paper.journal}</p>
                      </div>

                      {/* Page content with turning animation */}
                      <div className="p-8 h-96 overflow-y-auto relative">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.5 }}
                            className="prose prose-amber max-w-none"
                          >
                            <h4 className="text-2xl font-bold text-amber-900 mb-4 font-serif">
                              {paper.pages[currentPage].title}
                            </h4>
                            <p className="text-gray-700 leading-relaxed text-lg font-serif">
                              {paper.pages[currentPage].content}
                            </p>
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {/* Page navigation with realistic book controls */}
                      <div className="p-6 border-t-2 border-amber-200 bg-gradient-to-r from-amber-100 to-yellow-100 flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageTurn("prev")}
                          disabled={currentPage === 0}
                          className="border-amber-600 text-amber-700 hover:bg-amber-200 disabled:opacity-50"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous Page
                        </Button>

                        <div className="flex items-center space-x-2">
                          <span className="text-amber-700 font-serif">
                            Page {currentPage + 1} of {paper.pages.length}
                          </span>
                          {/* Page indicators */}
                          <div className="flex space-x-1 ml-4">
                            {paper.pages.map((_, index) => (
                              <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${
                                  index === currentPage ? "bg-amber-600" : "bg-amber-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageTurn("next")}
                          disabled={currentPage === paper.pages.length - 1}
                          className="border-amber-600 text-amber-700 hover:bg-amber-200 disabled:opacity-50"
                        >
                          Next Page
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>

                      {/* External link for published papers */}
                      {paper.type === "published" && (
                        <div className="p-6 pt-0">
                          <Button
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg"
                            onClick={() => window.open(paper.link, "_blank")}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Read Complete Research Paper
                          </Button>
                        </div>
                      )}
                    </>
                  )
                })()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-8 {
          transform: rotateY(8deg);
        }
        .rotate-y-15 {
          transform: rotateY(15deg);
        }
        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  )
}
