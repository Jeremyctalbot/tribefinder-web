import Link from 'next/link'

export default function TermsPage() {
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
              Terms & Conditions
            </h1>
            <p className="mt-4 text-sm text-white/60">
              Last updated: May 11, 2026
            </p>
          </div>

          <div className="space-y-8 text-sm leading-7 text-white/75">
            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                1. Agreement to these Terms
              </h2>
              <p>
                These Terms & Conditions govern your access to and use of Tribe Finder, including our website, mobile application, church dashboard, discovery tools, messaging features, claim forms, subscription features, and related services. By using Tribe Finder, you agree to these Terms.
              </p>
              <p className="mt-3">
                Tribe Finder is operated by Tribe Finder Co. LLC. If you do not agree to these Terms, you should not access or use the service.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                2. What Tribe Finder Does
              </h2>
              <p>
                Tribe Finder helps people discover churches and helps churches present accurate, helpful information to potential visitors. The service may include church discovery, church profiles, claimed church dashboards, profile editing, messaging, plan-a-visit features, saved churches, and subscription-based visibility or engagement tools.
              </p>
              <p className="mt-3">
                Tribe Finder is not a church, denomination, ministry authority, legal advisor, counselor, emergency service, or replacement for personal discernment. Users are responsible for evaluating whether a church, message, visit, event, or relationship is appropriate for them.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                3. Eligibility
              </h2>
              <p>
                You must be able to legally enter into these Terms to use Tribe Finder. If you use Tribe Finder on behalf of a church, organization, ministry, or business, you represent that you have authority to act on behalf of that entity.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                4. User Accounts
              </h2>
              <p>
                You may need an account to access certain features. You are responsible for keeping your login information secure and for all activity under your account. You agree to provide accurate information and to update it when needed.
              </p>
              <p className="mt-3">
                Tribe Finder may suspend, restrict, or terminate accounts that violate these Terms, misuse the platform, submit false information, attempt unauthorized access, harass others, or create safety, legal, reputational, or operational risk.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                5. Church Profiles and Claimed Churches
              </h2>
              <p>
                Tribe Finder may display church information from public data sources, church submissions, claimed church profiles, third-party services, or user-provided content. Some church listings may be unclaimed and may contain incomplete, outdated, or third-party-sourced information.
              </p>
              <p className="mt-3">
                Churches may request to claim or manage a profile. Claim submission does not guarantee approval. Tribe Finder may review, approve, reject, request more information, or remove claimed status at its discretion.
              </p>
              <p className="mt-3">
                A verified or approved church profile means only that Tribe Finder has performed a platform-level review based on available information. It does not guarantee theological alignment, legal compliance, safety, quality, doctrine, leadership integrity, background checks, availability of services, or the accuracy of every profile detail.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                6. Church-Generated Content
              </h2>
              <p>
                Churches and authorized users may submit profile details, descriptions, images, ministry information, service times, website links, contact information, messages, and other content. The submitting user is responsible for ensuring they have the rights and permissions necessary to provide that content.
              </p>
              <p className="mt-3">
                By submitting content to Tribe Finder, you grant Tribe Finder a non-exclusive, worldwide, royalty-free license to host, store, display, reproduce, resize, format, publish, and use that content in connection with operating, improving, promoting, and displaying the Tribe Finder service.
              </p>
              <p className="mt-3">
                Tribe Finder may remove or modify content that we believe is inaccurate, misleading, inappropriate, unlawful, harmful, offensive, infringing, spammy, low quality, or inconsistent with the purpose of the platform.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                7. Messaging and Plan-a-Visit Features
              </h2>
              <p>
                Tribe Finder may allow seekers and churches to communicate through messaging or plan-a-visit features. Messages and visit requests are user-generated communications. Tribe Finder does not guarantee that any message will be read, answered, accurate, appropriate, confidential, or delivered without delay.
              </p>
              <p className="mt-3">
                Users should not use messaging for emergencies, crisis situations, legal notices, confidential counseling, or time-sensitive safety needs. If there is an emergency, contact local emergency services or an appropriate crisis resource.
              </p>
              <p className="mt-3">
                Tribe Finder may monitor, restrict, review, remove, or preserve communications where needed for safety, moderation, platform integrity, legal compliance, or enforcement of these Terms.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                8. Subscriptions, Payments, and Billing
              </h2>
              <p>
                Tribe Finder may offer free and paid church subscription tiers, including Free, Growth, and Featured plans. Paid plans may be offered on a monthly or annual basis and may unlock additional features such as enhanced visibility, messaging, analytics, additional photos, or other church tools.
              </p>
              <p className="mt-3">
                Subscription pricing, included features, billing periods, promotional offers, and plan availability may change over time. Any paid subscription terms shown at checkout or in the applicable app store, payment processor, or dashboard are incorporated into these Terms.
              </p>
              <p className="mt-3">
                If you purchase through Apple, your purchase may be processed by Apple and subject to Apple’s payment terms, subscription rules, cancellation process, and refund policies. If you purchase through another payment provider, that provider’s terms may also apply.
              </p>
              <p className="mt-3">
                Unless otherwise stated, subscriptions automatically renew until canceled. Users are responsible for canceling before renewal if they do not want to be charged again. Refunds are not guaranteed except where required by law or by the applicable app store or payment provider policy.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                9. Acceptable Use
              </h2>
              <p>
                You agree not to misuse Tribe Finder. Prohibited conduct includes harassment, threats, impersonation, false church claims, misleading information, spam, scraping, unauthorized data collection, attempts to bypass security, uploading unlawful or infringing content, interfering with platform operations, or using the service for harmful, abusive, discriminatory, exploitative, or illegal activity.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                10. Moderation and Enforcement
              </h2>
              <p>
                Tribe Finder may investigate potential violations and may remove content, restrict features, suspend accounts, deny church claims, downgrade visibility, block access, or terminate accounts at our discretion. We are not obligated to monitor all content but reserve the right to do so.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                11. Third-Party Services and Links
              </h2>
              <p>
                Tribe Finder may rely on or link to third-party services, including hosting providers, analytics tools, payment processors, app stores, map providers, authentication providers, email services, church websites, and public data sources. We are not responsible for third-party services, content, availability, pricing, policies, or practices.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                12. No Guarantee of Results
              </h2>
              <p>
                Tribe Finder does not guarantee that seekers will find a specific church, that churches will receive visits, messages, saves, subscriptions, conversions, increased attendance, or any particular outcome. Matching, ranking, recommendations, visibility, and analytics are provided for convenience and may be imperfect, incomplete, or change over time.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                13. Intellectual Property
              </h2>
              <p>
                Tribe Finder, including its software, design, branding, logos, layouts, platform features, and original content, is owned by Tribe Finder Co. LLC or its licensors and is protected by intellectual property laws. You may not copy, modify, reverse engineer, reproduce, sell, or exploit Tribe Finder without permission.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                14. Privacy and Data
              </h2>
              <p>
                Your use of Tribe Finder is also governed by our Privacy Policy. The Privacy Policy explains how we collect, use, store, and protect information. Users may request account deletion and deletion of associated personal data by contacting info@tribefinderapp.co.
              </p>
              <p className="mt-3">
                <Link href="/privacy" className="font-semibold text-teal-300 hover:text-teal-200">
                  View our Privacy Policy
                </Link>
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                15. Disclaimer of Warranties
              </h2>
              <p>
                Tribe Finder is provided on an “as is” and “as available” basis. To the fullest extent permitted by law, Tribe Finder Co. LLC disclaims all warranties, express or implied, including warranties of accuracy, availability, merchantability, fitness for a particular purpose, non-infringement, and uninterrupted service.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                16. Limitation of Liability
              </h2>
              <p>
                To the fullest extent permitted by law, Tribe Finder Co. LLC and its owners, officers, employees, contractors, partners, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, lost data, lost goodwill, personal decisions, church interactions, user conduct, third-party content, service interruptions, or outcomes from use of the platform.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                17. Indemnification
              </h2>
              <p>
                You agree to defend, indemnify, and hold harmless Tribe Finder Co. LLC from claims, damages, liabilities, losses, costs, and expenses arising from your use of Tribe Finder, your submitted content, your violation of these Terms, your violation of law, or your infringement of another party’s rights.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                18. Account and Data Deletion
              </h2>
              <p>
                Users may request account deletion and deletion of associated personal data by contacting info@tribefinderapp.co. Some information may be retained where necessary for legal compliance, fraud prevention, dispute resolution, security, backup integrity, payment records, or legitimate business purposes.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                19. Changes to the Service or Terms
              </h2>
              <p>
                Tribe Finder may update the service or these Terms from time to time. If changes are material, we may provide notice through the website, app, email, or other reasonable means. Continued use of Tribe Finder after changes become effective means you accept the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                20. Contact
              </h2>
              <p>
                For questions about these Terms, contact Tribe Finder Co. LLC at{' '}
                <a href="mailto:info@tribefinderapp.co" className="font-semibold text-teal-300 hover:text-teal-200">
                  info@tribefinderapp.co
                </a>
                .
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}