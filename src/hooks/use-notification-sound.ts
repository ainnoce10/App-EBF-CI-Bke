'use client'

import { useEffect, useRef } from 'react'

export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Créer un son de notification avec Web Audio API
    const createNotificationSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    }

    audioRef.current = {
      play: createNotificationSound
    } as any
  }, [])

  const playSound = () => {
    if (audioRef.current) {
      try {
        audioRef.current.play()
      } catch (error) {
        console.log('Audio play failed:', error)
      }
    }
  }

  return { playSound }
}