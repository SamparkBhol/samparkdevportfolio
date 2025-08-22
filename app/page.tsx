"use client"

import { useState, useEffect } from "react"
import HeroSection from "@/components/hero-section"
import AboutSection from "@/components/about-section"
import ExperienceSection from "@/components/experience-section"
import ProjectsSection from "@/components/projects-section"
import NPMPackagesSection from "@/components/npm-packages-section"
import ResearchSection from "@/components/research-section"
import BlogsSection from "@/components/blogs-section"
import VolunteerSection from "@/components/volunteer-section"
import SkillsSection from "@/components/skills-section"
import CertificationsSection from "@/components/certifications-section"
import ContactSection from "@/components/contact-section"
import GameboyLoader from "@/components/gameboy-loader"
import FloatingChatbot from "@/components/floating-chatbot"
import Navigation from "@/components/navigation"

export default function Portfolio() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentSection, setCurrentSection] = useState("home")

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <GameboyLoader />
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navigation currentSection={currentSection} setCurrentSection={setCurrentSection} />

      <main>
        <section id="home">
          <HeroSection />
        </section>

        <section id="about">
          <AboutSection />
        </section>

        <section id="experience">
          <ExperienceSection />
        </section>

        <section id="projects">
          <ProjectsSection />
        </section>

        <section id="npm-packages">
          <NPMPackagesSection />
        </section>

        <section id="research">
          <ResearchSection />
        </section>

        <section id="blogs">
          <BlogsSection />
        </section>

        <section id="volunteer">
          <VolunteerSection />
        </section>

        <section id="skills">
          <SkillsSection />
        </section>

        <section id="certifications">
          <CertificationsSection />
        </section>

        <section id="contact">
          <ContactSection />
        </section>
      </main>

      <FloatingChatbot />
    </div>
  )
}
