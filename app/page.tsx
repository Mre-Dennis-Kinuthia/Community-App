import Link from "next/link"
import { redirect } from "next/navigation"

// Simple root route: redirect to login.
export default function Home() {
  redirect("/login")
}


