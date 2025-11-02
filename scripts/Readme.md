# Generate requests 

In both the cases of a local dev deployment and a web app publicly available it's useful to have scripts that generate requests. 

The scripts are opionated and make use of [HTTPie](https://httpie.io) (more consice than  `curl`)
```sh
brew install httpie
```

## Local

For the local case, we need to populate the `x-first-seen` header in the request since we won't have the Cloudflare worker on the path to the origin. 

```sh
# send 77 requests to local server (SvelteKit / Vite => http://localhost:5173)
export NO_OF_REQUESTS=77
node scripts/send-requests-local.js "$NO_OF_REQUESTS"
```

## A Salesforce domain

```sh
export NO_OF_REQUESTS=88
export TARGET="some-sub-domain.some-domain.salesforce.com"
./scripts/send-rq "$TARGET" "$NO_OF_REQUESTS"
```
