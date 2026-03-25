"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function CharitySelector({ userId }: { userId: string }) {
  const [charities, setCharities] = useState<any[]>([])
  const [selected, setSelected] = useState<string>("")
  const [percentage, setPercentage] = useState<number>(10)

  useEffect(() => {
    const fetchCharities = async () => {
      const { data } = await supabase.from("charities").select("*")
      setCharities(data || [])
    }
    fetchCharities()
  }, [])

  const handleSave = async () => {
    if (!selected) return alert("Select a charity")
    if (percentage < 10) return alert("Minimum 10% contribution")
    await supabase.from("users").update({ selected_charity: selected, charity_percentage: percentage }).eq("id", userId)
    alert("Charity selection saved!")
  }

  return (
    <div>
      <h3>Select Charity</h3>
      <select value={selected} onChange={e => setSelected(e.target.value)}>
        <option value="">--Select Charity--</option>
        {charities.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <input type="number" value={percentage} min={10} max={100} onChange={e => setPercentage(parseInt(e.target.value))} />%
      <button onClick={handleSave}>Save</button>
    </div>
  )
}