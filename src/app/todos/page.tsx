'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { useTodos } from '@/hooks/useTodos'
import { useGoals } from '@/hooks/useGoals'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  CheckCircle2,
  Circle,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Tag,
  Clock,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Todo } from '@/types'
import Link from 'next/link'

export default function TodoListPage() {
  const { todos, pendingTodos, loading, completeTodo, softDeleteTodo, editTodo } = useTodos()
  const { goals } = useGoals()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', tags: '' })

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch =
      todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority
    const matchesStatus = filterStatus === 'all' || todo.status === filterStatus

    return matchesSearch && matchesPriority && matchesStatus
  })

  const handleComplete = async (id: string) => {
    try {
      await completeTodo(id)
    } catch (error) {
      console.error('Failed to complete todo:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await softDeleteTodo(id)
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  const openEditDialog = (todo: Todo) => {
    setEditingTodo(todo)
    setEditForm({
      title: todo.title,
      description: todo.description || '',
      tags: todo.tags.join(','),
    })
  }

  const handleEdit = async () => {
    if (!editingTodo) return

    try {
      await editTodo(editingTodo.id, {
        title: editForm.title,
        description: editForm.description || null,
        tags: editForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      })
      setEditingTodo(null)
    } catch (error) {
      console.error('Failed to edit todo:', error)
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

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'important_urgent':
        return 'danger'
      case 'important_not_urgent':
        return 'warning'
      case 'not_important_urgent':
        return 'default'
      default:
        return 'outline'
    }
  }

  const getGoalName = (goalId: string | null) => {
    if (!goalId) return null
    return goals.find((g) => g.id === goalId)?.name
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
      <Header currentPage="/todos" />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold">待办事项</h1>
            <p className="text-muted-foreground">
              共 {todos.length} 项，待完成 {pendingTodos.length} 项
            </p>
          </div>
          <Link href="/todos/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              创建待办
            </Button>
          </Link>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索待办..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="优先级" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="important_urgent">重要紧急</SelectItem>
              <SelectItem value="important_not_urgent">重要不紧急</SelectItem>
              <SelectItem value="not_important_urgent">紧急不重要</SelectItem>
              <SelectItem value="not_important_not_urgent">普通</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="pending">待完成</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredTodos.length > 0 ? (
          <div className="space-y-4">
            {filteredTodos.map((todo) => (
              <Card key={todo.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleComplete(todo.id)}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                        todo.status === 'completed'
                          ? 'bg-success text-white'
                          : 'border-2 border-muted-foreground/30 hover:border-primary hover:bg-primary/10'
                      }`}
                    >
                      {todo.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4 opacity-0" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`font-medium ${
                            todo.status === 'completed' ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {todo.title}
                        </h3>
                        {todo.status === 'completed' && (
                          <Badge variant="success" className="text-xs">
                            已完成
                          </Badge>
                        )}
                      </div>
                      {todo.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{todo.description}</p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {todo.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            {todo.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(parseISO(todo.start_time), 'yyyy-MM-dd HH:mm', {
                            locale: zhCN,
                          })}{' '}
                          -{' '}
                          {format(parseISO(todo.end_time), 'HH:mm', {
                            locale: zhCN,
                          })}
                        </div>
                        {getGoalName(todo.goal_id) && (
                          <Badge variant="secondary" className="text-xs">
                            {getGoalName(todo.goal_id)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditDialog(todo)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="p-2 text-muted-foreground hover:text-danger hover:bg-accent rounded-md">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>确认删除</AlertDialogTitle>
                            <AlertDialogDescription>
                              确定要删除这个待办事项吗？此操作无法撤销。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex gap-3">
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(todo.id)} className="bg-danger">
                              删除
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <Badge variant={getPriorityVariant(todo.priority)}>
                      {getPriorityLabel(todo.priority)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Circle className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
              <h3 className="text-lg font-medium mb-2">暂无待办事项</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterPriority !== 'all' || filterStatus !== 'all'
                  ? '没有找到匹配的待办事项'
                  : '点击右下角按钮创建第一个待办'}
              </p>
              <Link href="/todos/new">
                <Button>创建待办</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={!!editingTodo} onOpenChange={() => setEditingTodo(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑待办</DialogTitle>
            <DialogDescription>修改待办事项的详细信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="tags">标签（用逗号分隔）</Label>
              <Input
                id="tags"
                value={editForm.tags}
                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEditingTodo(null)}>
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