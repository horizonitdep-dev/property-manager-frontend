import Link from "next/link"
import { ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"

export function AccessRestricted() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-outline-variant bg-surface py-24 text-center">
      <ShieldAlert className="h-10 w-10 text-warning" />
      <div>
        <h2 className="font-display text-h2 text-on-surface">Manager access required</h2>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Only Managers can register or edit buildings.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href={ROUTES.buildings}>Back to Buildings</Link>
      </Button>
    </div>
  )
}
