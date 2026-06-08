import Link from 'next/link'

export default function SupportPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070B14] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.20),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_34%)]" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-6">
        <Link href="/" className="text-xl font-black tracking-wide">
          Tribe Finder
        </Link>

        <Link
          href="/"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/80 transition hover:bg-white/10"
        >
          Back to Home
        </Link>
      </nav>

      <section className="relative z-10 mx-auto flex w-full max-w-4xl flex-col px-6 pb-20 pt-8">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl md:p-12">
          <div className="mb-10">
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              Support
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
              Need help with Tribe Finder? We’re here to help with account
              issues, church verification, onboarding questions, technical
              support, and general feedback.
            </p>
          </div>lets g

          <div className="space-y-8">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-xl font-bold">General Support</h2>

              <p className="mt-3 text-white/70">
                For general questions, account assistance, bug reports, or
                support requests, contact us at:
              </p>

              <a
                href="mailto:support@tribefinderapp.co"
                className="mt-4 inline-block text-lg font-semibold text-teal-300 transition hover:text-teal-200"
              >
                support@tribefinderapp.co
              </a>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-xl font-bold">
                Church Verification & Claims
              </h2>

              <p className="mt-3 text-white/70">
                Churches needing assistance with verification, profile claims,
                onboarding, or account access can contact our support team
                directly.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-xl font-bold">Response Time</h2>

              <p className="mt-3 text-white/70">
                We aim to respond to most support inquiries within 1–3 business
                days.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-xl font-bold">Privacy & Security</h2>

              <p className="mt-3 text-white/70">
                If you believe your account has been compromised or notice any
                suspicious activity, please contact us immediately.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}