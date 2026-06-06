'use client'

import { useState } from 'react'
import { Google, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth()
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      redirect('/')
    }
  }, [user])

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (err) {
      setError('登录失败，请重试')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary">
            <svg
              className="h-10 w-10 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h1 className="mb-2 text-3xl font-bold">PlanToDo</h1>
          <p className="text-muted-foreground">管理时间，追踪成长，记录生活</p>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-3"
            onClick={handleSignIn}
          >
            <Google className="h-5 w-5" />
            继续使用 Google 账号登录
            <ArrowRight className="ml-auto h-4 w-4" />
          </Button>
        </div>

        {error && (
          <p className="text-center text-sm text-danger">{error}</p>
        )}

        <p className="text-center text-sm text-muted-foreground">
          登录即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  )
}