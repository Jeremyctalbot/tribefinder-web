import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type ChurchProfile = {
  id: string
  church_name?: string | null
  name?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  image_url?: string | null
  gallery_images?: string[] | null
  verification_status?: string | null
  denomination?: string | null
  worship_style?: string | null
  church_size?: string | null
  weekly_attendance?: number | null
  atmosphere_preference?: string | null
  bio?: string | null
  service_times?: string[] | null
  kids_ministry?: boolean | null
  youth_ministry?: boolean | null
  small_groups?: boolean | null
  ministry_tags?: string[] | null
  newcomer_features?: string[] | null
  serving_focuses?: string[] | null
  target_life_stages?: string[] | null
  website?: string | null
  phone?: string | null
  email?: string | null
}

async function getChurch(id: string): Promise<ChurchProfile | null> {
  const { data, error } = await supabase
    .from('church_profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('Church fetch error:', error)
    return null
  }

  return data
}

function formatFullAddress(church: ChurchProfile) {
  return [church.address, church.city, church.state, church.zip_code]
    .filter(Boolean)
    .join(', ')
}

function mapsUrl(address: string) {
  return `https://maps.apple.com/?q=${encodeURIComponent(address)}`
}

function normalizeGalleryImages(imageUrl?: string | null, galleryImages?: string[] | null) {
  const combined = [imageUrl ?? '', ...(Array.isArray(galleryImages) ? galleryImages : [])]
    .map((value) => value.trim())
    .filter(Boolean)

  return Array.from(new Set(combined))
}

function hasItems(values?: string[] | null) {
  return Array.isArray(values) && values.length > 0
}

export default async function ChurchPublicPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const church = await getChurch(id)

  const churchName = church?.church_name || church?.name || 'Church profile'
  const fullAddress = church ? formatFullAddress(church) : ''
  const isClaimed = church?.verification_status === 'approved'
  const galleryImages = normalizeGalleryImages(church?.image_url, church?.gallery_images)
  const heroImage = church?.image_url || galleryImages[0]

  return (
    <main className="min-h-screen bg-[#070B14] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.24),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.22),_transparent_34%)]" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-6">
        <Link href="/" className="text-xl font-black">
          Tribe Finder
        </Link>

        {isClaimed ? (
          <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-200">
            Claimed
          </div>
        ) : (
          <Link
            href="/create-account"
            className="rounded-full bg-teal-300 px-4 py-2 text-sm font-bold text-black transition hover:bg-teal-200"
          >
            Claim this church
          </Link>
        )}
      </nav>

      <section className="relative z-10 px-6 py-10">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
          <div className="relative min-h-[560px] bg-gradient-to-br from-slate-900 to-black">
            {heroImage && (
              <img
                src={heroImage}
                alt={churchName}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              {fullAddress && (
                <p className="mb-4 inline-flex rounded-full border border-white/10 bg-black/45 px-4 py-2 text-sm font-semibold text-teal-200 backdrop-blur">
                  {fullAddress}
                </p>
              )}

              <h1 className="max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
                {churchName}
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
                {church?.bio ||
                  'Find out if this church actually fits before you walk in.'}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/plan-a-visit?church=${id}`}
                  className="rounded-xl bg-teal-300 px-6 py-3 text-center font-black text-black transition hover:bg-teal-200"
                >
                  Plan a visit
                </Link>

                {fullAddress && (
                  <a
                    href={mapsUrl(fullAddress)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-center font-bold transition hover:bg-white/15"
                  >
                    Open in Maps
                  </a>
                )}

                {isClaimed ? (
                  <div className="rounded-xl border border-white/15 bg-white/10 px-6 py-3 text-center font-bold text-white/60">
                    Church claimed
                  </div>
                ) : (
                  <Link
                    href="/create-account"
                    className="rounded-xl border border-white/20 bg-black/30 px-6 py-3 text-center font-bold transition hover:bg-white/10"
                  >
                    Is this your church?
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {church ? (
        <section className="relative z-10 px-6 pb-20">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-6">
              {galleryImages.length > 1 && (
                <Card title="Photos">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {galleryImages.map((imageUrl, index) => (
                      <div
                        key={imageUrl}
                        className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
                      >
                        <img
                          src={imageUrl}
                          alt={`${churchName} photo ${index + 1}`}
                          className="h-full w-full object-cover"
                        />

                        {imageUrl === church.image_url && (
                          <div className="absolute left-3 top-3 rounded-full bg-teal-300 px-3 py-1 text-xs font-black text-black">
                            Hero
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card title="About this church">
                <p className="leading-8 text-white/75">
                  {church.bio ||
                    'This church has not added a description yet. If this is your church, claim the profile to add photos, service times, ministries, and more.'}
                </p>
              </Card>

              <Card title="Service times">
                {hasItems(church.service_times) ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {church.service_times!.map((time) => (
                      <div
                        key={time}
                        className="rounded-2xl border border-teal-300/15 bg-teal-300/10 px-4 py-3 font-bold text-teal-100"
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState text="No service times have been added yet." />
                )}
              </Card>

              <Card title="Ministries and community">
                <div className="grid gap-3 sm:grid-cols-3">
                  <BooleanFeature label="Kids Ministry" active={Boolean(church.kids_ministry)} />
                  <BooleanFeature label="Youth Ministry" active={Boolean(church.youth_ministry)} />
                  <BooleanFeature label="Small Groups" active={Boolean(church.small_groups)} />
                </div>

                <div className="mt-5 space-y-5">
                  <TagSection title="Ministry highlights" values={church.ministry_tags} />
                  <TagSection title="Newcomer experience" values={church.newcomer_features} />
                  <TagSection title="Serving and outreach" values={church.serving_focuses} />
                  <TagSection title="Life stages" values={church.target_life_stages} />
                </div>
              </Card>
            </div>

            <aside className="space-y-6">
              <Card title="Church details">
                <Info label="Denomination" value={church.denomination} />
                <Info label="Worship style" value={church.worship_style} />
                <Info label="Church size" value={church.church_size} />
                <Info
                  label="Attendance"
                  value={
                    church.weekly_attendance
                      ? String(church.weekly_attendance)
                      : null
                  }
                />
                <Info label="Atmosphere" value={church.atmosphere_preference} />
              </Card>

              <Card title="Location">
                <Info label="Address" value={church.address} />
                <Info label="City" value={church.city} />
                <Info label="State" value={church.state} />
                <Info label="ZIP" value={church.zip_code} />

                {fullAddress && (
                  <a
                    href={mapsUrl(fullAddress)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 block rounded-2xl bg-white px-5 py-3 text-center font-black text-black transition hover:bg-teal-100"
                  >
                    Get directions
                  </a>
                )}
              </Card>

              <Card title="Contact">
                <Info label="Website" value={church.website} />
                <Info label="Phone" value={church.phone} />
                <Info label="Email" value={church.email} />
              </Card>

              {!isClaimed && (
                <div className="rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-300/15 to-blue-400/10 p-6 shadow-xl">
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-200">
                    Church owner?
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    Claim this profile
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/65">
                    Add photos, service times, ministries, and manage how seekers
                    discover your church.
                  </p>

                  <Link
                    href="/create-account"
                    className="mt-5 block rounded-2xl bg-teal-300 px-5 py-3 text-center font-black text-black transition hover:bg-teal-200"
                  >
                    Claim this church
                  </Link>
                </div>
              )}
            </aside>
          </div>
        </section>
      ) : (
        <section className="relative z-10 px-6 pb-20">
          <div className="mx-auto max-w-6xl rounded-3xl border border-red-400/20 bg-red-400/10 p-6 text-red-100">
            Church profile could not be loaded from Supabase.
          </div>
        </section>
      )}
    </main>
  )
}

function Card({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-6 shadow-xl backdrop-blur-xl">
      <h2 className="mb-5 text-xl font-black tracking-tight">{title}</h2>
      {children}
    </div>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value?: string | number | null
}) {
  return (
    <p className="flex justify-between gap-6 border-b border-white/5 py-3 text-sm text-white/55 last:border-b-0">
      <span>{label}</span>
      <span className="text-right font-semibold text-white/85">
        {value || '—'}
      </span>
    </p>
  )
}

function BooleanFeature({
  label,
  active,
}: {
  label: string
  active: boolean
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
        active
          ? 'border-teal-300/25 bg-teal-300/12 text-teal-100'
          : 'border-white/10 bg-white/[0.035] text-white/35'
      }`}
    >
      {active ? '✓ ' : '— '}
      {label}
    </div>
  )
}

function TagSection({
  title,
  values,
}: {
  title: string
  values?: string[] | null
}) {
  if (!hasItems(values)) return null

  return (
    <div>
      <p className="mb-3 text-sm font-bold text-white/55">{title}</p>
      <div className="flex flex-wrap gap-2">
        {values!.map((value) => (
          <span
            key={value}
            className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm font-semibold text-white/75"
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <p className="italic text-white/40">{text}</p>
}