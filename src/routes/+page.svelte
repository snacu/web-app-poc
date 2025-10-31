<script>
  import Highlight from 'svelte-highlight'
  import json from 'svelte-highlight/languages/json'
  import 'svelte-highlight/styles/oceanicnext.css'
  import { invalidateAll } from '$app/navigation'

  let { data } = $props()
  let expandedIds = $state(new Set())
  let isRefreshing = $state(false)

  /**
   * @param {string} id
   */
  function toggleEntry(id) {
    if (expandedIds.has(id)) {
      expandedIds.delete(id)
    } else {
      expandedIds.add(id)
    }
    expandedIds = new Set(expandedIds) // Trigger reactivity
  }

  /**
   * @param {string} text
   */
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  async function refresh() {
    isRefreshing = true
    await invalidateAll()
    isRefreshing = false
  }
</script>

<div class="container mx-auto p-8">
  <div class="mb-8 flex items-baseline gap-3">
    <h1 class="text-4xl font-bold">Requests</h1>
    <button
      onclick={refresh}
      disabled={isRefreshing}
      class="flex items-center gap-1 rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
      title="Refresh entries"
    >
      <svg
        class="h-4 w-4 {isRefreshing ? 'animate-spin' : ''}"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        ></path>
      </svg>
      Refresh
    </button>
  </div>

  {#if data.entries.length === 0}
    <div class="rounded-lg border border-gray-300 bg-gray-50 p-8 text-center">
      <p class="text-gray-600">
        No entries yet. Send a POST request to /data/{'{id}'} to create one.
      </p>
      <div class="mt-4">
        <code class="block rounded bg-gray-800 p-4 text-left text-sm text-white">
          curl -X POST http://localhost:5173/data/example \<br />
          &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
          &nbsp;&nbsp;-d '{'{'}"message": "Hello World"{'}'}'
        </code>
      </div>
    </div>
  {:else}
    <div class="mb-4 text-gray-600">
      Showing {data.entries.length}
      {data.entries.length === 1 ? 'entry' : 'entries'}
    </div>

    <div class="space-y-2">
      {#each data.entries as entry}
        <div
          class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all"
        >
          <button
            class="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50"
            onclick={() => toggleEntry(entry.id)}
          >
            <div class="flex items-center gap-4">
              <span class="text-lg font-semibold text-blue-600">{entry.id}</span>
              <span class="text-sm text-gray-500"
                >{new Date(entry.timestamp).toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  fractionalSecondDigits: 3,
                  hour12: false,
                })}</span
              >
            </div>
            <svg
              class="h-5 w-5 text-gray-400 transition-transform {expandedIds.has(entry.id)
                ? 'rotate-180'
                : ''}"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {#if expandedIds.has(entry.id)}
            <div class="border-t border-gray-200 bg-gray-50 p-4">
              <div class="mb-4">
                <div class="mb-2 flex items-center justify-between">
                  <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Body</h3>
                  <button
                    onclick={() => copyToClipboard(JSON.stringify(entry.body, null, 2))}
                    class="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    title="Copy body"
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      ></path>
                    </svg>
                    Copy
                  </button>
                </div>
                <div class="overflow-hidden rounded-md">
                  <Highlight language={json} code={JSON.stringify(entry.body, null, 2)} />
                </div>
              </div>

              <div>
                <div class="mb-2 flex items-center justify-between">
                  <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Headers</h3>
                  <button
                    onclick={() => copyToClipboard(JSON.stringify(entry.headers, null, 2))}
                    class="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    title="Copy headers"
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      ></path>
                    </svg>
                    Copy
                  </button>
                </div>
                <div class="overflow-hidden rounded-md">
                  <Highlight language={json} code={JSON.stringify(entry.headers, null, 2)} />
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
