export function generateNumbers(): number[] {
  let nums: number[] = []

  while (nums.length < 5) {
    let n = Math.floor(Math.random() * 45) + 1
    if (!nums.includes(n)) nums.push(n)
  }

  return nums
}

export function checkMatch(userScores: number[], draw: number[]) {
  return userScores.filter(n => draw.includes(n)).length
}