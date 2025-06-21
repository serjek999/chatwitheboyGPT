// components/VerifiedBadge.jsx
import { CheckCircle2 } from "lucide-react"

export default function VerifiedBadge({ label = " ", className = "" }) {
  return (
    <div className={`flex items-center gap-1 text-blue-700 text-sm ${className}`}>
      <CheckCircle2 className="w-4 h-4" />
      <span>{label}</span>
    </div>
  )
}
