'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { useGoals } from '@/hooks/useGoals'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Plus, Target } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function GoalCreatePage() {
  const { createGoal } = useGoals()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetMinutes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '目标名称不能为空'
    }

    const targetMinutes = parseInt(formData.targetMinutes)
    if (!formData.targetMinutes) {
      newErrors.targetMinutes = '目标时长不能为空'
    } else if (isNaN(targetMinutes) || targetMinutes <= 0) {
      newErrors.targetMinutes = '目标时长必须大于0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      await createGoal({
        name: formData.name,
        description: formData.description || null,
        target_minutes: parseInt(formData.targetMinutes),
      })

      router.push('/goals')
    } catch (error) {
      console.error('Failed to create goal:', error)
      setErrors({ submit: '创建失败，请重试' })
    }
  }

  return (
    <div className="min-h-screen">
      <Header currentPage="/goals" />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>
          <h1 className="text-2xl font-bold">创建目标</h1>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-secondary" />
              目标信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">目标名称 *</Label>
                <Input
                  id="name"
                  placeholder="输入目标名称"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? 'border-danger' : ''}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-danger">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  placeholder="输入目标描述（可选）"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="targetMinutes">目标时长（分钟）*</Label>
                <Input
                  id="targetMinutes"
                  type="number"
                  placeholder="输入目标学习时长"
                  value={formData.targetMinutes}
                  onChange={(e) => setFormData({ ...formData, targetMinutes: e.target.value })}
                  min="1"
                  className={errors.targetMinutes ? 'border-danger' : ''}
                />
                {errors.targetMinutes && (
                  <p className="mt-1 text-sm text-danger">{errors.targetMinutes}</p>
                )}
              </div>

              {errors.submit && (
                <p className="text-sm text-danger">{errors.submit}</p>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => router.back()}>
                  取消
                </Button>
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  创建目标
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}