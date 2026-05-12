'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminCreatePage() {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleCreateAdmin() {
    setIsSubmitting(true)
    setErrorMessage('')

    const cleanFullName = fullName.trim()
    const cleanEmail = email.trim().toLowerCase()

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
          role: 'admin',
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
      setErrorMessage('Failed to create admin account.')
      setIsSubmitting(false)
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: cleanEmail,
        full_name: cleanFullName,
        role: 'admin',
        created_at: new Date().toISOString(),
      })

    if (profileError) {
      setErrorMessage(profileError.message)
      setIsSubmitting(false)
      return
    }

    router.push('/admin')
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#05070F] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.20),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_34%)]" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-6">
        <Link href="/" className="text-xl font-black">
          Tribe Finder
        </Link>
      </nav>

      <section className="relative z-10 flex min-h-[calc(100vh-96px)] items-center justify-center px-6 py-10">
        <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl md:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-300">
            Internal Access
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
            create admin account
          </h1>

          <p className="mt-4 text-white/60">
            This creates an admin-only account without creating a church profile.
          </p>

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-200">
              {errorMessage}
            </div>
          )}

          <div className="mt-8 space-y-5">
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
              onClick={handleCreateAdmin}
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-teal-400 py-4 font-black text-black transition hover:bg-teal-300 disabled:opacity-60"
            >
              {isSubmitting ? 'Creating Admin...' : 'Create Admin Account'}
            </button>
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