# Simulator app to visualize what requests will be throttled

## Developing

The app is built on NodeJS / Svelte 5 / SvelteKit / Tailwind CSS

Once you've created/cloned the project and installed dependencies with `npm install` (or `pnpm install`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Simulate (or send) requests

For the live app use:

```sh
 ./scripts/send-rq $WEB_APP_URL $NO_OF_REQUESTS
```

For localhost:

```sh
node scripts/send-requests-local.js $NO_OF_REQUESTS
```
