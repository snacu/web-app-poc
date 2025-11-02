<script>
  import Highlight from 'svelte-highlight'
  import json from 'svelte-highlight/languages/json'
  import 'svelte-highlight/styles/oceanicnext.css'
  import { invalidateAll } from '$app/navigation'

  let { data } = $props()
  let expandedIds = $state(new Set())
  let isRefreshing = $state(false)
  let threshold = $state(data.threshold)
  let activeTab = $state('requests')

  // Calculate time since first entry
  let entriesWithOffset = $derived.by(() => {
    if (data.entries.length === 0) return []

    return data.entries.map((entry) => {
      return { ...entry }
    })
  })

  // Calculate throttled percentage
  let throttledPercentage = $derived.by(() => {
    if (entriesWithOffset.length === 0) return 0

    const throttledCount = entriesWithOffset.filter(
      (entry) => entry.since_first_seen && parseFloat(entry.since_first_seen) * 1000 > threshold,
    ).length

    return ((throttledCount / entriesWithOffset.length) * 100).toFixed(2)
  })

  // Calculate latency data points for chart
  let latencyChartData = $derived.by(() => {
    if (entriesWithOffset.length === 0) return []

    const latencies = entriesWithOffset
      .filter((entry) => entry.since_first_seen)
      .map((entry) => parseFloat(entry.since_first_seen) * 1000)
      .sort((a, b) => a - b)

    if (latencies.length === 0) return []

    const minLatency = Math.floor(latencies[0])
    const maxLatency = Math.ceil(latencies[latencies.length - 1]) + 100 // Add 100ms to show 0% throttled
    const step = Math.max(1, Math.ceil((maxLatency - minLatency) / 20))

    const dataPoints = []
    for (let lat = minLatency; lat <= maxLatency; lat += step) {
      const throttledCount = latencies.filter((l) => l > lat).length
      const percentage = (throttledCount / latencies.length) * 100
      dataPoints.push({ latency: lat, percentage })
    }

    return dataPoints
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
  <!-- Tabs -->
  <div class="mb-8 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <button
        onclick={() => (activeTab = 'requests')}
        class="rounded-t-lg px-4 py-2 font-semibold {activeTab === 'requests'
          ? 'border-b-2 border-blue-600 bg-white text-blue-600'
          : 'text-gray-600 hover:text-gray-900'}"
      >
        Requests
      </button>
      <button
        onclick={() => (activeTab = 'visualize')}
        class="rounded-t-lg px-4 py-2 font-semibold {activeTab === 'visualize'
          ? 'border-b-2 border-blue-600 bg-white text-blue-600'
          : 'text-gray-600 hover:text-gray-900'}"
      >
        Visualize
      </button>
      {#if activeTab === 'requests'}
        <button
          onclick={refresh}
          disabled={isRefreshing}
          class="ml-2 flex items-center gap-1 rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
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
      {/if}
    </div>
    <span class="rounded bg-orange-100 px-3 py-2 text-base font-semibold text-orange-700">
      Throttled: <b>{throttledPercentage}</b>%
    </span>
  </div>

  {#if activeTab === 'requests'}
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
      <div class="mb-4 flex items-center justify-between text-gray-600">
        <div title="The most recent entries">
          Most recent: <b>{entriesWithOffset.length}</b>
          {entriesWithOffset.length === 1 ? 'entry' : 'entries'}
        </div>
        <div class="text-sm">
          Threshold millis:
          <input
            type="number"
            bind:value={threshold}
            step="10"
            min="10"
            class="ml-1 w-18 rounded border border-gray-300 px-2 py-0.5 font-mono text-sm font-semibold text-gray-800 focus:border-blue-500 focus:outline-none"
          />
        </div>
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
                <span
                  class="ml-4 font-mono text-xs {entry.since_first_seen &&
                  parseFloat(entry.since_first_seen) * 1000 > threshold
                    ? 'rounded bg-red-600 px-2 py-1 text-white'
                    : 'rounded bg-green-500 px-2 py-1 text-white'}"
                >
                  {entry.since_first_seen ? '+' + entry.since_first_seen + 's' : 'n/a'}
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
                    <h3 class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                      Body
                    </h3>
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
  {:else if activeTab === 'visualize'}
    <!-- Visualize Tab -->
    <div class="flex flex-col items-center justify-center py-12">
      <div class="mb-8">
        <div class="text-lg text-gray-700">
          Threshold millis:
          <input
            type="number"
            bind:value={threshold}
            step="10"
            min="10"
            class="ml-2 w-28 rounded border border-gray-300 px-3 py-2 font-mono text-lg font-semibold text-gray-800 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div class="text-center">
        <h2 class="mb-6 text-2xl font-bold">Request Distribution</h2>
        <div class="mb-8 text-2xl text-gray-700">
          <span class="text-4xl font-bold">{entriesWithOffset.length}</span> Total Requests
        </div>

        {#if entriesWithOffset.length > 0}
          {@const throttledPct = Number(throttledPercentage)}
          {@const normalPct = 100 - throttledPct}
          {@const normalAngle = (normalPct / 100) * 2 * Math.PI}
          {@const normalX = 150 + 140 * Math.sin(normalAngle)}
          {@const normalY = 150 - 140 * Math.cos(normalAngle)}
          {@const normalLargeArc = normalPct > 50 ? 1 : 0}
          {@const throttledLargeArc = throttledPct > 50 ? 1 : 0}

          <svg width="300" height="300" viewBox="0 0 300 300" class="mx-auto">
            <!-- Green slice (non-throttled) -->
            {#if throttledPct < 100}
              <path
                d="M 150 150 L 150 10 A 140 140 0 {normalLargeArc} 1 {normalX} {normalY} Z"
                fill="#10b981"
              />
            {/if}

            <!-- Red slice (throttled) -->
            {#if throttledPct > 0}
              <path
                d="M 150 150 L {normalX} {normalY} A 140 140 0 {throttledLargeArc} 1 150 10 Z"
                fill="#ef4444"
              />
            {/if}
          </svg>

          <div class="mt-8 flex justify-center gap-8">
            <div class="flex items-center gap-2">
              <div class="h-4 w-4 rounded bg-green-500"></div>
              <span class="text-sm">Normal: {normalPct.toFixed(2)}%</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="h-4 w-4 rounded bg-red-500"></div>
              <span class="text-sm">Throttled: {throttledPercentage}%</span>
            </div>
          </div>
        {:else}
          <div class="text-gray-500">No data to visualize</div>
        {/if}
      </div>

      <!-- Latency vs Throttled Chart -->
      {#if latencyChartData.length > 0}
        {@const minLat = latencyChartData[0].latency}
        {@const maxLat = latencyChartData[latencyChartData.length - 1].latency}
        {@const latRange = maxLat - minLat}
        {@const points = latencyChartData
          .map((d) => {
            const x = 60 + ((d.latency - minLat) / latRange) * 700
            const y = 350 - d.percentage * 2.5
            return `${x},${y}`
          })
          .join(' ')}
        {@const thresholdX = 60 + ((threshold - minLat) / latRange) * 700}

        <div class="mt-16 text-center">
          <h2 class="mb-6 text-2xl font-bold">Latency vs Throttled %</h2>
          <div class="mx-auto max-w-4xl rounded-lg border border-gray-200 bg-white p-6">
            <svg width="800" height="400" viewBox="0 0 800 400" class="mx-auto">
              <!-- Grid lines -->
              {#each [0, 25, 50, 75, 100] as y}
                <line
                  x1="60"
                  y1={350 - y * 2.5}
                  x2="760"
                  y2={350 - y * 2.5}
                  stroke="#e5e7eb"
                  stroke-width="1"
                />
                <text x="45" y={355 - y * 2.5} font-size="12" text-anchor="end" fill="#6b7280">
                  {y}%
                </text>
              {/each}

              <!-- Axes -->
              <line x1="60" y1="350" x2="760" y2="350" stroke="#374151" stroke-width="2" />
              <line x1="60" y1="350" x2="60" y2="100" stroke="#374151" stroke-width="2" />

              <!-- X-axis labels -->
              {#each [0, 0.25, 0.5, 0.75, 1] as fraction}
                {@const latValue = Math.round(minLat + latRange * fraction)}
                {@const xPos = 60 + 700 * fraction}
                <text x={xPos} y="370" font-size="12" text-anchor="middle" fill="#6b7280">
                  {latValue}ms
                </text>
              {/each}

              <!-- Data line -->
              <polyline
                {points}
                fill="none"
                stroke="#3b82f6"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <!-- Current threshold marker -->
              {#if threshold >= minLat && threshold <= maxLat}
                {@const throttledY = 350 - Number(throttledPercentage) * 2.5}
                <!-- Vertical line (threshold) -->
                <line
                  x1={thresholdX}
                  y1="100"
                  x2={thresholdX}
                  y2="350"
                  stroke="#ef4444"
                  stroke-width="2"
                  stroke-dasharray="5,5"
                />
                <text
                  x={thresholdX}
                  y="90"
                  font-size="12"
                  text-anchor="middle"
                  fill="#ef4444"
                  font-weight="bold"
                >
                  Current: {threshold}ms
                </text>

                <!-- Horizontal line (throttled %) -->
                <line
                  x1="60"
                  y1={throttledY}
                  x2="760"
                  y2={throttledY}
                  stroke="#ef4444"
                  stroke-width="2"
                  stroke-dasharray="5,5"
                />
                <text
                  x="750"
                  y={throttledY - 5}
                  font-size="12"
                  text-anchor="end"
                  fill="#ef4444"
                  font-weight="bold"
                >
                  {throttledPercentage}%
                </text>
              {/if}

              <!-- Axis labels -->
              <text
                x="400"
                y="395"
                font-size="14"
                text-anchor="middle"
                fill="#374151"
                font-weight="bold"
              >
                Latency (milliseconds)
              </text>
              <text
                x="-225"
                y="20"
                font-size="14"
                text-anchor="middle"
                fill="#374151"
                font-weight="bold"
                transform="rotate(-90)"
              >
                Throttled %
              </text>
            </svg>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
