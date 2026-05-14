'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type ChurchSearchResult = {
  id: string
  place_id?: string | null
  name: string
  address: string
  city?: string | null
  state?: string | null
  zip_code?: string | null
  website?: string | null
  latitude?: number | null
  longitude?: number | null
  distance_miles?: number | null
}

type ServiceEntry = {
  id: string
  day: string
  time: string
}

const DENOMINATIONS = [
  'Baptist',
  'Catholic',
  'Methodist',
  'Presbyterian',
  'Pentecostal',
  'Lutheran',
  'Episcopal',
  'Non-Denominational',
  'Orthodox',
  'Church of Christ',
  'Assembly of God',
  'Other',
]

const WORSHIP_STYLES = [
  'Traditional',
  'Contemporary',
  'Blended',
  'Charismatic',
  'Liturgical',
]

const ATMOSPHERES = [
  'Casual',
  'Family-Focused',
  'Formal',
  'High-Energy',
  'Quiet / Reflective',
]

const LIFE_STAGES = [
  'College Students',
  'Young Adults',
  'Young Families',
  'Parents',
  'Singles',
  'Empty Nesters',
  'Seniors',
]

const MINISTRY_TAGS = [
  'Recovery Ministry',
  'Marriage Ministry',
  'Men’s Ministry',
  'Women’s Ministry',
  'Missions',
  'Prayer Ministry',
  'Bible Studies',
  'Community Groups',
]

const NEWCOMER_FEATURES = [
  'Guest Parking',
  'Welcome Team',
  'Coffee / Fellowship',
  'Newcomer Lunch',
  'Connect Card',
  'First-Time Guest Gift',
]

const SERVING_FOCUSES = [
  'Local Outreach',
  'Food Pantry',
  'Homeless Ministry',
  'Youth Outreach',
  'International Missions',
  'Disaster Relief',
]

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

function clean(value: string) {
  return value.trim()
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function display(value?: string | number | null) {
  if (value === null || value === undefined) return '—'
  const text = String(value).trim()
  return text.length > 0 ? text : '—'
}

function ClaimPageContent() {
  const searchParams = useSearchParams()

  const initialChurchName =
    searchParams.get('churchName') ||
    (typeof window !== 'undefined'
      ? window.sessionStorage.getItem('tribe_claim_church_name') || ''
      : '')

  const initialPlaceId =
    searchParams.get('placeId') ||
    (typeof window !== 'undefined'
      ? window.sessionStorage.getItem('tribe_claim_place_id') || ''
      : '')

  const initialAddress =
    searchParams.get('address') ||
    (typeof window !== 'undefined'
      ? window.sessionStorage.getItem('tribe_claim_address') || ''
      : '')

  const [authChecking, setAuthChecking] = useState(true)

  const [step, setStep] = useState(0)
  const [mode, setMode] = useState<'claim' | 'manual'>(
    searchParams.get('manual') === 'true' ? 'manual' : 'claim'
  )

  const [zipSearch, setZipSearch] = useState('')
  const [churchSearchText, setChurchSearchText] = useState('')
  const [searchResults, setSearchResults] = useState<ChurchSearchResult[]>([])
  const [selectedChurch, setSelectedChurch] =
    useState<ChurchSearchResult | null>(null)

  const [churchName, setChurchName] = useState(initialChurchName)
  const [fullName, setFullName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [churchEmail, setChurchEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [address, setAddress] = useState(initialAddress)
  const [city, setCity] = useState('')
  const [stateValue, setStateValue] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [authorityExplanation, setAuthorityExplanation] = useState('')

  const [denomination, setDenomination] = useState('')
  const [worshipStyle, setWorshipStyle] = useState('Contemporary')
  const [weeklyAttendance, setWeeklyAttendance] = useState('')
  const [atmosphere, setAtmosphere] = useState('Casual')
  const [serviceSchedule, setServiceSchedule] = useState<ServiceEntry[]>([
    { id: makeId(), day: 'Sunday', time: '10:00 AM' },
  ])
  const [lifeStages, setLifeStages] = useState<string[]>([])

  const [kidsMinistry, setKidsMinistry] = useState(false)
  const [youthMinistry, setYouthMinistry] = useState(false)
  const [smallGroups, setSmallGroups] = useState(false)
  const [ministryTags, setMinistryTags] = useState<string[]>([])
  const [newcomerFeatures, setNewcomerFeatures] = useState<string[]>([])
  const [servingFocuses, setServingFocuses] = useState<string[]>([])

  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const steps =
    mode === 'claim'
      ? ['Find Church', 'Verify', 'Details', 'Ministries', 'Review']
      : ['Verify', 'Details', 'Ministries', 'Review']

  const progress = ((step + 1) / steps.length) * 100

  useEffect(() => {
    async function requireVerifiedUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.id) {
        window.location.href = '/create-account'
        return
      }

      const emailConfirmed =
        Boolean(user.email_confirmed_at) ||
        Boolean(user.confirmed_at)

      if (!emailConfirmed) {
        window.location.href = `/verify-email?email=${encodeURIComponent(
          user.email ?? ''
        )}&next=${encodeURIComponent('/claim')}`
        return
      }

      if (user.email && !churchEmail) {
        setChurchEmail(user.email)
      }

      if (initialChurchName && !churchName) {
        setChurchName(initialChurchName)
      }

      if (initialAddress && !address) {
        setAddress(initialAddress)
      }

      setAuthChecking(false)
    }

    requireVerifiedUser()
  }, [churchEmail, initialChurchName, initialAddress, churchName, address])

  const filteredResults = useMemo(() => {
    const query = churchSearchText.trim().toLowerCase()

    if (!query) return searchResults

    return searchResults.filter((church) => {
      return (
        church.name.toLowerCase().includes(query) ||
        church.address.toLowerCase().includes(query)
      )
    })
  }, [churchSearchText, searchResults])

  function toggleArray(
    value: string,
    list: string[],
    setter: (next: string[]) => void
  ) {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value))
      return
    }

    setter([...list, value].sort())
  }

  function addServiceEntry() {
    setServiceSchedule((current) => [
      ...current,
      { id: makeId(), day: 'Sunday', time: '10:00 AM' },
    ])
  }

  function updateServiceEntry(
    id: string,
    key: 'day' | 'time',
    value: string
  ) {
    setServiceSchedule((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, [key]: value } : entry
      )
    )
  }

  function removeServiceEntry(id: string) {
    setServiceSchedule((current) => {
      if (current.length === 1) {
        return [{ id: makeId(), day: 'Sunday', time: '10:00 AM' }]
      }

      return current.filter((entry) => entry.id !== id)
    })
  }

  function selectChurch(church: ChurchSearchResult) {
    setSelectedChurch(church)
    setChurchName(church.name)
    setWebsite(church.website ?? '')
    setAddress(church.address ?? '')
    setCity(church.city ?? '')
    setStateValue(church.state ?? '')
    setZipCode(church.zip_code ?? '')
    setErrorMessage('')

    if (church.place_id) {
      window.sessionStorage.setItem('tribe_claim_place_id', church.place_id)
    }

    if (church.name) {
      window.sessionStorage.setItem('tribe_claim_church_name', church.name)
    }

    if (church.address) {
      window.sessionStorage.setItem('tribe_claim_address', church.address)
    }
  }

  async function searchChurches() {
    setErrorMessage('')
    setIsSearching(true)
    setHasSearched(false)
    setSelectedChurch(null)

    const zip = clean(zipSearch)

    if (!zip || zip.length !== 5 || !/^\d+$/.test(zip)) {
      setErrorMessage('Please enter a valid 5-digit ZIP code.')
      setIsSearching(false)
      return
    }

    try {
      const response = await fetch(
        `/api/church-search?zip=${encodeURIComponent(zip)}&radius=10`
      )

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json?.error || 'Church search failed.')
      }

      const rawResults = json?.churches || json?.results || json?.data || []

      const normalized: ChurchSearchResult[] = rawResults
        .map((item: any) => ({
          id:
            item.id ||
            item.place_id ||
            item.placeId ||
            item.google_place_id ||
            `${item.name}-${item.address}`,
          place_id:
            item.place_id ||
            item.placeId ||
            item.google_place_id ||
            null,
          name: item.name || item.church_name || 'Unknown Church',
          address:
            item.address ||
            item.formatted_address ||
            item.location ||
            '',
          city: item.city || null,
          state: item.state || null,
          zip_code:
            item.zip_code ||
            item.zipCode ||
            item.postal_code ||
            null,
          website: item.website || null,
          latitude:
            typeof item.latitude === 'number'
              ? item.latitude
              : typeof item.lat === 'number'
                ? item.lat
                : null,
          longitude:
            typeof item.longitude === 'number'
              ? item.longitude
              : typeof item.lng === 'number'
                ? item.lng
                : null,
          distance_miles:
            typeof item.distance_miles === 'number'
              ? item.distance_miles
              : typeof item.distanceMiles === 'number'
                ? item.distanceMiles
                : null,
        }))
        .filter((item: ChurchSearchResult) => item.name && item.address)

      setSearchResults(normalized)
      setHasSearched(true)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Church search failed.'
      )
    }

    setIsSearching(false)
  }

  function validateStep() {
    setErrorMessage('')

    if (mode === 'claim' && step === 0) {
      if (!selectedChurch && !initialPlaceId) {
        setErrorMessage('Please select your church before continuing.')
        return false
      }
    }

    const verificationStep = mode === 'claim' ? 1 : 0
    const detailsStep = mode === 'claim' ? 2 : 1

    if (step === verificationStep) {
      if (!clean(churchName)) {
        setErrorMessage('Please enter your church name.')
        return false
      }

      if (!clean(fullName)) {
        setErrorMessage('Please enter your full name.')
        return false
      }

      if (!clean(roleTitle)) {
        setErrorMessage('Please enter your role or title.')
        return false
      }

      if (!clean(phone)) {
        setErrorMessage('Please enter a phone number.')
        return false
      }

      if (!clean(authorityExplanation)) {
        setErrorMessage(
          'Please explain why you are authorized to manage this church.'
        )
        return false
      }
    }

    if (step === detailsStep) {
      if (!clean(denomination)) {
        setErrorMessage('Please select the church denomination.')
        return false
      }

      if (!clean(weeklyAttendance) || Number(weeklyAttendance) <= 0) {
        setErrorMessage('Please enter average weekly attendance.')
        return false
      }

      if (
        serviceSchedule.length === 0 ||
        serviceSchedule.some(
          (entry) => !clean(entry.day) || !clean(entry.time)
        )
      ) {
        setErrorMessage('Please add at least one service day and time.')
        return false
      }
    }

    return true
  }

  function goNext() {
    if (!validateStep()) return
    setStep((current) => Math.min(current + 1, steps.length - 1))
  }

  function goBack() {
    setErrorMessage('')
    setStep((current) => Math.max(current - 1, 0))
  }

  function switchToManual() {
    setMode('manual')
    setStep(0)
    setSelectedChurch(null)
    setChurchName('')
    setAddress('')
    setCity('')
    setStateValue('')
    setZipCode('')
    setWebsite('')
    setErrorMessage('')
    window.sessionStorage.removeItem('tribe_claim_place_id')
    window.sessionStorage.removeItem('tribe_claim_church_name')
    window.sessionStorage.removeItem('tribe_claim_address')
  }

  async function handleSubmit() {
    if (!validateStep()) return

    setIsSubmitting(true)
    setErrorMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      setErrorMessage('Please log in again before submitting your claim.')
      setIsSubmitting(false)
      return
    }

    const cleanChurchName = clean(churchName)
    const googlePlaceId =
      selectedChurch?.place_id ||
      initialPlaceId ||
      window.sessionStorage.getItem('tribe_claim_place_id') ||
      null

    const { data: existingClaims, error: existingClaimError } =
      await supabase
        .from('church_claim_requests')
        .select('id, status')
        .or(
          googlePlaceId
            ? `google_place_id.eq.${googlePlaceId},church_name.ilike.${cleanChurchName}`
            : `church_name.ilike.${cleanChurchName}`
        )
        .in('status', ['pending', 'approved'])
        .limit(1)

    if (existingClaimError) {
      setErrorMessage(existingClaimError.message)
      setIsSubmitting(false)
      return
    }

    if (existingClaims && existingClaims.length > 0) {
      setErrorMessage(
        existingClaims[0].status === 'approved'
          ? 'This church has already been claimed.'
          : 'A claim request is already pending for this church.'
      )
      setIsSubmitting(false)
      return
    }

    const { data: approvedProfiles, error: profileError } = await supabase
      .from('church_profiles')
      .select('id, church_name, verification_status')
      .or(
        googlePlaceId
          ? `google_place_id.eq.${googlePlaceId},church_name.ilike.${cleanChurchName}`
          : `church_name.ilike.${cleanChurchName}`
      )
      .eq('verification_status', 'approved')
      .limit(1)

    if (profileError) {
      setErrorMessage(profileError.message)
      setIsSubmitting(false)
      return
    }

    if (approvedProfiles && approvedProfiles.length > 0) {
      setErrorMessage('This church has already been claimed.')
      setIsSubmitting(false)
      return
    }

    const scheduleText = serviceSchedule
      .map((entry) => `${entry.day} ${entry.time}`)
      .join(', ')

    const { error: claimError } = await supabase
      .from('church_claim_requests')
      .insert({
        user_id: user.id,
        google_place_id: googlePlaceId,
        claimed_church_id: null,
        church_id: null,
        church_name: cleanChurchName,
        full_name: clean(fullName),
        role_title: clean(roleTitle),
        church_email: clean(churchEmail),
        phone: clean(phone),
        website: clean(website),
        address: clean(address),
        city: clean(city),
        state: clean(stateValue),
        zip_code: clean(zipCode),
        denomination: clean(denomination),
        authority_explanation: clean(authorityExplanation),
        status: 'pending',
        submitted_at: new Date().toISOString(),
        search_zip_code: clean(zipSearch || zipCode),
        latitude: selectedChurch?.latitude ?? null,
        longitude: selectedChurch?.longitude ?? null,
        distance_miles: selectedChurch?.distance_miles ?? null,
      })

    if (claimError) {
      setErrorMessage(
        claimError.message.toLowerCase().includes('duplicate')
          ? 'A claim request is already pending for this church.'
          : claimError.message
      )
      setIsSubmitting(false)
      return
    }

    const { error: profileInsertError } = await supabase
      .from('church_profiles')
      .upsert(
        {
          id: user.id,
          google_place_id: googlePlaceId,
          church_name: cleanChurchName,
          full_name: clean(fullName),
          role_title: clean(roleTitle),
          email: clean(churchEmail),
          phone: clean(phone),
          website: clean(website),
          denomination: clean(denomination),
          worship_style: clean(worshipStyle),
          church_size:
            Number(weeklyAttendance) < 100
              ? 'Small'
              : Number(weeklyAttendance) < 300
                ? 'Medium'
                : Number(weeklyAttendance) < 1000
                  ? 'Large'
                  : 'Mega',
          weekly_attendance: Number(weeklyAttendance),
          kids_ministry: kidsMinistry,
          youth_ministry: youthMinistry,
          small_groups: smallGroups,
          ministry_tags: ministryTags,
          newcomer_features: newcomerFeatures,
          serving_focuses: servingFocuses,
          atmosphere_preference: clean(atmosphere),
          service_times: serviceSchedule.map(
            (entry) => `${entry.day} ${entry.time}`
          ),
          target_life_stages: lifeStages,
          address: clean(address),
          city: clean(city),
          state: clean(stateValue),
          zip_code: clean(zipCode),
          latitude: selectedChurch?.latitude ?? null,
          longitude: selectedChurch?.longitude ?? null,
          bio: null,
          authority_explanation: clean(authorityExplanation),
          onboarding_complete: true,
          verification_status: 'pending',
          verification_notes: 'Claim request submitted and awaiting review.',
          subscription_tier: 'tier1',
          badge_type: null,
          image_url: null,
          gallery_images: [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

    if (profileInsertError) {
      setErrorMessage(profileInsertError.message)
      setIsSubmitting(false)
      return
    }

    window.location.href = '/onboarding/success'
  }

  if (authChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070B14] text-white">
        Checking account verification...
      </main>
    )
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#070B14] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.24),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.22),_transparent_34%)]" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-6">
        <Link href="/" className="text-xl font-black">
          Tribe Finder
        </Link>

        <Link
          href="/login"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
        >
          Church login
        </Link>
      </nav>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16 pt-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 bg-gradient-to-br from-teal-300/15 to-blue-400/10 p-6 md:p-8">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-300">
              Church onboarding
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
              {mode === 'claim'
                ? 'Claim your church'
                : 'Create your church profile'}
            </h1>

            <p className="mt-4 max-w-3xl text-white/65">
              Complete the same verification and profile information used in the
              Tribe Finder app so your church can be reviewed and matched
              accurately.
            </p>

            <div className="mt-6">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.16em] text-white/45">
                <span>
                  Step {step + 1} of {steps.length}
                </span>
                <span>{steps[step]}</span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-teal-300 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {errorMessage && (
              <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-200">
                {errorMessage}
              </div>
            )}

            {mode === 'claim' && step === 0 && (
              <StepCard
                title="Find churches near your ZIP code"
                description="Search within 10 miles, choose the correct church, then confirm your verification information."
              >
                {initialChurchName && initialPlaceId && (
                  <div className="mb-6 rounded-3xl border border-teal-300/20 bg-teal-300/10 p-5">
                    <p className="text-sm font-black uppercase tracking-[0.16em] text-teal-200">
                      Selected from search
                    </p>

                    <h3 className="mt-2 text-xl font-black">
                      {initialChurchName}
                    </h3>

                    {initialAddress && (
                      <p className="mt-1 text-sm text-white/60">
                        {initialAddress}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="mt-5 rounded-2xl bg-teal-400 px-5 py-3 font-black text-black transition hover:bg-teal-300"
                    >
                      Continue with this church
                    </button>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                  <Input
                    label="ZIP Code"
                    value={zipSearch}
                    onChange={setZipSearch}
                    inputMode="numeric"
                  />

                  <button
                    type="button"
                    onClick={searchChurches}
                    disabled={isSearching}
                    className="self-end rounded-2xl bg-teal-400 px-6 py-4 font-black text-black transition hover:bg-teal-300 disabled:opacity-60"
                  >
                    {isSearching ? 'Searching...' : 'Find Churches'}
                  </button>
                </div>

                {hasSearched && (
                  <div className="mt-6">
                    <Input
                      label="Search nearby churches"
                      value={churchSearchText}
                      onChange={setChurchSearchText}
                    />

                    <div className="mt-4 grid gap-3">
                      {filteredResults.length === 0 ? (
                        <div className="rounded-3xl border border-white/10 bg-black/25 p-6 text-center">
                          <h3 className="text-xl font-black">
                            Can’t find your church?
                          </h3>

                          <p className="mt-2 text-white/55">
                            Try another ZIP code or create the church manually.
                          </p>

                          <button
                            type="button"
                            onClick={switchToManual}
                            className="mt-5 rounded-2xl bg-teal-400 px-5 py-3 font-black text-black transition hover:bg-teal-300"
                          >
                            Create Manually
                          </button>
                        </div>
                      ) : (
                        filteredResults.map((church) => (
                          <button
                            key={church.id}
                            type="button"
                            onClick={() => selectChurch(church)}
                            className={`rounded-3xl border p-5 text-left transition ${
                              selectedChurch?.id === church.id
                                ? 'border-teal-300/50 bg-teal-300/10'
                                : 'border-white/10 bg-black/25 hover:bg-white/[0.06]'
                            }`}
                          >
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-black">
                                  {church.name}
                                </h3>

                                <p className="mt-1 text-sm text-white/55">
                                  {church.address}
                                </p>

                                {church.distance_miles !== null &&
                                  church.distance_miles !== undefined && (
                                    <p className="mt-2 text-sm font-bold text-teal-200">
                                      {church.distance_miles.toFixed(1)} miles away
                                    </p>
                                  )}
                              </div>

                              <span className="text-2xl">
                                {selectedChurch?.id === church.id ? '✓' : '○'}
                              </span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {!hasSearched && (
                  <button
                    type="button"
                    onClick={switchToManual}
                    className="mt-6 text-sm font-bold text-teal-300 transition hover:text-teal-200"
                  >
                    Can’t find your church? Create one manually →
                  </button>
                )}
              </StepCard>
            )}

            {((mode === 'claim' && step === 1) ||
              (mode === 'manual' && step === 0)) && (
              <StepCard
                title="Verification information"
                description="This information helps us confirm that you legitimately represent this church."
              >
                {(selectedChurch || initialChurchName) && (
                  <div className="mb-6 rounded-3xl border border-teal-300/20 bg-teal-300/10 p-5">
                    <p className="text-sm font-black uppercase tracking-[0.16em] text-teal-200">
                      Selected Church
                    </p>
                    <h3 className="mt-2 text-xl font-black">
                      {selectedChurch?.name || initialChurchName}
                    </h3>
                    <p className="mt-1 text-sm text-white/60">
                      {selectedChurch?.address || initialAddress}
                    </p>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Church Name"
                    value={churchName}
                    onChange={setChurchName}
                    disabled={mode === 'claim' && Boolean(selectedChurch)}
                  />

                  <Input
                    label="Full Name"
                    value={fullName}
                    onChange={setFullName}
                  />

                  <Input
                    label="Role / Title"
                    value={roleTitle}
                    onChange={setRoleTitle}
                  />

                  <Input
                    label="Church Email"
                    value={churchEmail}
                    onChange={setChurchEmail}
                    type="email"
                  />

                  <Input
                    label="Phone Number"
                    value={phone}
                    onChange={setPhone}
                  />

                  <Input
                    label="Website"
                    value={website}
                    onChange={setWebsite}
                  />

                  <Input
                    label="Address"
                    value={address}
                    onChange={setAddress}
                  />

                  <Input
                    label="City"
                    value={city}
                    onChange={setCity}
                  />

                  <Input
                    label="State"
                    value={stateValue}
                    onChange={setStateValue}
                  />

                  <Input
                    label="ZIP Code"
                    value={zipCode}
                    onChange={setZipCode}
                    inputMode="numeric"
                  />
                </div>

                <TextArea
                  label="Why are you authorized to manage this church account?"
                  value={authorityExplanation}
                  onChange={setAuthorityExplanation}
                />
              </StepCard>
            )}

            {((mode === 'claim' && step === 2) ||
              (mode === 'manual' && step === 1)) && (
              <StepCard
                title="Church details"
                description="These answers help Tribe Finder match seekers to churches with better accuracy."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Select
                    label="Denomination"
                    value={denomination}
                    onChange={setDenomination}
                    options={DENOMINATIONS}
                  />

                  <Select
                    label="Worship Style"
                    value={worshipStyle}
                    onChange={setWorshipStyle}
                    options={WORSHIP_STYLES}
                  />

                  <Input
                    label="Average Weekly Attendance"
                    value={weeklyAttendance}
                    onChange={setWeeklyAttendance}
                    inputMode="numeric"
                  />

                  <Select
                    label="Atmosphere"
                    value={atmosphere}
                    onChange={setAtmosphere}
                    options={ATMOSPHERES}
                  />
                </div>

                <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black">
                        Service Schedule
                      </h3>
                      <p className="mt-1 text-sm text-white/50">
                        Add each regular service time.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addServiceEntry}
                      className="rounded-full bg-teal-400 px-4 py-2 text-sm font-black text-black transition hover:bg-teal-300"
                    >
                      Add
                    </button>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {serviceSchedule.map((entry) => (
                      <div
                        key={entry.id}
                        className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
                      >
                        <select
                          value={entry.day}
                          onChange={(event) =>
                            updateServiceEntry(
                              entry.id,
                              'day',
                              event.target.value
                            )
                          }
                          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-teal-300"
                        >
                          {DAYS.map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>

                        <input
                          value={entry.time}
                          onChange={(event) =>
                            updateServiceEntry(
                              entry.id,
                              'time',
                              event.target.value
                            )
                          }
                          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-teal-300"
                        />

                        <button
                          type="button"
                          onClick={() => removeServiceEntry(entry.id)}
                          className="rounded-2xl border border-red-300/20 bg-red-300/10 px-4 py-3 font-black text-red-100 transition hover:bg-red-300/15"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <MultiSelect
                  title="Target Life Stages"
                  options={LIFE_STAGES}
                  selected={lifeStages}
                  onToggle={(value) =>
                    toggleArray(value, lifeStages, setLifeStages)
                  }
                />
              </StepCard>
            )}

            {((mode === 'claim' && step === 3) ||
              (mode === 'manual' && step === 2)) && (
              <StepCard
                title="Ministries"
                description="Show seekers the strongest parts of your church community."
              >
                <div className="grid gap-3 md:grid-cols-3">
                  <ToggleCard
                    label="Kids Ministry"
                    checked={kidsMinistry}
                    onClick={() => setKidsMinistry(!kidsMinistry)}
                  />

                  <ToggleCard
                    label="Youth Ministry"
                    checked={youthMinistry}
                    onClick={() => setYouthMinistry(!youthMinistry)}
                  />

                  <ToggleCard
                    label="Small Groups"
                    checked={smallGroups}
                    onClick={() => setSmallGroups(!smallGroups)}
                  />
                </div>

                <MultiSelect
                  title="Support & Ministry Highlights"
                  options={MINISTRY_TAGS}
                  selected={ministryTags}
                  onToggle={(value) =>
                    toggleArray(value, ministryTags, setMinistryTags)
                  }
                />

                <MultiSelect
                  title="Newcomer Experience"
                  options={NEWCOMER_FEATURES}
                  selected={newcomerFeatures}
                  onToggle={(value) =>
                    toggleArray(value, newcomerFeatures, setNewcomerFeatures)
                  }
                />

                <MultiSelect
                  title="Serving & Outreach"
                  options={SERVING_FOCUSES}
                  selected={servingFocuses}
                  onToggle={(value) =>
                    toggleArray(value, servingFocuses, setServingFocuses)
                  }
                />
              </StepCard>
            )}

            {((mode === 'claim' && step === 4) ||
              (mode === 'manual' && step === 3)) && (
              <StepCard
                title="Review and submit"
                description="Review the profile information before sending it for verification."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <ReviewBlock label="Church" value={churchName} />
                  <ReviewBlock label="Requester" value={fullName} />
                  <ReviewBlock label="Role / Title" value={roleTitle} />
                  <ReviewBlock label="Church Email" value={churchEmail} />
                  <ReviewBlock label="Phone" value={phone} />
                  <ReviewBlock label="Website" value={website} />
                  <ReviewBlock label="Denomination" value={denomination} />
                  <ReviewBlock label="Worship Style" value={worshipStyle} />
                  <ReviewBlock label="Attendance" value={weeklyAttendance} />
                  <ReviewBlock label="Atmosphere" value={atmosphere} />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <ReviewBlock
                    label="Service Times"
                    value={serviceSchedule
                      .map((entry) => `${entry.day} ${entry.time}`)
                      .join(', ')}
                  />

                  <ReviewBlock
                    label="Life Stages"
                    value={lifeStages.join(', ')}
                  />

                  <ReviewBlock
                    label="Ministry Tags"
                    value={ministryTags.join(', ')}
                  />

                  <ReviewBlock
                    label="Newcomer Features"
                    value={newcomerFeatures.join(', ')}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="mt-8 w-full rounded-2xl bg-teal-400 py-4 font-black text-black transition hover:bg-teal-300 disabled:opacity-60"
                >
                  {isSubmitting
                    ? 'Submitting...'
                    : 'Submit for Verification'}
                </button>
              </StepCard>
            )}

            <div className="mt-8 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white/75 transition hover:bg-white/10 disabled:opacity-30"
              >
                Back
              </button>

              {step < steps.length - 1 && (
                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-2xl bg-teal-400 px-6 py-3 font-black text-black transition hover:bg-teal-300"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function StepCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h2 className="text-3xl font-black tracking-tight">{title}</h2>
      <p className="mt-3 max-w-3xl text-white/60">{description}</p>
      <div className="mt-8">{children}</div>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  disabled = false,
  inputMode,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  disabled?: boolean
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-300">{label}</span>

      <input
        type={type}
        value={value}
        disabled={disabled}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-teal-300 disabled:opacity-60"
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
    <label className="mt-4 block">
      <span className="text-sm font-semibold text-gray-300">{label}</span>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-32 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-teal-300"
      />
    </label>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-300">{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-teal-300"
      >
        <option value="">Select one</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function ToggleCard({
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
      className={`rounded-3xl border p-5 text-left transition ${
        checked
          ? 'border-teal-300/50 bg-teal-300/10'
          : 'border-white/10 bg-black/25 hover:bg-white/[0.06]'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-black">{label}</span>
        <span className="text-2xl">{checked ? '✓' : '○'}</span>
      </div>
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
  return (
    <div className="mt-6">
      <h3 className="text-xl font-black">{title}</h3>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {options.map((option) => {
          const isSelected = selected.includes(option)

          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                isSelected
                  ? 'border-teal-300/50 bg-teal-300/10 text-teal-100'
                  : 'border-white/10 bg-black/25 text-white/70 hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold">{option}</span>
                <span>{isSelected ? '✓' : '○'}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ReviewBlock({
  label,
  value,
}: {
  label: string
  value?: string | number | null
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-white/80">
        {display(value)}
      </p>
    </div>
  )
}

export default function ClaimPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#070B14] text-white">
          Loading...
        </main>
      }
    >
      <ClaimPageContent />
    </Suspense>
  )
}