'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const establishRecoverySession = async () => {
      try {
        const hash = window.location.hash

        if (!hash) {
          setErrorMessage('Invalid or expired password reset link.')
          setCheckingSession(false)
          return
        }

        const params = new URLSearchParams(hash.replace('#', ''))

        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        if (!accessToken || !refreshToken) {
          setErrorMessage('Invalid or expired password reset link.')
          setCheckingSession(false)
          return
        }

        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          console.error(error)
          setErrorMessage('Failed to verify reset session.')
          setCheckingSession(false)
          return
        }

        setCheckingSession(false)
      } catch (error) {
        console.error(error)
        setErrorMessage('Something went wrong.')
        setCheckingSession(false)
      }
    }

    establishRecoverySession()
  }, [])

  const handleResetPassword = async () => {
    setErrorMessage('')
    setSuccessMessage('')

    if (!password || !confirmPassword) {
      setErrorMessage('Please complete all fields.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        console.error(error)
        setErrorMessage(error.message)
        setLoading(false)
        return
      }

      setSuccessMessage('Password updated successfully.')

      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error) {
      console.error(error)
      setErrorMessage('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070B14] px-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.20),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_32%)]" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight">
            Reset password
          </h1>

          <p className="mt-3 text-sm text-white/70">
            Enter your new password below.
          </p>
        </div>

        {checkingSession ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            Verifying reset session...
          </div>
        ) : (
          <>
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  New password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter new password"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-teal-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Confirm password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-teal-400"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                {successMessage}
              </div>
            )}

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-teal-400 to-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Updating password...' : 'Update password'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}