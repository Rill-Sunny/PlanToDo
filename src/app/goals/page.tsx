'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { useGoals } from '@/hooks/useGoals'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Plus, Play, Pause, Trash2, Clock, Target } from 'lucide-react'
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
import { Goal } from '@/types'
import Link from 'next/link'

export default function GoalPage() {
  const { goals, activeGoals, completedGoals, getProgress, loading, addGoalTime, updateGoalStatus, removeGoal } = useGoals()
  const [addingMinutes, setAddingMinutes] = useState<string>('')
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const handleAddTime = async () => {
    if (!selectedGoal || !addingMinutes) return

    try {
      await addGoalTime(selectedGoal.id, parseInt(addingMinutes))
      setAddingMinutes('')
      setSelectedGoal(null)
    } catch (error) {
      console.error('Failed to add time:', error)
    }
  }

  const handleStatusChange = async (goalId: string, status: Goal['status']) => {
    try {
      await updateGoalStatus(goalId, status)
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await removeGoal(id)
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete goal:', error)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '进行中'
      case 'paused':
        return '已暂停'
      case 'completed':
        return '已完成'
      default:
        return status
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'paused':
        return 'warning'
      case 'completed':
        return 'default'
      default:
        return 'outline'
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
      <Header currentPage="/goals" />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold">学习目标</h1>
            <p className="text-muted-foreground">
              共 {goals.length} 个目标，进行中 {activeGoals.length} 个
            </p>
          </div>
          <Link href="/goals/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              创建目标
            </Button>
          </Link>
        </div>

        {goals.length > 0 ? (
          <div className="space-y-8">
            {activeGoals.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
                  <Play className="h-5 w-5 text-success" />
                  进行中
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeGoals.map((goal) => {
                    const progress = getProgress(goal)
                    return (
                      <Card key={goal.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-secondary" />
                                {goal.name}
                              </CardTitle>
                              {goal.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {goal.description}
                                </p>
                              )}
                            </div>
                            <Badge variant={getStatusVariant(goal.status)}>
                              {getStatusLabel(goal.status)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">进度</span>
                                <span className="text-sm text-muted-foreground">
                                  {Math.round(progress)}%
                                </span>
                              </div>
                              <Progress value={progress} className="h-3" />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {goal.current_minutes} / {goal.target_minutes} 分钟
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStatusChange(goal.id, 'paused')}
                                >
                                  <Pause className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-danger">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>确认删除</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        确定要删除这个目标吗？此操作无法撤销。
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="flex gap-3">
                                      <AlertDialogCancel>取消</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(goal.id)} className="bg-danger">
                                        删除
                                      </AlertDialogAction>
                                    </div>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-4"
                            onClick={() => {
                              setSelectedGoal(goal)
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            添加学习时长
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {completedGoals.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold">已完成</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedGoals.map((goal) => {
                    const progress = getProgress(goal)
                    return (
                      <Card key={goal.id} className="overflow-hidden opacity-75">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2 line-through">
                                <Target className="h-4 w-4 text-secondary" />
                                {goal.name}
                              </CardTitle>
                              {goal.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {goal.description}
                                </p>
                              )}
                            </div>
                            <Badge variant={getStatusVariant(goal.status)}>
                              {getStatusLabel(goal.status)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">进度</span>
                                <span className="text-sm text-muted-foreground">
                                  {Math.round(progress)}%
                                </span>
                              </div>
                              <Progress value={progress} className="h-3" />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                {goal.current_minutes} / {goal.target_minutes} 分钟
                              </span>
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
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
              <h3 className="text-lg font-medium mb-2">暂无目标</h3>
              <p className="text-muted-foreground mb-4">设定一个学习目标，开始你的成长之旅</p>
              <Link href="/goals/new">
                <Button>创建目标</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={!!selectedGoal} onOpenChange={() => setSelectedGoal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>添加学习时长</DialogTitle>
            <DialogDescription>
              为 "{selectedGoal?.name}" 添加学习时长
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="minutes">分钟数</Label>
              <Input
                id="minutes"
                type="number"
                placeholder="输入学习分钟数"
                value={addingMinutes}
                onChange={(e) => setAddingMinutes(e.target.value)}
                min="1"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSelectedGoal(null)}>
                取消
              </Button>
              <Button onClick={handleAddTime}>添加</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}