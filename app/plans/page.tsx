import Link from 'next/link'

const plans = [
  {
    name: 'Starter',
    tier: 'Tier 1',
    price: 'Free',
    description: 'A simple church profile so seekers can find you.',
    photoLimit: '1 photo',
    cta: 'Current free plan',
    href: '/dashboard',
    featured: false,
    features: [
      'Basic public church profile',
      '1 church photo',
      'Church location and contact info',
      'Service times',
      'Ministry highlights',
      'Appears in seeker discovery',
    ],
  },
  {
    name: 'Growth',
    tier: 'Tier 2',
    price: '$19.99/mo',
    description: 'For churches ready to create a stronger first impression.',
    photoLimit: '5 photos',
    cta: 'Contact us to upgrade',
    href: 'mailto:hello@tribefinder.app?subject=Upgrade%20to%20Growth',
    featured: true,
    features: [
      'Everything in Starter',
      'Up to 5 church photos',
      'Stronger public profile presentation',
      'Messaging-ready church presence',
      'Analytics visibility',
      'Better seeker engagement tools',
    ],
  },
  {
    name: 'Featured',
    tier: 'Tier 3',
    price: '$149.99/mo',
    description: 'For churches that want premium visibility before launch scaling.',
    photoLimit: '10 photos',
    cta: 'Contact us to upgrade',
    href: 'mailto:hello@tribefinder.app?subject=Upgrade%20to%20Featured',
    featured: false,
    features: [
      'Everything in Growth',
      'Up to 10 church photos',
      'Featured church badge',
      'Premium profile depth',
      'Priority visibility positioning',
      'Best option for launch partners',
    ],
  },
]

export default function PlansPage() {
  return (
    <main className="min-h-screen bg-[#070B14] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.24),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.22),_transparent_34%)]" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-6">
        <Link href="/" className="text-xl font-black">
          Tribe Finder
        </Link>

        <Link
          href="/dashboard"
          className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/80 transition hover:bg-white/15"
        >
          Back to dashboard
        </Link>
      </nav>

      <section className="relative z-10 px-6 py-12">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-teal-200">
            Church plans
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            Help seekers see what makes your church feel like home.
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/65">
            Tribe Finder is launching with simple church plans built around
            visibility, photos, trust, and seeker engagement. Online upgrades are
            coming soon — for launch, upgrades are handled directly.
          </p>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-[2rem] border p-6 shadow-2xl backdrop-blur-xl ${
                plan.featured
                  ? 'border-teal-300/35 bg-teal-300/[0.13]'
                  : 'border-white/10 bg-white/[0.055]'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-6 rounded-full bg-teal-300 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-black">
                  Most popular
                </div>
              )}

              <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/45">
                {plan.tier}
              </p>

              <h2 className="mt-3 text-3xl font-black">{plan.name}</h2>

              <p className="mt-2 text-white/60">{plan.description}</p>

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5">
                <p className="text-4xl font-black">{plan.price}</p>
                <p className="mt-2 text-sm font-bold text-teal-200">
                  {plan.photoLimit}
                </p>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-3 text-sm leading-6 text-white/70"
                  >
                    <span className="mt-1 text-teal-200">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-7 block rounded-2xl px-5 py-4 text-center font-black transition ${
                  plan.featured
                    ? 'bg-teal-300 text-black hover:bg-teal-200'
                    : 'border border-white/15 bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-6xl rounded-3xl border border-white/10 bg-white/[0.055] p-6 text-center text-white/60">
          Payments are not enabled on the website yet. This page is launch-safe
          and does not modify subscriptions automatically.
        </div>
      </section>
    </main>
  )
}