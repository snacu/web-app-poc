import { json } from '@sveltejs/kit'
import db from '$lib/db.js'

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
  const { id } = params

  // Get request body
  let body
  try {
    body = await request.json()
  } catch {
    // If not JSON, try to get as text
    body = await request.text()
  }

  // Get headers as object
  const headers = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })

  // Store in database
  db.data.data[id] = {
    body,
    headers,
    timestamp: new Date().toISOString(),
  }
  await db.write()

  return json({
    success: true,
    id,
    stored: db.data.data[id],
  })
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
  const { id } = params

  await db.read()

  if (!db.data.data[id]) {
    return json({ error: 'Not found' }, { status: 404 })
  }

  return json(db.data.data[id])
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params }) {
  const { id } = params

  await db.read()

  if (!db.data.data[id]) {
    return json({ error: 'Not found' }, { status: 404 })
  }

  delete db.data.data[id]
  await db.write()

  return json({ success: true, id })
}
