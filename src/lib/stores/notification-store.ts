'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Notification {
  id: string
  message: {
    id: string
    name: string
    email: string
    subject: string
    content: string
    type: 'CONTACT' | 'REQUEST' | 'COMPLAINT' | 'INFO'
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
    createdAt: string
  }
  read: boolean
  createdAt: string
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  addNotification: (message: any) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (message) => {
        const notification: Notification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          message,
          read: false,
          createdAt: new Date().toISOString()
        }

        set((state) => {
          const existingNotification = state.notifications.find(
            (n) => n.message.id === message.id
          )

          if (existingNotification) {
            return state
          }

          const newNotifications = [notification, ...state.notifications]
          const unreadCount = newNotifications.filter((n) => !n.read).length

          return {
            notifications: newNotifications,
            unreadCount
          }
        })
      },

      markAsRead: (id) => {
        set((state) => {
          const newNotifications = state.notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification
          )
          const unreadCount = newNotifications.filter((n) => !n.read).length

          return {
            notifications: newNotifications,
            unreadCount
          }
        })
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true
          })),
          unreadCount: 0
        }))
      },

      removeNotification: (id) => {
        set((state) => {
          const newNotifications = state.notifications.filter(
            (notification) => notification.id !== id
          )
          const unreadCount = newNotifications.filter((n) => !n.read).length

          return {
            notifications: newNotifications,
            unreadCount
          }
        })
      },

      clearNotifications: () => {
        set({
          notifications: [],
          unreadCount: 0
        })
      }
    }),
    {
      name: 'notifications-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount
      })
    }
  )
)