'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { useTodos } from '@/hooks/useTodos'
import { useGoals } from '@/hooks/useGoals'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TodoCreatePage() {
  const { createTodo } = useTodos()
  const { goals } = useGoals()
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    priority: 'important_not_urgent' as const,
    goalId: '',
    tags: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = '标题不能为空'
    } else if (formData.title.length > 100) {
      newErrors.title = '标题长度不能超过100个字符'
    }

    if (!formData.startTime) {
      newErrors.startTime = '开始时间不能为空'
    }

    if (!formData.endTime) {
      newErrors.endTime = '结束时间不能为空'
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = '结束时间必须晚于开始时间'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      await createTodo({
        title: formData.title,
        description: formData.description || null,
        start_time: new Date(formData.startTime).toISOString(),
        end_time: new Date(formData.endTime).toISOString(),
        priority: formData.priority,
        goal_id: formData.goalId || null,
        tags: tagsArray,
      })

      router.push('/todos')
    } catch (error) {
      console.error('Failed to create todo:', error)
      setErrors({ submit: '创建失败，请重试' })
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'important_urgent':
        return '重要紧急'
      case 'important_not_urgent':
        return '重要不紧急'
      case 'not_important_urgent':
        return '紧急不重要'
      case 'not_important_not_urgent':
        return '普通'
      default:
        return priority
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen">
      <Header currentPage="/todos" />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>
          <h1 className="text-2xl font-bold">创建待办</h1>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>待办信息</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">标题 *</Label>
                <Input
                  id="title"
                  placeholder="输入待办标题"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={errors.title ? 'border-danger' : ''}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-danger">{errors.title}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  placeholder="输入待办描述（可选）"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">开始时间 *</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    min={today}
                    className={errors.startTime ? 'border-danger' : ''}
                  />
                  {errors.startTime && (
                    <p className="mt-1 text-sm text-danger">{errors.startTime}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="endTime">结束时间 *</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    min={formData.startTime || today}
                    className={errors.endTime ? 'border-danger' : ''}
                  />
                  {errors.endTime && (
                    <p className="mt-1 text-sm text-danger">{errors.endTime}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="priority">优先级 *</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as any })}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="选择优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="important_urgent">重要紧急</SelectItem>
                    <SelectItem value="important_not_urgent">重要不紧急</SelectItem>
                    <SelectItem value="not_important_urgent">紧急不重要</SelectItem>
                    <SelectItem value="not_important_not_urgent">普通</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="goalId">关联目标</Label>
                <Select value={formData.goalId} onValueChange={(value) => setFormData({ ...formData, goalId: value })}>
                  <SelectTrigger id="goalId">
                    <SelectValue placeholder="选择目标（可选）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">无</SelectItem>
                    {goals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tags">标签</Label>
                <Input
                  id="tags"
                  placeholder="输入标签，用逗号分隔"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
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
                  创建待办
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}