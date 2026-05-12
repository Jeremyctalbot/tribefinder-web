'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import LoginForm from '../../login/LoginForm'

type AdminProfile = {
  id: string
  email: string | null
  role: string | null
}

type UserProfile = {
  id: string
  email: string | null
  role: string | null
}

type ChurchProfile = {
  id: string
  church_name: string | null
  email: string | null
  role_title: string | null
  verification_status: string | null
  subscription_tier: string | null
  city: string | null
  state: string | null
  zip_code: string | null
}

type SeekerProfile = {
  id: string
  zip_code: string | null
  onboarding_complete: boolean | null
}

const ADMIN_ACCESS_KEY =
  process.env.NEXT_PUBLIC_ADMIN_ACCESS_KEY || ''

const ADMIN_GATE_STORAGE_KEY =
  'tribe_finder_admin_gate_unlocked'

function display(value?: string | number | boolean | null) {
  if (value === null || value === undefined) return '—'
  const cleanValue = String(value).trim()
  return cleanValue.length > 0 ? cleanValue : '—'
}

export default function AdminUsersPage() {
  const [adminProfile, setAdminProfile] =
    useState<AdminProfile | null>(null)

  const [users, setUsers] = useState<UserProfile[]>([])
  const [selectedUser, setSelectedUser] =
    useState<UserProfile | null>(null)

  const [churchProfile, setChurchProfile] =
    useState<ChurchProfile | null>(null)

  const [seekerProfile, setSeekerProfile] =
    useState<SeekerProfile | null>(null)

  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [saving, setSaving] = useState(false)

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [gateChecking, setGateChecking] = useState(true)
  const [gateUnlocked, setGateUnlocked] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [gateError, setGateError] = useState('')

  const [newRole, setNewRole] = useState('')
  const [newTier, setNewTier] = useState('')
  const [newVerificationStatus, setNewVerificationStatus] =
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

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', user.id)
        .single()

      if (error) {
        setErrorMessage(error.message)
        setLoading(false)
        return
      }

      setAdminProfile(profile)

      if (profile?.role === 'admin') {
        await loadUsers('')
      }

      setLoading(false)
    }

    loadAdmin()
  }, [gateUnlocked])

  function handleGateSubmit() {
    setGateError('')

    if (!ADMIN_ACCESS_KEY) {
      setGateError('Admin access key is not configured.')
      return
    }

    if (adminPassword.trim() !== ADMIN_ACCESS_KEY) {
      setGateError('Incorrect admin password.')
      return
    }

    window.sessionStorage.setItem(
      ADMIN_GATE_STORAGE_KEY,
      'true'
    )

    setGateUnlocked(true)
  }

  async function loadUsers(queryValue = search) {
    setLoadingUsers(true)
    setErrorMessage('')
    setSuccessMessage('')

    let query = supabase
      .from('profiles')
      .select('id, email, role')
      .order('email', { ascending: true })
      .limit(75)

    const cleanQuery = queryValue.trim()

    if (cleanQuery.length > 0) {
      query = query.or(
        `email.ilike.%${cleanQuery}%,role.ilike.%${cleanQuery}%`
      )
    }

    const { data, error } = await query

    if (error) {
      setErrorMessage(error.message)
      setLoadingUsers(false)
      return
    }

    setUsers(data ?? [])
    setLoadingUsers(false)
  }

  async function loadUserDetails(userProfile: UserProfile) {
    setSelectedUser(userProfile)
    setChurchProfile(null)
    setSeekerProfile(null)
    setNewRole(userProfile.role ?? '')
    setNewTier('')
    setNewVerificationStatus('')
    setLoadingDetails(true)
    setErrorMessage('')
    setSuccessMessage('')

    const { data: churchData } = await supabase
      .from('church_profiles')
      .select(
        `
        id,
        church_name,
        email,
        role_title,
        verification_status,
        subscription_tier,
        city,
        state,
        zip_code
      `
      )
      .eq('id', userProfile.id)
      .maybeSingle()

    const { data: seekerData } = await supabase
      .from('seeker_profiles')
      .select('id, zip_code, onboarding_complete')
      .eq('id', userProfile.id)
      .maybeSingle()

    setChurchProfile(churchData ?? null)
    setSeekerProfile(seekerData ?? null)

    setNewTier(churchData?.subscription_tier ?? '')
    setNewVerificationStatus(
      churchData?.verification_status ?? ''
    )

    setLoadingDetails(false)
  }

  async function sendPasswordReset(email?: string | null) {
    setSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    const cleanEmail = email?.trim().toLowerCase()

    if (!cleanEmail) {
      setErrorMessage('This user does not have an email.')
      setSaving(false)
      return
    }

    const { error } =
      await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo:
          'https://tribefinderapp.co/reset-password',
      })

    if (error) {
      setErrorMessage(error.message)
      setSaving(false)
      return
    }

    setSuccessMessage(
      `Password reset email sent to ${cleanEmail}`
    )

    setSaving(false)
  }

  async function updateRole() {
    if (!selectedUser) return

    setSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', selectedUser.id)

    if (error) {
      setErrorMessage(error.message)
      setSaving(false)
      return
    }

    const updatedUser = {
      ...selectedUser,
      role: newRole,
    }

    setSelectedUser(updatedUser)

    setUsers((current) =>
      current.map((user) =>
        user.id === selectedUser.id ? updatedUser : user
      )
    )

    setSuccessMessage('User role updated.')
    setSaving(false)
  }

  async function updateChurchProfile() {
    if (!churchProfile) return

    setSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    const { error } = await supabase
      .from('church_profiles')
      .update({
        subscription_tier: newTier,
        verification_status: newVerificationStatus,
      })
      .eq('id', churchProfile.id)

    if (error) {
      setErrorMessage(error.message)
      setSaving(false)
      return
    }

    setChurchProfile({
      ...churchProfile,
      subscription_tier: newTier,
      verification_status: newVerificationStatus,
    })

    setSuccessMessage('Church profile updated.')
    setSaving(false)
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

          <label className="mt-6 block">
            <span className="text-sm font-semibold text-gray-300">
              Admin password
            </span>

            <input
              type="password"
              value={adminPassword}
              onChange={(event) =>
                setAdminPassword(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleGateSubmit()
                }
              }}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-teal-300"
            />
          </label>

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
        Loading admin users...
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
        <Link href="/" className="text-xl font-black">
          Tribe Finder
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10"
          >
            Claims
          </Link>

          <Link
            href="/dashboard"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl md:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-300">
            Admin users
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
            User management
          </h1>

          <p className="mt-4 max-w-3xl text-white/60">
            Search users, view linked profiles, send
            password resets, adjust roles, and manage
            church verification or subscription tier.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-[1fr_auto]">
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  loadUsers()
                }
              }}
              placeholder="Search by email or role"
              className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition focus:border-teal-300"
            />

            <button
              type="button"
              onClick={() => loadUsers()}
              disabled={loadingUsers}
              className="rounded-2xl bg-teal-400 px-6 py-4 font-black text-black transition hover:bg-teal-300 disabled:opacity-60"
            >
              {loadingUsers ? 'Searching...' : 'Search'}
            </button>
          </div>

          {successMessage && (
            <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-semibold text-emerald-100">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-200">
              {errorMessage}
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black">
                Users
              </h2>

              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-sm font-bold text-white/60">
                {users.length}
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              {loadingUsers ? (
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center text-white/60">
                  Loading users...
                </div>
              ) : users.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center text-white/60">
                  No users found.
                </div>
              ) : (
                users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => loadUserDetails(user)}
                    className={`rounded-3xl border p-4 text-left transition ${
                      selectedUser?.id === user.id
                        ? 'border-teal-300/50 bg-teal-300/10'
                        : 'border-white/10 bg-black/25 hover:bg-white/[0.06]'
                    }`}
                  >
                    <p className="break-words text-sm font-black text-white">
                      {display(user.email)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-white/55">
                        {display(user.role)}
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-white/35">
                        {user.id.slice(0, 8)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl md:p-8">
            {!selectedUser ? (
              <div className="flex min-h-[420px] items-center justify-center text-center">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-white/35">
                    Select a user
                  </p>

                  <h2 className="mt-3 text-3xl font-black">
                    User details will appear here
                  </h2>

                  <p className="mt-3 max-w-xl text-white/55">
                    Choose a user from the list to view
                    linked church or seeker data.
                  </p>
                </div>
              </div>
            ) : loadingDetails ? (
              <div className="flex min-h-[420px] items-center justify-center text-white/60">
                Loading user details...
              </div>
            ) : (
              <div>
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                      Selected user
                    </p>

                    <h2 className="mt-3 break-words text-3xl font-black">
                      {display(selectedUser.email)}
                    </h2>

                    <p className="mt-2 break-all text-sm text-white/40">
                      {selectedUser.id}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      sendPasswordReset(selectedUser.email)
                    }
                    disabled={saving}
                    className="rounded-2xl bg-cyan-400 px-5 py-3 font-black text-black transition hover:bg-cyan-300 disabled:opacity-60"
                  >
                    Send Reset Link
                  </button>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <InfoBlock
                    label="Role"
                    value={selectedUser.role}
                  />

                  <InfoBlock
                    label="Church Profile"
                    value={churchProfile ? 'Yes' : 'No'}
                  />

                  <InfoBlock
                    label="Seeker Profile"
                    value={seekerProfile ? 'Yes' : 'No'}
                  />
                </div>

                <div className="mt-8 rounded-3xl border border-white/10 bg-black/25 p-5">
                  <h3 className="text-xl font-black">
                    Account role
                  </h3>

                  <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
                    <select
                      value={newRole}
                      onChange={(event) =>
                        setNewRole(event.target.value)
                      }
                      className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-teal-300"
                    >
                      <option value="">No role</option>
                      <option value="seeker">seeker</option>
                      <option value="church">church</option>
                      <option value="admin">admin</option>
                    </select>

                    <button
                      type="button"
                      onClick={updateRole}
                      disabled={saving}
                      className="rounded-2xl bg-teal-400 px-5 py-3 font-black text-black transition hover:bg-teal-300 disabled:opacity-60"
                    >
                      Save Role
                    </button>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5">
                  <h3 className="text-xl font-black">
                    Church profile
                  </h3>

                  {!churchProfile ? (
                    <p className="mt-4 text-white/55">
                      No linked church profile found for
                      this user.
                    </p>
                  ) : (
                    <>
                      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <InfoBlock
                          label="Church Name"
                          value={churchProfile.church_name}
                        />

                        <InfoBlock
                          label="Church Email"
                          value={churchProfile.email}
                        />

                        <InfoBlock
                          label="Role Title"
                          value={churchProfile.role_title}
                        />

                        <InfoBlock
                          label="City"
                          value={churchProfile.city}
                        />

                        <InfoBlock
                          label="State"
                          value={churchProfile.state}
                        />

                        <InfoBlock
                          label="ZIP"
                          value={churchProfile.zip_code}
                        />
                      </div>

                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <label>
                          <span className="text-sm font-black uppercase tracking-[0.16em] text-white/35">
                            Subscription Tier
                          </span>

                          <select
                            value={newTier}
                            onChange={(event) =>
                              setNewTier(event.target.value)
                            }
                            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-teal-300"
                          >
                            <option value="">No tier</option>
                            <option value="tier1">tier1</option>
                            <option value="tier2">tier2</option>
                            <option value="tier3">tier3</option>
                          </select>
                        </label>

                        <label>
                          <span className="text-sm font-black uppercase tracking-[0.16em] text-white/35">
                            Verification Status
                          </span>

                          <select
                            value={newVerificationStatus}
                            onChange={(event) =>
                              setNewVerificationStatus(
                                event.target.value
                              )
                            }
                            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-teal-300"
                          >
                            <option value="">
                              No status
                            </option>
                            <option value="pending">
                              pending
                            </option>
                            <option value="approved">
                              approved
                            </option>
                            <option value="rejected">
                              rejected
                            </option>
                            <option value="needs_more_info">
                              needs_more_info
                            </option>
                          </select>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={updateChurchProfile}
                        disabled={saving}
                        className="mt-5 rounded-2xl bg-teal-400 px-5 py-3 font-black text-black transition hover:bg-teal-300 disabled:opacity-60"
                      >
                        Save Church Updates
                      </button>
                    </>
                  )}
                </div>

                <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5">
                  <h3 className="text-xl font-black">
                    Seeker profile
                  </h3>

                  {!seekerProfile ? (
                    <p className="mt-4 text-white/55">
                      No linked seeker profile found for
                      this user.
                    </p>
                  ) : (
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <InfoBlock
                        label="ZIP Code"
                        value={seekerProfile.zip_code}
                      />

                      <InfoBlock
                        label="Onboarding Complete"
                        value={
                          seekerProfile.onboarding_complete
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function InfoBlock({
  label,
  value,
}: {
  label: string
  value?: string | number | boolean | null
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