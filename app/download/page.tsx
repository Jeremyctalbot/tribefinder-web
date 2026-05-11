export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.22),_transparent_35%)]" />

      <div className="relative z-10 max-w-2xl text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-6">
          download tribe finder
        </h1>

        <p className="text-lg md:text-xl text-gray-400 mb-10">
          Find a church that actually fits — without guessing every Sunday.
        </p>

        <a
          href="#"
          className="inline-block bg-teal-400 hover:bg-teal-300 text-black font-bold px-10 py-4 rounded-2xl text-lg transition shadow-[0_0_40px_rgba(45,212,191,0.35)]"
        >
          Download on the App Store
        </a>

        <p className="text-sm text-gray-500 mt-6">
          Launching first in Lexington, KY. Expanding soon.
        </p>

        <div className="mt-10">
          <a
            href="/"
            className="text-gray-400 hover:text-white transition"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </main>
  )
}