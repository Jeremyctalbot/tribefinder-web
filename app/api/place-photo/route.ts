import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get('reference')

  if (!reference) {
    return NextResponse.json(
      { error: 'Photo reference is required.' },
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

  const googleUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${encodeURIComponent(
    reference
  )}&key=${apiKey}`

  try {
    const response = await fetch(googleUrl, {
      redirect: 'manual',
    })

    // If Google gives us a redirect → good image
    const location = response.headers.get('location')

    if (location) {
      return NextResponse.redirect(location)
    }

    // If no image → return fallback
    return NextResponse.redirect(
      'https://via.placeholder.com/800x600/0f172a/ffffff?text=Tribe+Finder'
    )
  } catch {
    return NextResponse.redirect(
      'https://via.placeholder.com/800x600/0f172a/ffffff?text=Tribe+Finder'
    )
  }
}