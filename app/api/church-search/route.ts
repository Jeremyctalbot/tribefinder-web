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

type ChurchRow = {
  id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  google_place_id: string | null
}

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

function formatAddress(church: ChurchRow) {
  return [church.address, church.city, church.state, church.zip_code]
    .filter(Boolean)
    .join(', ')
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

async function fetchGoogleChurches({
  apiKey,
  lat,
  lng,
}: {
  apiKey: string
  lat: number
  lng: number
}) {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${SEARCH_RADIUS_METERS}&type=church&key=${apiKey}`

  const response = await fetch(url)
  const data = await response.json()

  if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.error('Google Places error:', data.status, data.error_message)
    return []
  }

  return (data.results || []) as GooglePlace[]
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
      { error: 'Missing GOOGLE_PLACES_API_KEY.' },
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

  const googlePlaces = await fetchGoogleChurches({
    apiKey,
    lat: location.lat,
    lng: location.lng,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let churches: ChurchRow[] = []

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data, error } = await supabase
      .from('churches')
      .select('id, name, address, city, state, zip_code, google_place_id')

    if (!error && data) {
      churches = data
    }
  }

  const churchesByGoogleId = new Map(
    churches
      .filter((church) => church.google_place_id)
      .map((church) => [church.google_place_id, church])
  )

  const churchesByName = new Map(
    churches.map((church) => [normalizeName(church.name), church])
  )

  const results = googlePlaces.map((place) => {
    const matchedChurch =
      churchesByGoogleId.get(place.place_id) ||
      churchesByName.get(normalizeName(place.name)) ||
      null

    if (matchedChurch) {
      return {
        source: 'churches',
        id: matchedChurch.id,
        claimed_church_id: matchedChurch.id,
        church_id: null,
        google_place_id: place.place_id,
        place_id: place.place_id,
        placeId: place.place_id,
        name: matchedChurch.name,
        church_name: matchedChurch.name,
        churchName: matchedChurch.name,
        address: formatAddress(matchedChurch) || place.vicinity || '',
        city: matchedChurch.city,
        state: matchedChurch.state,
        zip_code: matchedChurch.zip_code,
        imageUrl: photoUrl(place.photos?.[0]?.photo_reference),
        verificationStatus: null,
        latitude: place.geometry?.location?.lat ?? null,
        longitude: place.geometry?.location?.lng ?? null,
        distance_miles: place.geometry?.location
          ? distanceMeters(
              { lat: location.lat, lng: location.lng },
              {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
              }
            ) / 1609.344
          : null,
      }
    }

    return {
      source: 'google',
      id: place.place_id,
      claimed_church_id: null,
      church_id: null,
      google_place_id: place.place_id,
      place_id: place.place_id,
      placeId: place.place_id,
      name: place.name,
      church_name: place.name,
      churchName: place.name,
      address: place.vicinity || '',
      city: null,
      state: null,
      zip_code: zip,
      imageUrl: photoUrl(place.photos?.[0]?.photo_reference),
      verificationStatus: null,
      latitude: place.geometry?.location?.lat ?? null,
      longitude: place.geometry?.location?.lng ?? null,
      distance_miles: place.geometry?.location
        ? distanceMeters(
            { lat: location.lat, lng: location.lng },
            {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
            }
          ) / 1609.344
        : null,
    }
  })

  return NextResponse.json({ results })
}