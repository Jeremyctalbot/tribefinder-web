'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type ChurchResult = {
  id: string
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

  async function searchChurches() {
    setError('')
    setResults([])

    const cleanZip = zip.trim()
    const cleanName = name.trim()

    if (!cleanZip && !cleanName) {
      setError('Enter a ZIP code or church name.')
      return
    }

    setLoading(true)

    let query = supabase
      .from('church_profiles')
      .select(
        'id, church_name, address, city, state, zip_code, verification_status, google_place_id'
      )
      .or('verification_status.is.null,verification_status.neq.approved')
      .order('church_name', { ascending: true })
      .limit(50)

    if (cleanZip) {
      query = query.eq('zip_code', cleanZip)
    }

    if (cleanName) {
      query = query.ilike('church_name', `%${cleanName}%`)
    }

    const { data, error } = await query

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setResults(data || [])
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
              Church UUID Lookup
            </h1>
            <p className="mt-2 text-white/60">
              Search unclaimed or pending churches by ZIP code or name.
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
              placeholder="Church name"
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
                      {church.church_name || 'Unnamed Church'}
                    </h2>

                    <p className="mt-1 text-sm text-white/55">
                      {[church.address, church.city, church.state, church.zip_code]
                        .filter(Boolean)
                        .join(', ') || 'No address listed'}
                    </p>

                    <p className="mt-2 text-sm text-teal-200">
                      Status: {church.verification_status || 'unclaimed'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => copy(church.id)}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-black text-black hover:bg-teal-200"
                  >
                    Copy UUID
                  </button>
                </div>

                <div className="mt-4 rounded-2xl bg-zinc-950 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                    Church UUID
                  </p>
                  <code className="mt-2 block break-all text-sm text-teal-300">
                    {church.id}
                  </code>
                </div>

                {church.google_place_id && (
                  <div className="mt-3 rounded-2xl bg-zinc-950 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                      Google Place ID
                    </p>
                    <code className="mt-2 block break-all text-sm text-blue-300">
                      {church.google_place_id}
                    </code>
                  </div>
                )}
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