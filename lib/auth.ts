import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const secretKey = "secret"
const key = new TextEncoder().encode(secretKey)

const DEMO_CREDENTIALS = {
  email: "demo@impacthub.co.ke",
  password: "password123"
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("2h").sign(key)
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  })
  return payload
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (email !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
    throw new Error("Invalid credentials. Try demo@impacthub.co.ke / password123")
  }

  const user = { id: "1", name: "Demo User", email: email }

  const expires = new Date(Date.now() + 2 * 60 * 60 * 1000)
  const session = await encrypt({ user, expires })

  const cookieStore = await cookies()
  cookieStore.set("session", session, { expires, httpOnly: true })
  return { success: true }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.set("session", "", { expires: new Date(0) })
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  if (!session) return null
  return await decrypt(session)
}

export async function register(formData: FormData) {
  const firstName = formData.get("first-name") as string
  const lastName = formData.get("last-name") as string
  const email = formData.get("email") as string
  
  const user = { 
    id: "2", 
    name: `${firstName} ${lastName}`, 
    email: email 
  }

  const expires = new Date(Date.now() + 2 * 60 * 60 * 1000)
  const session = await encrypt({ user, expires })

  const cookieStore = await cookies()
  cookieStore.set("session", session, { expires, httpOnly: true })
}
