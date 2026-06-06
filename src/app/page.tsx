'use client'

import { useAuth } from '@/hooks/useAuth'
import { useTodos } from '@/hooks/useTodos'
import { useGoals } from '@/hooks/useGoals'
import { useNotes } from '@/hooks/useNotes'
import { useMemorialEvents } from '@/hooks/useMemorialEvents'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, Target, Calendar, Heart, FileText, ArrowRight } from 'lucide-react'
import { format, isToday, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import Link from 'next/link'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const { pendingTodos, loading: todosLoading } = useTodos()
  const { goals, getProgress, loading: goalsLoading } = useGoals()
  const { notes, loading: notesLoading } = useNotes()
  const { upcomingEvents, getDaysUntil, loading: eventsLoading } = useMemorialEvents()

  if (authLoading || todosLoading || goalsLoading || notesLoading || eventsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const today = new Date()
  const todayTodos = pendingTodos.filter((todo) => {
    return isToday(parseISO(todo.start_time))
  })

  const recentNotes = notes.slice(0, 3)

  const todayGoalMinutes = goals.reduce((acc, goal) => {
    if (goal.status === 'active') {
      return acc + goal.current_minutes
    }
    return acc
  }, 0)

  return (
    <div className="min-h-screen">
      <Header currentPage="/" />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            今天是 {format(today, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
          </h1>
          <p className="text-muted-foreground">
            {user.name || '用户'}，开始高效的一天吧！
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-sm font-medium">今日待办</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{todayTodos.length}</p>
              <p className="text-sm text-muted-foreground">
                {todayTodos.length > 0 ? `${todayTodos.length} 项待完成` : '今日无待办'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10">
                  <Target className="h-4 w-4 text-secondary" />
                </div>
                <CardTitle className="text-sm font-medium">今日学习</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{todayGoalMinutes}</p>
              <p className="text-sm text-muted-foreground">分钟</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10">
                  <Calendar className="h-4 w-4 text-success" />
                </div>
                <CardTitle className="text-sm font-medium">即将到来</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{upcomingEvents.length}</p>
              <p className="text-sm text-muted-foreground">纪念日</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/10">
                  <FileText className="h-4 w-4 text-warning" />
                </div>
                <CardTitle className="text-sm font-medium">最近笔记</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{notes.length}</p>
              <p className="text-sm text-muted-foreground">篇笔记</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Circle className="h-5 w-5 text-primary" />
                  今日待办
                </CardTitle>
                <Link href="/todos">
                  <Button variant="ghost" size="sm" className="gap-1">
                    查看全部 <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {todayTodos.length > 0 ? (
                  <div className="space-y-3">
                    {todayTodos.slice(0, 5).map((todo) => (
                      <div
                        key={todo.id}
                        className="group flex items-center gap-4 rounded-lg border border-border p-3 hover:bg-accent/50"
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/30" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{todo.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(todo.start_time), 'HH:mm', { locale: zhCN })} -{' '}
                            {format(parseISO(todo.end_time), 'HH:mm', { locale: zhCN })}
                          </p>
                        </div>
                        <Badge
                          variant={
                            todo.priority === 'important_urgent'
                              ? 'danger'
                              : todo.priority === 'important_not_urgent'
                              ? 'warning'
                              : 'default'
                          }
                          className="shrink-0"
                        >
                          {todo.priority === 'important_urgent' && '重要紧急'}
                          {todo.priority === 'important_not_urgent' && '重要不紧急'}
                          {todo.priority === 'not_important_urgent' && '紧急不重要'}
                          {todo.priority === 'not_important_not_urgent' && '普通'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Circle className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
                    <p className="text-muted-foreground">今日暂无待办事项</p>
                    <Link href="/todos/new">
                      <Button variant="ghost" size="sm" className="mt-2">
                        创建待办
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-secondary" />
                  目标进度
                </CardTitle>
                <Link href="/goals">
                  <Button variant="ghost" size="sm" className="gap-1">
                    管理 <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {goals.length > 0 ? (
                  goals.slice(0, 3).map((goal) => {
                    const progress = getProgress(goal)
                    return (
                      <div key={goal.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{goal.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="mt-1 text-xs text-muted-foreground">
                          {goal.current_minutes} / {goal.target_minutes} 分钟
                        </p>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-6">
                    <Target className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">暂无目标</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-danger" />
                  即将到来的纪念日
                </CardTitle>
                <Link href="/memorials">
                  <Button variant="ghost" size="sm" className="gap-1">
                    查看 <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.slice(0, 3).map((event) => {
                    const daysUntil = getDaysUntil(event.event_date)
                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-3 rounded-lg border border-border p-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-danger/10">
                          <Heart className="h-4 w-4 text-danger" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{event.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {daysUntil === 0
                              ? '今天'
                              : daysUntil === 1
                              ? '明天'
                              : `${daysUntil} 天后`}
                          </p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-6">
                    <Heart className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">暂无纪念日</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-warning" />
                最近笔记
              </CardTitle>
              <Link href="/notes/calendar">
                <Button variant="ghost" size="sm" className="gap-1">
                  日历视图 <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentNotes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recentNotes.map((note) => (
                    <div
                      key={note.id}
                      className="group cursor-pointer rounded-lg border border-border p-4 hover:bg-accent/50"
                    >
                      <p className="font-medium">{note.title || '无标题'}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {note.content || '无内容'}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {format(parseISO(note.note_date), 'yyyy-MM-dd', { locale: zhCN })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
                  <p className="text-muted-foreground">暂无笔记</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}