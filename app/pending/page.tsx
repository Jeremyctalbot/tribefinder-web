import Link from 'next/link'

export default function PendingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070B14] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.24),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.22),_transparent_34%)]" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-6">
        <Link href="/" className="text-xl font-black">
          Tribe Finder
        </Link>

        <Link
          href="/login"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/80 transition hover:bg-white/10"
        >
          Church login
        </Link>
      </nav>

      <section className="relative z-10 flex min-h-[calc(100vh-96px)] items-center justify-center px-6 py-10">
        <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 bg-gradient-to-br from-teal-300/15 to-blue-400/10 px-8 py-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-teal-300/30 bg-teal-300/10 text-4xl shadow-lg shadow-teal-300/10">
              ✓
            </div>

            <p className="mt-6 inline-flex rounded-full border border-teal-300/20 bg-teal-300/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-teal-200">
              Verification pending
            </p>

            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
              Your church claim is under review
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70">
              Thanks for submitting your church claim. We review claims before
              unlocking dashboard access so church profiles stay accurate and
              trustworthy.
            </p>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-3">
            <StepCard
              number="1"
              title="Review"
              text="We verify your church details and your ability to manage the profile."
            />

            <StepCard
              number="2"
              title="Approve"
              text="Once approved, your dashboard unlocks with profile editing and photos."
            />

            <StepCard
              number="3"
              title="Launch"
              text="Complete your public profile so seekers know what to expect."
            />
          </div>

          <div className="px-6 pb-6">
            <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
              <h2 className="font-black text-white">While you wait</h2>

              <div className="mt-4 space-y-3 text-sm leading-6 text-white/65">
                <p>✓ Gather your best church photos for your profile.</p>
                <p>✓ Confirm your service times, address, and contact info.</p>
                <p>✓ Think through what makes your church welcoming to new visitors.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="rounded-2xl bg-teal-400 px-6 py-3 text-center font-black text-black transition hover:bg-teal-300"
              >
                Back to home
              </Link>

              <Link
                href="/login"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-center font-bold text-white/80 transition hover:bg-white/10"
              >
                Check status
              </Link>
            </div>

            <p className="mt-5 text-center text-sm text-white/40">
              Dashboard access is intentionally locked until your claim is
              approved.
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