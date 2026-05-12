'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type FormMode = 'login' | 'create'

type ServiceTime = {
  id: string
  day: string
  time: string
}

const PHOTO_BUCKET = 'church-images'
const MAX_IMAGE_SIZE_MB = 5
const PASSWORD_RESET_REDIRECT_URL = 'https://tribefinderapp.co/reset-password'

const denominations = [
  'Baptist',
  'Catholic',
  'Christian',
  'Church of Christ',
  'Episcopal',
  'Lutheran',
  'Methodist',
  'Non-Denominational',
  'Pentecostal',
  'Presbyterian',
  'Other',
]

const worshipStyles = [
  'Traditional',
  'Contemporary',
  'Blended',
  'Charismatic',
  'Liturgical',
]

const atmospheres = [
  'Casual',
  'Traditional',
  'Modern',
  'Family-focused',
  'High-energy',
  'Quiet and reflective',
]

const serviceDays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const lifeStages = [
  'College students',
  'Young adults',
  'Young families',
  'Families with teens',
  'Empty nesters',
  'Seniors',
]

const ministryTags = [
  'Kids ministry',
  'Youth ministry',
  'Small groups',
  'College ministry',
  'Recovery ministry',
  'Marriage ministry',
  'Men’s ministry',
  'Women’s ministry',
]

const newcomerFeatures = [
  'Welcome team',
  'Newcomer lunch',
  'Connection card',
  'Guest parking',
  'Next steps class',
  'Prayer team',
]

const servingFocuses = [
  'Local outreach',
  'Missions',
  'Food pantry',
  'Homeless ministry',
  'Foster care',
  'Community events',
]

function getChurchSize(attendance: number) {
  if (attendance < 100) return 'Small'
  if (attendance < 300) return 'Medium'
  if (attendance < 1000) return 'Large'
  return 'Mega'
}

function formatServiceTime(day: string, time: string) {
  const [hourValue, minuteValue] = time.split(':')
  const hour = Number(hourValue)
  const minute = minuteValue || '00'
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12

  return `${day} ${displayHour}:${minute} ${suffix}`
}

export default function LoginForm({
  initialMode = 'login',
}: {
  initialMode?: FormMode
}) {
  const router = useRouter()

  const [mode, setMode] = useState<FormMode>(initialMode)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [churchName, setChurchName] = useState('')
  const [fullName, setFullName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [denomination, setDenomination] = useState('')
  const [worshipStyle, setWorshipStyle] = useState('')
  const [weeklyAttendance, setWeeklyAttendance] = useState('')
  const [atmospherePreference, setAtmospherePreference] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [stateValue, setStateValue] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [bio, setBio] = useState('')
  const [authorityExplanation, setAuthorityExplanation] = useState('')

  const [kidsMinistry, setKidsMinistry] = useState(false)
  const [youthMinistry, setYouthMinistry] = useState(false)
  const [smallGroups, setSmallGroups] = useState(false)

  const [selectedLifeStages, setSelectedLifeStages] = useState<string[]>([])
  const [selectedMinistryTags, setSelectedMinistryTags] = useState<string[]>([])
  const [selectedNewcomerFeatures, setSelectedNewcomerFeatures] = useState<string[]>([])
  const [selectedServingFocuses, setSelectedServingFocuses] = useState<string[]>([])

  const [serviceTimes, setServiceTimes] = useState<ServiceTime[]>([
    { id: crypto.randomUUID(), day: 'Sunday', time: '10:00' },
  ])

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState('')
  const [photoError, setPhotoError] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const attendanceNumber = Number(weeklyAttendance)
  const churchSize = useMemo(() => getChurchSize(attendanceNumber || 0), [attendanceNumber])

  const createProgress = useMemo(() => {
    let score = 0

    if (churchName.trim()) score += 10
    if (selectedPhotoPreview) score += 10
    if (fullName.trim() && roleTitle.trim()) score += 10
    if (email.trim() && password.trim()) score += 10
    if (phone.trim() && website.trim()) score += 10
    if (city.trim() && stateValue.trim() && zipCode.trim()) score += 12
    if (denomination && worshipStyle && atmospherePreference) score += 12
    if (attendanceNumber > 0) score += 10
    if (serviceTimes.length > 0) score += 8
    if (
      kidsMinistry ||
      youthMinistry ||
      smallGroups ||
      selectedMinistryTags.length > 0 ||
      selectedNewcomerFeatures.length > 0 ||
      selectedServingFocuses.length > 0
    ) {
      score += 4
    }
    if (authorityExplanation.trim()) score += 4

    return Math.min(score, 100)
  }, [
    churchName,
    selectedPhotoPreview,
    fullName,
    roleTitle,
    email,
    password,
    phone,
    website,
    city,
    stateValue,
    zipCode,
    denomination,
    worshipStyle,
    atmospherePreference,
    attendanceNumber,
    serviceTimes.length,
    kidsMinistry,
    youthMinistry,
    smallGroups,
    selectedMinistryTags.length,
    selectedNewcomerFeatures.length,
    selectedServingFocuses.length,
    authorityExplanation,
  ])

  async function handleLogin() {
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setErrorMessage(error.message)
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
  }

  async function handleForgotPassword() {
    setErrorMessage('')
    setSuccessMessage('')

    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setErrorMessage('Enter your email first, then click forgot password.')
      return
    }

    setIsSendingReset(true)

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: PASSWORD_RESET_REDIRECT_URL,
    })

    if (error) {
      setErrorMessage(error.message)
      setIsSendingReset(false)
      return
    }

    setSuccessMessage('Password reset email sent. Check your inbox.')
    setIsSendingReset(false)
  }

  async function uploadSelectedPhoto(userId: string) {
    if (!selectedPhoto) return ''

    const extension = selectedPhoto.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeExtension = extension.replace(/[^a-z0-9]/g, '') || 'jpg'
    const filePath = `${userId}/${Date.now()}-${crypto.randomUUID()}.${safeExtension}`

    const { error: uploadError } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(filePath, selectedPhoto, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw new Error(uploadError.message)
    }

    const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(filePath)

    return data.publicUrl || ''
  }

  async function handleCreateProfile() {
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    const trimmedEmail = email.trim()
    const trimmedChurchName = churchName.trim()
    const trimmedFullName = fullName.trim()
    const trimmedRoleTitle = roleTitle.trim()
    const trimmedPhone = phone.trim()
    const trimmedWebsite = website.trim()
    const trimmedAddress = address.trim()
    const trimmedCity = city.trim()
    const trimmedState = stateValue.trim()
    const trimmedZipCode = zipCode.trim()
    const trimmedBio = bio.trim()
    const trimmedAuthorityExplanation = authorityExplanation.trim()

    if (!trimmedChurchName) return stopLoadingWithError('Please enter your church name.')
    if (!trimmedFullName) return stopLoadingWithError('Please enter your full name.')
    if (!trimmedRoleTitle) return stopLoadingWithError('Please enter your role or title.')
    if (!trimmedEmail || !password) return stopLoadingWithError('Please enter an email and password.')
    if (!trimmedPhone) return stopLoadingWithError('Please enter a phone number.')
    if (!trimmedWebsite) return stopLoadingWithError('Please enter your church website.')
    if (!trimmedCity || !trimmedState || !trimmedZipCode) return stopLoadingWithError('Please enter your city, state, and ZIP code.')
    if (!denomination) return stopLoadingWithError('Please select your denomination.')
    if (!worshipStyle) return stopLoadingWithError('Please select your worship style.')
    if (!weeklyAttendance || attendanceNumber <= 0) return stopLoadingWithError('Please enter your average weekly attendance.')
    if (!atmospherePreference) return stopLoadingWithError('Please select your church atmosphere.')
    if (!trimmedAuthorityExplanation) return stopLoadingWithError('Please explain why you are authorized to manage this church.')

    const formattedServiceTimes = serviceTimes.map((service) =>
      formatServiceTime(service.day, service.time)
    )

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
    })

    if (signUpError) {
      setErrorMessage(signUpError.message)
      setIsLoading(false)
      return
    }

    const userId = signUpData.user?.id

    if (!userId) {
      setErrorMessage('Your account was created, but the profile could not be linked. Please log in and try again.')
      setIsLoading(false)
      return
    }

    let uploadedImageUrl = ''

    try {
      uploadedImageUrl = await uploadSelectedPhoto(userId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Photo upload failed.'
      setErrorMessage(message)
      setIsLoading(false)
      return
    }

    const galleryImages = uploadedImageUrl ? [uploadedImageUrl] : []

    const { error: profileError } = await supabase.from('church_profiles').insert({
      id: userId,
      church_name: trimmedChurchName,
      full_name: trimmedFullName,
      role_title: trimmedRoleTitle,
      email: trimmedEmail,
      phone: trimmedPhone,
      website: trimmedWebsite,
      denomination,
      worship_style: worshipStyle,
      weekly_attendance: attendanceNumber,
      church_size: churchSize,
      kids_ministry: kidsMinistry,
      youth_ministry: youthMinistry,
      small_groups: smallGroups,
      ministry_tags: selectedMinistryTags,
      newcomer_features: selectedNewcomerFeatures,
      serving_focuses: selectedServingFocuses,
      atmosphere_preference: atmospherePreference,
      service_times: formattedServiceTimes,
      target_life_stages: selectedLifeStages,
      address: trimmedAddress,
      city: trimmedCity,
      state: trimmedState,
      zip_code: trimmedZipCode,
      bio: trimmedBio,
      authority_explanation: trimmedAuthorityExplanation,
      image_url: uploadedImageUrl || null,
      gallery_images: galleryImages,
      onboarding_complete: true,
      verification_status: 'pending',
      subscription_tier: 'tier1',
    })

    if (profileError) {
      setErrorMessage(profileError.message)
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
  }

  function stopLoadingWithError(message: string) {
    setErrorMessage(message)
    setIsLoading(false)
  }

  function handlePhotoSelect(file: File | null) {
    setPhotoError('')

    if (!file) {
      setSelectedPhoto(null)
      setSelectedPhotoPreview('')
      return
    }

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please upload an image file.')
      return
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setPhotoError(`Image must be ${MAX_IMAGE_SIZE_MB} MB or smaller.`)
      return
    }

    setSelectedPhoto(file)
    setSelectedPhotoPreview(URL.createObjectURL(file))
  }

  function toggleValue(value: string, current: string[], setter: (value: string[]) => void) {
    if (current.includes(value)) {
      setter(current.filter((item) => item !== value))
    } else {
      setter([...current, value])
    }
  }

  function addServiceTime() {
    setServiceTimes([
      ...serviceTimes,
      { id: crypto.randomUUID(), day: 'Sunday', time: '10:00' },
    ])
  }

  function removeServiceTime(id: string) {
    if (serviceTimes.length === 1) return
    setServiceTimes(serviceTimes.filter((service) => service.id !== id))
  }

  function updateServiceTime(id: string, key: 'day' | 'time', value: string) {
    setServiceTimes(
      serviceTimes.map((service) =>
        service.id === id ? { ...service, [key]: value } : service
      )
    )
  }

  return (
    <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-[0_0_70px_rgba(20,184,166,0.14)] backdrop-blur-xl">
      <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="hidden border-r border-white/10 bg-gradient-to-b from-teal-400/15 via-white/[0.04] to-indigo-400/10 p-8 lg:block">
          <div className="inline-flex rounded-full border border-teal-300/20 bg-teal-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-teal-100">
            Tribe Finder
          </div>

          <h2 className="mt-8 text-4xl font-black leading-tight tracking-tight">
            Build trust before Sunday.
          </h2>

          <p className="mt-4 text-sm leading-7 text-white/60">
            Create a verified church profile that helps seekers understand your
            worship style, ministries, service times, photos, and next steps.
          </p>

          <div className="mt-8 space-y-3">
            <SideStep number="01" title="Create your profile" active={mode === 'create'} />
            <SideStep number="02" title="Add your first photo" active={mode === 'create'} />
            <SideStep number="03" title="Submit for verification" active={mode === 'create'} />
            <SideStep number="04" title="Unlock your dashboard" active={mode === 'login'} />
          </div>

          {mode === 'create' && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white/70">Setup progress</p>
                <p className="text-sm font-black text-teal-200">{createProgress}%</p>
              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-300 to-blue-400 transition-all"
                  style={{ width: `${createProgress}%` }}
                />
              </div>

              <p className="mt-3 text-xs leading-5 text-white/45">
                Stronger profiles help seekers feel more confident before they
                plan a visit.
              </p>
            </div>
          )}
        </aside>

        <section className="p-5 sm:p-8">
          <div className="mb-8 grid grid-cols-2 rounded-2xl bg-black/30 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setErrorMessage('')
                setSuccessMessage('')
              }}
              className={`rounded-xl py-3 text-sm font-bold transition ${
                mode === 'login'
                  ? 'bg-teal-400 text-black shadow-lg shadow-teal-400/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Church Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('create')
                setErrorMessage('')
                setSuccessMessage('')
              }}
              className={`rounded-xl py-3 text-sm font-bold transition ${
                mode === 'create'
                  ? 'bg-teal-400 text-black shadow-lg shadow-teal-400/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Profile
            </button>
          </div>

          <div className="mb-8">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-300">
              {mode === 'login' ? 'Church portal' : 'Profile onboarding'}
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              {mode === 'login' ? 'Welcome back' : 'Create your church profile'}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
              {mode === 'login'
                ? 'Manage your Tribe Finder profile, messages, visits, photos, analytics, and plan.'
                : 'Submit the information seekers need to understand your church and help us verify your account.'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {mode === 'create' && (
              <PremiumSection
                eyebrow="Step 1"
                title="Verification Information"
                description="Who is managing this profile?"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Church Name" value={churchName} setValue={setChurchName} />
                  <Field label="Full Name" value={fullName} setValue={setFullName} />
                  <Field label="Role / Title" value={roleTitle} setValue={setRoleTitle} />
                  <Field label="Phone Number" value={phone} setValue={setPhone} type="tel" />
                  <Field label="Website" value={website} setValue={setWebsite} type="url" />
                </div>
              </PremiumSection>
            )}

            <PremiumSection
              eyebrow={mode === 'login' ? 'Secure access' : 'Step 2'}
              title={mode === 'login' ? 'Account Login' : 'Account Details'}
              description={mode === 'login' ? 'Use your church account credentials.' : 'This creates your web dashboard login.'}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Email" value={email} setValue={setEmail} type="email" />
                <Field label="Password" value={password} setValue={setPassword} type="password" />
              </div>

              {mode === 'login' && (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isSendingReset}
                    className="text-sm font-bold text-teal-300 transition hover:text-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSendingReset ? 'Sending reset email...' : 'Forgot password?'}
                  </button>
                </div>
              )}
            </PremiumSection>

            {mode === 'create' && (
              <>
                <PremiumSection
                  eyebrow="Step 3"
                  title="Church Photo"
                  description="Starter includes one photo. Growth unlocks five. Featured unlocks ten after approval."
                >
                  <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
                    <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-teal-300/35 bg-black/25 p-6 text-center transition hover:bg-white/[0.04]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          handlePhotoSelect(event.target.files?.[0] ?? null)
                          event.target.value = ''
                        }}
                        className="hidden"
                      />

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400 text-2xl font-black text-black">
                        +
                      </div>

                      <p className="mt-4 font-black text-white">
                        Upload first church photo
                      </p>

                      <p className="mt-1 text-sm leading-6 text-white/45">
                        Max {MAX_IMAGE_SIZE_MB} MB. This becomes your first hero image.
                      </p>
                    </label>

                    <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/25">
                      {selectedPhotoPreview ? (
                        <div className="relative h-full min-h-56">
                          <img
                            src={selectedPhotoPreview}
                            alt="Selected church preview"
                            className="h-full min-h-56 w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() => handlePhotoSelect(null)}
                            className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/70 px-4 py-2 text-sm font-black text-white backdrop-blur transition hover:bg-black"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="flex h-full min-h-56 items-center justify-center p-6 text-center">
                          <div>
                            <p className="text-4xl">📸</p>
                            <p className="mt-3 font-black text-white/70">
                              No photo selected yet
                            </p>
                            <p className="mt-1 text-sm text-white/40">
                              You can submit without one, but photos build trust fast.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {photoError && (
                    <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
                      {photoError}
                    </p>
                  )}
                </PremiumSection>

                <PremiumSection
                  eyebrow="Step 4"
                  title="Church Details"
                  description="Core details used across the app and website."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <SelectField label="Denomination" value={denomination} setValue={setDenomination} options={denominations} />
                    <SelectField label="Worship Style" value={worshipStyle} setValue={setWorshipStyle} options={worshipStyles} />
                    <Field label="Weekly Attendance" value={weeklyAttendance} setValue={setWeeklyAttendance} type="number" />
                    <SelectField label="Atmosphere" value={atmospherePreference} setValue={setAtmospherePreference} options={atmospheres} />
                    <Field label="Address" value={address} setValue={setAddress} />
                    <Field label="City" value={city} setValue={setCity} />
                    <Field label="State" value={stateValue} setValue={setStateValue} />
                    <Field label="ZIP Code" value={zipCode} setValue={setZipCode} />
                  </div>

                  <div className="mt-4 rounded-2xl border border-teal-300/15 bg-teal-300/10 px-4 py-3 text-sm text-teal-100">
                    Derived Church Size:{' '}
                    <span className="font-black">{churchSize}</span>
                  </div>
                </PremiumSection>

                <PremiumSection
                  eyebrow="Step 5"
                  title="Service Schedule"
                  description="Add each regular service time."
                  action={
                    <button
                      type="button"
                      onClick={addServiceTime}
                      className="rounded-full bg-teal-400 px-4 py-2 text-sm font-black text-black transition hover:bg-teal-300"
                    >
                      Add Service
                    </button>
                  }
                >
                  <div className="space-y-3">
                    {serviceTimes.map((service) => (
                      <div
                        key={service.id}
                        className="grid gap-3 rounded-2xl border border-white/10 bg-black/25 p-3 md:grid-cols-[1fr_1fr_auto]"
                      >
                        <select
                          value={service.day}
                          onChange={(e) => updateServiceTime(service.id, 'day', e.target.value)}
                          className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-teal-300"
                        >
                          {serviceDays.map((day) => (
                            <option key={day} value={day} className="bg-[#05070F]">
                              {day}
                            </option>
                          ))}
                        </select>

                        <input
                          type="time"
                          value={service.time}
                          onChange={(e) => updateServiceTime(service.id, 'time', e.target.value)}
                          className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-teal-300"
                        />

                        <button
                          type="button"
                          onClick={() => removeServiceTime(service.id)}
                          disabled={serviceTimes.length === 1}
                          className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200 transition hover:bg-red-500/20 disabled:opacity-40"
                        >
                          Remove
                        </button>

                        <div className="rounded-xl border border-teal-300/10 bg-teal-300/10 px-4 py-3 text-sm font-bold text-teal-100 md:col-span-3">
                          {formatServiceTime(service.day, service.time)}
                        </div>
                      </div>
                    ))}
                  </div>
                </PremiumSection>

                <PremiumSection
                  eyebrow="Step 6"
                  title="Ministries & Fit"
                  description="Help seekers understand where they may connect."
                >
                  <div className="grid gap-3 md:grid-cols-3">
                    <ToggleButton label="Kids Ministry" active={kidsMinistry} onClick={() => setKidsMinistry(!kidsMinistry)} />
                    <ToggleButton label="Youth Ministry" active={youthMinistry} onClick={() => setYouthMinistry(!youthMinistry)} />
                    <ToggleButton label="Small Groups" active={smallGroups} onClick={() => setSmallGroups(!smallGroups)} />
                  </div>

                  <ChipGroup title="Target Life Stages" options={lifeStages} selected={selectedLifeStages} onToggle={(value) => toggleValue(value, selectedLifeStages, setSelectedLifeStages)} />
                  <ChipGroup title="Ministry Highlights" options={ministryTags} selected={selectedMinistryTags} onToggle={(value) => toggleValue(value, selectedMinistryTags, setSelectedMinistryTags)} />
                  <ChipGroup title="Newcomer Features" options={newcomerFeatures} selected={selectedNewcomerFeatures} onToggle={(value) => toggleValue(value, selectedNewcomerFeatures, setSelectedNewcomerFeatures)} />
                  <ChipGroup title="Serving Focuses" options={servingFocuses} selected={selectedServingFocuses} onToggle={(value) => toggleValue(value, selectedServingFocuses, setSelectedServingFocuses)} />
                </PremiumSection>

                <PremiumSection
                  eyebrow="Step 7"
                  title="Profile Story"
                  description="Keep it warm, clear, and seeker-friendly."
                >
                  <div className="space-y-4">
                    <TextArea label="Church Bio" value={bio} setValue={setBio} />
                    <TextArea label="Why are you authorized to manage this church account?" value={authorityExplanation} setValue={setAuthorityExplanation} />
                  </div>
                </PremiumSection>
              </>
            )}

            {errorMessage && (
              <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100">
                {successMessage}
              </p>
            )}

            <button
              type="button"
              onClick={mode === 'login' ? handleLogin : handleCreateProfile}
              disabled={isLoading}
              className="w-full rounded-2xl bg-teal-400 py-4 font-black text-black shadow-lg shadow-teal-400/20 transition hover:bg-teal-300 disabled:opacity-60"
            >
              {isLoading
                ? mode === 'login'
                  ? 'Logging in...'
                  : 'Submitting...'
                : mode === 'login'
                  ? 'Log in'
                  : 'Submit for Verification'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

function SideStep({
  number,
  title,
  active,
}: {
  number: string
  title: string
  active: boolean
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-4 transition ${
        active
          ? 'border-teal-300/30 bg-teal-300/10 text-white'
          : 'border-white/10 bg-white/[0.04] text-white/45'
      }`}
    >
      <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-200">
        {number}
      </p>
      <p className="mt-1 font-bold">{title}</p>
    </div>
  )
}

function PremiumSection({
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-black/20 p-5 shadow-xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-300">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-black text-white">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-gray-400">{description}</p>
        </div>

        {action}
      </div>

      {children}
    </section>
  )
}

function Field({
  label,
  value,
  setValue,
  type = 'text',
}: {
  label: string
  value: string
  setValue: (value: string) => void
  type?: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-teal-300"
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  setValue,
  options,
}: {
  label: string
  value: string
  setValue: (value: string) => void
  options: string[]
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-300">{label}</span>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-teal-300"
      >
        <option value="" className="bg-[#05070F]">
          Select one
        </option>
        {options.map((option) => (
          <option key={option} value={option} className="bg-[#05070F]">
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function TextArea({
  label,
  value,
  setValue,
}: {
  label: string
  value: string
  setValue: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-300">{label}</span>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={5}
        className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-teal-300"
      />
    </label>
  )
}

function ToggleButton({
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
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-4 text-left text-sm font-bold transition ${
        active
          ? 'border-teal-300 bg-teal-400/20 text-teal-100'
          : 'border-white/10 bg-black/40 text-gray-300 hover:border-white/20'
      }`}
    >
      {active ? '✓ ' : '+ '}
      {label}
    </button>
  )
}

function ChipGroup({
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
      <p className="mb-3 text-sm font-bold text-gray-300">{title}</p>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option)

          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active
                  ? 'border-teal-300 bg-teal-400/20 text-teal-100'
                  : 'border-white/10 bg-black/40 text-gray-300 hover:border-white/20'
              }`}
            >
              {active ? '✓ ' : '+ '}
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}