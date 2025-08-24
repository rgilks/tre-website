import { Suspense } from 'react'
import { ProjectGrid } from '@/components/ProjectGrid'
import { HeroSection } from '@/components/HeroSection'
import { AboutSection } from '@/components/AboutSection'
import { ContactSection } from '@/components/ContactSection'
import { getProjects } from '@/lib/projects'

export default async function HomePage() {
  const projects = await getProjects()

  return (
    <div className="min-h-screen">
      <HeroSection />

      <section
        id="projects"
        className="py-16 bg-gradient-to-b from-tre-black to-tre-black/95"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-tre-green font-mono mb-12 animate-fade-in">
            Featured Projects
          </h2>

          <Suspense
            fallback={
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tre-green"></div>
              </div>
            }
          >
            <ProjectGrid initialProjects={projects} />
          </Suspense>
        </div>
      </section>

      <AboutSection />
      <ContactSection />
    </div>
  )
}
