'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { getUserCredits } from '@/lib/quota'
import { Coins, Loader2 } from 'lucide-react'

export function CreditBalance() {
  const { user } = useAuth()
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    async function fetchCredits() {
      if (!user) {
        setCredits(null)
        return
      }
      const supabase = createClient()
      const balance = await getUserCredits(supabase, user.id)
      setCredits(balance)
    }
    fetchCredits()
  }, [user])

  if (credits === null) return null

  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-600">
      {credits === undefined ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Coins className="h-4 w-4" />
          <span>💎 {credits} 积分</span>
        </>
      )}
    </div>
  )
}
