"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAccount } from "wagmi"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { address } = useAccount()
  const [status, setStatus] = useState<null | { ok?: boolean; error?: string }>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setStatus(null)
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, walletAddress: address }),
    })
    const json = await res.json()
    if (!res.ok) {
      setStatus({ error: json.error || "Registration failed" })
    } else {
      setStatus({ ok: true })
      reset()
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="max-w-md mx-auto px-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-2xl text-gradient">Create Account</CardTitle>
              <CardDescription>Registration requires a real email domain with MX records</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-sm">Email</label>
                  <Input type="email" placeholder="you@company.com" {...register("email")} />
                  {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="text-sm">Password</label>
                  <Input type="password" placeholder="********" {...register("password")} />
                  {errors.password && <p className="text-sm text-red-400 mt-1">{errors.password.message}</p>}
                </div>
                <Button className="w-full neon-gradient" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Creating..." : "Register"}
                </Button>
                {status?.error && <p className="text-sm text-red-400 mt-2">{status.error}</p>}
                {status?.ok && <p className="text-sm text-green-400 mt-2">Registration successful!</p>}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
