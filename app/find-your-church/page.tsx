'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

type ChurchSearchResult = {
  source: 'google' | 'supabase'
  id: string
  placeId: string
  churchName: string
  address: string
  imageUrl: string | null
  verificationStatus: string | null
}

function isClaimed(church: ChurchSearchResult) {
  return church.verificationStatus?.trim().toLowerCase() === 'approved'
}

function claimUrl(church: ChurchSearchResult) {
  if (church.source === 'supabase') {
    return `/church/${church.id}`
  }

  return `/claim?churchName=${encodeURIComponent(church.churchName)}`
}

export default function FindYourChurchPage() {
  const [zipCode, setZipCode] = useState('')
  const [searchText, setSearchText] = useState('')
  const [churches, setChurches] = useState<ChurchSearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const filteredChurches = useMemo(() => {
    const cleanSearch = searchText.trim().toLowerCase()

    if (!cleanSearch) return churches

    return churches.filter((church) => {
      return (
        church.churchName.toLowerCase().includes(cleanSearch) ||
        church.address.toLowerCase().includes(cleanSearch)
      )
    })
  }, [churches, searchText])

  async function handleSearch() {
    const cleanZip = zipCode.trim()

    setHasSearched(true)
    setChurches([])
    setErrorMessage('')

    if (!cleanZip) {
      setErrorMessage('Enter a ZIP code to find churches near you.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `/api/church-search?zip=${encodeURIComponent(cleanZip)}`
      )

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || 'Search failed.')
      }

      setChurches(payload.results || [])
      setErrorMessage('')
    } catch (error: any) {
      setErrorMessage(error.message || 'Something went wrong while searching.')
    } finally {
      setIsLoading(false)
    }
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

      <section className="relative z-10 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur md:p-8">
            <p className="mb-4 inline-flex rounded-full border border-teal-300/20 bg-teal-300/10 px-4 py-2 text-sm font-bold text-teal-200">
              For churches
            </p>

            <h1 className="text-4xl font-black tracking-tight md:text-6xl">
              find your church
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/70">
              Search by ZIP code, choose your church, then claim the profile.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-[220px_1fr_auto]">
              <div>
                <label className="text-sm font-semibold text-white/70">
                  ZIP code
                </label>
                <input
                  value={zipCode}
                  onChange={(event) => setZipCode(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSearch()
                  }}
                  inputMode="numeric"
                  className="mt-2 w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-teal-300/60"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-white/70">
                  Search church name
                </label>
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-teal-300/60"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-teal-400 px-6 py-3 font-black text-black transition hover:bg-teal-300 disabled:opacity-60 md:w-auto"
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {errorMessage && (
              <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-200">
                {errorMessage}
              </p>
            )}
          </div>

          <div className="mt-8">
            {hasSearched &&
              !isLoading &&
              filteredChurches.length === 0 &&
              !errorMessage && (
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 text-white/70">
                  No churches found for that ZIP code yet.
                </div>
              )}

            {filteredChurches.length > 0 && (
              <div className="grid gap-4">
                {filteredChurches.map((church) => (
                  <Link
                    key={`${church.source}-${church.id}`}
                    href={claimUrl(church)}
                    className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.06] transition hover:border-teal-300/40 hover:bg-white/[0.09]"
                  >
                    <div className="grid gap-0 md:grid-cols-[180px_1fr]">
                      <div className="relative h-44 bg-black/40 md:h-full">
                        {church.imageUrl ? (
                          <img
                            src={church.imageUrl}
                            alt={church.churchName}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-black text-sm text-white/40">
                            Tribe Finder
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>

                      <div className="p-5 md:p-6">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h2 className="text-2xl font-black">
                              {church.churchName}
                            </h2>

                            {church.address && (
                              <p className="mt-2 text-white/60">
                                {church.address}
                              </p>
                            )}
                          </div>

                          {isClaimed(church) ? (
                            <span className="w-fit rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-bold text-white/60">
                              Claimed
                            </span>
                          ) : (
                            <span className="w-fit rounded-full bg-teal-300 px-3 py-1 text-sm font-black text-black">
                              Claim available
                            </span>
                          )}
                        </div>

                        <p className="mt-5 text-sm font-bold text-teal-200">
                          {church.source === 'supabase'
                            ? 'View profile →'
                            : 'Start claim →'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}