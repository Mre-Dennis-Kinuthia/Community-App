"use server"

import { redirect } from "next/navigation"
import { login, logout, register } from "@/lib/auth"

export async function handleLogin(formData: FormData) {
  try {
    await login(formData)
    redirect("/dashboard")
  } catch (error) {
    console.log("Login error:", error)
    throw error
  }
}

export async function handleLogout() {
  await logout()
  redirect("/login")
}

export async function handleRegister(formData: FormData) {
  await register(formData)
  redirect("/dashboard")
}
