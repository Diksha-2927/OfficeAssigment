"use client"

import { generateNumbers } from "@/utils/number"
import { supabase } from "@/lib/supabase"

export default function AdminPage() {   // <-- important: default export function with proper name

  const runDraw = async () => {
    const numbers = generateNumbers()

    await supabase.from("draws").insert([
      { month: "March", numbers }
    ])

    alert("Draw created")
  }

  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>

      <button
        onClick={runDraw}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Run Draw
      </button>
    </div>
  )
}