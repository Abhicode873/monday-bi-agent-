**#MONDAY BI AGENT** 
An AI-powered Business Intelligence Agent that allows founders and executives to ask natural-language questions about Monday.com Deals and Work Orders data.

The system uses Gemini to understand the user's question and convert it into a structured BI operation. Deterministic BI tools then perform the actual calculation and return a concise business answer.

**Features**
• Natural-language querying of business data
• Monday.com Deals and Work Orders integration
• AI-powered query planning using Gemini
• Deterministic BI operations
• Handling of missing/null and inconsistent data
• Conversational React interface
• Error handling and validation
• Hosted frontend and backend

**Supported BI Operations**
count — count records
sum — calculate totals
average — calculate averages
min — find minimum values
max — find maximum values
filter — filter records by field/value
groupBy — group records by a field
topN — return top N records by value

**Example questions:**
• How many deals do we have?
• What is the total deal value?
• What is the average deal value?
• What is the maximum deal value?
• Show me the top 5 deals by value.
• Show me all open deals.
• Show me the breakdown of deals by status.


**Architecture**
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


**Technology Stack**
Frontend: React, Vite, JavaScript, CSS, Lucide React
Backend: Node.js, Express.js, Axios, CORS, dotenv
AI: Google Gemini API
Data: Monday.com API
Deployment: Vercel (Frontend), Render (Backend), GitHub (Source Code)

**Project Structure**
monday-bi-agent/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
├── server/
│   ├── services/
│   │   ├── agent.js
│   │   └── monday.js
│   ├── tools/
│   │   ├── biTools.js
│   │   ├── dealmetrics.js
│   │   ├── executer.js
│   │   ├── metrics.js
│   │   ├── responseFormatter.js
│   │   └── workOrderMetrics.js
│   ├── utils/
│   │   └── normalizer.js
│   ├── server.js
│   └── package.json
└── .gitignore


**Setup**
**1. Clone:**
git clone https://github.com/Abhicode873/monday-bi-agent-.git
cd monday-bi-agent-

**2. Backend:**
cd server
npm install

Create server/.env:
GEMINI_API_KEY=your_gemini_api_key
MONDAY_API_TOKEN=your_monday_api_token
MONDAY_DEAL_BOARD_ID=your_deals_board_id
MONDAY_WORK_ORDER_BOARD_ID=your_work_orders_board_id

Start:
npm start

**3. Frontend:**
cd client
npm install
npm run dev

Do not commit .env or API credentials to GitHub.


**API**
Main endpoint:
GET /api/agent/execute

Example:
 /api/agent/execute?question=What%20is%20the%20maximum%20deal%20value

Example response:
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


**Data Handling**
The application handles missing values, null fields, numeric values stored as strings, inconsistent dates, and inconsistent text values. 
A normalization layer prepares data before BI operations are executed.

**Deployment**
Frontend: Vercel — React + Vite
Backend: Render — Node.js + Express
Source Code: GitHub

Environment variables and API credentials are configured on the deployment platform and are not committed to GitHub.

**Assignment Scope**
The implementation focuses on Monday.com integration, natural-language business queries,
AI-based query planning, deterministic BI calculations, data resilience, a conversational interface, 
error handling, and a hosted prototype.The architecture can be extended with advanced trend analysis, automated leadership reports, richer visualizations,
and more complex cross-board analytics.
