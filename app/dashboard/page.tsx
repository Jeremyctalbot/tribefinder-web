'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import LoginForm from '../login/LoginForm'

type DashboardTab = 'profile' | 'analytics' | 'edit'

type AnalyticsSummary = {
  views: number
  saves: number
  unsaves: number
  messages: number
  visitRequests: number
}

type ServiceTimeRow = {
  day: string
  time: string
}

type ProfileImprovement = {
  title: string
  description: string
  priority: number
}

type ProfileStrength = {
  score: number
  improvements: ProfileImprovement[]
}

type ChurchProfileForm = {
  church_name: string
  full_name: string
  role_title: string
  email: string
  phone: string
  website: string
  denomination: string
  worship_style: string
  church_size: string
  weekly_attendance: string
  kids_ministry: boolean
  youth_ministry: boolean
  small_groups: boolean
  ministry_tags: string[]
  newcomer_features: string[]
  serving_focuses: string[]
  atmosphere_preference: string
  service_times: ServiceTimeRow[]
  target_life_stages: string[]
  address: string
  city: string
  state: string
  zip_code: string
  bio: string
  authority_explanation: string
  image_url: string
  gallery_images: string[]
}

const PHOTO_BUCKET = 'church-images'
const MAX_IMAGE_SIZE_MB = 5

const denominationOptions = [
  'Unknown',
  'Non-Denominational',
  'Baptist',
  'Catholic',
  'Methodist',
  'Presbyterian',
  'Lutheran',
  'Pentecostal',
  'Episcopal',
  'Assembly of God',
  'Church of Christ',
  'Christian Church',
  'Community Church',
]

const worshipStyleOptions = [
  'Traditional',
  'Contemporary',
  'Blended',
  'Charismatic',
  'Liturgical',
]

const atmosphereOptions = [
  'Casual',
  'Modern',
  'Traditional',
  'Quiet',
  'Energetic',
  'Family-oriented',
]

const lifeStageOptions = [
  'College',
  'Young Adults',
  'Singles',
  'Married Couples',
  'Families with Kids',
  'Empty Nesters',
  'Seniors',
]

const ministryTagOptions = [
  'Celebrate Recovery',
  'Recovery Support',
  'Grief Support',
  'Counseling & Care',
  'Young Adults',
  "Men's Ministry",
  "Women's Ministry",
  'Family Support',
  'Special Needs',
  'Prayer Support',
]

const newcomerFeatureOptions = [
  'Plan Your Visit',
  'First-Time Guest',
  'What to Expect',
  'Guest Parking',
  'Next Steps',
  'Welcome Team',
  'Newcomer Events',
]

const servingFocusOptions = [
  'Volunteer Teams',
  'Local Outreach',
  'Global Missions',
  'Community Care',
  'Prayer Team',
  'Discipleship Pathway',
]

const serviceDayOptions = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

function clean(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function deriveChurchSize(attendance: string) {
  const value = Number(attendance)

  if (!Number.isFinite(value) || value <= 0) return 'Medium'
  if (value < 100) return 'Small'
  if (value < 500) return 'Medium'
  if (value < 2000) return 'Large'
  return 'Mega'
}

function toArray(value: any): string[] {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function uniqueOptions(options: string[], current?: string | null) {
  const cleanedCurrent = current?.trim()

  if (!cleanedCurrent || options.includes(cleanedCurrent)) {
    return options
  }

  return [cleanedCurrent, ...options]
}

function formatTimeLabel(time: string) {
  if (!time) return ''

  const [hourValue, minuteValue] = time.split(':')
  const hourNumber = Number(hourValue)
  const minuteNumber = Number(minuteValue)

  if (
    !Number.isFinite(hourNumber) ||
    !Number.isFinite(minuteNumber) ||
    hourNumber < 0 ||
    hourNumber > 23
  ) {
    return time
  }

  const suffix = hourNumber >= 12 ? 'PM' : 'AM'
  const displayHour = hourNumber % 12 === 0 ? 12 : hourNumber % 12
  const displayMinute = String(minuteNumber).padStart(2, '0')

  return `${displayHour}:${displayMinute} ${suffix}`
}

function timeLabelToInput(value: string) {
  const trimmed = value.trim()

  const twelveHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)

  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1])
    const minute = twelveHourMatch[2]
    const suffix = twelveHourMatch[3].toUpperCase()

    if (suffix === 'PM' && hour !== 12) hour += 12
    if (suffix === 'AM' && hour === 12) hour = 0

    return `${String(hour).padStart(2, '0')}:${minute}`
  }

  const twentyFourHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/)

  if (twentyFourHourMatch) {
    return `${String(Number(twentyFourHourMatch[1])).padStart(2, '0')}:${
      twentyFourHourMatch[2]
    }`
  }

  return ''
}

function parseServiceTime(value: string): ServiceTimeRow {
  const trimmed = value.trim()

  if (!trimmed) {
    return {
      day: 'Sunday',
      time: '10:00',
    }
  }

  const pipeParts = trimmed.split('|').map((part) => part.trim())

  if (pipeParts.length >= 2 && serviceDayOptions.includes(pipeParts[0])) {
    return {
      day: pipeParts[0],
      time: timeLabelToInput(pipeParts[1]) || '10:00',
    }
  }

  const normalized = trimmed.replace(/\s+at\s+/i, ' ')
  const matchedDay = serviceDayOptions.find((day) =>
    normalized.toLowerCase().startsWith(day.toLowerCase())
  )

  if (!matchedDay) {
    return {
      day: 'Sunday',
      time: timeLabelToInput(trimmed) || '10:00',
    }
  }

  const timePart = normalized.slice(matchedDay.length).trim()

  return {
    day: matchedDay,
    time: timeLabelToInput(timePart) || '10:00',
  }
}

function encodeServiceTime(row: ServiceTimeRow) {
  return `${row.day} ${formatTimeLabel(row.time)}`
}

function serviceRowsToStorage(rows: ServiceTimeRow[]) {
  return rows
    .filter((row) => row.day.trim().length > 0 && row.time.trim().length > 0)
    .map(encodeServiceTime)
}

function sortServiceRows(rows: ServiceTimeRow[]) {
  return [...rows].sort((a, b) => {
    const dayDifference =
      serviceDayOptions.indexOf(a.day) - serviceDayOptions.indexOf(b.day)

    if (dayDifference !== 0) return dayDifference

    return a.time.localeCompare(b.time)
  })
}

function hasText(value: string) {
  return value.trim().length > 0
}

function getPhotoLimit(tier?: string | null) {
  const normalized = tier?.trim().toLowerCase() ?? ''

  if (
    normalized === 'tier3' ||
    normalized === 'featured' ||
    normalized.includes('featured')
  ) {
    return 10
  }

  if (
    normalized === 'tier2' ||
    normalized === 'growth' ||
    normalized.includes('growth')
  ) {
    return 5
  }

  return 1
}

function getPlanName(tier?: string | null) {
  const normalized = tier?.trim().toLowerCase() ?? ''

  if (
    normalized === 'tier3' ||
    normalized === 'featured' ||
    normalized.includes('featured')
  ) {
    return 'Featured'
  }

  if (
    normalized === 'tier2' ||
    normalized === 'growth' ||
    normalized.includes('growth')
  ) {
    return 'Growth'
  }

  return 'Starter'
}

function getUpgradeText(limit: number) {
  if (limit >= 10) return 'You have the maximum launch photo package.'
  if (limit >= 5) return 'Upgrade to Featured to unlock up to 10 photos.'
  return 'Upgrade to Growth to unlock up to 5 photos.'
}

function normalizeGalleryImages(imageUrl: string, galleryImages: string[]) {
  const combined = [imageUrl, ...galleryImages]
    .map((value) => value.trim())
    .filter(Boolean)

  return Array.from(new Set(combined))
}

function getProfileStrength(form: ChurchProfileForm): ProfileStrength {
  let score = 0
  const improvements: ProfileImprovement[] = []

  if (hasText(form.image_url) || form.gallery_images.length > 0) {
    score += 20
  } else {
    improvements.push({
      title: 'Add a photo',
      description:
        'Profiles with photos feel more trustworthy and get more engagement.',
      priority: 1,
    })
  }

  if (hasText(form.bio)) {
    score += 20
  } else {
    improvements.push({
      title: 'Add a church bio',
      description:
        'Help seekers understand what your church is like before they visit.',
      priority: 2,
    })
  }

  if (serviceRowsToStorage(form.service_times).length > 0) {
    score += 20
  } else {
    improvements.push({
      title: 'Add service times',
      description: 'Clear service times help people confidently plan a visit.',
      priority: 0,
    })
  }

  if (
    form.kids_ministry ||
    form.youth_ministry ||
    form.small_groups ||
    form.ministry_tags.length > 0 ||
    form.newcomer_features.length > 0 ||
    form.serving_focuses.length > 0
  ) {
    score += 15
  } else {
    improvements.push({
      title: 'Add ministries',
      description: 'Show what community and support your church offers.',
      priority: 3,
    })
  }

  if (form.target_life_stages.length > 0) {
    score += 10
  } else {
    improvements.push({
      title: 'Add life stages',
      description:
        'Help people quickly see if your church fits their season of life.',
      priority: 4,
    })
  }

  const hasBasicInfo =
    hasText(form.church_name) &&
    hasText(form.address) &&
    hasText(form.city) &&
    hasText(form.state)

  if (hasBasicInfo) {
    score += 15
  } else {
    improvements.push({
      title: 'Complete basic info',
      description: 'Make sure your church name and location are fully filled out.',
      priority: 5,
    })
  }

  return {
    score: Math.min(score, 100),
    improvements: improvements.sort((a, b) => a.priority - b.priority),
  }
}

function profileToForm(profile: any): ChurchProfileForm {
  const serviceRows = toArray(profile?.service_times).map(parseServiceTime)
  const imageUrl = profile?.image_url ?? ''
  const galleryImages = normalizeGalleryImages(
    imageUrl,
    toArray(profile?.gallery_images)
  )

  return {
    church_name: profile?.church_name ?? '',
    full_name: profile?.full_name ?? '',
    role_title: profile?.role_title ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone ?? '',
    website: profile?.website ?? '',
    denomination: profile?.denomination ?? 'Unknown',
    worship_style: profile?.worship_style ?? 'Contemporary',
    church_size: profile?.church_size ?? 'Medium',
    weekly_attendance:
      profile?.weekly_attendance && Number(profile.weekly_attendance) > 0
        ? String(profile.weekly_attendance)
        : '',
    kids_ministry: Boolean(profile?.kids_ministry),
    youth_ministry: Boolean(profile?.youth_ministry),
    small_groups: Boolean(profile?.small_groups),
    ministry_tags: toArray(profile?.ministry_tags),
    newcomer_features: toArray(profile?.newcomer_features),
    serving_focuses: toArray(profile?.serving_focuses),
    atmosphere_preference: profile?.atmosphere_preference ?? 'Casual',
    service_times:
      serviceRows.length > 0
        ? sortServiceRows(serviceRows)
        : [
            {
              day: 'Sunday',
              time: '10:00',
            },
          ],
    target_life_stages: toArray(profile?.target_life_stages),
    address: profile?.address ?? '',
    city: profile?.city ?? '',
    state: profile?.state ?? '',
    zip_code: profile?.zip_code ?? '',
    bio: profile?.bio ?? '',
    authority_explanation: profile?.authority_explanation ?? '',
    image_url: imageUrl,
    gallery_images: galleryImages,
  }
}

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [editForm, setEditForm] = useState<ChurchProfileForm | null>(null)
  const [activeTab, setActiveTab] = useState<DashboardTab>('profile')
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    views: 0,
    saves: 0,
    unsaves: 0,
    messages: 0,
    visitRequests: 0,
  })
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  function isApproved(status?: string | null) {
    return status?.trim().toLowerCase() === 'approved'
  }

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData?.user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('church_profiles')
        .select('*')
        .eq('id', userData.user.id)
        .maybeSingle()

      if (error) {
        console.error('Profile load error:', error)
        setLoading(false)
        return
      }

      if (data) {
        setProfile(data)
        setEditForm(profileToForm(data))

        if (isApproved(data.verification_status)) {
          await loadAnalytics(data.id)
        }
      }

      setLoading(false)
    }

    loadProfile()
  }, [])

  async function getAnalyticsCount(
    churchId: string,
    eventNames: string[],
    since: string
  ) {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_name')
      .eq('subject_church_id', churchId)
      .in('event_name', eventNames)
      .gte('created_at', since)

    if (error) {
      console.error('Analytics load error:', error)
      return 0
    }

    return data?.length ?? 0
  }

  async function loadAnalytics(churchId: string) {
    setAnalyticsLoading(true)

    const since = new Date()
    since.setDate(since.getDate() - 30)
    const sinceIso = since.toISOString()

    const [views, saves, unsaves, messages, visitRequests] = await Promise.all([
      getAnalyticsCount(churchId, ['church_profile_view'], sinceIso),
      getAnalyticsCount(churchId, ['church_saved'], sinceIso),
      getAnalyticsCount(churchId, ['church_unsaved'], sinceIso),
      getAnalyticsCount(churchId, ['message_sent', 'message_started'], sinceIso),
      getAnalyticsCount(churchId, ['visit_request_submitted'], sinceIso),
    ])

    setAnalytics({ views, saves, unsaves, messages, visitRequests })
    setAnalyticsLoading(false)
  }

  async function saveProfile() {
    if (!profile || !editForm) return

    setSavingProfile(true)
    setSaveMessage('')
    setSaveError('')

    const derivedSize = deriveChurchSize(editForm.weekly_attendance)
    const photoLimit = getPhotoLimit(profile.subscription_tier)
    const normalizedGallery = normalizeGalleryImages(
      editForm.image_url,
      editForm.gallery_images
    ).slice(0, photoLimit)

    const primaryImageUrl =
      editForm.image_url.trim() ||
      normalizedGallery[0] ||
      ''

    const payload = {
      church_name: clean(editForm.church_name),
      full_name: clean(editForm.full_name),
      role_title: clean(editForm.role_title),
      email: clean(editForm.email),
      phone: clean(editForm.phone),
      website: clean(editForm.website),
      denomination:
        editForm.denomination === 'Unknown' ? null : clean(editForm.denomination),
      worship_style: clean(editForm.worship_style),
      church_size: derivedSize,
      weekly_attendance:
        Number(editForm.weekly_attendance) > 0
          ? Number(editForm.weekly_attendance)
          : null,
      kids_ministry: editForm.kids_ministry,
      youth_ministry: editForm.youth_ministry,
      small_groups: editForm.small_groups,
      ministry_tags: editForm.ministry_tags,
      newcomer_features: editForm.newcomer_features,
      serving_focuses: editForm.serving_focuses,
      atmosphere_preference: clean(editForm.atmosphere_preference),
      service_times: serviceRowsToStorage(editForm.service_times),
      target_life_stages: editForm.target_life_stages,
      address: clean(editForm.address),
      city: clean(editForm.city),
      state: clean(editForm.state),
      zip_code: clean(editForm.zip_code),
      bio: clean(editForm.bio),
      authority_explanation: clean(editForm.authority_explanation),
      image_url: clean(primaryImageUrl),
      gallery_images: normalizedGallery,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('church_profiles')
      .update(payload)
      .eq('id', profile.id)
      .select('*')
      .single()

    if (error) {
      console.error('Profile save error:', error)
      setSaveError(error.message)
      setSavingProfile(false)
      return
    }

    setProfile(data)
    setEditForm(profileToForm(data))
    setSaveMessage('Church profile saved successfully.')
    setSavingProfile(false)
    setActiveTab('profile')
  }

  const netSaves = Math.max(analytics.saves - analytics.unsaves, 0)
  const totalInterest =
    analytics.saves + analytics.messages + analytics.visitRequests

  const saveRate =
    analytics.views > 0 ? Math.round((analytics.saves / analytics.views) * 100) : 0
  const messageRate =
    analytics.views > 0 ? Math.round((analytics.messages / analytics.views) * 100) : 0
  const visitRate =
    analytics.views > 0
      ? Math.round((analytics.visitRequests / analytics.views) * 100)
      : 0

  const profileGalleryImages = normalizeGalleryImages(
    profile?.image_url ?? '',
    toArray(profile?.gallery_images)
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05070F] text-white">
        Loading...
      </div>
    )
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05070F] px-6 py-10 text-white">
        <LoginForm />
      </main>
    )
  }

  if (!isApproved(profile.verification_status)) {
    return (
      <PendingAccessScreen
        title="verification pending"
        message="Your church profile is still under review. Dashboard access unlocks only after your claim has been approved."
      />
    )
  }

  return (
    <main className="min-h-screen bg-[#05070F] text-white">
      <div className="relative h-80 w-full overflow-hidden">
        {profile.image_url ? (
          <img
            src={profile.image_url}
            alt={profile.church_name || 'Church profile image'}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-teal-400/20 via-indigo-500/20 to-black" />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-[#05070F]" />

        <div className="absolute bottom-8 left-8 right-8">
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            {profile.church_name}
          </h1>

          <p className="mt-2 text-lg text-white/70">
            {[profile.city, profile.state].filter(Boolean).join(', ')}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge label={profile.verification_status} type="success" />
            <Badge label={getPlanName(profile.subscription_tier)} />
            <Badge label={profile.badge_type} />
            <Badge
              label={`${profileGalleryImages.length}/${getPhotoLimit(
                profile.subscription_tier
              )} photos`}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-wrap gap-3">
          <TabButton
            label="Profile"
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          />

          <TabButton
            label="Analytics"
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
          />

          <TabButton
            label="Edit Profile"
            active={activeTab === 'edit'}
            onClick={() => {
              setEditForm(profileToForm(profile))
              setSaveMessage('')
              setSaveError('')
              setActiveTab('edit')
            }}
          />

          <a
            href={`/church/${profile.id}`}
            className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-bold text-white/80 transition hover:bg-white/10"
          >
            View Public Page
          </a>
        </div>

        {activeTab === 'profile' && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card title="About">
              {profile.bio || <EmptyState text="No description yet." />}
            </Card>

            <Card title="Details">
              <Info label="Denomination" value={profile.denomination} />
              <Info label="Worship Style" value={profile.worship_style} />
              <Info label="Church Size" value={profile.church_size} />
              <Info label="Attendance" value={profile.weekly_attendance} />
              <Info label="Atmosphere" value={profile.atmosphere_preference} />
            </Card>

            <Card title="Photos">
              {profileGalleryImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {profileGalleryImages.slice(0, 4).map((imageUrl, index) => (
                    <div
                      key={imageUrl}
                      className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
                    >
                      <img
                        src={imageUrl}
                        alt={`${profile.church_name || 'Church'} photo ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      {imageUrl === profile.image_url && (
                        <div className="absolute left-2 top-2 rounded-full bg-teal-400 px-3 py-1 text-xs font-black text-black">
                          Hero
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="No church photos added yet." />
              )}
            </Card>

            <Card title="Contact">
              <Info label="Leader" value={profile.full_name} />
              <Info label="Role" value={profile.role_title} />
              <Info label="Email" value={profile.email} />
              <Info label="Phone" value={profile.phone} />
              <Info label="Website" value={profile.website} />
            </Card>

            <Card title="Location">
              <Info label="Address" value={profile.address} />
              <Info label="City" value={profile.city} />
              <Info label="State" value={profile.state} />
              <Info label="ZIP" value={profile.zip_code} />
            </Card>

            <Card title="Service Times">
              {profile.service_times?.length > 0 ? (
                <div className="space-y-1">
                  {profile.service_times.map((time: string, index: number) => (
                    <p key={index} className="text-white/80">
                      {time}
                    </p>
                  ))}
                </div>
              ) : (
                <EmptyState text="No service times added." />
              )}
            </Card>

            <Card title="Ministries">
              <Info label="Kids Ministry" value={profile.kids_ministry ? 'Yes' : 'No'} />
              <Info label="Youth Ministry" value={profile.youth_ministry ? 'Yes' : 'No'} />
              <Info label="Small Groups" value={profile.small_groups ? 'Yes' : 'No'} />
              <TagList values={profile.ministry_tags} empty="No ministry highlights added." />
            </Card>

            <Card title="Newcomer Experience">
              <TagList
                values={profile.newcomer_features}
                empty="No newcomer features added."
              />
            </Card>

            <Card title="Serving & Outreach">
              <TagList values={profile.serving_focuses} empty="No serving focuses added." />
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-300">
                  Last 30 days
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">
                  Growth snapshot
                </h2>
              </div>

              <p className="text-sm text-white/40">
                {analyticsLoading ? 'Updating...' : 'Live from Supabase'}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AnalyticsCard title="Profile Views" value={analytics.views} />
              <AnalyticsCard title="Net Saves" value={netSaves} />
              <AnalyticsCard title="Messages" value={analytics.messages} />
              <AnalyticsCard title="Visit Requests" value={analytics.visitRequests} />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MiniMetric title="Total Interest" value={totalInterest} />
              <MiniMetric title="Save Rate" value={`${saveRate}%`} />
              <MiniMetric title="Message Rate" value={`${messageRate}%`} />
              <MiniMetric title="Visit Rate" value={`${visitRate}%`} />
            </div>
          </section>
        )}

        {activeTab === 'edit' && editForm && (
          <EditProfileForm
            form={editForm}
            setForm={setEditForm}
            profile={profile}
            saving={savingProfile}
            saveMessage={saveMessage}
            saveError={saveError}
            onSave={saveProfile}
            onCancel={() => {
              setEditForm(profileToForm(profile))
              setSaveMessage('')
              setSaveError('')
              setActiveTab('profile')
            }}
          />
        )}
      </div>
    </main>
  )
}

function EditProfileForm({
  form,
  setForm,
  profile,
  saving,
  saveMessage,
  saveError,
  onSave,
  onCancel,
}: {
  form: ChurchProfileForm
  setForm: (form: ChurchProfileForm) => void
  profile: any
  saving: boolean
  saveMessage: string
  saveError: string
  onSave: () => void
  onCancel: () => void
}) {
  const derivedSize = deriveChurchSize(form.weekly_attendance)
  const strength = getProfileStrength(form)

  function update<K extends keyof ChurchProfileForm>(
    key: K,
    value: ChurchProfileForm[K]
  ) {
    setForm({ ...form, [key]: value })
  }

  function toggleArray(key: keyof ChurchProfileForm, value: string) {
    const current = form[key]

    if (!Array.isArray(current)) return

    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value].sort()

    setForm({ ...form, [key]: next })
  }

  function updateServiceRow(
    index: number,
    key: keyof ServiceTimeRow,
    value: string
  ) {
    const next = [...form.service_times]
    next[index] = {
      ...next[index],
      [key]: value,
    }

    update('service_times', sortServiceRows(next))
  }

  function addServiceTime() {
    update('service_times', [
      ...form.service_times,
      {
        day: 'Sunday',
        time: '10:00',
      },
    ])
  }

  function removeServiceTime(index: number) {
    const next = form.service_times.filter((_, itemIndex) => itemIndex !== index)

    update(
      'service_times',
      next.length > 0
        ? sortServiceRows(next)
        : [
            {
              day: 'Sunday',
              time: '10:00',
            },
          ]
    )
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-teal-300/15 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-6 shadow-2xl backdrop-blur-xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-300">
          Profile editor
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight">
          Keep your church profile aligned with the app
        </h2>
        <p className="mt-2 max-w-3xl text-white/60">
          These fields write to the existing church profile record and mirror the
          profile values used by the iOS app.
        </p>
      </div>

      <ProfileStrengthCard strength={strength} />

      <EditCard title="Church Photos">
        <PhotoManager form={form} setForm={setForm} profile={profile} />
      </EditCard>

      <EditCard title="Church Details">
        <Field
          label="Church Name"
          value={form.church_name}
          onChange={(value) => update('church_name', value)}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            label="Denomination"
            value={form.denomination}
            options={uniqueOptions(denominationOptions, form.denomination)}
            onChange={(value) => update('denomination', value)}
          />

          <SelectField
            label="Worship Style"
            value={form.worship_style}
            options={uniqueOptions(worshipStyleOptions, form.worship_style)}
            onChange={(value) => update('worship_style', value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Weekly Attendance"
            value={form.weekly_attendance}
            type="number"
            onChange={(value) => {
              setForm({
                ...form,
                weekly_attendance: value,
                church_size: deriveChurchSize(value),
              })
            }}
          />

          <div>
            <p className="mb-2 text-sm font-semibold text-white/60">
              Derived Church Size
            </p>
            <div className="flex min-h-12 items-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white/90">
              {derivedSize}
            </div>
          </div>
        </div>
      </EditCard>

      <EditCard title="Leadership Contact">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Full Name"
            value={form.full_name}
            onChange={(value) => update('full_name', value)}
          />

          <Field
            label="Role / Title"
            value={form.role_title}
            onChange={(value) => update('role_title', value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="Church Email"
            value={form.email}
            type="email"
            onChange={(value) => update('email', value)}
          />

          <Field
            label="Phone Number"
            value={form.phone}
            onChange={(value) => update('phone', value)}
          />

          <Field
            label="Website"
            value={form.website}
            onChange={(value) => update('website', value)}
          />
        </div>
      </EditCard>

      <EditCard title="Location">
        <Field
          label="Address"
          value={form.address}
          onChange={(value) => update('address', value)}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="City"
            value={form.city}
            onChange={(value) => update('city', value)}
          />

          <Field
            label="State"
            value={form.state}
            onChange={(value) => update('state', value)}
          />

          <Field
            label="ZIP"
            value={form.zip_code}
            onChange={(value) => update('zip_code', value)}
          />
        </div>
      </EditCard>

      <EditCard title="Ministries & Community">
        <div className="grid gap-3 md:grid-cols-3">
          <TogglePill
            label="Kids Ministry"
            checked={form.kids_ministry}
            onClick={() => update('kids_ministry', !form.kids_ministry)}
          />

          <TogglePill
            label="Youth Ministry"
            checked={form.youth_ministry}
            onClick={() => update('youth_ministry', !form.youth_ministry)}
          />

          <TogglePill
            label="Small Groups"
            checked={form.small_groups}
            onClick={() => update('small_groups', !form.small_groups)}
          />
        </div>

        <MultiSelect
          title="Support & Ministry Highlights"
          options={ministryTagOptions}
          selected={form.ministry_tags}
          onToggle={(value) => toggleArray('ministry_tags', value)}
        />

        <MultiSelect
          title="Newcomer Experience"
          options={newcomerFeatureOptions}
          selected={form.newcomer_features}
          onToggle={(value) => toggleArray('newcomer_features', value)}
        />

        <MultiSelect
          title="Serving & Outreach"
          options={servingFocusOptions}
          selected={form.serving_focuses}
          onToggle={(value) => toggleArray('serving_focuses', value)}
        />
      </EditCard>

      <EditCard title="How People Find You">
        <SelectField
          label="Atmosphere"
          value={form.atmosphere_preference}
          options={uniqueOptions(atmosphereOptions, form.atmosphere_preference)}
          onChange={(value) => update('atmosphere_preference', value)}
        />

        <div>
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white/60">
                Service Schedule
              </p>
              <p className="text-xs text-white/40">
                Add each service with a day and time. This saves back into the
                existing service_times array.
              </p>
            </div>

            <button
              type="button"
              onClick={addServiceTime}
              className="rounded-2xl bg-teal-400 px-4 py-2 text-sm font-bold text-black hover:bg-teal-300"
            >
              Add service
            </button>
          </div>

          <div className="space-y-3">
            {form.service_times.map((row, index) => (
              <div
                key={`${row.day}-${row.time}-${index}`}
                className="rounded-3xl border border-white/10 bg-white/[0.035] p-4"
              >
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <SelectField
                    label="Day"
                    value={row.day}
                    options={serviceDayOptions}
                    onChange={(value) => updateServiceRow(index, 'day', value)}
                  />

                  <Field
                    label="Time"
                    value={row.time}
                    type="time"
                    onChange={(value) => updateServiceRow(index, 'time', value)}
                  />

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeServiceTime(index)}
                      className="min-h-12 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 font-bold text-red-200 hover:bg-red-400/15"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-teal-300/10 bg-teal-300/10 px-4 py-3 text-sm font-bold text-teal-100">
                  {encodeServiceTime(row)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <MultiSelect
          title="Target Life Stages"
          options={lifeStageOptions}
          selected={form.target_life_stages}
          onToggle={(value) => toggleArray('target_life_stages', value)}
        />
      </EditCard>

      <EditCard title="About Your Church">
        <TextArea
          label="Church Bio"
          value={form.bio}
          onChange={(value) => update('bio', value)}
        />

        {profile.verification_status !== 'approved' && (
          <TextArea
            label="Why are you authorized to manage this church account?"
            value={form.authority_explanation}
            onChange={(value) => update('authority_explanation', value)}
          />
        )}
      </EditCard>

      {(saveMessage || saveError) && (
        <div
          className={`rounded-2xl border p-4 text-sm font-semibold ${
            saveError
              ? 'border-red-400/20 bg-red-400/10 text-red-200'
              : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
          }`}
        >
          {saveError || saveMessage}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-2xl bg-teal-400 px-6 py-4 font-black text-black shadow-lg shadow-teal-400/20 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Church Profile'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </section>
  )
}

function PhotoManager({
  form,
  setForm,
  profile,
}: {
  form: ChurchProfileForm
  setForm: (form: ChurchProfileForm) => void
  profile: any
}) {
  const [uploading, setUploading] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [photoMessage, setPhotoMessage] = useState('')

  const photoLimit = getPhotoLimit(profile.subscription_tier)
  const planName = getPlanName(profile.subscription_tier)
  const galleryImages = normalizeGalleryImages(form.image_url, form.gallery_images).slice(
    0,
    photoLimit
  )
  const remainingSlots = Math.max(photoLimit - galleryImages.length, 0)
  const slotCount = Math.max(photoLimit, 1)

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return

    setPhotoError('')
    setPhotoMessage('')

    if (remainingSlots <= 0) {
      setPhotoError(`Your ${planName} plan allows ${photoLimit} photo${photoLimit === 1 ? '' : 's'}.`)
      return
    }

    const selectedFiles = Array.from(files).slice(0, remainingSlots)

    const invalidFile = selectedFiles.find((file) => !file.type.startsWith('image/'))

    if (invalidFile) {
      setPhotoError('Please upload image files only.')
      return
    }

    const oversizedFile = selectedFiles.find(
      (file) => file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024
    )

    if (oversizedFile) {
      setPhotoError(`Images must be ${MAX_IMAGE_SIZE_MB} MB or smaller.`)
      return
    }

    setUploading(true)

    const uploadedUrls: string[] = []

    for (const file of selectedFiles) {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const safeExtension = extension.replace(/[^a-z0-9]/g, '') || 'jpg'
      const filePath = `${profile.id}/${Date.now()}-${crypto.randomUUID()}.${safeExtension}`

      const { error: uploadError } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Image upload error:', uploadError)
        setPhotoError(uploadError.message)
        setUploading(false)
        return
      }

      const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(filePath)

      if (data.publicUrl) {
        uploadedUrls.push(data.publicUrl)
      }
    }

    const nextGallery = normalizeGalleryImages(form.image_url, [
      ...form.gallery_images,
      ...uploadedUrls,
    ]).slice(0, photoLimit)

    setForm({
      ...form,
      image_url: form.image_url.trim() || nextGallery[0] || '',
      gallery_images: nextGallery,
    })

    setPhotoMessage(
      uploadedUrls.length === 1
        ? 'Photo uploaded. Save your profile to publish it.'
        : 'Photos uploaded. Save your profile to publish them.'
    )
    setUploading(false)
  }

  function setHeroImage(imageUrl: string) {
    const nextGallery = normalizeGalleryImages(imageUrl, galleryImages)

    setForm({
      ...form,
      image_url: imageUrl,
      gallery_images: nextGallery,
    })
  }

  function removeImage(imageUrl: string) {
    const nextGallery = galleryImages.filter((item) => item !== imageUrl)
    const nextHero =
      form.image_url === imageUrl ? nextGallery[0] || '' : form.image_url

    setForm({
      ...form,
      image_url: nextHero,
      gallery_images: nextGallery,
    })
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-teal-300/15 bg-gradient-to-br from-teal-300/10 to-blue-400/10 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-200">
              {planName} photo package
            </p>
            <h3 className="mt-1 text-2xl font-black">
              {galleryImages.length}/{photoLimit} photos used
            </h3>
            <p className="mt-1 text-sm leading-6 text-white/55">
              Starter includes 1 photo. Growth includes 5. Featured includes 10.
              Your hero image is the main photo seekers see first.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm text-white/65">
            {getUpgradeText(photoLimit)}
          </div>
        </div>
      </div>

      <label
        className={`block rounded-3xl border border-dashed p-6 text-center transition ${
          remainingSlots > 0
            ? 'cursor-pointer border-teal-300/35 bg-white/[0.035] hover:bg-white/[0.06]'
            : 'cursor-not-allowed border-white/10 bg-white/[0.02] opacity-60'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={uploading || remainingSlots <= 0}
          onChange={(event) => {
            handleUpload(event.target.files)
            event.target.value = ''
          }}
          className="hidden"
        />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400 text-2xl font-black text-black">
          +
        </div>

        <p className="mt-4 font-black">
          {uploading
            ? 'Uploading...'
            : remainingSlots > 0
              ? `Upload church photo${remainingSlots === 1 ? '' : 's'}`
              : 'Photo limit reached'}
        </p>

        <p className="mt-1 text-sm text-white/45">
          {remainingSlots > 0
            ? `${remainingSlots} upload slot${remainingSlots === 1 ? '' : 's'} remaining. Max ${MAX_IMAGE_SIZE_MB} MB each.`
            : 'Upgrade your plan to add more photos.'}
        </p>
      </label>

      {(photoError || photoMessage) && (
        <div
          className={`rounded-2xl border p-4 text-sm font-semibold ${
            photoError
              ? 'border-red-400/20 bg-red-400/10 text-red-200'
              : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
          }`}
        >
          {photoError || photoMessage}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: slotCount }).map((_, index) => {
          const imageUrl = galleryImages[index]
          const isHero = imageUrl && imageUrl === form.image_url

          if (!imageUrl) {
            return (
              <div
                key={`empty-${index}`}
                className="flex aspect-[4/3] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.035] p-4 text-center"
              >
                <div>
                  <p className="font-black text-white/50">Slot {index + 1}</p>
                  <p className="mt-1 text-xs text-white/35">
                    {index < photoLimit ? 'Available' : 'Locked'}
                  </p>
                </div>
              </div>
            )
          }

          return (
            <div
              key={imageUrl}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
            >
              <div className="relative aspect-[4/3]">
                <img
                  src={imageUrl}
                  alt={`Church photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />

                {isHero && (
                  <div className="absolute left-3 top-3 rounded-full bg-teal-400 px-3 py-1 text-xs font-black text-black">
                    Hero
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 p-3">
                <button
                  type="button"
                  onClick={() => setHeroImage(imageUrl)}
                  className={`rounded-xl px-3 py-2 text-xs font-black transition ${
                    isHero
                      ? 'bg-teal-400 text-black'
                      : 'border border-white/10 bg-white/[0.05] text-white/70 hover:bg-white/[0.08]'
                  }`}
                >
                  {isHero ? 'Selected' : 'Set Hero'}
                </button>

                <button
                  type="button"
                  onClick={() => removeImage(imageUrl)}
                  className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-black text-red-200 transition hover:bg-red-400/15"
                >
                  Remove
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {photoLimit < 10 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 10 - photoLimit }).map((_, index) => (
            <div
              key={`locked-${index}`}
              className="flex aspect-[4/3] items-center justify-center rounded-3xl border border-white/10 bg-black/30 p-4 text-center opacity-70"
            >
              <div>
                <p className="text-xl">🔒</p>
                <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-white/35">
                  Upgrade slot
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProfileStrengthCard({ strength }: { strength: ProfileStrength }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-300/15 via-white/[0.055] to-blue-400/10 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-200">
            Profile strength
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight">
            {strength.score}% complete
          </h2>

          <p className="mt-2 max-w-2xl text-white/60">
            Stronger profiles help seekers understand your church before they
            visit.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/20 px-6 py-5 text-center">
          <p className="text-5xl font-black text-teal-200">{strength.score}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/40">
            out of 100
          </p>
        </div>
      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-300 to-blue-400 transition-all"
          style={{ width: `${strength.score}%` }}
        />
      </div>

      {strength.improvements.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-semibold text-emerald-100">
          Your profile looks strong. Keep it updated so seekers know what to
          expect.
        </div>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {strength.improvements.slice(0, 3).map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.055] p-4"
            >
              <p className="font-bold text-white">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/55">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PendingAccessScreen({
  title,
  message,
}: {
  title: string
  message: string
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05070F] px-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.05] p-10 text-center shadow-2xl backdrop-blur-xl">
        <p className="inline-flex rounded-full border border-teal-300/20 bg-teal-300/10 px-4 py-2 text-sm font-bold text-teal-200">
          Access locked
        </p>

        <h1 className="mt-6 text-4xl font-black">{title}</h1>
        <p className="mt-4 leading-relaxed text-white/70">{message}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/pending"
            className="rounded-2xl bg-teal-400 px-6 py-3 font-bold text-black hover:bg-teal-300"
          >
            View pending status
          </Link>

          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-bold text-white/80 hover:bg-white/10"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-6 py-3 font-bold transition ${
        active
          ? 'bg-teal-400 text-black shadow-lg shadow-teal-400/20'
          : 'border border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  )
}

function AnalyticsCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-xl backdrop-blur-xl">
      <p className="text-sm font-semibold text-white/50">{title}</p>
      <p className="mt-3 text-4xl font-black tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-white/40">Last 30 days</p>
    </div>
  )
}

function MiniMetric({
  title,
  value,
}: {
  title: string
  value: string | number
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl">
      <p className="text-sm font-semibold text-white/50">{title}</p>
      <p className="mt-3 text-3xl font-black">{value}</p>
    </div>
  )
}

function Badge({ label, type }: { label?: string; type?: 'success' }) {
  if (!label) return null

  const styles =
    type === 'success'
      ? 'border-emerald-400/20 bg-emerald-400/15 text-emerald-300'
      : 'border-white/20 bg-white/10 text-white/80'

  return (
    <div className={`rounded-full border px-3 py-1 text-sm font-medium ${styles}`}>
      {label}
    </div>
  )
}

function Card({ title, children }: any) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      <div className="text-white/80">{children}</div>
    </div>
  )
}

function EditCard({ title, children }: any) {
  return (
    <div className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl">
      <h2 className="text-xl font-black tracking-tight">{title}</h2>
      {children}
    </div>
  )
}

function Info({ label, value }: any) {
  return (
    <p className="flex justify-between gap-6 border-b border-white/5 py-2 text-white/70 last:border-b-0">
      <span>{label}</span>
      <span className="text-right text-white">{value || '-'}</span>
    </p>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/60">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none transition placeholder:text-white/30 focus:border-teal-300/50"
      />
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/60">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={6}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-teal-300/50"
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/60">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none transition focus:border-teal-300/50"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-[#05070F]">
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function TogglePill({
  label,
  checked,
  onClick,
}: {
  label: string
  checked: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left font-bold transition ${
        checked
          ? 'border-teal-300/30 bg-teal-300/15 text-teal-100'
          : 'border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.07]'
      }`}
    >
      {checked ? '✓ ' : '+ '}
      {label}
    </button>
  )
}

function MultiSelect({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  const combinedOptions = Array.from(new Set([...selected, ...options]))

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-white/60">{title}</p>
      <div className="flex flex-wrap gap-2">
        {combinedOptions.map((option) => {
          const isSelected = selected.includes(option)

          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                isSelected
                  ? 'border-teal-300/30 bg-teal-300/15 text-teal-100'
                  : 'border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08]'
              }`}
            >
              {isSelected ? '✓ ' : '+ '}
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TagList({ values, empty }: { values?: string[]; empty: string }) {
  if (!values || values.length === 0) {
    return <EmptyState text={empty} />
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {values.map((value) => (
        <span
          key={value}
          className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm text-white/75"
        >
          {value}
        </span>
      ))}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <p className="italic text-white/40">{text}</p>
}