require("dotenv").config();

const express = require("express");
const cors = require("cors");

// ============================================
// BI TOOLS
// ============================================

const {
  count,
  sum,
  average,
  filter,
  groupBy,
  topN,
  min,
  max,
} = require("./tools/biTools");

// ============================================
// MONDAY.COM SERVICES
// ============================================

const {
  mondayQuery,
  getBoard,
  getBothBoards,
} = require("./services/monday");

// ============================================
// DATA NORMALIZER
// ============================================

const {
  normalizeBothBoards,
} = require("./utils/normalizer");

// ============================================
// AI PLANNER
// ============================================

const {
  planQuestion,
} = require("./services/agent");

// ============================================
// BI EXECUTOR
// ============================================

const {
  executePlan,
} = require("./tools/executer");

// ============================================
// RESPONSE FORMATTER
// ============================================

const {
  formatResult,
} = require("./tools/responseFormatter");

// ============================================
// EXPRESS APP
// ============================================

const app = express();

// Use Vercel/hosting PORT when available
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json());

// ============================================
// HEALTH CHECK
// ============================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Monday BI Agent backend is running",
  });
});

// ============================================
// FETCH BOTH MONDAY.COM BOARDS
// ============================================

app.get("/api/monday/boards", async (req, res) => {
  try {
    console.log(
      "Deals Board ID:",
      process.env.MONDAY_DEAL_BOARD_ID
    );

    console.log(
      "Work Orders Board ID:",
      process.env.MONDAY_WORK_ORDER_BOARD_ID
    );

    const boards = await getBothBoards();

    const normalizedBoards =
      normalizeBothBoards(boards);

    res.json({
      success: true,
      boards: normalizedBoards,
    });

  } catch (error) {
    console.error(
      "Monday boards error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch Monday.com boards",
      error: error.message,
    });
  }
});

// ============================================
// TEST MONDAY.COM API CONNECTION
// ============================================

app.get("/api/monday/test", async (req, res) => {
  try {
    const query = `
      query {
        me {
          id
          name
          email
        }
      }
    `;

    const data =
      await mondayQuery(query);

    res.json({
      success: true,
      message:
        "Monday.com API connection successful",
      user: data.me,
    });

  } catch (error) {
    console.error(
      "Monday test error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        "Monday.com API connection failed",
      error: error.message,
    });
  }
});

// ============================================
// TEST SINGLE MONDAY BOARD
// ============================================

app.get(
  "/api/monday/board/:boardId",
  async (req, res) => {
    try {
      const { boardId } = req.params;

      const data =
        await getBoard(boardId);

      res.json({
        success: true,
        board: data.boards[0],
      });

    } catch (error) {
      console.error(
        "Board fetch error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch Monday.com board",
        error: error.message,
      });
    }
  }
);

// ============================================
// BI TOOLS TEST
// ============================================

app.get("/api/bi/test", async (req, res) => {
  try {
    // Fetch Monday data
    const rawData =
      await getBothBoards();

    // Normalize data
    const data =
      normalizeBothBoards(rawData);

    const deals =
      data.deals.items;

    const workOrders =
      data.workOrders.items;

    // Top 5 deals
    const topDeals =
      topN(
        deals,
        "dealValue",
        5
      );

    // Open deals
    const openDeals =
      filter(
        deals,
        "dealStatus",
        "Open"
      );

    // Build result
    const result = {
      deals: {
        total:
          count(deals),

        open:
          count(openDeals),

        totalDealValue:
          sum(
            deals,
            "dealValue"
          ),

        openDealValue:
          sum(
            openDeals,
            "dealValue"
          ),

        averageDealValue:
          average(
            deals,
            "dealValue"
          ),
      },

      workOrders: {
        total:
          count(workOrders),
      },

      dealsByStatus:
        Object.fromEntries(
          Object.entries(
            groupBy(
              deals,
              "dealStatus"
            )
          ).map(
            ([status, items]) => [
              status,
              count(items),
            ]
          )
        ),

      topDealsByValue:
        topDeals.map(
          (deal) => ({
            id: deal.id,
            name: deal.name,
            dealValue:
              deal.dealValue,
          })
        ),
    };

    res.json({
      success: true,
      result,
    });

  } catch (error) {
    console.error(
      "BI Test Error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        "BI tools test failed",
      error: error.message,
    });
  }
});

// ============================================
// AI PLANNER TEST
// ============================================

app.get(
  "/api/agent/test",
  async (req, res) => {
    try {
      const question =
        req.query.question ||
        "What is the total deal value?";

      console.log(
        "===================================="
      );

      console.log(
        "Agent question:",
        question
      );

      // Gemini creates the plan
      const plan =
        await planQuestion(question);

      console.log(
        "Gemini plan:"
      );

      console.log(
        JSON.stringify(
          plan,
          null,
          2
        )
      );

      // Validate planner output
      if (
        !plan ||
        typeof plan !== "object" ||
        !plan.tool
      ) {
        throw new Error(
          "Gemini planner did not return a valid BI plan"
        );
      }

      res.json({
        success: true,
        question,
        plan,
      });

    } catch (error) {
      console.error(
        "Agent Test Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Agent planner test failed",
        error: error.message,
      });
    }
  }
);

// ============================================
// AI AGENT EXECUTION
// PLAN → EXECUTOR → FORMATTER
// ============================================

app.get(
  "/api/agent/execute",
  async (req, res) => {

    try {

      // ----------------------------------------
      // STEP 1: GET USER QUESTION
      // ----------------------------------------

      const question =
        req.query.question ||
        "What is the total deal value?";

      console.log(
        "===================================="
      );

      console.log(
        "AGENT EXECUTION STARTED"
      );

      console.log(
        "Question:",
        question
      );

      // ----------------------------------------
      // STEP 2: FETCH MONDAY.COM DATA
      // ----------------------------------------

      console.log(
        "Fetching Monday.com data..."
      );

      const rawData =
        await getBothBoards();

      if (!rawData) {
        throw new Error(
          "Monday.com returned no data"
        );
      }

      // ----------------------------------------
      // STEP 3: NORMALIZE DATA
      // ----------------------------------------

      console.log(
        "Normalizing Monday.com data..."
      );

      const data =
        normalizeBothBoards(rawData);

      if (!data) {
        throw new Error(
          "Failed to normalize Monday.com data"
        );
      }

      console.log(
        "Monday.com data loaded successfully"
      );

      // ----------------------------------------
      // STEP 4: CREATE AI PLAN
      // ----------------------------------------

      console.log(
        "Sending question to Gemini..."
      );

      const plan =
        await planQuestion(question);

      console.log(
        "Gemini plan:"
      );

      console.log(
        JSON.stringify(
          plan,
          null,
          2
        )
      );

      // ----------------------------------------
      // SAFETY CHECK
      // ----------------------------------------

      if (
        !plan ||
        typeof plan !== "object" ||
        !plan.tool
      ) {
        throw new Error(
          "Gemini planner did not return a valid BI plan"
        );
      }

      console.log(
        "Validated plan:",
        plan.tool
      );

      // ----------------------------------------
      // STEP 5: EXECUTE BI PLAN
      // ----------------------------------------

      console.log(
        "Executing BI tool:",
        plan.tool
      );

      const result =
        executePlan(
          plan,
          data
        );

      if (!result) {
        throw new Error(
          "BI executor returned no result"
        );
      }

      console.log(
        "Execution result:"
      );

      console.log(
        JSON.stringify(
          result,
          null,
          2
        )
      );

      // ----------------------------------------
      // STEP 6: FORMAT RESPONSE
      // ----------------------------------------

      console.log(
        "Formatting response..."
      );

      const answer =
        formatResult(
          plan,
          result
        );

      console.log(
        "Final answer:",
        answer
      );

      // ----------------------------------------
      // STEP 7: SEND RESPONSE
      // ----------------------------------------

      res.json({
        success: true,
        question,
        answer,
        plan,
        result,
      });

      console.log(
        "AGENT EXECUTION COMPLETED"
      );

      console.log(
        "===================================="
      );

    } catch (error) {

      console.error(
        "===================================="
      );

      console.error(
        "Agent Execute Error:",
        error.message
      );

      console.error(
        error.stack
      );

      console.error(
        "===================================="
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to execute BI agent request",
        error: error.message,
      });
    }
  }
);

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {

  console.log(
    "===================================="
  );

  console.log(
    `Server running on http://localhost:${PORT}`
  );

  console.log(
    "Monday BI Agent backend ready"
  );

  console.log(
    "===================================="
  );

});