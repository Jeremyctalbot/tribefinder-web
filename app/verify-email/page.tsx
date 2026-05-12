// app/verify-email/page.tsx

'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const email = searchParams.get('email') || ''
  const next = searchParams.get('next') || '/claim'

  const [checking, setChecking] = useState(false)
  const [statusMessage, setStatusMessage] = useState(
    'Confirm your email, then return here. This page will send you forward once your account is active.'
  )
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const timer = window.setInterval(() => {
      checkVerification(false)
    }, 3000)

    checkVerification(false)

    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function ensureProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) return false

    const firstName =
      typeof user.user_metadata?.first_name === 'string'
        ? user.user_metadata.first_name
        : ''

    const lastName =
      typeof user.user_metadata?.last_name === 'string'
        ? user.user_metadata.last_name
        : ''

    const role = user.user_metadata?.role === 'seeker' ? 'seeker' : 'church'

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email ?? email,
      role,
      first_name: firstName,
      last_name: lastName,
      created_at: new Date().toISOString(),
    })

    if (error) {
      setErrorMessage(error.message)
      return false
    }

    return true
  }

  async function checkVerification(showCheckingState = true) {
    if (showCheckingState) setChecking(true)

    setErrorMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      setStatusMessage(
        'Still waiting on email confirmation. Open the confirmation link from your inbox, then this page will continue.'
      )
      if (showCheckingState) setChecking(false)
      return
    }

    const profileReady = await ensureProfile()

    if (!profileReady) {
      if (showCheckingState) setChecking(false)
      return
    }

    setStatusMessage('Email confirmed. Redirecting...')
    router.replace(next)
  }

  async function resendConfirmation() {
    setChecking(true)
    setErrorMessage('')

    if (!email) {
      setErrorMessage('Email address is missing. Go back and create your account again.')
      setChecking(false)
      return
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email?next=${encodeURIComponent(next)}`,
      },
    })

    if (error) {
      setErrorMessage(error.message)
      setChecking(false)
      return
    }

    setStatusMessage(`Confirmation email resent to ${email}.`)
    setChecking(false)
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
          Log in
        </Link>
      </nav>

      <section className="relative z-10 flex min-h-[calc(100vh-96px)] items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-teal-300/30 bg-teal-300/10 text-4xl shadow-lg shadow-teal-300/10">
            ✉️
          </div>

          <p className="mt-6 text-sm font-black uppercase tracking-[0.2em] text-teal-300">
            Verify your email
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
            Check your inbox
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70">
            {email ? (
              <>
                We sent a confirmation link to{' '}
                <span className="font-black text-white">{email}</span>.
              </>
            ) : (
              'We sent a confirmation link to your email address.'
            )}
          </p>

          <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-6 text-white/65">
            {statusMessage}
          </div>

          {errorMessage && (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-200">
              {errorMessage}
            </div>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => checkVerification(true)}
              disabled={checking}
              className="rounded-2xl bg-teal-400 px-6 py-4 font-black text-black transition hover:bg-teal-300 disabled:opacity-60"
            >
              {checking ? 'Checking...' : 'I verified my email'}
            </button>

            <button
              type="button"
              onClick={resendConfirmation}
              disabled={checking}
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-white/80 transition hover:bg-white/10 disabled:opacity-60"
            >
              Resend email
            </button>
          </div>

          <p className="mt-6 text-sm text-white/40">
            After verification, church accounts continue to the claim form.
          </p>
        </div>
      </section>
    </main>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#070B14] text-white">
          Loading verification...
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}