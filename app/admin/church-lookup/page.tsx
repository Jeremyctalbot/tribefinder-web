// app/admin/church-lookup/page.tsx

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
      const response = await fetch(
        `/api/church-search?zip=${encodeURIComponent(cleanZip)}&radius=10`
      )

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json?.error || 'Church search failed.')
      }

      const rawResults = json?.churches || json?.results || json?.data || []

      const normalized: ChurchResult[] = rawResults
        .map((item: any) => {
          const googleId =
            item.place_id ||
            item.placeId ||
            item.google_place_id ||
            item.id ||
            ''

          return {
            id: googleId,
            church_name:
              item.name ||
              item.church_name ||
              'Unknown Church',
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
              cleanZip,
            verification_status: 'google_unclaimed',
            google_place_id: googleId || null,
          }
        })
        .filter((church: ChurchResult) => {
          const hasRequiredData = church.id && church.church_name

          if (!cleanName) return hasRequiredData

          return (
            hasRequiredData &&
            church.church_name.toLowerCase().includes(cleanName)
          )
        })

      setResults(normalized)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Church search failed.'
      )
    }

    setLoading(false)
  }

  async function copy(value: string) {
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
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-300">
              Admin Tool
            </p>
            <h1 className="mt-2 text-4xl font-black">
              Google Church ID Lookup
            </h1>
            <p className="mt-2 text-white/60">
              Search Google churches by ZIP code and copy the Google Place ID.
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
                key={church.id}
                className="rounded-3xl border border-white/10 bg-black/30 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-black">
                      {church.church_name}
                    </h2>

                    <p className="mt-1 text-sm text-white/55">
                      {[church.address, church.city, church.state, church.zip_code]
                        .filter(Boolean)
                        .join(', ') || 'No address listed'}
                    </p>

                    <p className="mt-2 text-sm text-teal-200">
                      Source: Google / Unclaimed
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => copy(church.id)}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-black text-black hover:bg-teal-200"
                  >
                    Copy Google ID
                  </button>
                </div>

                <div className="mt-4 rounded-2xl bg-zinc-950 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                    Google Place ID
                  </p>
                  <code className="mt-2 block break-all text-sm text-teal-300">
                    {church.id}
                  </code>
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

export default AdminChurchLookupPage