export function AboutSection() {
  return (
    <section
      data-testid="about-section"
      id="about"
      className="py-16 bg-tre-black/95"
    >
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-tre-green font-mono mb-8 animate-fade-in">
          About Total Reality Engineering
        </h2>
        <div className="max-w-4xl mx-auto space-y-6">
          <p className="text-xl text-tre-white/80 leading-relaxed">
            I design systems that pair artistic instincts with disciplined
            engineering, delivering software that is durable, performant, and
            delightful to use. Every engagement focuses on solving hard problems
            with precise execution rather than hype.
          </p>
          <div className="border-t border-tre-green/20 pt-6">
            <p className="text-lg text-tre-white/70 leading-relaxed mb-4">
              Total Reality Engineering is a solo practice where artist and
              software engineer{' '}
              <a
                href="https://www.linkedin.com/in/rob-gilks-39bb03/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tre-green hover:text-tre-green-dark transition-colors underline"
              >
                Robert Gilks
              </a>{' '}
              partners directly with clients to deliver bespoke interactive
              experiences, research tools, and production platforms.
            </p>
            <p className="text-sm text-tre-white/60 font-mono">
              Founded in Australia in 1998 • Established in the UK in 2008
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
