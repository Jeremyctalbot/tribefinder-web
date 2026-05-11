'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function EditProfile() {
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData?.user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('church_profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }

    loadProfile()
  }, [])

  async function handleSave() {
    setSaving(true)

    const { data: userData } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('church_profiles')
      .update({
        church_name: profile.church_name,
        bio: profile.bio,
        phone: profile.phone,
        website: profile.website,
        worship_style: profile.worship_style,
        church_size: profile.church_size
      })
      .eq('id', userData.user.id)

    setSaving(false)

    if (!error) {
      router.push('/dashboard')
    } else {
      alert(error.message)
    }
  }

  if (loading || !profile) {
    return <div className="bg-black text-white p-10">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-black text-white p-8 max-w-2xl mx-auto space-y-6">

      <h1 className="text-3xl font-bold">Edit Profile</h1>

      <Input label="Church Name" value={profile.church_name} onChange={(v) => setProfile({ ...profile, church_name: v })} />
      <Input label="Phone" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
      <Input label="Website" value={profile.website} onChange={(v) => setProfile({ ...profile, website: v })} />
      <Input label="Worship Style" value={profile.worship_style} onChange={(v) => setProfile({ ...profile, worship_style: v })} />
      <Input label="Church Size" value={profile.church_size} onChange={(v) => setProfile({ ...profile, church_size: v })} />

      <div>
        <label className="block mb-1 text-sm text-gray-400">Bio</label>
        <textarea
          value={profile.bio || ''}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          className="w-full bg-white/10 border border-white/20 rounded-lg p-3"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-white text-black px-6 py-3 rounded-lg font-semibold"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

    </main>
  )
}

/* ---------- Input Component ---------- */

function Input({ label, value, onChange }: any) {
  return (
    <div>
      <label className="block mb-1 text-sm text-gray-400">{label}</label>
      <input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/10 border border-white/20 rounded-lg p-3"
      />
    </div>
  )
}