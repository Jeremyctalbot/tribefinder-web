'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type ProfileRole = 'admin' | 'church' | 'seeker'

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  function getErrorMessage(error: unknown) {
    if (!error) return 'Something went wrong.'
    if (typeof error === 'string') return error

    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      return (error as { message: string }).message
    }

    return 'Unexpected error occurred.'
  }

  async function handleLogin() {
    setIsLoading(true)
    setErrorMessage('')

    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail) {
      setErrorMessage('Email is required.')
      setIsLoading(false)
      return
    }

    if (!password) {
      setErrorMessage('Password is required.')
      setIsLoading(false)
      return
    }

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

    if (signInError) {
      setErrorMessage(getErrorMessage(signInError))
      setIsLoading(false)
      return
    }

    const user = signInData.user

    if (!user?.id) {
      setErrorMessage('Login succeeded, but no user session was returned.')
      setIsLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      setErrorMessage(getErrorMessage(profileError))
      setIsLoading(false)
      return
    }

    if (!profile?.role) {
      setErrorMessage('No profile role found for this account.')
      setIsLoading(false)
      return
    }

    const role = profile.role as ProfileRole

    if (role === 'admin') {
      router.replace('/admin')
      return
    }

    if (role === 'church') {
      router.replace('/dashboard')
      return
    }

    if (role === 'seeker') {
      router.replace('/')
      return
    }

    setErrorMessage(`Unsupported account role: ${profile.role}`)
    setIsLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.20),_transparent_35%)]" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur shadow-[0_0_60px_rgba(20,184,166,0.14)]">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black mb-3">Church login</h1>
          <p className="text-gray-400">
            Manage your Tribe Finder profile, messages, visits, photos, and plan.
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            handleLogin()
          }}
        >
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input
              type="email"
              placeholder="you@church.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-teal-300"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-teal-300"
            />
          </div>

          {errorMessage && (
            <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-teal-400 py-3 font-bold text-black hover:bg-teal-300 transition disabled:opacity-60"
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </main>
  )
}