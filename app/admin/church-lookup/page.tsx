'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type ChurchResult = {
  id: string
  church_name: string
  address: string
  city: string | null
  state: string | null
  zip_code: string | null
  verification_status: string
  google_place_id: string | null
  church_profile_id: string | null
  generated_church_uuid: string | null
  source: 'supabase' | 'google'
}

type ChurchProfileLookup = {
  id: string
  church_id: string | null
  church_name: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  verification_status: string | null
  google_place_id: string | null
}

function AdminChurchLookupPage() {
  const [authChecking, setAuthChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const [zip, setZip] = useState('')
  const [name, setName] = useState('')
  const [results, setResults] = useState<ChurchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.id) {
        window.location.href = '/login'
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error || data?.role !== 'admin') {
        window.location.href = '/dashboard'
        return
      }

      setIsAdmin(true)
      setAuthChecking(false)
    }

    checkAdmin()
  }, [])

  function normalizeText(value: string | null | undefined) {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
  }

  function buildAddressKey(
    address: string | null | undefined,
    zipCode: string | null | undefined
  ) {
    return `${normalizeText(address)}|${normalizeText(zipCode)}`
  }

  async function loadExistingProfiles(cleanZip: string, cleanName: string) {
    let query = supabase
      .from('church_profiles')
      .select(
        `
        id,
        church_id,
        church_name,
        address,
        city,
        state,
        zip_code,
        verification_status,
        google_place_id
      `
      )
      .eq('zip_code', cleanZip)
      .order('church_name', { ascending: true })

    if (cleanName) {
      query = query.ilike('church_name', `%${cleanName}%`)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return (data ?? []) as ChurchProfileLookup[]
  }

  async function searchChurches() {
    setError('')
    setResults([])

    const cleanZip = zip.trim()
    const cleanName = name.trim().toLowerCase()

    if (!cleanZip) {
      setError('Enter a ZIP code.')
      return
    }

    if (cleanZip.length !== 5 || !/^\d+$/.test(cleanZip)) {
      setError('Enter a valid 5-digit ZIP code.')
      return
    }

    setLoading(true)

    try {
      const existingProfiles = await loadExistingProfiles(cleanZip, cleanName)

      const profilesByGoogleId = new Map<string, ChurchProfileLookup>()
      const profilesByAddress = new Map<string, ChurchProfileLookup>()
      const profilesByName = new Map<string, ChurchProfileLookup>()

      existingProfiles.forEach((profile) => {
        if (profile.google_place_id) {
          profilesByGoogleId.set(profile.google_place_id, profile)
        }

        profilesByAddress.set(
          buildAddressKey(profile.address, profile.zip_code),
          profile
        )

        if (profile.church_name) {
          profilesByName.set(normalizeText(profile.church_name), profile)
        }
      })

      const response = await fetch(
        `/api/church-search?zip=${encodeURIComponent(cleanZip)}&radius=10`
      )

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json?.error || 'Church search failed.')
      }

      const rawResults = json?.churches || json?.results || json?.data || []

      const googleResults: ChurchResult[] = rawResults
        .map((item: any) => {
          const googleId =
            item.place_id ||
            item.placeId ||
            item.google_place_id ||
            ''

          const churchName =
            item.name ||
            item.church_name ||
            item.churchName ||
            'Unknown Church'

          const address =
            item.address ||
            item.formatted_address ||
            item.location ||
            ''

          const zipCode =
            item.zip_code ||
            item.zipCode ||
            item.postal_code ||
            cleanZip

          const matchedProfile =
            (googleId ? profilesByGoogleId.get(googleId) : null) ||
            profilesByAddress.get(buildAddressKey(address, zipCode)) ||
            profilesByName.get(normalizeText(churchName)) ||
            null

          return {
            id: googleId || `${churchName}-${address}`,
            church_name: matchedProfile?.church_name || churchName,
            address: matchedProfile?.address || address,
            city: matchedProfile?.city || item.city || null,
            state: matchedProfile?.state || item.state || null,
            zip_code: matchedProfile?.zip_code || zipCode,
            verification_status:
              matchedProfile?.verification_status || 'google_unclaimed',
            google_place_id: matchedProfile?.google_place_id || googleId || null,
            church_profile_id: matchedProfile?.id || null,
            generated_church_uuid: matchedProfile?.church_id || null,
            source: matchedProfile ? 'supabase' : 'google',
          } satisfies ChurchResult
        })
        .filter((church: ChurchResult) => {
          const hasRequiredData = church.id && church.church_name

          if (!cleanName) return hasRequiredData

          return (
            hasRequiredData &&
            church.church_name.toLowerCase().includes(cleanName)
          )
        })

      const googleIds = new Set(
        googleResults
          .map((church) => church.google_place_id)
          .filter(Boolean)
      )

      const profileOnlyResults: ChurchResult[] = existingProfiles
        .filter((profile) => {
          if (profile.google_place_id && googleIds.has(profile.google_place_id)) {
            return false
          }

          return true
        })
        .map((profile) => ({
          id: profile.google_place_id || profile.id,
          church_name: profile.church_name || 'Unknown Church',
          address: profile.address || '',
          city: profile.city,
          state: profile.state,
          zip_code: profile.zip_code,
          verification_status: profile.verification_status || 'unknown',
          google_place_id: profile.google_place_id,
          church_profile_id: profile.id,
          generated_church_uuid: profile.church_id,
          source: 'supabase',
        }))

      setResults([...profileOnlyResults, ...googleResults])
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Church search failed.'
      )
    }

    setLoading(false)
  }

  async function copy(value: string | null) {
    if (!value) return
    await navigator.clipboard.writeText(value)
  }

  if (authChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070B14] text-white">
        Checking admin access...
      </main>
    )
  }

  if (!isAdmin) return null

  return (
    <main className="min-h-screen bg-[#070B14] px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-300">
              Admin Tool
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Church UUID Lookup
            </h1>

            <p className="mt-2 text-white/60">
              Search by ZIP and view both the generated Tribe Finder church UUID and the Google Place UUID.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/80 hover:bg-white/10"
          >
            Back to Admin
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <input
              value={zip}
              onChange={(event) => setZip(event.target.value)}
              placeholder="ZIP code"
              inputMode="numeric"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-teal-300"
            />

            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Optional church name filter"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-teal-300"
            />

            <button
              type="button"
              onClick={searchChurches}
              disabled={loading}
              className="rounded-2xl bg-teal-400 px-6 py-3 font-black text-black hover:bg-teal-300 disabled:opacity-60"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-bold text-red-200">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            {results.map((church) => (
              <div
                key={`${church.source}-${church.id}-${church.church_profile_id || 'google'}`}
                className="rounded-3xl border border-white/10 bg-black/30 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-teal-100">
                        {church.source === 'supabase' ? 'Supabase' : 'Google'}
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-white/60">
                        {church.verification_status}
                      </span>
                    </div>

                    <h2 className="mt-3 text-xl font-black">
                      {church.church_name}
                    </h2>

                    <p className="mt-1 text-sm text-white/55">
                      {[church.address, church.city, church.state, church.zip_code]
                        .filter(Boolean)
                        .join(', ') || 'No address listed'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <IdBlock
                    label="Generated Church UUID"
                    value={church.generated_church_uuid}
                    onCopy={() => copy(church.generated_church_uuid)}
                  />

                  <IdBlock
                    label="Church Profile ID"
                    value={church.church_profile_id}
                    onCopy={() => copy(church.church_profile_id)}
                  />

                  <IdBlock
                    label="Google Place UUID"
                    value={church.google_place_id}
                    onCopy={() => copy(church.google_place_id)}
                  />
                </div>
              </div>
            ))}

            {!loading && results.length === 0 && (
              <p className="text-center text-white/45">
                No churches found yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function IdBlock({
  label,
  value,
  onCopy,
}: {
  label: string
  value: string | null
  onCopy: () => void
}) {
  return (
    <div className="rounded-2xl bg-zinc-950 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
        {label}
      </p>

      <code className="mt-2 block min-h-10 break-all text-sm text-teal-300">
        {value || '—'}
      </code>

      <button
        type="button"
        onClick={onCopy}
        disabled={!value}
        className="mt-3 rounded-xl bg-white px-4 py-2 text-sm font-black text-black hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Copy
      </button>
    </div>
  )
}

export default AdminChurchLookupPage