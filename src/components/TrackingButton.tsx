'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function TrackingButton() {
  const [trackingCode, setTrackingCode] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!trackingCode.trim()) {
      toast.error('Veuillez entrer un code de suivi')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/tracking?code=${encodeURIComponent(trackingCode.trim())}`)
      const data = await response.json()

      if (data.success) {
        toast.success('Code de suivi trouvé !')
        setIsOpen(false)
        router.push(`/tracking/${trackingCode.trim()}`)
      } else {
        toast.error(data.error || 'Code de suivi invalide')
      }
    } catch (error) {
      toast.error('Erreur lors de la vérification du code')
      console.error('Tracking error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center justify-center gap-1 md:gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0 text-[11px] md:text-sm px-2 md:px-4 py-1 md:py-2 h-8 md:h-auto"
        >
          <Search className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
          <span className="hidden lg:inline whitespace-nowrap">Suivre ma demande</span>
          <span className="hidden sm:inline lg:hidden whitespace-nowrap">Suivre</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Suivre votre demande
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="trackingCode">Code de suivi</Label>
            <Input
              id="trackingCode"
              type="text"
              placeholder="Entrez votre code de suivi (ex: EBF_XXXX)"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
              className="mt-1"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-2">
              Le code de suivi vous a été fourni lors de la soumission de votre demande.
            </p>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !trackingCode.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Vérification...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Suivre
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

