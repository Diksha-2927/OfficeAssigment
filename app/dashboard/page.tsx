"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

// -------------------------
// Dashboard Wrapper (Session Check)
// -------------------------
export default function DashboardPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push("/login/page") // aapke login folder ke hisaab se
      } else {
        setUserId(data.session.user.id)
        setLoading(false)
      }
    }
    checkSession()
  }, [router])

  if (loading) return <p>Loading Dashboard...</p>
  if (!userId) return null

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-3xl text-center space-y-6">

        <h1 className="text-2xl font-bold mb-4">🎯 Your Dashboard</h1>

        <SubscriptionStatus userId={userId} />
        <ScoreEntry userId={userId} />
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
    <div className="text-left p-2 border rounded">
      <h3 className="font-bold">Subscription</h3>
      <p>Plan: {plan || "N/A"}</p>
      <p>Status: {status || "N/A"}</p>
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
    if (newScore < 1 || newScore > 45) return alert("Score must be 1–45")
    await supabase.from("scores").insert([{ user_id: userId, score: newScore }])
    setNewScore(0)
    fetchScores()
  }

  useEffect(() => { fetchScores() }, [userId])

  return (
    <div className="text-left p-2 border rounded">
      <h3 className="font-bold">Latest Scores (1–5)</h3>
      <ul>{scores.map((s, i) => <li key={i}>{s}</li>)}</ul>
      <div className="mt-2 flex gap-2">
        <input
          type="number"
          value={newScore}
          onChange={e => setNewScore(Number(e.target.value))}
          className="border px-2 py-1 rounded w-24"
          placeholder="Score 1–45"
        />
        <button onClick={addScore} className="bg-blue-500 text-white px-3 py-1 rounded">Add Score</button>
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
    if (!selected) return alert("Please select a charity")
    if (percent < 10 || percent > 100) return alert("Percentage must be 10–100")
    await supabase.from("users").update({ selected_charity: selected, charity_percentage: percent }).eq("id", userId)
    alert("Charity selection saved!")
  }

  useEffect(() => { fetchCharities() }, [])

  return (
    <div className="text-left p-2 border rounded">
      <h3 className="font-bold">Select Charity</h3>
      <select value={selected} onChange={e => setSelected(e.target.value)} className="border p-1 rounded w-full">
        <option value="">-- Choose Charity --</option>
        {charities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <div className="mt-2 flex gap-2 items-center">
        <input
          type="number"
          value={percent}
          onChange={e => setPercent(Number(e.target.value))}
          className="border px-2 py-1 rounded w-20"
          min={10}
          max={100}
        /> %
        <button onClick={saveSelection} className="bg-green-500 text-white px-3 py-1 rounded">Save</button>
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
      { user_id: userId, user_nums: user.join(","), draw_nums: draw.join(","), matches: matchCount, created_at: new Date().toISOString() }
    ])
    fetchHistory()
    setLoading(false)
  }

  const fetchHistory = async () => {
    const { data } = await supabase.from("games").select("*").eq("user_id", userId).order("id", { ascending: false })
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
    <div className="text-left p-2 border rounded">
      <h3 className="font-bold mb-2">🎲 Lottery Game</h3>
      <div className="flex gap-2 mb-2">
        <button onClick={handlePlay} className="bg-green-500 text-white px-3 py-1 rounded">{loading ? "Saving..." : "Play"}</button>
        <button onClick={handleReset} className="bg-red-500 text-white px-3 py-1 rounded">Reset</button>
      </div>
      <p>User: {userNumbers.join(", ")}</p>
      <p>Draw: {drawNumbers.join(", ")}</p>
      <p>Matches: {match}</p>
      <p className="mt-1 font-bold">{getResult()}</p>
      <div className="mt-2 max-h-32 overflow-y-auto">
        <h4 className="font-bold">History</h4>
        {history.length === 0 && <p>No data yet</p>}
        {history.map((h, i) => (
          <p key={i}>{h.user_nums} → {h.matches} matches ({new Date(h.created_at).toLocaleString()})</p>
        ))}
      </div>
    </div>
  )
}