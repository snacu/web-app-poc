# FlowIQ

A visual tool for simulating and analyzing request throttling to help you choose optimal thresholds for service protection.

## Overview

FlowIQ helps you understand the impact of different throttling thresholds on your service by:
- Capturing and displaying incoming HTTP requests with detailed timing information
- Visualizing throttling percentages with interactive charts
- Analyzing latency patterns to find the optimal threshold
- Providing real-time feedback on throttling decisions

## Features

### 📊 Request Tracking
- **Real-time monitoring** - See requests as they arrive
- **Detailed metadata** - View headers, body, method, URL path, and timestamps
- **Timing information** - Track time since first request with millisecond precision
- **Color-coded status** - Green for normal, red for throttled requests

### 📈 Visualizations
- **Pie Chart** - Distribution of normal vs throttled requests
- **Latency Chart** - Interactive graph showing throttled percentage at different thresholds
- **Live Updates** - Charts update in real-time as you adjust the threshold

### ⚙️ Interactive Controls
- **Adjustable Threshold** - Change the throttling threshold and see immediate impact
- **Delete Entries** - Remove individual requests from the dataset
- **Refresh Data** - Reload the latest requests
- **Copy Functions** - One-click copy for request bodies and headers

## Technology Stack

- **Frontend**: Svelte 5 + SvelteKit
- **Styling**: Tailwind CSS v4
- **Database**: LowDB (in-memory)
- **Syntax Highlighting**: svelte-highlight (Oceanic Next theme)
- **Server**: Node.js with adapter-node

## Getting Started

### Prerequisites

1. **Node.js** - Version 24 or higher
2. **HTTPie** - For sending test requests
```sh
brew install httpie
```

### Installation

1. Clone the repository:
```sh
git clone https://github.com/snacu/web-app-poc.git
cd web-app-poc
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

The app will be available at `http://localhost:5173`

### Generating Test Data

Send requests to populate the application:

```sh
# Send 100 requests locally
node scripts/send-requests-local.js 100
```

## API Endpoints

### POST `/data/{id}`
Store a request with body and headers.

**Example:**
```sh
http POST http://localhost:5173/data/req-1 \
  Content-Type:application/json \
  X-Custom-Header:"custom-value" \
  message="example request"
```

**Response:**
```json
{
  "success": true,
  "id": "req-1",
  "stored": {
    "body": { "message": "example request" },
    "headers": { "content-type": "application/json", ... },
    "method": "POST",
    "url": "http://localhost:5173/data/req-1",
    "timestamp": "2025-11-02T19:47:23.456Z"
  }
}
```

### GET `/data/{id}`
Retrieve a stored request by ID.

### DELETE `/data/{id}`
Delete a request from the database.

### GET `/info`
Get server information.
Used also as Cloudflare monitor health info

**Response:**
```json
{
  "up_since": 42,
  "version": "0.0.1"
}
```

## Configuration

### Environment Variables

- `BASE_URL` - Base URL for the application (used in HTTPie examples)
  - Default: `http://localhost:5173`
- `MAX_ENTRIES` - number of the most recent requests rendered by the app
- `PORT` - Server port (set automatically by hosting platforms)


## Development

### Available Scripts

```sh
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production server
npm run preview  # Preview production build
npm run format   # Format code with Prettier
npm run lint     # Check code quality
npm run test     # Run tests
```

### Using Make

```sh
make dev         # Start development server
make format      # Format code
make test        # Run tests
```

## Project Structure

```
/Users/snacu/dev/poc-web-app/
├── src/
│   ├── routes/
│   │   ├── +page.svelte           # Main UI (tabs, request list, charts)
│   │   ├── +page.server.js        # Server-side data loading
│   │   ├── +layout.svelte         # App layout with Tailwind
│   │   ├── data/[id]/
│   │   │   └── +server.js         # API endpoints (POST, GET, DELETE)
│   │   └── info/
│   │       └── +server.js         # Server info endpoint
│   ├── lib/
│   │   ├── db.js                  # LowDB configuration
│   │   └── assets/
│   │       └── favicon.svg        # Shield icon with arrows
│   └── app.html                   # HTML template
├── scripts/
│   ├── send-requests.js           # Generate remote requests
│   ├── send-requests-local.js     # Generate local requests
│   └── send-rq                    # Helper script
├── static/                         # Static assets
├── Makefile                        # Make commands
├── Procfile                        # Heroku configuration
└── package.json                    # Dependencies and scripts
```

## Usage Tips

### Finding the Optimal Threshold

1. **Generate realistic load** - Use the scripts to simulate your expected traffic pattern
2. **Switch to Visualize tab** - View the pie chart and latency graph
3. **Adjust the threshold** - Use the input to test different values
4. **Observe the chart** - The line graph shows how throttling changes with different thresholds
5. **Check the percentage** - Aim for a throttling rate that balances protection and user experience

### Understanding the Metrics

- **Since First Seen** (Green/Red badge) - Time elapsed since the first request in milliseconds
  - Green: Below threshold
  - Red: Above threshold (would be throttled)
- **Throttled %** - Percentage of requests that exceed the current threshold
- **Timestamp** - Exact time when the request was received (with millisecond precision)
