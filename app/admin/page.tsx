'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import LoginForm from '../login/LoginForm'

type AdminProfile = {
  id: string
  email: string | null
  role: string | null
}

type ChurchClaimRequest = {
  id: string
  user_id: string | null
  claimed_church_id: string | null
  church_id: string | null
  church_name: string | null
  full_name: string | null
  role_title: string | null
  church_email: string | null
  phone: string | null
  website: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  denomination: string | null
  authority_explanation: string | null
  status: string | null
  submitted_at: string | null
  search_zip_code: string | null
  latitude: number | null
  longitude: number | null
  distance_miles: number | null
}

const ADMIN_ACCESS_KEY =
  process.env.NEXT_PUBLIC_ADMIN_ACCESS_KEY || ''

const ADMIN_GATE_STORAGE_KEY =
  'tribe_finder_admin_gate_unlocked'

function formatDate(value?: string | null) {
  if (!value) return 'Unknown'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Unknown'

  return date.toLocaleString()
}

function display(value?: string | number | null) {
  if (value === null || value === undefined) return '—'

  const cleanValue = String(value).trim()

  return cleanValue.length > 0 ? cleanValue : '—'
}

export default function AdminPage() {
  const [adminProfile, setAdminProfile] =
    useState<AdminProfile | null>(null)

  const [claims, setClaims] = useState<
    ChurchClaimRequest[]
  >([])

  const [loading, setLoading] = useState(true)

  const [loadingClaims, setLoadingClaims] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState('')

  const [gateChecking, setGateChecking] =
    useState(true)

  const [gateUnlocked, setGateUnlocked] =
    useState(false)

  const [adminPassword, setAdminPassword] =
    useState('')

  const [gateError, setGateError] =
    useState('')

  useEffect(() => {
    const unlocked =
      typeof window !== 'undefined' &&
      window.sessionStorage.getItem(
        ADMIN_GATE_STORAGE_KEY
      ) === 'true'

    setGateUnlocked(unlocked)
    setGateChecking(false)
  }, [])

  useEffect(() => {
    if (!gateUnlocked) return

    async function loadAdmin() {
      setLoading(true)
      setErrorMessage('')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        setErrorMessage(profileError.message)
        setLoading(false)
        return
      }

      setAdminProfile(profile)

      if (profile?.role === 'admin') {
        await loadPendingClaims()
      }

      setLoading(false)
    }

    loadAdmin()
  }, [gateUnlocked])

  function handleGateSubmit() {
    setGateError('')

    if (!ADMIN_ACCESS_KEY) {
      setGateError(
        'Admin access key is not configured.'
      )
      return
    }

    if (
      adminPassword.trim() !== ADMIN_ACCESS_KEY
    ) {
      setGateError('Incorrect admin password.')
      return
    }

    window.sessionStorage.setItem(
      ADMIN_GATE_STORAGE_KEY,
      'true'
    )

    setGateUnlocked(true)
  }

  async function loadPendingClaims() {
    setLoadingClaims(true)
    setErrorMessage('')

    const { data, error } = await supabase
      .from('church_claim_requests')
      .select(
        `
        id,
        user_id,
        claimed_church_id,
        church_id,
        church_name,
        full_name,
        role_title,
        church_email,
        phone,
        website,
        address,
        city,
        state,
        zip_code,
        denomination,
        authority_explanation,
        status,
        submitted_at,
        search_zip_code,
        latitude,
        longitude,
        distance_miles
      `
      )
      .eq('status', 'pending')
      .order('submitted_at', {
        ascending: false,
      })

    if (error) {
      setErrorMessage(error.message)
      setLoadingClaims(false)
      return
    }

    setClaims(data ?? [])
    setLoadingClaims(false)
  }

  if (gateChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05070F] text-white">
        Loading admin gate...
      </main>
    )
  }

  if (!gateUnlocked) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05070F] px-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_34%)]" />

        <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-300">
            Admin gate
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight">
            Protected access
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/60">
            Enter the admin access password before
            continuing.
          </p>

          <div className="mt-6">
            <label className="block">
              <span className="text-sm font-semibold text-gray-300">
                Admin password
              </span>

              <input
                type="password"
                value={adminPassword}
                onChange={(event) =>
                  setAdminPassword(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleGateSubmit()
                  }
                }}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-teal-300"
              />
            </label>
          </div>

          {gateError && (
            <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
              {gateError}
            </p>
          )}

          <button
            type="button"
            onClick={handleGateSubmit}
            className="mt-6 w-full rounded-2xl bg-teal-400 py-4 font-black text-black shadow-lg shadow-teal-400/20 transition hover:bg-teal-300"
          >
            Continue
          </button>

          <Link
            href="/"
            className="mt-4 block text-center text-sm font-bold text-white/45 transition hover:text-white"
          >
            Back to home
          </Link>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05070F] text-white">
        Loading admin...
      </main>
    )
  }

  if (!adminProfile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05070F] px-6 py-10 text-white">
        <LoginForm />
      </main>
    )
  }

  if (adminProfile.role !== 'admin') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05070F] px-6 text-white">
        <div className="w-full max-w-xl rounded-3xl border border-red-400/20 bg-red-400/10 p-8 text-center shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-red-200">
            Access denied
          </p>

          <h1 className="mt-4 text-4xl font-black">
            Admin only
          </h1>

          <p className="mt-4 text-white/70">
            Your account is signed in, but it does
            not have admin permissions.
          </p>

          <Link
            href="/dashboard"
            className="mt-8 inline-flex rounded-2xl bg-teal-400 px-6 py-3 font-black text-black transition hover:bg-teal-300"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#05070F] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_34%)]" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="text-xl font-black"
        >
          Tribe Finder
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10"
          >
            Dashboard
          </Link>

          <button
            type="button"
            onClick={loadPendingClaims}
            disabled={loadingClaims}
            className="rounded-full bg-teal-400 px-4 py-2 text-sm font-black text-black transition hover:bg-teal-300 disabled:opacity-60"
          >
            {loadingClaims
              ? 'Refreshing...'
              : 'Refresh'}
          </button>
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-8">
        <div className="grid gap-6">

          <PasswordResetPanel />

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-300">
                  Admin moderation
                </p>

                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
                  Church claim requests
                </h1>

                <p className="mt-4 max-w-3xl text-white/60">
                  Review pending church claims
                  before granting dashboard
                  access.
                </p>
              </div>

              <div className="rounded-3xl border border-teal-300/20 bg-teal-300/10 px-6 py-4">
                <p className="text-sm font-bold text-teal-100">
                  Pending Claims
                </p>

                <p className="mt-1 text-4xl font-black text-white">
                  {claims.length}
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-200">
                {errorMessage}
              </div>
            )}

            <div className="mt-8">
              {loadingClaims ? (
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-white/60">
                  Loading claims...
                </div>
              ) : claims.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
                  <h2 className="text-2xl font-black">
                    No pending claims
                  </h2>

                  <p className="mt-2 text-white/55">
                    New church claim requests
                    will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5">
                  {claims.map((claim) => (
                    <ClaimCard
                      key={claim.id}
                      claim={claim}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function PasswordResetPanel() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const [successMessage, setSuccessMessage] =
    useState('')

  const [errorMessage, setErrorMessage] =
    useState('')

  async function sendResetLink() {
    setLoading(true)
    setSuccessMessage('')
    setErrorMessage('')

    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail) {
      setErrorMessage(
        'Enter an email address.'
      )

      setLoading(false)
      return
    }

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        cleanEmail,
        {
          redirectTo:
            'https://tribefinderapp.co/reset-password',
        }
      )

    if (error) {
      setErrorMessage(error.message)
      setLoading(false)
      return
    }

    setSuccessMessage(
      `Password reset email sent to ${cleanEmail}`
    )

    setEmail('')
    setLoading(false)
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
            Account recovery
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight">
            Send password reset link
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
            Send an official Supabase password
            reset email directly from the admin
            dashboard.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-[1fr_auto]">
        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="church@example.com"
          className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition focus:border-cyan-300"
        />

        <button
          type="button"
          onClick={sendResetLink}
          disabled={loading}
          className="rounded-2xl bg-cyan-400 px-6 py-4 font-black text-black transition hover:bg-cyan-300 disabled:opacity-60"
        >
          {loading
            ? 'Sending...'
            : 'Send Reset Link'}
        </button>
      </div>

      {successMessage && (
        <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-semibold text-emerald-100">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-200">
          {errorMessage}
        </div>
      )}
    </div>
  )
}

function ClaimCard({
  claim,
}: {
  claim: ChurchClaimRequest
}) {
  const linkedChurchId =
    claim.church_id || claim.claimed_church_id

  return (
    <article className="rounded-3xl border border-white/10 bg-black/25 p-5 shadow-xl backdrop-blur">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-yellow-100">
              {display(claim.status)}
            </span>

            {claim.user_id ? (
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-100">
                Auth linked
              </span>
            ) : (
              <span className="rounded-full border border-red-300/20 bg-red-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-red-100">
                No user id
              </span>
            )}
          </div>

          <h2 className="mt-4 text-2xl font-black tracking-tight">
            {display(claim.church_name)}
          </h2>

          <p className="mt-2 text-sm text-white/45">
            Submitted{' '}
            {formatDate(claim.submitted_at)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/55">
          <p>
            <span className="font-bold text-white/80">
              Claim ID:
            </span>{' '}
            {claim.id}
          </p>

          <p className="mt-1">
            <span className="font-bold text-white/80">
              Church ID:
            </span>{' '}
            {display(linkedChurchId)}
          </p>

          <p className="mt-1">
            <span className="font-bold text-white/80">
              User ID:
            </span>{' '}
            {display(claim.user_id)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InfoBlock
          label="Requester"
          value={claim.full_name}
        />

        <InfoBlock
          label="Role / Title"
          value={claim.role_title}
        />

        <InfoBlock
          label="Email"
          value={claim.church_email}
        />

        <InfoBlock
          label="Phone"
          value={claim.phone}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InfoBlock
          label="Website"
          value={claim.website}
        />

        <InfoBlock
          label="Denomination"
          value={claim.denomination}
        />

        <InfoBlock
          label="Search ZIP"
          value={claim.search_zip_code}
        />

        <InfoBlock
          label="Distance"
          value={claim.distance_miles}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InfoBlock
          label="Address"
          value={claim.address}
        />

        <InfoBlock
          label="City"
          value={claim.city}
        />

        <InfoBlock
          label="State"
          value={claim.state}
        />

        <InfoBlock
          label="ZIP Code"
          value={claim.zip_code}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <InfoBlock
          label="Latitude"
          value={claim.latitude}
        />

        <InfoBlock
          label="Longitude"
          value={claim.longitude}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
          Authority Explanation
        </p>

        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/75">
          {display(
            claim.authority_explanation
          )}
        </p>
      </div>
    </article>
  )
}

function InfoBlock({
  label,
  value,
}: {
  label: string
  value?: string | number | null
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-white/80">
        {display(value)}
      </p>
    </div>
  )
}