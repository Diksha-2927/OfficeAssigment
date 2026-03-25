"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

// -------------------------
// Dashboard Page
// -------------------------
export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) setUserId(data.user.id)
      setLoadingUser(false)
    }
    fetchUser()
  }, [])

  if (loadingUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">Loading dashboard...</p>
      </div>
    )

  if (!userId)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold text-red-500">
          Please login to access dashboard
        </p>
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-blue-500 p-4">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-8 space-y-8">
        <h1 className="text-3xl font-extrabold text-center text-gray-800">
          🎯 Your Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SubscriptionStatus userId={userId} />
          <ScoreEntry userId={userId} />
        </div>

        <CharitySelector userId={userId} />

        <LotteryGame userId={userId} />
      </div>
    </div>
  )
}

// -------------------------
// Subscription Status
// -------------------------
function SubscriptionStatus({ userId }: { userId: string }) {
  const [plan, setPlan] = useState<string>("")
  const [status, setStatus] = useState<string>("")

  useEffect(() => {
    const fetchSubscription = async () => {
      const { data } = await supabase
        .from("users")
        .select("subscription_plan, subscription_status")
        .eq("id", userId)
        .single()
      if (data) {
        setPlan(data.subscription_plan)
        setStatus(data.subscription_status)
      }
    }
    fetchSubscription()
  }, [userId])

  return (
    <div className="bg-purple-50 p-4 rounded-xl shadow-md border border-purple-200">
      <h3 className="text-lg font-semibold text-purple-700 mb-2">Subscription</h3>
      <p>
        <span className="font-medium">Plan:</span> {plan || "N/A"}
      </p>
      <p>
        <span className="font-medium">Status:</span> {status || "N/A"}
      </p>
    </div>
  )
}

// -------------------------
// Score Entry
// -------------------------
function ScoreEntry({ userId }: { userId: string }) {
  const [scores, setScores] = useState<number[]>([])
  const [newScore, setNewScore] = useState<number>(0)

  const fetchScores = async () => {
    const { data } = await supabase
      .from("scores")
      .select("score")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)
    if (data) setScores(data.map(d => d.score))
  }

  const addScore = async () => {
    if (newScore < 1 || newScore > 45) return alert("Score must be 1-45")
    await supabase.from("scores").insert([{ user_id: userId, score: newScore }])
    setNewScore(0)
    fetchScores()
  }

  useEffect(() => {
    fetchScores()
  }, [userId])

  return (
    <div className="bg-green-50 p-4 rounded-xl shadow-md border border-green-200">
      <h3 className="text-lg font-semibold text-green-700 mb-2">Latest Scores (1-5)</h3>
      <ul className="list-disc list-inside mb-2">
        {scores.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
      <div className="flex gap-2 mt-2">
        <input
          type="number"
          value={newScore}
          onChange={e => setNewScore(Number(e.target.value))}
          placeholder="Score 1-45"
          className="border border-green-300 px-3 py-1 rounded w-28"
        />
        <button
          onClick={addScore}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded transition"
        >
          Add Score
        </button>
      </div>
    </div>
  )
}

// -------------------------
// Charity Selector
// -------------------------
function CharitySelector({ userId }: { userId: string }) {
  const [charities, setCharities] = useState<any[]>([])
  const [selected, setSelected] = useState<string>("")
  const [percent, setPercent] = useState<number>(10)

  const fetchCharities = async () => {
    const { data } = await supabase.from("charities").select("*")
    if (data) setCharities(data)
  }

  const saveSelection = async () => {
    if (!selected) return alert("Select a charity")
    await supabase
      .from("users")
      .update({ selected_charity: selected, charity_percentage: percent })
      .eq("id", userId)
    alert("Charity selection saved!")
  }

  useEffect(() => {
    fetchCharities()
  }, [])

  return (
    <div className="bg-yellow-50 p-4 rounded-xl shadow-md border border-yellow-200">
      <h3 className="text-lg font-semibold text-yellow-700 mb-2">Select Charity</h3>
      <div className="flex flex-col gap-2">
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="border border-yellow-300 rounded px-2 py-1"
        >
          <option value="">-- Choose Charity --</option>
          {charities.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2 items-center mt-2">
          <input
            type="number"
            value={percent}
            onChange={e => setPercent(Number(e.target.value))}
            className="border px-2 py-1 rounded w-20"
            min={10}
            max={100}
          />
          <span>%</span>
          <button
            onClick={saveSelection}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

// -------------------------
// Lottery Game
// -------------------------
function generateNumbers(): number[] {
  const nums: number[] = []
  while (nums.length < 5) {
    const n = Math.floor(Math.random() * 50) + 1
    if (!nums.includes(n)) nums.push(n)
  }
  return nums
}

function checkMatch(user: number[], draw: number[]): number {
  return user.filter(n => draw.includes(n)).length
}

function LotteryGame({ userId }: { userId: string }) {
  const [userNumbers, setUserNumbers] = useState<number[]>([])
  const [drawNumbers, setDrawNumbers] = useState<number[]>([])
  const [match, setMatch] = useState<number>(0)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handlePlay = async () => {
    setLoading(true)
    const user = generateNumbers()
    const draw = generateNumbers()
    const matchCount = checkMatch(user, draw)
    setUserNumbers(user)
    setDrawNumbers(draw)
    setMatch(matchCount)

    await supabase.from("games").insert([
      { user_id: userId, user_nums: user.join(","), draw_nums: draw.join(","), matches: matchCount, created_at: new Date().toISOString() },
    ])
    fetchHistory()
    setLoading(false)
  }

  const fetchHistory = async () => {
    const { data } = await supabase
      .from("games")
      .select("*")
      .eq("user_id", userId)
      .order("id", { ascending: false })
    setHistory(data || [])
  }

  useEffect(() => { fetchHistory() }, [userId])

  const handleReset = () => {
    setUserNumbers([])
    setDrawNumbers([])
    setMatch(0)
  }

  const getResult = () => {
    if (match === 5) return "🏆 JACKPOT WINNER!"
    if (match === 4) return "🥈 Almost! 4 Matches"
    if (match === 3) return "🥉 Good Job! 3 Matches"
    return "😢 Try Again"
  }

  return (
    <div className="bg-blue-50 p-4 rounded-xl shadow-md border border-blue-200">
      <h3 className="text-lg font-semibold text-blue-700 mb-2">🎲 Lottery Game</h3>
      <div className="flex gap-2 mb-2">
        <button
          onClick={handlePlay}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded transition"
        >
          {loading ? "Saving..." : "Play"}
        </button>
        <button
          onClick={handleReset}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded transition"
        >
          Reset
        </button>
      </div>
      <p><b>User:</b> {userNumbers.join(", ")}</p>
      <p><b>Draw:</b> {drawNumbers.join(", ")}</p>
      <p><b>Matches:</b> {match}</p>
      <p className="mt-1 font-bold">{getResult()}</p>

      <div className="mt-4 max-h-40 overflow-y-auto border-t border-blue-200 pt-2">
        <h4 className="font-semibold text-blue-800 mb-1">History</h4>
        {history.length === 0 && <p>No data yet</p>}
        {history.map((h, i) => (
          <p key={i} className="text-sm">
            {h.user_nums} → {h.matches} matches ({new Date(h.created_at).toLocaleString()})
          </p>
        ))}
      </div>
    </div>
  )
}