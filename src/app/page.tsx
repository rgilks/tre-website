import { Suspense } from 'react'
import { ProjectGrid } from '@/components/ProjectGrid'
import { HeroSection } from '@/components/HeroSection'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      
      <section id="projects" className="py-16 bg-gradient-to-b from-tre-black to-tre-black/95">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-tre-green font-mono mb-12 animate-fade-in">
            Featured Projects
          </h2>
          
          <Suspense fallback={
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tre-green"></div>
            </div>
          }>
            <ProjectGrid />
          </Suspense>
        </div>
      </section>
      
      <section id="about" className="py-16 bg-tre-black/95">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-tre-green font-mono mb-8 animate-fade-in">
            About Total Reality Engineering
          </h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <p className="text-xl text-tre-white/80 leading-relaxed">
              We build innovative solutions that bridge the gap between imagination and reality. 
              Our portfolio showcases cutting-edge projects that demonstrate technical excellence 
              and creative problem-solving.
            </p>
            <div className="border-t border-tre-green/20 pt-6">
              <p className="text-lg text-tre-white/70 leading-relaxed mb-4">
                Total Reality Engineering is the personal contracting business of artist and software engineer{' '}
                <a 
                  href="https://www.linkedin.com/in/rob-gilks-39bb03/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-tre-green hover:text-tre-green-dark transition-colors underline"
                >
                  Robert Gilks
                </a>.
              </p>
              <p className="text-sm text-tre-white/60 font-mono">
                Founded in Australia in 1998 • Established in the UK in 2008
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section id="contact" className="py-16 bg-gradient-to-t from-tre-black to-tre-black/95">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-tre-green font-mono mb-8 animate-fade-in">
            Get In Touch
          </h2>
          <p className="text-xl text-tre-white/80 max-w-2xl mx-auto mb-8">
            Ready to bring your ideas to life? Let&apos;s discuss how we can help you 
            achieve your engineering goals.
          </p>
          <div className="flex justify-center space-x-6">
            <a 
              href="https://github.com/rgilks" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-3 bg-tre-green text-tre-black font-bold font-mono rounded-lg hover:bg-tre-green-dark transition-colors duration-200 animate-slide-up"
            >
              GitHub
            </a>
            <a 
              href="https://www.linkedin.com/in/rob-gilks-39bb03/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-3 border-2 border-tre-green text-tre-green font-bold font-mono rounded-lg hover:bg-tre-green hover:text-tre-black transition-all duration-200 animate-slide-up"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
