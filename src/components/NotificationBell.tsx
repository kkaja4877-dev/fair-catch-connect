import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

const NotificationBell = () => {
  return (
    <Button variant="ghost" size="sm" className="relative">
      <Bell className="h-5 w-5" />
    </Button>
  )
}

export default NotificationBell