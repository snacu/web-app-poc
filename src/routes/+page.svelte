<script>
  import Highlight from 'svelte-highlight'
  import json from 'svelte-highlight/languages/json'
  import 'svelte-highlight/styles/oceanicnext.css'

  let { data } = $props()
  let expandedIds = $state(new Set())

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
</script>

<div class="container mx-auto p-8">
  <h1 class="mb-8 text-4xl font-bold">Requests</h1>

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
                <h3 class="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Body
                </h3>
                <div class="overflow-hidden rounded-md">
                  <Highlight language={json} code={JSON.stringify(entry.body, null, 2)} />
                </div>
              </div>

              <div>
                <h3 class="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Headers
                </h3>
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
