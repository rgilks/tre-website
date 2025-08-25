export function ContactSection() {
  return (
    <section
      data-testid="contact-section"
      id="contact"
      className="py-16 bg-gradient-to-t from-tre-black to-tre-black/95"
    >
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-tre-green font-mono mb-8 animate-fade-in">
          Get In Touch
        </h2>
        <p className="text-xl text-tre-white/80 max-w-2xl mx-auto mb-8">
          Ready to bring your ideas to life? Let&apos;s discuss how we can help
          you achieve your engineering goals.
        </p>
        <div className="flex justify-center space-x-6">
          <a
            href="https://github.com/rgilks"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 border-2 border-tre-green text-tre-green font-bold font-mono rounded-lg hover:bg-tre-green hover:text-tre-black hover:shadow-lg hover:shadow-tre-green/30 hover:scale-105 transition-all duration-300 animate-slide-up"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/rob-gilks-39bb03/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 border-2 border-tre-green text-tre-green font-bold font-mono rounded-lg hover:bg-tre-green hover:text-tre-black hover:shadow-lg hover:shadow-tre-green/30 hover:scale-105 transition-all duration-300 animate-slide-up"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  )
}
