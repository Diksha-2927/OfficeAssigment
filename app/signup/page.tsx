"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setLoading(true)

    // 1️⃣ Signup user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    const user = data.user

    // 2️⃣ Insert user in "users" table (VERY IMPORTANT)
    if (user) {
      await supabase.from("users").insert([
        {
          id: user.id,
          subscription_plan: "free",
          subscription_status: "active",
        },
      ])
    }

    // 3️⃣ Redirect to dashboard
    router.push("/dashboard")

    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-purple-500">
      <div className="bg-white p-8 rounded-xl shadow-xl w-80 space-y-4">
        <h2 className="text-2xl font-bold text-center">Signup</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border w-full px-3 py-2 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border w-full px-3 py-2 rounded"
        />

        <button
          onClick={handleSignup}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "Signing up..." : "Signup"}
        </button>
      </div>
    </div>
  )
}