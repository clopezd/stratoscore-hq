'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  format,
} from 'date-fns'
import { useTasksStore } from '@/shared/stores/tasks-store'
import { PRIORITY_CONFIG } from '@/features/tasks/utils/priority'
import type { CalendarEvent, CalendarView, AccountFilter } from '../types'

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('month')
  const [accountFilter, setAccountFilter] = useState<AccountFilter>('all')

  const tasks = useTasksStore((s) => s.tasks)

  // Convert tasks with due_at into CalendarEvent format
  const taskEvents: CalendarEvent[] = useMemo(() => {
    return tasks
      .filter((t) => t.due_at && t.status !== 'archived')
      .map((t) => {
        const pConfig = PRIORITY_CONFIG[t.priority ?? 0]
        return {
          id: `task-${t.id}`,
          title: `${pConfig.icon} ${t.title}`,
          start: t.due_at!,
          end: t.due_at!,
          allDay: true,
          account: 'tasks' as const,
          taskId: t.id,
          color: t.status === 'done' ? '#10b981' : undefined,
        }
      })
  }, [tasks])

  const fetchEvents = useCallback(async () => {
    setLoading(true)

    let start: Date
    let end: Date

    if (view === 'month') {
      start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 })
      end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
    } else if (view === 'week') {
      start = startOfWeek(currentDate, { weekStartsOn: 1 })
      end = endOfWeek(currentDate, { weekStartsOn: 1 })
    } else {
      start = startOfDay(currentDate)
      end = endOfDay(currentDate)
    }

    const from = format(start, 'yyyy-MM-dd')
    const to = format(end, 'yyyy-MM-dd')

    try {
      const res = await fetch(`/api/calendar?from=${from}&to=${to}`)
      const data: { events: CalendarEvent[] } = await res.json()
      setEvents(data.events || [])
    } catch (err) {
      console.error('Failed to fetch calendar events:', err)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [currentDate, view])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const createEvent = useCallback(
    async (event: Omit<CalendarEvent, 'id'>) => {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      })
      const data = await res.json()
      if (data.event) {
        setEvents((prev) => [...prev, data.event])
      }
      return data.event
    },
    []
  )

  const updateEvent = useCallback(
    async (id: string, updates: Partial<CalendarEvent>) => {
      const res = await fetch('/api/calendar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      const data = await res.json()
      if (data.event) {
        setEvents((prev) => prev.map((e) => (e.id === id ? data.event : e)))
      }
      return data.event
    },
    []
  )

  const deleteEvent = useCallback(
    async (id: string) => {
      await fetch('/api/calendar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setEvents((prev) => prev.filter((e) => e.id !== id))
    },
    []
  )

  const goNext = useCallback(() => {
    setCurrentDate((prev) => {
      if (view === 'month') return addMonths(prev, 1)
      if (view === 'week') return addWeeks(prev, 1)
      return addDays(prev, 1)
    })
  }, [view])

  const goPrev = useCallback(() => {
    setCurrentDate((prev) => {
      if (view === 'month') return subMonths(prev, 1)
      if (view === 'week') return subWeeks(prev, 1)
      return subDays(prev, 1)
    })
  }, [view])

  const goToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  // Merge Supabase events + task events
  const allEvents = [...events, ...taskEvents]

  const filteredEvents =
    accountFilter === 'all'
      ? allEvents
      : allEvents.filter((e) => e.account === accountFilter)

  return {
    events: filteredEvents,
    allEvents,
    loading,
    currentDate,
    view,
    setView,
    accountFilter,
    setAccountFilter,
    goNext,
    goPrev,
    goToday,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents,
  }
}
