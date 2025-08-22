"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import * as THREE from "three"
import { Button } from "@/components/ui/button"
import { Github, Linkedin, ExternalLink } from "lucide-react"

export default function HeroSection() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [typedText, setTypedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const texts = ["Student", "Aspiring Software Developer", "AI Researcher", "Innovation Enthusiast", "Problem Solver"]

  useEffect(() => {
    // Three.js Black Hole Animation
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    // Create black hole geometry
    const geometry = new THREE.SphereGeometry(2, 64, 64)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float time;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          vec3 pos = position;
          float wave = sin(pos.x * 2.0 + time) * 0.1;
          pos.y += wave;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);
          
          float blackHole = 1.0 - smoothstep(0.0, 0.2, dist);
          float accretionDisk = smoothstep(0.2, 0.8, dist) * (1.0 - smoothstep(0.8, 1.2, dist));
          
          float lightRing1 = smoothstep(0.25, 0.3, dist) * (1.0 - smoothstep(0.3, 0.35, dist));
          float lightRing2 = smoothstep(0.4, 0.45, dist) * (1.0 - smoothstep(0.45, 0.5, dist));
          float lightRing3 = smoothstep(0.6, 0.65, dist) * (1.0 - smoothstep(0.65, 0.7, dist));
          
          vec3 diskColor = vec3(1.0, 0.3, 0.0) * accretionDisk;
          diskColor += vec3(0.0, 0.5, 1.0) * accretionDisk * sin(time * 2.0 + dist * 15.0);
          
          vec3 lightColor1 = vec3(0.0, 0.8, 1.0) * lightRing1 * (0.5 + 0.5 * sin(time * 3.0));
          vec3 lightColor2 = vec3(1.0, 0.4, 0.8) * lightRing2 * (0.5 + 0.5 * sin(time * 2.5 + 1.0));
          vec3 lightColor3 = vec3(0.8, 1.0, 0.2) * lightRing3 * (0.5 + 0.5 * sin(time * 2.0 + 2.0));
          
          diskColor += lightColor1 + lightColor2 + lightColor3;
          
          float alpha = blackHole + accretionDisk + lightRing1 + lightRing2 + lightRing3;
          
          gl_FragColor = vec4(diskColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    })

    const blackHole = new THREE.Mesh(geometry, material)
    scene.add(blackHole)

    const particleGeometry = new THREE.BufferGeometry()
    const particleCount = 2000
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = Math.random() * 15 + 3
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      positions[i] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i + 2] = radius * Math.cos(phi)

      const distanceFromCenter = radius / 15
      colors[i] = 1.0 - distanceFromCenter * 0.5 // Red
      colors[i + 1] = 0.5 + distanceFromCenter * 0.3 // Green
      colors[i + 2] = 1.0 // Blue
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.08,
      transparent: true,
      opacity: 0.9,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    })

    const particles = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particles)

    camera.position.z = 8

    const animate = () => {
      requestAnimationFrame(animate)

      const time = Date.now() * 0.001
      material.uniforms.time.value = time

      blackHole.rotation.z += 0.015
      particles.rotation.y += 0.003
      particles.rotation.x += 0.002

      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      if (typeof window !== "undefined") {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  useEffect(() => {
    let isTyping = true
    let charIndex = 0
    let textIndex = 0

    const typeText = () => {
      const currentText = texts[textIndex]

      if (isTyping) {
        if (charIndex < currentText.length) {
          setTypedText(currentText.slice(0, charIndex + 1))
          charIndex++
          setTimeout(typeText, 100)
        } else {
          setTimeout(() => {
            isTyping = false
            typeText()
          }, 2000)
        }
      } else {
        if (charIndex > 0) {
          setTypedText(currentText.slice(0, charIndex - 1))
          charIndex--
          setTimeout(typeText, 50)
        } else {
          textIndex = (textIndex + 1) % texts.length
          isTyping = true
          setTimeout(typeText, 500)
        }
      }
    }

    typeText()
  }, [])

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div ref={mountRef} className="absolute inset-0 z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-10" />
      <div className="relative z-20 text-center max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h1 className="text-8xl md:text-9xl font-bold mb-8 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent">
            SAMPARK BHOL
          </h1>

          <div className="h-16 mb-12">
            <p className="text-2xl md:text-3xl text-gray-300 font-mono">
              {typedText}
              <span className="animate-pulse text-blue-400">|</span>
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="flex flex-wrap justify-center gap-6 mb-12"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Explore My Work
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg bg-transparent"
              onClick={() => window.open("https://github.com/SamparkBhol", "_blank")}
            >
              <Github className="mr-2 h-5 w-5" />
              GitHub
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg bg-transparent"
              onClick={() => window.open("https://www.linkedin.com/in/sampark-bhol-118560251", "_blank")}
            >
              <Linkedin className="mr-2 h-5 w-5" />
              LinkedIn
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
            className="text-gray-400"
          >
            <p className="text-lg mb-4">Scroll to explore</p>
            <div className="animate-bounce">
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
