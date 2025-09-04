import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/enhanced-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  order: any
  onPaymentComplete: () => void
}

const PaymentModal = ({ isOpen, onClose, order, onPaymentComplete }: PaymentModalProps) => {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [paymentType, setPaymentType] = useState("full")
  const [advanceAmount, setAdvanceAmount] = useState("")
  const [upiId, setUpiId] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    try {
      setIsProcessing(true)

      if (!upiId || !transactionId) {
        toast({ title: "Error", description: "Please fill in all payment details", variant: "destructive" })
        return
      }

      const paymentAmount = paymentType === "advance" ? parseFloat(advanceAmount) : order.total_amount
      
      if (paymentType === "advance" && paymentAmount <= 0) {
        toast({ title: "Error", description: "Please enter a valid advance amount", variant: "destructive" })
        return
      }

      // Update order with payment details
      const { error } = await supabase
        .from('orders')
        .update({
          payment_method: 'upi',
          payment_type: paymentType,
          advance_amount: paymentType === "advance" ? paymentAmount : 0,
          upi_transaction_id: transactionId,
          payment_status: paymentType === "advance" ? 'partially_paid' : 'paid'
        })
        .eq('id', order.id)

      if (error) throw error

      // Note: Notifications would be created here if table exists

      toast({ title: "Success", description: "Payment processed successfully!" })
      onPaymentComplete()
      onClose()
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  const upiUrl = `upi://pay?pa=${upiId}&am=${paymentType === "advance" ? advanceAmount : order?.total_amount}&cu=INR&tn=Order%20Payment`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>UPI Payment</DialogTitle>
          <DialogDescription>
            Complete your payment for Order #{order?.id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Order Amount: ₹{order?.total_amount}</Label>
          </div>

          <div>
            <Label>Payment Type</Label>
            <RadioGroup value={paymentType} onValueChange={setPaymentType} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full">Full Payment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advance" id="advance" />
                <Label htmlFor="advance">Advance Payment</Label>
              </div>
            </RadioGroup>
          </div>

          {paymentType === "advance" && (
            <div>
              <Label htmlFor="advance-amount">Advance Amount (₹)</Label>
              <Input
                id="advance-amount"
                type="number"
                placeholder="Enter advance amount"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(e.target.value)}
              />
            </div>
          )}

          <div>
            <Label htmlFor="upi-id">Enter UPI ID for Payment</Label>
            <Input
              id="upi-id"
              placeholder="example@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          </div>

          {upiId && (
            <div className="text-center">
              <a 
                href={upiUrl}
                className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
              >
                Pay ₹{paymentType === "advance" ? advanceAmount : order?.total_amount} via UPI
              </a>
              <p className="text-xs text-muted-foreground mt-2">
                Click to open your UPI app and complete payment
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="transaction-id">UPI Transaction ID</Label>
            <Input
              id="transaction-id"
              placeholder="Enter transaction ID after payment"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={isProcessing} className="flex-1">
              {isProcessing ? "Processing..." : "Confirm Payment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentModal