const { log } = console
import { execSync } from 'child_process'

let hostArg = process.argv[2]
hostArg = hostArg.replace('.salesforce.com', '')
hostArg = hostArg.replace('https://', '')
const URL = `https://${hostArg}.salesforce.com`

let numberOfRequests = process.argv[3]
log('requests:', numberOfRequests)

function getRandomd(N) {
  const letters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let word = ''
  for (let i = 0; i < N; i++) {
    word += letters[Math.floor(Math.random() * letters.length)]
  }
  return word
}

for (let i = 0; i < numberOfRequests; i++) {
  let batch = getRandomd(4)
  let id = `rq-${batch}-${i}`
  let url = `${URL}/data/${id}`
  let body = `info="script https://github.com/snacu/web-app-poc/blob/main/scripts/send-requests.js"`
  let cmd = `http --ignore-stdin POST ${url} Content-Type:application/json ${body}`
  execSync(cmd)
}
