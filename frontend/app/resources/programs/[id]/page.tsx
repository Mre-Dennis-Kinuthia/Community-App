import { redirect } from "next/navigation"

/** Legacy program detail routes — programs are listed on Resources. */
export default function ProgramDetailPage() {
  redirect("/resources?tab=programs")
}
