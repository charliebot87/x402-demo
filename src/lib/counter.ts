// Simple in-memory counter for demo purposes
// Resets on cold start — good enough for a playground
let count = 0

export function incrementCounter(): number {
  count++
  return count
}

export function getCount(): number {
  return count
}
