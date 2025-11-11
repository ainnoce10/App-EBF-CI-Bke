 'use client'

import { create } from 'zustand'
import type { Message } from '@/types/message'

type MessageStatus = 'UNREAD' | 'READ' | 'ARCHIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'URGENT'

interface MessageStore {
  messages: Message[]
  loading: boolean
  error: string | null
  fetchMessages: () => Promise<void>
  updateMessageStatus: (id: string, status: MessageStatus) => Promise<void>
  addMessage: (message: Message) => void
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: [],
  loading: false,
  error: null,

  fetchMessages: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/messages')
      if (!response.ok) throw new Error('Failed to fetch messages')
      const data = await response.json()
      set({ messages: data.messages || [], loading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },

  updateMessageStatus: async (id: string, status: MessageStatus) => {
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!response.ok) throw new Error('Failed to update message')
      
      // Mettre à jour le message dans le store
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === id 
            ? { ...msg, status: status as MessageStatus, updatedAt: new Date().toISOString() } 
            : msg
        )
      }))
    } catch (error) {
      throw error
    }
  },

  addMessage: (message: Message) => {
    set((state) => ({
      messages: [message, ...state.messages]
    }))
  }
}))