export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      
      {/* Glow background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_35%)]" />

      {/* NAV */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <a href="/" className="text-xl font-bold tracking-tight">
          Tribe Finder
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
          <a href="/" className="hover:text-white transition">Home</a>
          <a href="/for-churches" className="hover:text-white transition">For Churches</a>
          <a href="/login" className="hover:text-white transition">Login</a>
          <a href="/contact" className="hover:text-white transition">Contact</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 min-h-[calc(100vh-96px)] flex items-center justify-center px-6">
        <div className="text-center max-w-4xl">

          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-teal-200 mb-8 backdrop-blur">
            Now live in Lexington 👀
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-6">
            yeah… we made it
          </h1>

          <h2 className="text-2xl md:text-4xl text-gray-300 mb-6">
            the easiest way to find a church that actually fits
          </h2>

          <p className="text-xl md:text-2xl text-gray-100 mb-12 leading-relaxed">
            Stop guessing every Sunday. Discover, match, and plan your visit — all in one app.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            
            {/* PRIMARY CTA */}
            <a
              href="/download"
              className="bg-teal-400 hover:bg-teal-300 text-black font-bold px-8 py-4 rounded-2xl transition shadow-[0_0_40px_rgba(45,212,191,0.35)]"
            >
              Download the app
            </a>

            {/* SECONDARY CTA */}
            <a
              href="/for-churches"
              className="border border-white/15 bg-white/5 hover:bg-white/10 px-8 py-4 rounded-2xl transition backdrop-blur"
            >
              Are you a church?
            </a>

          </div>

          <p className="text-sm text-gray-500 mt-4">
            iOS launch — more cities coming soon
          </p>

        </div>
      </section>

      {/* PROBLEM + SOLUTION */}
      <section className="relative z-10 px-6 py-24 max-w-6xl mx-auto">

        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* PROBLEM */}
          <div>
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              finding a church shouldn’t feel like guessing
            </h3>

            <ul className="space-y-4 text-gray-400 text-lg">
              <li>• visiting random churches hoping one “feels right”</li>
              <li>• not knowing what they actually believe</li>
              <li>• walking in alone not knowing anyone</li>
              <li>• wasting weeks just trying to find a fit</li>
            </ul>
          </div>

          {/* SOLUTION */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur">
            <h3 className="text-2xl font-semibold mb-6 text-teal-300">
              there’s a better way
            </h3>

            <ul className="space-y-4 text-gray-200 text-lg">
              <li>✔ swipe through churches near you</li>
              <li>✔ get matched based on what actually matters</li>
              <li>✔ see exactly WHY you match</li>
              <li>✔ plan your visit with confidence</li>
            </ul>
          </div>

        </div>
      </section>

      {/* MATCH REASONS */}
      <section className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h3 className="text-3xl md:text-5xl font-bold mb-5">
            not just a match — an explanation
          </h3>

          <p className="text-gray-400 text-lg">
            We show exactly why a church fits you, so you can walk in confident — not guessing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card title="Worship style fits" text="You prefer modern worship, and this church leans contemporary." />
          <Card title="Strong family support" text="Kids ministry, youth ministry, and groups match your needs." />
          <Card title="Close to home" text="Within your preferred radius — easy to actually get connected." />
        </div>
      </section>

      {/* CHURCH CTA */}
      <section className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <div className="rounded-[2rem] border border-teal-300/20 bg-gradient-to-br from-white/10 to-white/5 p-8 md:p-12 backdrop-blur shadow-[0_0_60px_rgba(20,184,166,0.18)]">
          
          <div className="grid md:grid-cols-2 gap-10 items-center">

            <div>
              <p className="text-teal-300 font-semibold mb-4">
                For churches
              </p>

              <h3 className="text-3xl md:text-5xl font-bold mb-6">
                people are already searching for churches like yours
              </h3>

              <p className="text-gray-300 text-lg leading-relaxed">
                Claim your profile, respond to visits, and show seekers why your church is the right fit.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              
              {/* FIXED CTA */}
              <a
                href="/find-your-church"
                className="bg-teal-400 hover:bg-teal-300 text-black font-bold px-8 py-4 rounded-2xl text-center transition"
              >
                Claim your church
              </a>

              <a
                href="/login"
                className="border border-white/15 bg-white/5 hover:bg-white/10 px-8 py-4 rounded-2xl text-center transition"
              >
                Church login
              </a>

            </div>

          </div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 px-6 py-28 text-center">
        <div className="max-w-3xl mx-auto">

          <h3 className="text-4xl md:text-6xl font-black mb-6">
            stop church shopping blind
          </h3>

          <p className="text-gray-400 text-lg md:text-xl mb-10">
            Find your fit. Understand why. Walk in confident.
          </p>

          <a
            href="/download"
            className="bg-teal-400 hover:bg-teal-300 text-black font-bold px-10 py-4 rounded-2xl transition shadow-[0_0_40px_rgba(45,212,191,0.35)]"
          >
            Download the app
          </a>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 px-6 py-8 text-center text-sm text-gray-500">
        © 2026 Tribe Finder. Built for people looking for a church that actually fits.
      </footer>

    </main>
  )
}

/* ---------- UI ---------- */

function Card({ title, text }: any) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h4 className="text-xl font-bold mb-3">{title}</h4>
      <p className="text-gray-400">{text}</p>
    </div>
  )
}