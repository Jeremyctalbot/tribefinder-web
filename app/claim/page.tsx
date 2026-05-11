'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type ChurchProfile = {
  id: string
  church_name: string | null
  verification_status: string | null
}

export default function ClaimPage() {
  const searchParams = useSearchParams()
  const churchId = searchParams.get('church')

  const [church, setChurch] = useState<ChurchProfile | null>(null)
  const [loadingChurch, setLoadingChurch] = useState(true)

  const [churchName, setChurchName] = useState('')
  const [fullName, setFullName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [notes, setNotes] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  function isApproved(status?: string | null) {
    return status?.trim().toLowerCase() === 'approved'
  }

  useEffect(() => {
    async function loadChurch() {
      setLoadingChurch(true)
      setErrorMessage('')

      if (!churchId) {
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
  }, [churchId])

  async function handleSubmit() {
    setIsSubmitting(true)
    setSuccessMessage('')
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

    // 1. Block if church profile itself is already approved
    if (churchId) {
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

    // 2. Block by church name too, even if churchId is missing
    const { data: matchingApprovedProfiles, error: profileNameError } = await supabase
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
      matchingApprovedProfiles.some((profile) => isApproved(profile.verification_status))
    ) {
      setErrorMessage('This church has already been claimed.')
      setIsSubmitting(false)
      return
    }

    // 3. Block pending/approved claim requests by church_id
    if (churchId) {
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

    // 4. Block pending/approved claim requests by church_name
    const { data: existingClaimsByName, error: claimByNameError } = await supabase
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
      church_id: churchId || null,
      church_name: cleanChurchName,
      full_name: fullName.trim(),
      role_title: roleTitle.trim(),
      email: email.trim(),
      phone: phone.trim(),
      website: website.trim(),
      notes: notes.trim(),
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

    setSuccessMessage('Claim submitted successfully. We’ll review it soon.')
    setFullName('')
    setRoleTitle('')
    setEmail('')
    setPhone('')
    setWebsite('')
    setNotes('')
    setIsSubmitting(false)
  }

  const alreadyClaimed = isApproved(church?.verification_status)

  return (
    <main className="min-h-screen bg-[#070B14] text-white overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.24),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.22),_transparent_34%)]" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-6">
        <Link href="/" className="text-xl font-black">
          Tribe Finder
        </Link>

        <Link
          href="/login"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
        >
          Church login
        </Link>
      </nav>

      <section className="relative z-10 flex min-h-[calc(100vh-96px)] items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 md:p-8 shadow-2xl backdrop-blur">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            claim your church
          </h1>

          {loadingChurch && churchId && (
            <p className="mt-4 text-white/60">Loading church...</p>
          )}

          {errorMessage && (
            <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-200">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="mt-6 rounded-2xl border border-green-400/20 bg-green-400/10 p-4 text-green-200">
              {successMessage}
            </p>
          )}

          {alreadyClaimed ? (
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
                disabled={Boolean(churchId)}
              />

              <Input label="Full Name" value={fullName} onChange={setFullName} />
              <Input label="Role / Title" value={roleTitle} onChange={setRoleTitle} />
              <Input label="Email" value={email} onChange={setEmail} type="email" />
              <Input label="Phone" value={phone} onChange={setPhone} />
              <Input label="Website" value={website} onChange={setWebsite} />

              <textarea
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded bg-black border border-white/20 p-3"
              />

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || loadingChurch}
                className="w-full rounded bg-teal-400 py-3 font-bold text-black disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Claim'}
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
  onChange: (v: string) => void
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
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded bg-black border border-white/20 p-3 disabled:opacity-60"
      />
    </div>
  )
}