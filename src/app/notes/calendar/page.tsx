'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { useNotes } from '@/hooks/useNotes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Calendar, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { format, startOfMonth, endOfMonth, addMonths, isSameMonth, isSameDay, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'

export default function CalendarPage() {
  const { notes, loading, createNote, editNote, removeNote, getNotesByDate, searchNotes } = useNotes()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingNote, setEditingNote] = useState<{ id: string; title: string; content: string } | null>(null)
  const [noteForm, setNoteForm] = useState({ title: '', content: '' })

  const router = useRouter()

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)

  const daysInMonth = []
  let day = new Date(monthStart)

  while (day <= monthEnd) {
    daysInMonth.push(new Date(day))
    day.setDate(day.getDate() + 1)
  }

  const firstDayOfWeek = monthStart.getDay()

  const handlePrevMonth = () => {
    setCurrentDate(addMonths(currentDate, -1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    setSelectedDate(dateStr)
    const dateNotes = getNotesByDate(dateStr)
    if (dateNotes.length > 0) {
      const firstNote = dateNotes[0]
      setEditingNote({
        id: firstNote.id,
        title: firstNote.title || '',
        content: firstNote.content || '',
      })
    } else {
      setNoteForm({ title: '', content: '' })
      setShowCreateDialog(true)
    }
  }

  const handleCreateNote = async () => {
    if (!selectedDate) return

    try {
      await createNote({
        note_date: selectedDate,
        title: noteForm.title || null,
        content: noteForm.content || null,
      })
      setShowCreateDialog(false)
      setNoteForm({ title: '', content: '' })
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }

  const handleEditNote = async () => {
    if (!editingNote) return

    try {
      await editNote(editingNote.id, {
        title: editingNote.title || null,
        content: editingNote.content || null,
      })
      setEditingNote(null)
    } catch (error) {
      console.error('Failed to edit note:', error)
    }
  }

  const handleDeleteNote = async () => {
    if (!editingNote) return

    try {
      await removeNote(editingNote.id)
      setEditingNote(null)
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const filteredNotes = searchNotes(searchQuery)

  const getNotesCountForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return getNotesByDate(dateStr).length
  }

  const today = new Date()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header currentPage="/notes/calendar" />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold">日历笔记</h1>
            <p className="text-muted-foreground">记录每天的想法和收获</p>
          </div>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索笔记..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {format(currentDate, 'yyyy年MM月', { locale: zhCN })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="py-3" />
                  ))}
                  {daysInMonth.map((date) => {
                    const isToday = isSameDay(date, today)
                    const isSelected = selectedDate === format(date, 'yyyy-MM-dd')
                    const notesCount = getNotesCountForDate(date)
                    
                    return (
                      <button
                        key={format(date, 'yyyy-MM-dd')}
                        onClick={() => handleDayClick(date)}
                        className={`relative flex flex-col items-center justify-center h-14 rounded-lg transition-colors ${
                          isToday
                            ? 'bg-primary text-white'
                            : isSelected
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <span className={`text-sm font-medium ${isToday ? 'text-white' : ''}`}>
                          {date.getDate()}
                        </span>
                        {notesCount > 0 && (
                          <span className={`absolute bottom-1 flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                            isToday ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                          }`}>
                            {notesCount}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-warning" />
                  最近笔记
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredNotes.length > 0 ? (
                  filteredNotes.slice(0, 5).map((note) => (
                    <div
                      key={note.id}
                      onClick={() => {
                        setEditingNote({
                          id: note.id,
                          title: note.title || '',
                          content: note.content || '',
                        })
                      }}
                      className="cursor-pointer rounded-lg border border-border p-3 hover:bg-accent/50"
                    >
                      <p className="font-medium text-sm">{note.title || '无标题'}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {note.content || '无内容'}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {format(parseISO(note.note_date), 'yyyy-MM-dd', { locale: zhCN })}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">暂无笔记</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>创建笔记</DialogTitle>
            <DialogDescription>
              在 {selectedDate} 创建一条新笔记
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                placeholder="输入标题"
                value={noteForm.title}
                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="content">内容</Label>
              <Textarea
                id="content"
                placeholder="输入内容"
                value={noteForm.content}
                onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                取消
              </Button>
              <Button onClick={handleCreateNote}>
                <Plus className="h-4 w-4 mr-2" />
                创建笔记
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑笔记</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">标题</Label>
              <Input
                id="edit-title"
                placeholder="输入标题"
                value={editingNote?.title || ''}
                onChange={(e) => editingNote && setEditingNote({ ...editingNote, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-content">内容</Label>
              <Textarea
                id="edit-content"
                placeholder="输入内容"
                value={editingNote?.content || ''}
                onChange={(e) => editingNote && setEditingNote({ ...editingNote, content: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEditingNote(null)}>
                取消
              </Button>
              <Button variant="destructive" onClick={handleDeleteNote}>
                删除
              </Button>
              <Button onClick={handleEditNote}>保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}