"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, User, Newspaper } from "lucide-react"

const articles = [
  {
    title: "NeuroSymbolic AI : A view",
    description:
      "Exploring the integration of neural networks and symbolic reasoning in AI. This piece delves into the potential of hybrid models to overcome limitations of purely data-driven or rule-based approaches.",
    link: "https://medium.com/@samparkbhol2005/neurosymbolic-ai-a-view-328617188529",
    date: "2024",
    category: "AI Research",
  },
  {
    title: "Quantum-Enhanced NLP: The Future of Cloud AI",
    description:
      "Delving into how quantum computing can revolutionize Natural Language Processing tasks such as sentiment analysis, translation, and complex query understanding. The synergy with cloud AI is highlighted.",
    link: "https://medium.com/@samparkbhol2005/quantum-enhanced-nlp-the-future-of-cloud-ai-aff15f85f274",
    date: "2024",
    category: "Quantum Computing",
  },
  {
    title: "CERN in October: A Month of Milestones and Marvels",
    description:
      "A recap of significant achievements, experiments, and groundbreaking discoveries at CERN during a pivotal month. Insights into the world of particle physics and fundamental research.",
    link: "https://medium.com/@samparkbhol2005/cern-in-october-a-month-of-milestones-and-marvels-c289c5c140f3",
    date: "2024",
    category: "Physics",
  },
  {
    title: "Quantum-driven gaming: AI meets the future",
    description:
      "Exploring the exciting intersection of quantum computing, artificial intelligence, and the future of gaming. Potential for vastly more complex simulations and intelligent NPCs.",
    link: "https://medium.com/@samparkbhol2005/quantum-driven-gaming-ai-meets-the-future-of-limitless-possibilities-in-the-cusp-of-new-tech-era-7e4226b894b8",
    date: "2024",
    category: "Gaming & AI",
  },
]

export default function BlogsSection() {
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
            Insights & Articles
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Exploring the frontiers of technology through thoughtful analysis and research
          </p>
        </motion.div>

        {/* Newspaper Layout */}
        <div className="bg-gray-100 text-black p-8 rounded-lg shadow-2xl">
          {/* Newspaper Header */}
          <div className="border-b-4 border-black mb-8 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold font-serif">THE TECH HERALD</h1>
                <p className="text-sm text-gray-600">Insights by Sampark Bhol • Technology & Research</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Est. 2024</p>
                <p className="text-xs text-gray-500">Digital Edition</p>
              </div>
            </div>
          </div>

          {/* Main Article */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h2 className="text-3xl font-bold font-serif mb-4 leading-tight">{articles[0].title}</h2>
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <User className="h-4 w-4 mr-1" />
                  <span className="mr-4">Sampark Bhol</span>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="mr-4">{articles[0].date}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{articles[0].category}</span>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4 font-serif">{articles[0].description}</p>
                <Button
                  className="bg-black text-white hover:bg-gray-800"
                  onClick={() => window.open(articles[0].link, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Read Full Article
                </Button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-200 p-4 rounded">
                  <h3 className="font-bold text-sm mb-2">LATEST INSIGHTS</h3>
                  <div className="space-y-2">
                    {articles.slice(1, 3).map((article, index) => (
                      <div key={index} className="border-b border-gray-300 pb-2">
                        <h4 className="font-semibold text-sm leading-tight mb-1">{article.title}</h4>
                        <p className="text-xs text-gray-600">{article.category}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Article Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 border-t-2 border-black pt-8">
            {articles.slice(1).map((article, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="border-r border-gray-300 pr-4 last:border-r-0"
              >
                <div className="mb-4">
                  <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs font-bold">{article.category}</span>
                </div>

                <h3 className="text-lg font-bold font-serif mb-3 leading-tight">{article.title}</h3>

                <p className="text-sm text-gray-700 mb-4 leading-relaxed font-serif">
                  {article.description.substring(0, 120)}...
                </p>

                <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                  <span>{article.date}</span>
                  <span>By Sampark Bhol</span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="border-black text-black hover:bg-black hover:text-white text-xs bg-transparent"
                  onClick={() => window.open(article.link, "_blank")}
                >
                  <Newspaper className="h-3 w-3 mr-1" />
                  Read More
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t-2 border-black mt-8 pt-4 text-center">
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => window.open("https://medium.com/@samparkbhol2005", "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View All Articles on Medium
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
