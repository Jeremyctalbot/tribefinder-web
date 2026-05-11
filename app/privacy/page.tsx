import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#070B14] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.22),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_34%)]" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-10">
        <nav className="mb-10 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight">
            Tribe Finder
          </Link>

          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Back home
          </Link>
        </nav>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur md:p-10">
          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-teal-300">
              Legal
            </p>

            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              Privacy Policy
            </h1>

            <p className="mt-4 text-sm text-white/60">
              Last updated: May 11, 2026
            </p>
          </div>

          <div className="space-y-8 text-sm leading-7 text-white/75">
            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                1. Introduction
              </h2>

              <p>
                Tribe Finder Co. LLC (“Tribe Finder,” “we,” “our,” or “us”)
                values your privacy. This Privacy Policy explains how we collect,
                use, store, protect, and share information when you use the
                Tribe Finder website, mobile applications, church dashboard,
                messaging tools, subscriptions, and related services.
              </p>

              <p className="mt-3">
                By using Tribe Finder, you consent to the practices described in
                this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                2. Information We Collect
              </h2>

              <p>
                We may collect information you provide directly, information
                generated through use of the platform, and limited information
                from third-party services.
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-white">
                    Account Information
                  </h3>

                  <p>
                    This may include your name, email address, login provider,
                    profile details, church information, subscription status,
                    onboarding responses, and account preferences.
                  </p>
                </div>

                <div>
                  <h3 className="mb-1 text-lg font-semibold text-white">
                    Church Profile Information
                  </h3>

                  <p>
                    Churches may submit church descriptions, ministry details,
                    service times, website links, location information, photos,
                    contact details, and other public-facing content.
                  </p>
                </div>

                <div>
                  <h3 className="mb-1 text-lg font-semibold text-white">
                    Messaging and Visit Requests
                  </h3>

                  <p>
                    We may collect messages, visit requests, replies, and
                    related metadata generated through communication features on
                    the platform.
                  </p>
                </div>

                <div>
                  <h3 className="mb-1 text-lg font-semibold text-white">
                    Usage and Analytics Information
                  </h3>

                  <p>
                    We may collect information about how users interact with the
                    platform, including profile views, saves, searches,
                    subscriptions, feature usage, approximate location data,
                    device/browser details, diagnostics, and analytics events.
                  </p>
                </div>

                <div>
                  <h3 className="mb-1 text-lg font-semibold text-white">
                    Payment and Subscription Information
                  </h3>

                  <p>
                    Subscription payments may be processed by Apple, Stripe, or
                    other third-party payment providers. Tribe Finder does not
                    store full credit card numbers or sensitive payment
                    credentials directly.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                3. How We Use Information
              </h2>

              <p>We may use collected information to:</p>

              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>Operate and improve Tribe Finder</li>
                <li>Provide church discovery and matching features</li>
                <li>Enable messaging and visit requests</li>
                <li>Verify church claims and manage accounts</li>
                <li>Process subscriptions and billing</li>
                <li>Respond to support requests</li>
                <li>Maintain security and platform integrity</li>
                <li>Prevent fraud, abuse, or misuse</li>
                <li>Analyze usage trends and engagement</li>
                <li>Develop new features and improvements</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                4. Church Listings and Public Content
              </h2>

              <p>
                Some church profile information may be publicly visible,
                including church names, descriptions, ministry details, service
                times, photos, websites, and other public-facing information.
              </p>

              <p className="mt-3">
                Certain church listings may originate from public data sources,
                user submissions, claimed profiles, or third-party services.
                Information may not always be complete, current, or verified.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                5. Sharing Information
              </h2>

              <p>
                Tribe Finder does not sell personal information to third-party
                advertisers.
              </p>

              <p className="mt-3">
                We may share information:
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>With churches or users through platform features</li>
                <li>With service providers who support our operations</li>
                <li>With payment processors for subscriptions</li>
                <li>With hosting, analytics, email, or infrastructure providers</li>
                <li>When required by law or legal process</li>
                <li>To protect platform safety, rights, or integrity</li>
                <li>During a merger, acquisition, or business transfer</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                6. Third-Party Services
              </h2>

              <p>
                Tribe Finder may integrate with third-party providers such as
                Supabase, Apple, Google, Stripe, Vercel, map providers,
                analytics providers, authentication services, and email
                providers.
              </p>

              <p className="mt-3">
                Third-party services may have separate privacy policies and
                practices. Tribe Finder is not responsible for third-party
                systems, services, or policies.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                7. Data Retention
              </h2>

              <p>
                We retain information for as long as reasonably necessary to
                operate the platform, provide services, comply with legal
                obligations, resolve disputes, maintain security, enforce our
                agreements, and support legitimate business operations.
              </p>

              <p className="mt-3">
                Retention periods may vary depending on the type of data,
                account activity, legal requirements, fraud prevention needs,
                and technical backup processes.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                8. Security
              </h2>

              <p>
                Tribe Finder uses commercially reasonable technical and
                organizational safeguards designed to protect information.
                However, no platform, network, or storage system can be
                guaranteed completely secure.
              </p>

              <p className="mt-3">
                Users are responsible for maintaining the security of their own
                devices, passwords, and account access credentials.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                9. Children’s Privacy
              </h2>

              <p>
                Tribe Finder is not intended for children under 13 years of age.
                We do not knowingly collect personal information directly from
                children under 13.
              </p>

              <p className="mt-3">
                If we become aware that information has been collected from a
                child under 13 in violation of applicable law, we may remove the
                information and restrict the associated account.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                10. Your Rights and Choices
              </h2>

              <p>
                Depending on your jurisdiction, you may have rights regarding
                access, correction, deletion, portability, or restriction of
                certain personal information.
              </p>

              <p className="mt-3">
                Users may request account deletion and deletion of associated
                personal data by contacting{' '}
                <a
                  href="mailto:info@tribefinderapp.co"
                  className="font-semibold text-teal-300 hover:text-teal-200"
                >
                  info@tribefinderapp.co
                </a>
                .
              </p>

              <p className="mt-3">
                Some information may be retained where necessary for legal
                compliance, fraud prevention, security, billing records,
                dispute resolution, moderation enforcement, or backup integrity.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                11. Cookies and Analytics
              </h2>

              <p>
                Tribe Finder may use cookies, local storage, analytics tools,
                and related technologies to improve functionality, remember user
                preferences, measure engagement, and improve platform
                performance.
              </p>

              <p className="mt-3">
                Browser settings or device settings may allow you to limit
                certain tracking technologies, though some features may not work
                properly if disabled.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                12. International Use
              </h2>

              <p>
                Tribe Finder may store or process information in the United
                States or other jurisdictions where our providers or systems
                operate.
              </p>

              <p className="mt-3">
                By using the platform, you understand that information may be
                transferred to and processed in countries with different privacy
                laws than your own jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                13. Changes to this Privacy Policy
              </h2>

              <p>
                Tribe Finder may update this Privacy Policy from time to time.
                Updated versions may be posted within the app or website with a
                revised effective date.
              </p>

              <p className="mt-3">
                Continued use of Tribe Finder after changes become effective
                means you accept the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                14. Contact Us
              </h2>

              <p>
                If you have questions about this Privacy Policy or privacy
                practices, contact:
              </p>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="font-semibold text-white">
                  Tribe Finder Co. LLC
                </p>

                <a
                  href="mailto:info@tribefinderapp.co"
                  className="mt-2 inline-block font-semibold text-teal-300 hover:text-teal-200"
                >
                  info@tribefinderapp.co
                </a>
              </div>
            </section>

            <section>
              <p className="text-sm text-white/50">
                You should also review our{' '}
                <Link
                  href="/terms"
                  className="font-semibold text-teal-300 hover:text-teal-200"
                >
                  Terms & Conditions
                </Link>
                .
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}