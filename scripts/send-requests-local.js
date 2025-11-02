const { log } = console
import { execSync } from 'child_process'

const URL = `http://localhost:5173/`

let numberOfRequests = process.argv[2]
log('requests:', numberOfRequests)

function getRandomd(N) {
  const letters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let word = ''
  for (let i = 0; i < N; i++) {
    word += letters[Math.floor(Math.random() * letters.length)]
  }
  return word
}

let batch = getRandomd(3)
for (let i = 0; i < numberOfRequests; i++) {
  const paddingLength = numberOfRequests.toString().length
  const paddedIndex = i.toString().padStart(paddingLength, '0')
  let id = `req-${batch}-${paddedIndex}`
  let url = `${URL}/data/${id}`
  let body = `info="script local" batch="${batch}" id="${id}"`
  const delay = Math.floor(Math.random() * 400)
  let cmd = `http --ignore-stdin POST ${url} Content-Type:application/json X-First-Seen:${Date.now() - delay} ${body}`
  execSync(cmd)
}
