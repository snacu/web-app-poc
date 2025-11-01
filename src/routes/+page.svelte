<script>
  import Highlight from 'svelte-highlight'
  import json from 'svelte-highlight/languages/json'
  import 'svelte-highlight/styles/oceanicnext.css'
  import { invalidateAll } from '$app/navigation'

  let { data } = $props()
  let expandedIds = $state(new Set())
  let isRefreshing = $state(false)

  // Calculate time since first entry
  let entriesWithOffset = $derived.by(() => {
    if (data.entries.length === 0) return []

    const firstTimestamp = new Date(data.entries[data.entries.length - 1].timestamp).getTime()

    return data.entries.map((entry) => {
      const entryTime = new Date(entry.timestamp).getTime()
      const sinceFist = ((entryTime - firstTimestamp) / 1000).toFixed(3)
      return { ...entry, sinceFist }
    })
  })

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

  /**
   * @param {string} id
   */
  async function deleteEntry(id) {
    if (!confirm(`Delete entry "${id}"?`)) {
      return
    }

    try {
      const response = await fetch(`/data/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await invalidateAll() // Refresh the list
      } else {
        console.error('Failed to delete entry')
      }
    } catch (err) {
      console.error('Error deleting entry:', err)
    }
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
      <div class="relative mt-4">
        <button
          onclick={() =>
            copyToClipboard(
              `http POST ${data.baseUrl}/data/rq-1 Content-Type:application/json X-Custom-Header:"custom-header-val" message="example request"`,
            )}
          class="absolute top-2 right-2 flex items-center gap-1 rounded bg-gray-700 px-2 py-1 text-xs text-white hover:bg-gray-600"
          title="Copy command"
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
        <pre class="block overflow-auto rounded bg-gray-800 p-4 text-left text-sm text-white">
          <code class="language-bash">
http POST {data.baseUrl}/data/rq-1 \
  Content-Type:application/json \
  X-Custom-Header:"custom-header-val" \
  message="example request"
          </code>
        </pre>
      </div>
    </div>
  {:else}
    <div class="mb-4 text-gray-600">
      Showing {entriesWithOffset.length}
      {entriesWithOffset.length === 1 ? 'entry' : 'entries'}
    </div>

    <div class="space-y-2">
      {#each entriesWithOffset as entry}
        <div
          class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all"
        >
          <div class="flex items-center justify-between p-4 hover:bg-gray-50">
            <button
              class="flex flex-1 items-center gap-3 text-left"
              onclick={() => toggleEntry(entry.id)}
            >
              <span class="text-lg font-semibold text-blue-600">{entry.id}</span>
              {#if entry.method && entry.url}
                <span class="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                  {entry.method}
                </span>
                <span class="text-sm text-gray-600">
                  {new URL(entry.url).pathname}
                </span>
              {/if}
              <span class="font-mono text-xs text-purple-500">
                +{entry.sinceFist}s
              </span>
              <span class="ml-auto font-mono text-xs text-gray-400">
                {(() => {
                  const d = new Date(entry.timestamp)
                  const year = d.getFullYear()
                  const month = String(d.getMonth() + 1).padStart(2, '0')
                  const day = String(d.getDate()).padStart(2, '0')
                  const hour = String(d.getHours()).padStart(2, '0')
                  const minute = String(d.getMinutes()).padStart(2, '0')
                  const second = String(d.getSeconds()).padStart(2, '0')
                  const ms = String(d.getMilliseconds()).padStart(3, '0')
                  return `${year}/${month}/${day} ${hour}:${minute}.${second}.${ms}`
                })()}
              </span>
            </button>
            <div class="flex items-center gap-2">
              <button
                onclick={(e) => {
                  e.stopPropagation()
                  deleteEntry(entry.id)
                }}
                class="rounded p-1 text-red-600 hover:bg-red-50"
                title="Delete entry"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  ></path>
                </svg>
              </button>
              <button
                onclick={() => toggleEntry(entry.id)}
                class="p-1"
                title={expandedIds.has(entry.id) ? 'Collapse' : 'Expand'}
              >
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
            </div>
          </div>

          {#if expandedIds.has(entry.id)}
            <div class="border-t border-gray-200 bg-gray-50 p-4">
              <div class="mb-4">
                <div class="mb-2 flex items-center justify-between">
                  <h3 class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Body</h3>
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
                  <h3 class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Headers
                  </h3>
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
