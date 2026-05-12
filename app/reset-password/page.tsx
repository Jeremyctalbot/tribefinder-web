'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const PASSWORD_RESET_REDIRECT_URL = 'https://tribefinderapp.co/reset-password'

export default function ResetPasswordPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const establishRecoverySession = async () => {
      const hash = window.location.hash

      if (!hash) {
        setCheckingSession(false)
        setHasValidSession(false)
        return
      }

      const params = new URLSearchParams(hash.replace('#', ''))
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (!accessToken || !refreshToken) {
        setCheckingSession(false)
        setHasValidSession(false)
        return
      }

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (error) {
        setErrorMessage('Invalid or expired password reset link.')
        setCheckingSession(false)
        setHasValidSession(false)
        return
      }

      setCheckingSession(false)
      setHasValidSession(true)
    }

    establishRecoverySession()
  }, [])

  const handleSendResetEmail = async () => {
    setErrorMessage('')
    setSuccessMessage('')

    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.')
      return
    }

    setSendingEmail(true)

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: PASSWORD_RESET_REDIRECT_URL,
    })

    if (error) {
      setErrorMessage(error.message)
      setSendingEmail(false)
      return
    }

    setSuccessMessage('Password reset email sent. Check your inbox.')
    setSendingEmail(false)
  }

  const handleResetPassword = async () => {
    setErrorMessage('')
    setSuccessMessage('')

    if (!hasValidSession) {
      setErrorMessage('Please request a new reset email first.')
      return
    }

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

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setErrorMessage(error.message)
      setLoading(false)
      return
    }

    setSuccessMessage('Password updated successfully.')

    setTimeout(() => {
      router.push('/login')
    }, 1800)

    setLoading(false)
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070B14] px-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.20),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_32%)]" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight">Reset password</h1>

          <p className="mt-3 text-sm text-white/70">
            {hasValidSession
              ? 'Enter your new password below.'
              : 'Enter your email to receive a password reset link.'}
          </p>
        </div>

        {checkingSession ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            Verifying reset session...
          </div>
        ) : (
          <>
            {!hasValidSession && (
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Email address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-teal-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendResetEmail}
                  disabled={sendingEmail}
                  className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-teal-400 to-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sendingEmail ? 'Sending reset email...' : 'Send reset email'}
                </button>
              </div>
            )}

            {hasValidSession && (
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

                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-teal-400 to-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Updating password...' : 'Update password'}
                </button>
              </div>
            )}

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
          </>
        )}
      </div>
    </main>
  )
}