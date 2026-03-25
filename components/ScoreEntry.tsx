"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function ScoreEntry({ userId }: { userId: string }) {
  const [scores, setScores] = useState<{ id: string, score: number, created_at: string }[]>([])
  const [newScore, setNewScore] = useState<number>(0)

  // Fetch last 5 scores
  const fetchScores = async () => {
    const { data } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)
    setScores(data || [])
  }

  useEffect(() => { fetchScores() }, [])

  const handleAddScore = async () => {
    if (newScore < 1 || newScore > 45) {
      alert("Score must be between 1 and 45")
      return
    }

    // Insert new score
    await supabase.from("scores").insert([{ user_id: userId, score: newScore }])

    // Remove oldest if >5
    const { data: allScores } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })

    if (allScores && allScores.length > 5) {
      const excess = allScores.length - 5
      for (let i = 0; i < excess; i++) {
        await supabase.from("scores").delete().eq("id", allScores[i].id)
      }
    }

    setNewScore(0)
    fetchScores()
  }

  return (
    <div>
      <h3>Your Last 5 Scores</h3>
      <ul>
        {scores.map(s => (
          <li key={s.id}>{s.score} ({new Date(s.created_at).toLocaleDateString()})</li>
        ))}
      </ul>

      <input
        type="number"
        value={newScore}
        onChange={e => setNewScore(parseInt(e.target.value))}
        placeholder="Enter score"
      />
      <button onClick={handleAddScore}>Add Score</button>
    </div>
  )
}