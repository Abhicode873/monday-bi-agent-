// ============================================================
// Monday BI Agent - Planner
// ============================================================

// ------------------------------------------------------------
// AVAILABLE TOOLS
// ------------------------------------------------------------

const AVAILABLE_TOOLS = {
  count: {
    description: "Count records in a dataset",
    parameters: ["dataset"],
  },

  sum: {
    description: "Calculate the total of a numeric field",
    parameters: ["dataset", "field"],
  },

  average: {
    description: "Calculate the average of a numeric field",
    parameters: ["dataset", "field"],
  },

  filter: {
    description: "Filter records by a field and value",
    parameters: ["dataset", "field", "value"],
  },

  groupBy: {
    description: "Group records by a field",
    parameters: ["dataset", "field"],
  },

  topN: {
    description: "Return the highest N records by a numeric field",
    parameters: ["dataset", "field", "n"],
  },

  min: {
    description: "Find the minimum value of a numeric field",
    parameters: ["dataset", "field"],
  },

  max: {
    description: "Find the maximum value of a numeric field",
    parameters: ["dataset", "field"],
  },
};


// ------------------------------------------------------------
// VALID DATASETS AND FIELDS
// ------------------------------------------------------------

const DATASET_FIELDS = {
  deals: [
    "ownerCode",
    "clientCode",
    "dealStatus",
    "closeDate",
    "closeProbability",
    "dealValue",
    "tentativeCloseDate",
    "dealStage",
    "productDeal",
    "sector",
    "createdDate",
  ],

  workOrders: [
    "customerNameCode",
    "serialNumber",
    "natureOfWork",
    "executionStatus",
    "dataDeliveryDate",
    "poDate",
    "probableStartDate",
    "probableEndDate",
    "sector",
    "amountExclGST",
    "amountInclGST",
    "billedValueExclGST",
    "billedValue",
    "collectedAmount",
    "amountToBeBilledExclGST",
    "amountToBeBilled",
    "amountReceivable",
    "quantityByOps",
    "quantityBilled",
    "balanceQuantity",
    "invoiceStatus",
    "expectedBillingMonth",
    "actualBillingMonth",
    "actualCollectionMonth",
    "collectionStatus",
    "billingStatus",
  ],
};


// ------------------------------------------------------------
// GEMINI CLIENT
// ------------------------------------------------------------

let geminiClient = null;

async function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured in .env"
    );
  }

  if (!geminiClient) {
    const { GoogleGenAI } = await import("@google/genai");

    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  return geminiClient;
}


// ------------------------------------------------------------
// HELPER
// ------------------------------------------------------------

function makePlan(
  tool,
  dataset,
  field = null,
  value = null,
  n = null
) {
  return {
    tool,
    dataset,
    field,
    value,
    n,
  };
}


// ------------------------------------------------------------
// DETERMINISTIC PLANNER
// ------------------------------------------------------------
// Handles common questions WITHOUT Gemini.
// This prevents errors for predictable BI questions.
// ------------------------------------------------------------

function deterministicPlan(question) {
  const q = question
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

  // ==========================================================
  // DEAL QUESTIONS
  // ==========================================================

  if (
    q.includes("how many deals") ||
    q.includes("number of deals") ||
    q.includes("count of deals")
  ) {

    // ----------------------------
    // WON DEALS
    // ----------------------------

    if (
      q.includes("won") ||
      q.includes("marked as won") ||
      q.includes("status won")
    ) {
      return {
        operations: [
          makePlan(
            "filter",
            "deals",
            "dealStatus",
            "Won"
          ),
          makePlan(
            "count",
            "deals"
          ),
        ],
      };
    }

    // ----------------------------
    // OPEN DEALS
    // ----------------------------

    if (q.includes("open")) {
      return {
        operations: [
          makePlan(
            "filter",
            "deals",
            "dealStatus",
            "Open"
          ),
          makePlan(
            "count",
            "deals"
          ),
        ],
      };
    }

    // ----------------------------
    // DEAD DEALS
    // ----------------------------

    if (q.includes("dead")) {
      return {
        operations: [
          makePlan(
            "filter",
            "deals",
            "dealStatus",
            "Dead"
          ),
          makePlan(
            "count",
            "deals"
          ),
        ],
      };
    }

    // ----------------------------
    // ON HOLD DEALS
    // ----------------------------

    if (
      q.includes("on hold") ||
      q.includes("on-hold")
    ) {
      return {
        operations: [
          makePlan(
            "filter",
            "deals",
            "dealStatus",
            "On Hold"
          ),
          makePlan(
            "count",
            "deals"
          ),
        ],
      };
    }

    // ----------------------------
    // ALL DEALS
    // ----------------------------

    return makePlan(
      "count",
      "deals"
    );
  }


  // ==========================================================
  // TOTAL DEAL VALUE
  // ==========================================================

  if (
    q.includes("total deal value") ||
    q.includes("sum of deal value") ||
    q.includes("total value of deals")
  ) {
    return makePlan(
      "sum",
      "deals",
      "dealValue"
    );
  }


  // ==========================================================
  // AVERAGE DEAL VALUE
  // ==========================================================

  if (
    q.includes("average deal value") ||
    q.includes("average value of deals") ||
    q.includes("mean deal value")
  ) {
    return makePlan(
      "average",
      "deals",
      "dealValue"
    );
  }


  // ==========================================================
  // MINIMUM DEAL VALUE
  // ==========================================================

  if (
    q.includes("minimum deal value") ||
    q.includes("minimum value") ||
    q.includes("lowest deal value") ||
    q.includes("lowest value")
  ) {
    return makePlan(
      "min",
      "deals",
      "dealValue"
    );
  }


  // ==========================================================
  // MAXIMUM DEAL VALUE
  // ==========================================================

  if (
    q.includes("maximum deal value") ||
    q.includes("maximum value") ||
    q.includes("highest deal value") ||
    q.includes("highest value")
  ) {
    return makePlan(
      "max",
      "deals",
      "dealValue"
    );
  }


  // ==========================================================
  // TOP N DEALS
  // ==========================================================

  const topMatch = q.match(
    /top\s+(\d+)\s+deals?.*(value|deal value)/
  );

  if (topMatch) {
    const n = Number(topMatch[1]);

    return makePlan(
      "topN",
      "deals",
      "dealValue",
      null,
      n
    );
  }


  // ==========================================================
  // OPEN DEALS
  // ==========================================================

  if (
    q.includes("show me all open deals") ||
    q.includes("show all open deals") ||
    q.includes("list all open deals")
  ) {
    return makePlan(
      "filter",
      "deals",
      "dealStatus",
      "Open"
    );
  }


  // ==========================================================
  // WON DEALS LIST
  // ==========================================================

  if (
    q.includes("show me all won deals") ||
    q.includes("show all won deals") ||
    q.includes("list all won deals")
  ) {
    return makePlan(
      "filter",
      "deals",
      "dealStatus",
      "Won"
    );
  }


  // ==========================================================
  // DEAD DEALS LIST
  // ==========================================================

  if (
    q.includes("show me all dead deals") ||
    q.includes("show all dead deals")
  ) {
    return makePlan(
      "filter",
      "deals",
      "dealStatus",
      "Dead"
    );
  }


  // ==========================================================
  // BREAKDOWN BY STATUS
  // ==========================================================

  if (
    q.includes("breakdown of deals by status") ||
    q.includes("breakdown by status") ||
    q.includes("deals by status") ||
    q.includes("deal status breakdown")
  ) {
    return makePlan(
      "groupBy",
      "deals",
      "dealStatus"
    );
  }


  // ==========================================================
  // BREAKDOWN BY SECTOR
  // ==========================================================

  if (
    q.includes("breakdown of deals by sector") ||
    q.includes("breakdown by sector") ||
    q.includes("deals by sector") ||
    q.includes("deal sector breakdown")
  ) {
    return makePlan(
      "groupBy",
      "deals",
      "sector"
    );
  }


  // ==========================================================
  // BREAKDOWN BY DEAL STAGE
  // ==========================================================

  if (
    q.includes("breakdown of deals by stage") ||
    q.includes("breakdown by stage") ||
    q.includes("deals by stage") ||
    q.includes("deal stage breakdown")
  ) {
    return makePlan(
      "groupBy",
      "deals",
      "dealStage"
    );
  }


  // ==========================================================
  // BREAKDOWN BY PRODUCT
  // ==========================================================

  if (
    q.includes("breakdown by product") ||
    q.includes("deals by product") ||
    q.includes("product breakdown")
  ) {
    return makePlan(
      "groupBy",
      "deals",
      "productDeal"
    );
  }


  // ==========================================================
  // WORK ORDER QUESTIONS
  // ==========================================================

  if (
    q.includes("work orders") &&
    (
      q.includes("how many") ||
      q.includes("count")
    )
  ) {
    return makePlan(
      "count",
      "workOrders"
    );
  }


  return null;
}


// ------------------------------------------------------------
// GEMINI PLANNER PROMPT
// ------------------------------------------------------------

function buildPlannerPrompt(userQuestion) {
  return `
You are the planning layer of a Monday.com Business Intelligence Agent.

Your job is ONLY to understand the user's question and select
the correct deterministic BI tool or sequence of tools.

You MUST return valid JSON.

AVAILABLE DATASETS:
- deals
- workOrders

AVAILABLE TOOLS:
${JSON.stringify(AVAILABLE_TOOLS, null, 2)}

DEALS FIELDS:
${DATASET_FIELDS.deals.map((x) => `- ${x}`).join("\n")}

WORK ORDER FIELDS:
${DATASET_FIELDS.workOrders.map((x) => `- ${x}`).join("\n")}

USER QUESTION:
${userQuestion}

==================================================
SINGLE TOOL
==================================================

Use this format:

{
  "tool": "toolName",
  "dataset": "deals",
  "field": "dealValue",
  "value": null,
  "n": null
}

==================================================
MULTI STEP
==================================================

If filtering must happen before another operation:

{
  "operations": [
    {
      "tool": "filter",
      "dataset": "deals",
      "field": "dealStatus",
      "value": "Open",
      "n": null
    },
    {
      "tool": "count",
      "dataset": "deals",
      "field": null,
      "value": null,
      "n": null
    }
  ]
}

IMPORTANT:

"How many open deals?"
MUST become:

filter dealStatus = Open
THEN count

"How many won deals?"
MUST become:

filter dealStatus = Won
THEN count

"How many dead deals?"
MUST become:

filter dealStatus = Dead
THEN count

"Show me all open deals"
MUST become:

filter dealStatus = Open

"Show me the breakdown of deals by status"
MUST become:

groupBy dealStatus

"Show me the breakdown of deals by sector"
MUST become:

groupBy sector

"Show me the top 5 deals by value"
MUST become:

topN deals dealValue n=5

"What is the total deal value?"
MUST become:

sum deals dealValue

"What is the average deal value?"
MUST become:

average deals dealValue

"What is the minimum deal value?"
MUST become:

min deals dealValue

"What is the maximum deal value?"
MUST become:

max deals dealValue

RULES:

1. Use only available tools.
2. Use only available datasets.
3. Use only available fields.
4. Never invent a field.
5. Never calculate the final answer.
6. For filtering followed by another operation, use operations.
7. Execute operations in order.
8. For top N use topN.
9. For total use sum.
10. For count use count.
11. For average use average.
12. For breakdown/category questions use groupBy.
13. For minimum/lowest use min.
14. For maximum/highest use max.
15. Return ONLY JSON.
16. If unsupported, return:

{
  "tool": "unsupported",
  "reason": "Brief explanation"
}
`;
}


// ------------------------------------------------------------
// CREATE PLAN WITH GEMINI
// ------------------------------------------------------------

async function createPlan(userQuestion) {
  const ai = await getGeminiClient();

  const prompt = buildPlannerPrompt(userQuestion);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",

      contents: prompt,

      config: {
        temperature: 0,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error(
        "Gemini returned an empty response"
      );
    }

    console.log(
      "Gemini planner response:",
      text
    );

    let plan;

    try {
      plan = JSON.parse(text);
    } catch (error) {
      throw new Error(
        `Gemini returned invalid JSON: ${text}`
      );
    }

    return plan;

  } catch (error) {
    console.error(
      "Gemini Planner Error:",
      error.message
    );

    throw error;
  }
}


// ------------------------------------------------------------
// VALIDATE SINGLE OPERATION
// ------------------------------------------------------------

function validateOperation(operation) {
  if (
    !operation ||
    typeof operation !== "object"
  ) {
    throw new Error(
      "Invalid BI operation"
    );
  }

  if (!operation.tool) {
    throw new Error(
      "BI operation did not specify a tool"
    );
  }

  if (operation.tool === "unsupported") {
    return operation;
  }

  if (!AVAILABLE_TOOLS[operation.tool]) {
    throw new Error(
      `Planner selected an unavailable tool: ${operation.tool}`
    );
  }

  const allowedDatasets = [
    "deals",
    "workOrders",
  ];

  if (
    !allowedDatasets.includes(
      operation.dataset
    )
  ) {
    throw new Error(
      `Planner selected an invalid dataset: ${operation.dataset}`
    );
  }

  const parameters =
    AVAILABLE_TOOLS[
      operation.tool
    ].parameters;

  // ------------------------------------------
  // FIELD VALIDATION
  // ------------------------------------------

  if (parameters.includes("field")) {

    if (!operation.field) {
      throw new Error(
        `Tool ${operation.tool} requires a field`
      );
    }

    const validFields =
      DATASET_FIELDS[
        operation.dataset
      ];

    if (
      !validFields.includes(
        operation.field
      )
    ) {
      throw new Error(
        `Invalid field '${operation.field}' for dataset '${operation.dataset}'`
      );
    }
  }

  // ------------------------------------------
  // TOP N VALIDATION
  // ------------------------------------------

  if (operation.tool === "topN") {

    if (
      operation.n === null ||
      operation.n === undefined ||
      Number(operation.n) <= 0
    ) {
      throw new Error(
        "topN requires a positive n value"
      );
    }

    operation.n = Number(operation.n);
  }

  return {
    tool: operation.tool,
    dataset: operation.dataset,
    field:
      operation.field ?? null,
    value:
      operation.value ?? null,
    n:
      operation.n ?? null,
  };
}


// ------------------------------------------------------------
// VALIDATE COMPLETE PLAN
// ------------------------------------------------------------

function validatePlan(plan) {

  if (
    !plan ||
    typeof plan !== "object"
  ) {
    throw new Error(
      "Invalid planner response"
    );
  }


  // ------------------------------------------
  // UNSUPPORTED
  // ------------------------------------------

  if (
    plan.tool === "unsupported"
  ) {
    return plan;
  }


  // ------------------------------------------
  // MULTI STEP PLAN
  // ------------------------------------------

  if (
    Array.isArray(plan.operations)
  ) {

    if (
      plan.operations.length === 0
    ) {
      throw new Error(
        "Planner returned an empty operations array"
      );
    }

    const operations =
      plan.operations.map(
        validateOperation
      );

    return {
      operations,
    };
  }


  // ------------------------------------------
  // SINGLE TOOL PLAN
  // ------------------------------------------

  if (!plan.tool) {
    throw new Error(
      "Planner did not specify a tool"
    );
  }

  return validateOperation(plan);
}


// ------------------------------------------------------------
// MAIN PLANNER
// ------------------------------------------------------------

async function planQuestion(userQuestion) {

  if (
    !userQuestion ||
    !userQuestion.trim()
  ) {
    throw new Error(
      "User question is required"
    );
  }

  console.log(
    "Planning question:",
    userQuestion
  );


  // ==========================================================
  // FIRST: TRY DETERMINISTIC PLANNER
  // ==========================================================

  const deterministic =
    deterministicPlan(
      userQuestion
    );

  if (deterministic) {

    console.log(
      "Using deterministic BI plan:"
    );

    console.log(
      JSON.stringify(
        deterministic,
        null,
        2
      )
    );

    return validatePlan(
      deterministic
    );
  }


  // ==========================================================
  // SECOND: USE GEMINI
  // ==========================================================

  const rawPlan =
    await createPlan(
      userQuestion
    );


  // ==========================================================
  // VALIDATE GEMINI PLAN
  // ==========================================================

  const validatedPlan =
    validatePlan(
      rawPlan
    );


  console.log(
    "Validated BI plan:",
    JSON.stringify(
      validatedPlan,
      null,
      2
    )
  );

  return validatedPlan;
}


// ------------------------------------------------------------
// EXPORTS
// ------------------------------------------------------------

module.exports = {
  AVAILABLE_TOOLS,
  DATASET_FIELDS,
  buildPlannerPrompt,
  createPlan,
  validateOperation,
  validatePlan,
  deterministicPlan,
  planQuestion,
};