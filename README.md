# Monday BI Agent

An AI-powered Business Intelligence Agent that allows users to ask natural-language questions about Monday.com Deals and Work Orders data.

## Features

- Natural-language querying of business data
- Monday.com Deals and Work Orders integration
- AI-powered query planning using Gemini
- Deterministic BI operations
- Handling of missing and inconsistent data
- Conversational React interface
- Error handling and validation
- Hosted frontend and backend

## Supported BI Operations

- `count` — Count records
- `sum` — Calculate totals
- `average` — Calculate averages
- `min` — Find minimum values
- `max` — Find maximum values
- `filter` — Filter records
- `groupBy` — Group records by a field
- `topN` — Return top N records by value

### Example Questions

- How many deals do we have?
- What is the total deal value?
- What is the average deal value?
- What is the maximum deal value?
- Show me the top 5 deals by value.
- Show me all open deals.
- Show me the breakdown of deals by status.

## Architecture

```text
User
  ↓
React + Vite Frontend
  ↓
Express.js Backend
  ↓
Gemini AI Planner
  ↓
BI Tools
  ↓
Monday.com Data
  ↓
Formatted Business Response

Technology Stack

1.Frontend

>>React
>>Vite
>>JavaScript
>>CSS
>>Lucide React

2.Backend

>>Node.js
>>Express.js
>>Axios
>>CORS
>>dotenv

3.AI

>>Google Gemini API

4.Data

>>Monday.com API

5.Deployment

>>Vercel — Frontend
>>Render — Backend
>>GitHub — Source Code

##Project Structure
monday-bi-agent/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
│
├── server/
│   ├── services/
│   │   ├── agent.js
│   │   └── monday.js
│   │
│   ├── tools/
│   │   ├── biTools.js
│   │   ├── dealmetrics.js
│   │   ├── executer.js
│   │   ├── metrics.js
│   │   ├── responseFormatter.js
│   │   └── workOrderMetrics.js
│   │
│   ├── utils/
│   │   └── normalizer.js
│   │
│   ├── server.js
│   └── package.json
│
└── .gitignore

Setup
1. Clone the Repository
   git clone https://github.com/Abhicode873/monday-bi-agent-.git
   cd monday-bi-agent-

2. Install Backend Dependencies
   cd server
   npm install

   Create a .env file inside the server folder:
   GEMINI_API_KEY=your_gemini_api_key
   MONDAY_API_TOKEN=your_monday_api_token
   MONDAY_DEAL_BOARD_ID=your_deals_board_id
   MONDAY_WORK_ORDER_BOARD_ID=your_work_orders_board_id

3. Start Backend
   npm start

4. Install Frontend Dependencies

Open another terminal:
    cd client
    npm install

5. Start Frontend
   npm run dev
   API keys, tokens, and .env files should never be committed to GitHub.

API

Main endpoint:
GET /api/agent/execute
Example: 
/api/agent/execute?question=What%20is%20the%20maximum%20deal%20value
respone of example:
{
  "success": true,
  "question": "What is the maximum deal value",
  "answer": "Maximum dealValue: ₹75,14,73,450",
  "plan": {
    "tool": "max",
    "dataset": "deals",
    "field": "dealValue"
  }
}

Data Handling

The application includes handling for:

>>Missing values
>>Null fields
>>Numeric values stored as strings
>>Inconsistent dates
>>Inconsistent text values
A normalization layer prepares the data before BI operations are executed.

Deployment

The project is deployed using:

>>Frontend: Vercel
>>Backend: Render
>>Source Code: GitHub

Environment variables are configured on the deployment platforms and are not stored in the repository.

Project Scope

The project focuses on:

>>Monday.com integration
>>Natural-language business queries
>>AI-based query planning
>>Deterministic BI calculations
>>Data handling and normalization
>>Conversational interface
>>Error handling
>>Deployment of the application
