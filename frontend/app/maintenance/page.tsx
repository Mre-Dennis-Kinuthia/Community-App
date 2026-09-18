import Link from "next/link"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { MAINTENANCE_UNTIL_LABEL } from "@/lib/maintenance"

export default function MaintenancePage() {
  return (
    <AuthPageShell
      title="We'll be back Monday"
      subtitle={`The platform is under maintenance. Things will be back to normal by ${MAINTENANCE_UNTIL_LABEL}.`}
      panelTitle="We'll be back Monday"
      panelDescription={`Maintenance is underway. Service returns ${MAINTENANCE_UNTIL_LABEL}.`}
    >
      <div className="space-y-4 text-sm leading-relaxed text-[#1c395c]/90">
        <p>
          Sign in and bookings are paused until then. You can still create an account now and use it
          after maintenance.
        </p>
        <p>
          <Link
            href="/register"
            className="inline-flex w-full items-center justify-center rounded-md bg-[#812926] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#6b2120]"
          >
            Create your account
          </Link>
        </p>
      </div>
    </AuthPageShell>
  )
}
