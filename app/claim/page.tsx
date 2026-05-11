'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type ChurchProfile = {
  id: string
  church_name: string | null
  verification_status: string | null
}

function ClaimPageContent() {
  const searchParams = useSearchParams()
  const churchId = searchParams.get('church')
  const churchNameFromUrl = searchParams.get('churchName') || ''

  const [church, setChurch] = useState<ChurchProfile | null>(null)
  const [loadingChurch, setLoadingChurch] = useState(true)

  const [manualMode, setManualMode] = useState(
    searchParams.get('manual') === 'true'
  )

  const [churchName, setChurchName] = useState(churchNameFromUrl)
  const [fullName, setFullName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [notes, setNotes] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  function isApproved(status?: string | null) {
    return status?.trim().toLowerCase() === 'approved'
  }

  useEffect(() => {
    async function loadChurch() {
      setLoadingChurch(true)
      setErrorMessage('')

      if (!churchId || manualMode) {
        setLoadingChurch(false)
        return
      }

      const { data, error } = await supabase
        .from('church_profiles')
        .select('id, church_name, verification_status')
        .eq('id', churchId)
        .single()

      if (error || !data) {
        setErrorMessage('We could not find that church profile.')
        setLoadingChurch(false)
        return
      }

      setChurch(data)
      setChurchName(data.church_name || '')
      setLoadingChurch(false)
    }

    loadChurch()
  }, [churchId, manualMode])

  async function handleSubmit() {
    setIsSubmitting(true)
    setErrorMessage('')

    const cleanChurchName = churchName.trim()

    if (!cleanChurchName) {
      setErrorMessage('Church name is required.')
      setIsSubmitting(false)
      return
    }

    if (!fullName.trim()) {
      setErrorMessage('Full name is required.')
      setIsSubmitting(false)
      return
    }

    if (!email.trim()) {
      setErrorMessage('Email is required.')
      setIsSubmitting(false)
      return
    }

    if (churchId && !manualMode) {
      const { data: latestChurch, error: latestChurchError } = await supabase
        .from('church_profiles')
        .select('id, church_name, verification_status')
        .eq('id', churchId)
        .single()

      if (latestChurchError || !latestChurch) {
        setErrorMessage('We could not verify this church profile.')
        setIsSubmitting(false)
        return
      }

      if (isApproved(latestChurch.verification_status)) {
        setErrorMessage('This church has already been claimed.')
        setIsSubmitting(false)
        return
      }
    }

    const { data: matchingApprovedProfiles, error: profileNameError } =
      await supabase
        .from('church_profiles')
        .select('id, church_name, verification_status')
        .ilike('church_name', cleanChurchName)
        .limit(1)

    if (profileNameError) {
      setErrorMessage(profileNameError.message)
      setIsSubmitting(false)
      return
    }

    if (
      matchingApprovedProfiles &&
      matchingApprovedProfiles.some((profile) =>
        isApproved(profile.verification_status)
      )
    ) {
      setErrorMessage('This church has already been claimed.')
      setIsSubmitting(false)
      return
    }

    if (churchId && !manualMode) {
      const { data: existingClaimsById, error: claimByIdError } = await supabase
        .from('church_claim_requests')
        .select('id, status')
        .eq('church_id', churchId)
        .in('status', ['pending', 'approved'])
        .limit(1)

      if (claimByIdError) {
        setErrorMessage(claimByIdError.message)
        setIsSubmitting(false)
        return
      }

      if (existingClaimsById && existingClaimsById.length > 0) {
        setErrorMessage(
          existingClaimsById[0].status === 'approved'
            ? 'This church has already been claimed.'
            : 'A claim request is already pending for this church.'
        )
        setIsSubmitting(false)
        return
      }
    }

    const { data: existingClaimsByName, error: claimByNameError } =
      await supabase
        .from('church_claim_requests')
        .select('id, status')
        .ilike('church_name', cleanChurchName)
        .in('status', ['pending', 'approved'])
        .limit(1)

    if (claimByNameError) {
      setErrorMessage(claimByNameError.message)
      setIsSubmitting(false)
      return
    }

    if (existingClaimsByName && existingClaimsByName.length > 0) {
      setErrorMessage(
        existingClaimsByName[0].status === 'approved'
          ? 'This church has already been claimed.'
          : 'A claim request is already pending for this church.'
      )
      setIsSubmitting(false)
      return
    }

    const { error } = await supabase.from('church_claim_requests').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      church_id: manualMode ? null : churchId || null,
      church_name: cleanChurchName,
      full_name: fullName.trim(),
      role_title: roleTitle.trim(),
      church_email: email.trim(),
      phone: phone.trim(),
      website: website.trim(),
      authority_explanation: notes.trim(),
      status: 'pending',
    })

    if (error) {
      setErrorMessage(
        error.message.toLowerCase().includes('duplicate')
          ? 'A claim request is already pending for this church.'
          : error.message
      )
      setIsSubmitting(false)
      return
    }

    window.location.href = '/pending'
  }

  const alreadyClaimed = isApproved(church?.verification_status)

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

      <section className="relative z-10 flex min-h-[calc(100vh-96px)] items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur md:p-8">
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            claim your church
          </h1>

          <p className="mt-4 text-white/65">
            Submit your information for verification. You will not get dashboard
            access until the claim is reviewed and approved.
          </p>

          {!manualMode && (
            <button
              type="button"
              onClick={() => {
                setManualMode(true)
                setChurch(null)
                setChurchName('')
                setErrorMessage('')
              }}
              className="mt-6 text-sm font-medium text-teal-300 transition hover:text-teal-200"
            >
              Church not listed? Submit manually →
            </button>
          )}

          {manualMode && (
            <div className="mt-6 rounded-2xl border border-teal-400/20 bg-teal-400/10 p-4">
              <p className="text-sm text-teal-100">
                Manual church submission mode enabled.
              </p>
            </div>
          )}

          {loadingChurch && churchId && !manualMode && (
            <p className="mt-4 text-white/60">Loading church...</p>
          )}

          {errorMessage && (
            <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-200">
              {errorMessage}
            </p>
          )}

          {alreadyClaimed && !manualMode ? (
            <div className="mt-8 rounded-2xl border border-teal-300/20 bg-teal-300/10 p-5">
              <h2 className="text-xl font-black text-teal-200">
                Already claimed
              </h2>
              <p className="mt-2 text-white/70">
                This church profile has already been claimed.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              <Input
                label="Church Name"
                value={churchName}
                onChange={setChurchName}
                disabled={Boolean(churchId) && !manualMode}
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
                label="Email"
                value={email}
                onChange={setEmail}
                type="email"
              />

              <Input
                label="Phone"
                value={phone}
                onChange={setPhone}
              />

              <Input
                label="Website"
                value={website}
                onChange={setWebsite}
              />

              <div>
                <label className="text-sm text-gray-300">
                  Why are you authorized to manage this church?
                </label>

                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="mt-1 min-h-32 w-full rounded border border-white/20 bg-black p-3 text-white outline-none focus:border-teal-300/60"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || loadingChurch}
                className="w-full rounded bg-teal-400 py-3 font-bold text-black disabled:opacity-60"
              >
                {isSubmitting
                  ? 'Submitting...'
                  : 'Submit for Verification'}
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  disabled = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  disabled?: boolean
}) {
  return (
    <div>
      <label className="text-sm text-gray-300">{label}</label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded border border-white/20 bg-black p-3 text-white outline-none transition focus:border-teal-300/60 disabled:opacity-60"
      />
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