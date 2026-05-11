import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type GooglePlace = {
  place_id: string
  name: string
  vicinity?: string
  photos?: { photo_reference: string }[]
  geometry?: {
    location?: {
      lat: number
      lng: number
    }
  }
  types?: string[]
}

type SupabaseChurch = {
  id: string
  church_name: string
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  verification_status: string | null
}

const TILE_RADIUS_METERS = 4500
const MAX_PAGE_COUNT_PER_TILE = 3
const SEARCH_RADIUS_METERS = 16093

function photoUrl(photoReference?: string) {
  if (!photoReference) return null
  return `/api/place-photo?reference=${encodeURIComponent(photoReference)}`
}

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/\bchurch\b/g, '')
    .replace(/\bthe\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

function normalizedAddress(address?: string | null) {
  if (!address) return ''

  return address
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/,/g, '')
    .replace(/ road/g, ' rd')
    .replace(/ street/g, ' st')
    .replace(/ avenue/g, ' ave')
    .replace(/ drive/g, ' dr')
    .replace(/ lane/g, ' ln')
    .replace(/ boulevard/g, ' blvd')
    .replace(/ highway/g, ' hwy')
    .replace(/ suite /g, ' ste ')
    .replace(/#/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .join(' ')
}

function formatSupabaseAddress(church: SupabaseChurch) {
  return [church.address, church.city, church.state, church.zip_code]
    .filter(Boolean)
    .join(', ')
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function distanceMeters(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
) {
  const earthRadius = 6371000
  const dLat = ((to.lat - from.lat) * Math.PI) / 180
  const dLng = ((to.lng - from.lng) * Math.PI) / 180
  const lat1 = (from.lat * Math.PI) / 180
  const lat2 = (to.lat * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadius * c
}

function tileCenters({
  center,
  radiusMeters,
  tileRadiusMeters,
}: {
  center: { lat: number; lng: number }
  radiusMeters: number
  tileRadiusMeters: number
}) {
  if (radiusMeters <= tileRadiusMeters) return [center]

  const step = tileRadiusMeters * 1.6
  const latMetersPerDegree = 111320
  const lonMetersPerDegree =
    111320 * Math.cos((center.lat * Math.PI) / 180)

  const latStep = step / latMetersPerDegree
  const lonStep = step / Math.max(lonMetersPerDegree, 1)

  const latRadius = radiusMeters / latMetersPerDegree
  const lonRadius = radiusMeters / Math.max(lonMetersPerDegree, 1)

  const centers = [center]

  for (
    let lat = center.lat - latRadius;
    lat <= center.lat + latRadius;
    lat += latStep
  ) {
    for (
      let lng = center.lng - lonRadius;
      lng <= center.lng + lonRadius;
      lng += lonStep
    ) {
      const candidate = { lat, lng }

      const isNearCenter =
        Math.abs(candidate.lat - center.lat) < 0.0001 &&
        Math.abs(candidate.lng - center.lng) < 0.0001

      if (
        !isNearCenter &&
        distanceMeters(center, candidate) <= radiusMeters + tileRadiusMeters
      ) {
        centers.push(candidate)
      }
    }
  }

  return centers
}

function isLikelyActualChurch(place: GooglePlace) {
  const name = place.name.toLowerCase()
  const types = new Set((place.types || []).map((type) => type.toLowerCase()))

  const positiveNameTokens = [
    'church',
    'chapel',
    'baptist',
    'methodist',
    'presbyterian',
    'catholic',
    'lutheran',
    'pentecostal',
    'episcopal',
    'assembly of god',
    'christian church',
    'church of christ',
  ]

  const negativeNameTokens = [
    'ministries',
    'ministry',
    'mission',
    'missions',
    'outreach',
    'network',
    'association',
    'district',
    'office',
    'campus ministry',
    'food pantry',
    'counseling',
    'daycare',
    'school',
  ]

  const softNegativeTokens = ['center', 'resource center', 'family center']

  const hasPositiveName = positiveNameTokens.some((token) =>
    name.includes(token)
  )
  const hasNegativeName = negativeNameTokens.some((token) =>
    name.includes(token)
  )
  const hasSoftNegative = softNegativeTokens.some((token) =>
    name.includes(token)
  )

  const hasChurchType = types.has('church') || types.has('place_of_worship')
  const isSchool = types.has('school')

  if (hasNegativeName) return false
  if (isSchool) return false
  if (hasSoftNegative && !hasPositiveName && !hasChurchType) return false

  return hasChurchType || hasPositiveName
}

function churchQualityScore(place: GooglePlace) {
  const name = place.name.toLowerCase()
  const types = new Set((place.types || []).map((type) => type.toLowerCase()))

  let score = 0

  if (types.has('church')) score += 6
  if (types.has('place_of_worship')) score += 3
  if (name.includes('church')) score += 6
  if (name.includes('chapel')) score += 3

  const denominationWords = [
    'baptist',
    'methodist',
    'presbyterian',
    'catholic',
    'lutheran',
    'pentecostal',
    'episcopal',
    'assembly of god',
    'christian church',
    'church of christ',
  ]

  if (denominationWords.some((word) => name.includes(word))) score += 3

  const negativeWords = [
    'ministries',
    'ministry',
    'mission',
    'missions',
    'outreach',
    'association',
    'district',
    'office',
    'school',
    'daycare',
  ]

  if (negativeWords.some((word) => name.includes(word))) score -= 8

  if (place.photos?.[0]?.photo_reference) score += 2
  if (place.place_id) score += 1
  if (place.vicinity) score += 1

  return score
}

function dedupeByPlaceIDOrFallback(places: GooglePlace[]) {
  const seenPlaceIDs = new Set<string>()
  const seenFallback = new Set<string>()
  const deduped: GooglePlace[] = []

  for (const place of places) {
    if (place.place_id) {
      if (seenPlaceIDs.has(place.place_id)) continue
      seenPlaceIDs.add(place.place_id)
      deduped.push(place)
      continue
    }

    const location = place.geometry?.location
    const roundedLat = location ? Math.round(location.lat * 10000) / 10000 : ''
    const roundedLng = location ? Math.round(location.lng * 10000) / 10000 : ''
    const fallback = `${normalizeName(place.name)}|${roundedLat}|${roundedLng}`

    if (seenFallback.has(fallback)) continue

    seenFallback.add(fallback)
    deduped.push(place)
  }

  return deduped
}

function dedupePlacesByAddress(places: GooglePlace[]) {
  const bestByAddress = new Map<string, GooglePlace>()
  const fallback: GooglePlace[] = []

  for (const place of places) {
    const addressKey = normalizedAddress(place.vicinity)

    if (!addressKey) {
      fallback.push(place)
      continue
    }

    const existing = bestByAddress.get(addressKey)

    if (!existing || churchQualityScore(place) > churchQualityScore(existing)) {
      bestByAddress.set(addressKey, place)
    }
  }

  return [...Array.from(bestByAddress.values()), ...fallback]
}

function filterPlacesWithinRadius(
  places: GooglePlace[],
  center: { lat: number; lng: number },
  radiusMeters: number
) {
  return places.filter((place) => {
    const location = place.geometry?.location
    if (!location) return false

    return (
      distanceMeters(center, {
        lat: location.lat,
        lng: location.lng,
      }) <= radiusMeters
    )
  })
}

function rankedPlaces(
  places: GooglePlace[],
  center: { lat: number; lng: number }
) {
  return [...places].sort((a, b) => {
    const aScore = churchQualityScore(a)
    const bScore = churchQualityScore(b)

    if (aScore !== bScore) return bScore - aScore

    const aLocation = a.geometry?.location
    const bLocation = b.geometry?.location

    const aDistance = aLocation
      ? distanceMeters(center, { lat: aLocation.lat, lng: aLocation.lng })
      : Number.MAX_SAFE_INTEGER

    const bDistance = bLocation
      ? distanceMeters(center, { lat: bLocation.lat, lng: bLocation.lng })
      : Number.MAX_SAFE_INTEGER

    if (aDistance !== bDistance) return aDistance - bDistance

    return a.name.localeCompare(b.name)
  })
}

async function fetchGoogleChurchPage({
  apiKey,
  latitude,
  longitude,
  radiusMeters,
  pageToken,
}: {
  apiKey: string
  latitude: number
  longitude: number
  radiusMeters: number
  pageToken?: string | null
}) {
  const url = pageToken
    ? `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${encodeURIComponent(
        pageToken
      )}&key=${apiKey}`
    : `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radiusMeters}&type=church&key=${apiKey}`

  const response = await fetch(url)
  const data = await response.json()

  if (data.status === 'INVALID_REQUEST' && pageToken) {
    return {
      places: [] as GooglePlace[],
      nextPageToken: pageToken as string,
      retryable: true,
    }
  }

  if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.error('Google Places error:', data.status, data.error_message)

    return {
      places: [] as GooglePlace[],
      nextPageToken: undefined,
      retryable: false,
    }
  }

  return {
    places: (data.results || []) as GooglePlace[],
    nextPageToken: data.next_page_token as string | undefined,
    retryable: false,
  }
}

async function fetchPaginatedChurchesForTile({
  apiKey,
  latitude,
  longitude,
  radiusMeters,
}: {
  apiKey: string
  latitude: number
  longitude: number
  radiusMeters: number
}) {
  let allPlaces: GooglePlace[] = []
  let nextPageToken: string | undefined
  let pageCount = 0

  do {
    if (nextPageToken) {
      await sleep(2200)
    }

    let page = await fetchGoogleChurchPage({
      apiKey,
      latitude,
      longitude,
      radiusMeters,
      pageToken: nextPageToken,
    })

    let retryCount = 0

    while (page.retryable && retryCount < 3) {
      await sleep(1200)

      page = await fetchGoogleChurchPage({
        apiKey,
        latitude,
        longitude,
        radiusMeters,
        pageToken: nextPageToken,
      })

      retryCount += 1
    }

    allPlaces = [...allPlaces, ...page.places]

    if (page.retryable) {
      nextPageToken = undefined
    } else {
      nextPageToken = page.nextPageToken
    }

    pageCount += 1
  } while (nextPageToken && pageCount < MAX_PAGE_COUNT_PER_TILE)

  return allPlaces
}

async function fetchChurchesLikeApp({
  apiKey,
  center,
}: {
  apiKey: string
  center: { lat: number; lng: number }
}) {
  const centers = tileCenters({
    center,
    radiusMeters: SEARCH_RADIUS_METERS,
    tileRadiusMeters: TILE_RADIUS_METERS,
  })

  const tileResults = await Promise.allSettled(
    centers.map((tileCenter) =>
      fetchPaginatedChurchesForTile({
        apiKey,
        latitude: tileCenter.lat,
        longitude: tileCenter.lng,
        radiusMeters: TILE_RADIUS_METERS,
      })
    )
  )

  const allPlaces = tileResults.flatMap((result) => {
    if (result.status === 'fulfilled') return result.value
    return []
  })

  const combined = dedupeByPlaceIDOrFallback(allPlaces)
  const filteredByRadius = filterPlacesWithinRadius(
    combined,
    center,
    SEARCH_RADIUS_METERS
  )
  const strictChurches = filteredByRadius.filter(isLikelyActualChurch)
  const deduped = dedupePlacesByAddress(strictChurches)

  return rankedPlaces(deduped, center)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const zip = searchParams.get('zip')

  if (!zip) {
    return NextResponse.json(
      { error: 'ZIP code is required.' },
      { status: 400 }
    )
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing GOOGLE_PLACES_API_KEY in .env.local.' },
      { status: 500 }
    )
  }

  const geoResponse = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?components=country:US|postal_code:${encodeURIComponent(
      zip
    )}&key=${apiKey}`
  )

  const geoData = await geoResponse.json()
  const location = geoData?.results?.[0]?.geometry?.location

  if (!location) {
    return NextResponse.json(
      { error: 'Could not find that ZIP code.' },
      { status: 404 }
    )
  }

  const googlePlaces = await fetchChurchesLikeApp({
    apiKey,
    center: {
      lat: location.lat,
      lng: location.lng,
    },
  })

  let supabaseChurches: SupabaseChurch[] = []

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      const { data, error } = await supabase
        .from('church_profiles')
        .select(
          'id, church_name, address, city, state, zip_code, verification_status'
        )

      if (!error && data) {
        supabaseChurches = data
      }
    }
  } catch {
    supabaseChurches = []
  }

  const supabaseByName = new Map(
    supabaseChurches.map((church) => [
      normalizeName(church.church_name),
      church,
    ])
  )

  const results = googlePlaces.map((place) => {
    const matchingSupabaseChurch = supabaseByName.get(normalizeName(place.name))

    if (matchingSupabaseChurch) {
      return {
        source: 'supabase',
        id: matchingSupabaseChurch.id,
        placeId: place.place_id,
        churchName: matchingSupabaseChurch.church_name,
        address:
          formatSupabaseAddress(matchingSupabaseChurch) || place.vicinity || '',
        imageUrl: photoUrl(place.photos?.[0]?.photo_reference),
        verificationStatus: matchingSupabaseChurch.verification_status,
      }
    }

    return {
      source: 'google',
      id: place.place_id,
      placeId: place.place_id,
      churchName: place.name,
      address: place.vicinity || '',
      imageUrl: photoUrl(place.photos?.[0]?.photo_reference),
      verificationStatus: null,
    }
  })

  return NextResponse.json({ results })
}