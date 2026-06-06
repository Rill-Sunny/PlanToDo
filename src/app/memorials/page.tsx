'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { useMemorialEvents } from '@/hooks/useMemorialEvents'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, Plus, Trash2, Calendar, Birthday, Plane, GraduationCap, Gift } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MemorialEvent } from '@/types'
import Link from 'next/link'

export default function MemorialPage() {
  const { upcomingEvents, passedEvents, loading, createEvent, editEvent, removeEvent, getDaysUntil, getDaysPassed } = useMemorialEvents()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingEvent, setEditingEvent] = useState<MemorialEvent | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    eventDate: '',
    eventType: 'Custom' as const,
  })

  const handleCreate = async () => {
    try {
      await createEvent({
        name: formData.name,
        event_date: formData.eventDate,
        event_type: formData.eventType,
      })
      setShowCreateDialog(false)
      setFormData({ name: '', eventDate: '', eventType: 'Custom' })
    } catch (error) {
      console.error('Failed to create event:', error)
    }
  }

  const handleEdit = async () => {
    if (!editingEvent) return

    try {
      await editEvent(editingEvent.id, {
        name: editingEvent.name,
        event_date: editingEvent.event_date,
        event_type: editingEvent.event_type,
      })
      setEditingEvent(null)
    } catch (error) {
      console.error('Failed to edit event:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await removeEvent(id)
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'Birthday':
        return Birthday
      case 'Anniversary':
        return Heart
      case 'Exam':
        return GraduationCap
      case 'Travel':
        return Plane
      default:
        return Gift
    }
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'Birthday':
        return '生日'
      case 'Anniversary':
        return '纪念日'
      case 'Exam':
        return '考试'
      case 'Travel':
        return '旅行'
      case 'Custom':
        return '自定义'
      default:
        return type
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Birthday':
        return 'bg-pink-500'
      case 'Anniversary':
        return 'bg-red-500'
      case 'Exam':
        return 'bg-blue-500'
      case 'Travel':
        return 'bg-green-500'
      default:
        return 'bg-purple-500'
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
    <div className="min-h-screen">
      <Header currentPage="/memorials" />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold">纪念日</h1>
            <p className="text-muted-foreground">记录重要的日子</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            添加纪念日
          </Button>
        </div>

        <div className="space-y-8">
          {upcomingEvents.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5 text-danger" />
                即将到来
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => {
                  const daysUntil = getDaysUntil(event.event_date)
                  const EventIcon = getEventTypeIcon(event.event_type)

                  return (
                    <Card key={event.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${getEventTypeColor(event.event_type)}`}>
                            <EventIcon className="h-6 w-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{event.name}</h3>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setEditingEvent(event)}
                                  className="p-1 text-muted-foreground hover:text-foreground"
                                >
                                  <Heart className="h-4 w-4" />
                                </button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <button className="p-1 text-muted-foreground hover:text-danger">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>确认删除</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        确定要删除这个纪念日吗？
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="flex gap-3">
                                      <AlertDialogCancel>取消</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(event.id)} className="bg-danger">
                                        删除
                                      </AlertDialogAction>
                                    </div>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {format(parseISO(event.event_date), 'yyyy年MM月dd日', { locale: zhCN })}
                              </span>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <Badge variant="secondary">
                                {getEventTypeLabel(event.event_type)}
                              </Badge>
                              <span className="text-lg font-bold">
                                {daysUntil === 0
                                  ? '今天'
                                  : daysUntil === 1
                                  ? '明天'
                                  : `${daysUntil} 天后`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {passedEvents.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">已过去</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {passedEvents.map((event) => {
                  const daysPassed = getDaysPassed(event.event_date)
                  const EventIcon = getEventTypeIcon(event.event_type)

                  return (
                    <Card key={event.id} className="overflow-hidden opacity-75">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${getEventTypeColor(event.event_type)}`}>
                            <EventIcon className="h-6 w-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium">{event.name}</h3>
                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {format(parseISO(event.event_date), 'yyyy年MM月dd日', { locale: zhCN })}
                              </span>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <Badge variant="outline">
                                {getEventTypeLabel(event.event_type)}
                              </Badge>
                              <span className="text-lg font-bold text-muted-foreground">
                                已过去 {daysPassed} 天
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {upcomingEvents.length === 0 && passedEvents.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
              <h3 className="text-lg font-medium mb-2">暂无纪念日</h3>
              <p className="text-muted-foreground mb-4">记录重要的日子，不错过每一个特殊时刻</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                添加纪念日
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>添加纪念日</DialogTitle>
            <DialogDescription>记录一个重要的日子</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">名称 *</Label>
              <Input
                id="name"
                placeholder="输入纪念日名称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="eventDate">日期 *</Label>
              <Input
                id="eventDate"
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="eventType">类型</Label>
              <Select value={formData.eventType} onValueChange={(value) => setFormData({ ...formData, eventType: value as any })}>
                <SelectTrigger id="eventType">
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Birthday">生日</SelectItem>
                  <SelectItem value="Anniversary">纪念日</SelectItem>
                  <SelectItem value="Exam">考试</SelectItem>
                  <SelectItem value="Travel">旅行</SelectItem>
                  <SelectItem value="Custom">自定义</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                取消
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                添加
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑纪念日</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">名称</Label>
              <Input
                id="edit-name"
                value={editingEvent?.name || ''}
                onChange={(e) => editingEvent && setEditingEvent({ ...editingEvent, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-date">日期</Label>
              <Input
                id="edit-date"
                type="date"
                value={editingEvent?.event_date || ''}
                onChange={(e) => editingEvent && setEditingEvent({ ...editingEvent, event_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-type">类型</Label>
              <Select value={editingEvent?.event_type || ''} onValueChange={(value) => editingEvent && setEditingEvent({ ...editingEvent, event_type: value as any })}>
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Birthday">生日</SelectItem>
                  <SelectItem value="Anniversary">纪念日</SelectItem>
                  <SelectItem value="Exam">考试</SelectItem>
                  <SelectItem value="Travel">旅行</SelectItem>
                  <SelectItem value="Custom">自定义</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEditingEvent(null)}>
                取消
              </Button>
              <Button onClick={handleEdit}>保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}