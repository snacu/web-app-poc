import db from '$lib/db.js'

let baseUrl = 'http://localhost:5173'
const definedBaseUrl = !!process.env.BASE_URL
if (definedBaseUrl) {
  baseUrl = `https://${process.env.BASE_URL.replace('https://', '')}`
}

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  await db.read()

  // Get all entries and sort by timestamp (newest first)
  const entries = Object.entries(db.data.data || {})
    .map(([id, data]) => ({
      id,
      ...data,
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 30) // Get latest 30

  return {
    entries,
    baseUrl,
  }
}
