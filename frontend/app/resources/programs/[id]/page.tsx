import { redirect } from "next/navigation"

/** Legacy v0 demo program routes — programs are listed on Resources. */
export default function ProgramDetailPage() {
  redirect("/resources?tab=programs")
}
