import { Low } from 'lowdb'
import { Memory } from 'lowdb'

// Initialize in-memory database
const adapter = new Memory()
const db = new Low(adapter, { data: {} })

// Initialize the database
await db.read()
db.data ||= { data: {} }
await db.write()

export default db
