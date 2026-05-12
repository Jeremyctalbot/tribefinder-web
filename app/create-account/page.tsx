'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type AccountRole = 'church' | 'seeker'

export default function CreateAccountPage() {
  const router = useRouter()

  const [role, setRole] = useState<AccountRole>('church')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleCreateAccount() {
    setIsSubmitting(true)
    setErrorMessage('')

    const cleanEmail = email.trim().toLowerCase()
    const cleanFullName = fullName.trim()

    if (!cleanFullName) {
      setErrorMessage('Full name is required.')
      setIsSubmitting(false)
      return
    }

    if (!cleanEmail) {
      setErrorMessage('Email is required.')
      setIsSubmitting(false)
      return
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.')
      setIsSubmitting(false)
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      setIsSubmitting(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanFullName,
          role,
        },
      },
    })

    if (error) {
      setErrorMessage(error.message)
      setIsSubmitting(false)
      return
    }

    const user = data.user

    if (!user?.id) {
      router.push('/login')
      return
    }

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      email: cleanEmail,
      role,
      full_name: cleanFullName,
      created_at: new Date().toISOString(),
    })

    if (profileError) {
      setErrorMessage(profileError.message)
      setIsSubmitting(false)
      return
    }

    if (role === 'church') {
      router.push('/claim')
      return
    }

    router.push('/')
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
        <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur md:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-300">
            Create account
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
            join Tribe Finder
          </h1>

          <p className="mt-4 text-white/65">
            Create your account first, then continue into the church claim and verification flow.
          </p>

          {errorMessage && (
            <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-200">
              {errorMessage}
            </p>
          )}

          <div className="mt-8 space-y-5">
            <div>
              <label className="text-sm text-gray-300">Account Type</label>

              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('church')}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    role === 'church'
                      ? 'border-teal-300/40 bg-teal-300/15 text-teal-100'
                      : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="block font-black">Church</span>
                  <span className="mt-1 block text-xs text-white/50">
                    Claim or manage a church
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('seeker')}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    role === 'seeker'
                      ? 'border-teal-300/40 bg-teal-300/15 text-teal-100'
                      : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="block font-black">Seeker</span>
                  <span className="mt-1 block text-xs text-white/50">
                    Find a church home
                  </span>
                </button>
              </div>
            </div>

            <Input
              label="Full Name"
              value={fullName}
              onChange={setFullName}
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
            />

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />

            <button
              type="button"
              onClick={handleCreateAccount}
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-teal-400 py-4 font-black text-black transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-white/50">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-teal-300 hover:text-teal-200">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="text-sm text-gray-300">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-2xl border border-white/20 bg-black/40 p-3 text-white outline-none transition focus:border-teal-300/60"
      />
    </div>
  )
}