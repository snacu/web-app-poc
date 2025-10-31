import adapter from '@sveltejs/adapter-node'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      // Heroku sets the PORT environment variable
      envPrefix: '',
    }),
  },
}

export default config
