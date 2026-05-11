import Link from 'next/link'

export default function OnboardingSuccessPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070B14] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.24),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.22),_transparent_34%)]" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-6">
        <Link href="/" className="text-xl font-black">
          Tribe Finder
        </Link>

        <Link
          href="/dashboard"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/80 transition hover:bg-white/10"
        >
          Go to dashboard
        </Link>
      </nav>

      <section className="relative z-10 flex min-h-[calc(100vh-96px)] items-center justify-center px-6 py-10">
        <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 bg-gradient-to-br from-teal-300/15 to-blue-400/10 px-8 py-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-teal-300/30 bg-teal-300/10 text-4xl shadow-lg shadow-teal-300/10">
              ✓
            </div>

            <p className="mt-6 inline-flex rounded-full border border-teal-300/20 bg-teal-300/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-teal-200">
              Profile created
            </p>

            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
              Your church profile is ready for review
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70">
              Your church information has been saved. Once your claim is
              approved, dashboard access will unlock so you can keep improving
              your profile before seekers discover it.
            </p>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-3">
            <StepCard
              number="1"
              title="Saved"
              text="Your church profile details and photos are stored securely in Tribe Finder."
            />

            <StepCard
              number="2"
              title="Reviewed"
              text="Your claim is reviewed before full dashboard access is enabled."
            />

            <StepCard
              number="3"
              title="Published"
              text="After approval, your profile can be completed and shown to seekers."
            />
          </div>

          <div className="px-6 pb-6">
            <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
              <h2 className="font-black text-white">Best next steps</h2>

              <div className="mt-4 space-y-3 text-sm leading-6 text-white/65">
                <p>✓ Make sure your service times are accurate.</p>
                <p>✓ Prepare a strong church bio for first-time guests.</p>
                <p>✓ Add your best church photo so seekers get a clear first impression.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/pending"
                className="rounded-2xl bg-teal-400 px-6 py-3 text-center font-black text-black transition hover:bg-teal-300"
              >
                View review status
              </Link>

              <Link
                href="/"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-center font-bold text-white/80 transition hover:bg-white/10"
              >
                Back to home
              </Link>
            </div>

            <p className="mt-5 text-center text-sm text-white/40">
              Dashboard access remains locked until your claim is approved.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

function StepCard({
  number,
  title,
  text,
}: {
  number: string
  title: string
  text: string
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-300 text-sm font-black text-black">
        {number}
      </div>

      <h3 className="mt-4 font-black">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-white/55">{text}</p>
    </div>
  )
}