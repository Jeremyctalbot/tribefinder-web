export default function ForChurchesPage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_35%)]" />

      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <a href="/" className="text-xl font-bold tracking-tight">
          Tribe Finder
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
          <a href="/" className="hover:text-white transition">Home</a>
          <a href="/login" className="hover:text-white transition">Login</a>
          <a href="/contact" className="hover:text-white transition">Contact</a>
        </div>
      </nav>

      <section className="relative z-10 px-6 py-24 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-teal-200 mb-8 backdrop-blur">
            Built for churches ready to be found
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8">
            people are looking for a church like yours
          </h1>

          <p className="text-lg md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Tribe Finder helps seekers discover your church, understand what makes you a fit, and plan a visit with more confidence.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">

            {/* 🔥 FIXED */}
            <a
              href="/find-your-church"
              className="bg-teal-400 hover:bg-teal-300 text-black font-bold px-8 py-4 rounded-2xl transition shadow-[0_0_40px_rgba(45,212,191,0.35)]"
            >
              Claim your church
            </a>

            <a
              href="/login"
              className="border border-white/15 bg-white/5 hover:bg-white/10 px-8 py-4 rounded-2xl transition backdrop-blur"
            >
              Church login
            </a>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          <Feature
            title="Get discovered"
            text="Show up when seekers nearby are looking for churches that match their preferences."
          />
          <Feature
            title="Tell your story"
            text="Add photos, service times, ministries, worship style, and the details that help people feel ready to visit."
          />
          <Feature
            title="Turn interest into visits"
            text="Receive visit requests and help people walk in already feeling welcomed."
          />
        </div>
      </section>

      <section className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <div className="rounded-[2rem] border border-teal-300/20 bg-gradient-to-br from-white/10 to-white/5 p-8 md:p-12 backdrop-blur shadow-[0_0_60px_rgba(20,184,166,0.18)]">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-teal-300 font-semibold mb-4">
                Why it matters
              </p>

              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                most people visit before they ever talk to you
              </h2>

              <p className="text-gray-300 text-lg leading-relaxed">
                Tribe Finder gives them a better first step. Instead of guessing from a website or walking in cold, seekers can understand your church before Sunday.
              </p>
            </div>

            <div className="space-y-4 text-gray-200 text-lg">
              <p>✔ Show your church personality</p>
              <p>✔ Highlight ministries and service times</p>
              <p>✔ Help seekers understand why they match</p>
              <p>✔ Make planning a visit less intimidating</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            claim your profile before launch traffic hits
          </h2>

          <p className="text-gray-400 text-lg md:text-xl mb-10">
            We’re starting local first, then growing city by city.
          </p>

          {/* 🔥 FIXED */}
          <a
            href="/find-your-church"
            className="inline-block bg-teal-400 hover:bg-teal-300 text-black font-bold px-10 py-4 rounded-2xl transition shadow-[0_0_40px_rgba(45,212,191,0.35)]"
          >
            Start church claim
          </a>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-6 py-8 text-center text-sm text-gray-500">
        © 2026 Tribe Finder. Helping people find churches that actually fit.
      </footer>
    </main>
  )
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-[0_0_30px_rgba(20,184,166,0.10)]">
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{text}</p>
    </div>
  )
}