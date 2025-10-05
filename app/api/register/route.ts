import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { resolveMx } from "node:dns/promises"
import bcrypt from "bcryptjs"

function isEmailFormatValid(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

async function hasMxRecords(email: string) {
  const domain = email.split("@")[1]?.trim()
  if (!domain) return false
  try {
    const answers = await resolveMx(domain)
    return Array.isArray(answers) && answers.length > 0
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const { email, password, walletAddress } = await req.json().catch(() => ({}))

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }

  if (!isEmailFormatValid(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
  }

  const mxOk = await hasMxRecords(email)
  if (!mxOk) {
    return NextResponse.json({ error: "Email domain is not valid (no MX records found)" }, { status: 400 })
  }

  const existing = await query<{ id: number }[]>("SELECT id FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1", [email])
  if (existing.length) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 })
  }

  const hash = await bcrypt.hash(password, 12)
  await query(`INSERT INTO users (email, password_hash, wallet_address) VALUES (?, ?, ?)`, [
    email,
    hash,
    walletAddress || null,
  ])

  return NextResponse.json({ ok: true })
}
