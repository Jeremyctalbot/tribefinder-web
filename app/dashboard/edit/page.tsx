'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type ChurchProfile = {
  church_name: string
  denomination: string
  worship_style: string
  church_size: string
}

export default function EditProfile() {
  const router = useRouter()

  const [profile, setProfile] = useState<ChurchProfile>({
    church_name: '',
    denomination: '',
    worship_style: '',
    church_size: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData?.user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('church_profiles')
        .select('church_name, denomination, worship_style, church_size')
        .eq('id', userData.user.id)
        .maybeSingle()

      if (error) {
        setErrorMessage(error.message)
        setLoading(false)
        return
      }

      if (data) {
        setProfile({
          church_name: data.church_name ?? '',
          denomination: data.denomination ?? '',
          worship_style: data.worship_style ?? '',
          church_size: data.church_size ?? '',
        })
      }

      setLoading(false)
    }

    loadProfile()
  }, [router])

  async function handleSave() {
    setSaving(true)
    setErrorMessage('')

    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) {
      setSaving(false)
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('church_profiles')
      .update({
        church_name: profile.church_name,
        denomination: profile.denomination,
        worship_style: profile.worship_style,
        church_size: profile.church_size,
      })
      .eq('id', userData.user.id)

    setSaving(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    router.push('/dashboard')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        Loading...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="mx-auto max-w-xl">
        <h1 className="text-4xl font-black mb-8">Edit Church Profile</h1>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-red-200">
            {errorMessage}
          </div>
        )}

        <div className="space-y-5">
          <Field
            label="Church Name"
            value={profile.church_name}
            onChange={(value) =>
              setProfile({ ...profile, church_name: value })
            }
          />

          <Field
            label="Denomination"
            value={profile.denomination}
            onChange={(value) =>
              setProfile({ ...profile, denomination: value })
            }
          />

          <Field
            label="Worship Style"
            value={profile.worship_style}
            onChange={(value) =>
              setProfile({ ...profile, worship_style: value })
            }
          />

          <Field
            label="Church Size"
            value={profile.church_size}
            onChange={(value) =>
              setProfile({ ...profile, church_size: value })
            }
          />

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-teal-400 px-6 py-3 font-bold text-black disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </main>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-white/60">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none"
      />
    </label>
  )
}