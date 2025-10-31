import { json } from '@sveltejs/kit'
import pkg from '../../../package.json' assert { type: 'json' }

// Track server start time
const START_TIME = Date.now()

export function GET() {
  const upSince = Math.floor((Date.now() - START_TIME) / 1000)

  return json({
    seconds_since_start: upSince,
    version: pkg.version,
  })
}
