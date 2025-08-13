import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/enhanced-button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { Send } from "lucide-react"

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  listing: any
  otherParty: any
}

const ChatModal = ({ isOpen, onClose, listing, otherParty }: ChatModalProps) => {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && listing) {
      fetchMessages()
    }
  }, [isOpen, listing])

  const fetchMessages = async () => {
    try {
      const { data } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name)
        `)
        .eq('listing_id', listing.id)
        .order('created_at', { ascending: true })

      if (data) setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from('messages').insert([{
        listing_id: listing.id,
        sender_id: profile.id,
        receiver_id: otherParty.id,
        message: newMessage
      }])

      if (error) throw error

      setNewMessage("")
      fetchMessages()
    } catch (error) {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chat - {listing?.title}</DialogTitle>
          <DialogDescription>
            Negotiating with {otherParty?.full_name}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4 border rounded-lg">
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender_id === profile.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender_id === profile.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm">{message.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={isLoading || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ChatModal