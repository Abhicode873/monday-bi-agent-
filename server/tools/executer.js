const {
  count,
  sum,
  average,
  filter,
  groupBy,
  topN,
  min,
  max,
} = require("./biTools");


// ==================================================
// Execute a SINGLE BI operation
// ==================================================

function executeSingleOperation(
  operation,
  data,
  currentItems = null
) {
  // ----------------------------------------------
  // Validate operation
  // ----------------------------------------------

  if (!operation || typeof operation !== "object") {
    throw new Error("Invalid BI operation");
  }

  if (!operation.tool) {
    throw new Error("BI operation did not specify a tool");
  }

  // ----------------------------------------------
  // Unsupported question
  // ----------------------------------------------

  if (operation.tool === "unsupported") {
    return {
      success: false,
      message:
        operation.reason ||
        "Question is unsupported",
    };
  }

  // ----------------------------------------------
  // Validate dataset
  // ----------------------------------------------

  if (!operation.dataset) {
    throw new Error(
      "BI operation did not specify a dataset"
    );
  }

  const dataset = data[operation.dataset];

  if (
    !dataset ||
    !Array.isArray(dataset.items)
  ) {
    throw new Error(
      `Dataset '${operation.dataset}' was not found`
    );
  }

  // ----------------------------------------------
  // Use filtered records when available
  // Otherwise use complete dataset
  // ----------------------------------------------

  const items =
    currentItems !== null
      ? currentItems
      : dataset.items;


  // ==================================================
  // TOOL SWITCH
  // ==================================================

  switch (operation.tool) {

    // ----------------------------------------------
    // COUNT
    // ----------------------------------------------

    case "count":

      return {
        tool: "count",
        result: count(items),
      };


    // ----------------------------------------------
    // SUM
    // ----------------------------------------------

    case "sum":

      if (!operation.field) {
        throw new Error(
          "sum requires a field"
        );
      }

      return {
        tool: "sum",
        field: operation.field,
        result: sum(
          items,
          operation.field
        ),
      };


    // ----------------------------------------------
    // AVERAGE
    // ----------------------------------------------

    case "average":

      if (!operation.field) {
        throw new Error(
          "average requires a field"
        );
      }

      return {
        tool: "average",
        field: operation.field,
        result: average(
          items,
          operation.field
        ),
      };


    // ----------------------------------------------
    // FILTER
    // ----------------------------------------------

    case "filter": {

      if (!operation.field) {
        throw new Error(
          "filter requires a field"
        );
      }

      const filteredItems =
        filter(
          items,
          operation.field,
          operation.value
        );

      return {
        tool: "filter",
        field: operation.field,
        value: operation.value,
        result: filteredItems,
      };
    }


    // ----------------------------------------------
    // GROUP BY
    // ----------------------------------------------

    case "groupBy": {

      if (!operation.field) {
        throw new Error(
          "groupBy requires a field"
        );
      }

      // IMPORTANT:
      // Use operation.field, NOT plan.field
      const grouped =
        groupBy(
          items,
          operation.field
        );

      // Convert grouped records into counts
      // Example:
      // {
      //   Open: 49,
      //   Won: 165,
      //   Dead: 127
      // }

      const counts =
        Object.fromEntries(
          Object.entries(grouped).map(
            ([group, records]) => [
              group,
              Array.isArray(records)
                ? records.length
                : 0,
            ]
          )
        );

      return {
        tool: "groupBy",
        field: operation.field,
        result: counts,
      };
    }


    // ----------------------------------------------
    // TOP N
    // ----------------------------------------------

    case "topN":

      if (!operation.field) {
        throw new Error(
          "topN requires a field"
        );
      }

      if (
        operation.n === undefined ||
        Number(operation.n) <= 0
      ) {
        throw new Error(
          "topN requires a positive n value"
        );
      }

      return {
        tool: "topN",
        field: operation.field,
        n: Number(operation.n),
        result: topN(
          items,
          operation.field,
          Number(operation.n)
        ),
      };


    // ----------------------------------------------
    // MIN
    // ----------------------------------------------

    case "min":

      if (!operation.field) {
        throw new Error(
          "min requires a field"
        );
      }

      return {
        tool: "min",
        field: operation.field,
        result: min(
          items,
          operation.field
        ),
      };


    // ----------------------------------------------
    // MAX
    // ----------------------------------------------

    case "max":

      if (!operation.field) {
        throw new Error(
          "max requires a field"
        );
      }

      return {
        tool: "max",
        field: operation.field,
        result: max(
          items,
          operation.field
        ),
      };


    // ----------------------------------------------
    // UNKNOWN TOOL
    // ----------------------------------------------

    default:

      throw new Error(
        `Unknown BI tool: ${operation.tool}`
      );
  }
}


// ==================================================
// Execute COMPLETE BI PLAN
// ==================================================

function executePlan(plan, data) {

  // ----------------------------------------------
  // Validate plan
  // ----------------------------------------------

  if (!plan || typeof plan !== "object") {
    throw new Error(
      "Invalid BI plan"
    );
  }

  if (!plan.tool && !Array.isArray(plan.operations)) {
    throw new Error(
      "BI plan did not specify a tool or operations"
    );
  }


  // ----------------------------------------------
  // Unsupported question
  // ----------------------------------------------

  if (
    plan.tool === "unsupported"
  ) {
    return {
      success: false,
      message:
        plan.reason ||
        "Question is unsupported",
    };
  }


  // ==================================================
  // MULTI-STEP PLAN
  // ==================================================

  if (
    Array.isArray(plan.operations)
  ) {

    if (plan.operations.length === 0) {
      throw new Error(
        "BI plan contains no operations"
      );
    }

    let currentItems = null;

    let finalResult = null;

    const results = [];


    for (
      const operation
      of plan.operations
    ) {

      const result =
        executeSingleOperation(
          operation,
          data,
          currentItems
        );

      results.push(result);

      finalResult = result;


      // --------------------------------------------
      // Pass filtered records to next operation
      // --------------------------------------------

      if (
        operation.tool === "filter"
      ) {

        currentItems =
          result.result;
      }
    }


    return {
      tool: "operations",

      operations: results,

      result:
        finalResult
          ? finalResult.result
          : null,
    };
  }


  // ==================================================
  // SINGLE-STEP PLAN
  // ==================================================

  return executeSingleOperation(
    plan,
    data
  );
}


// ==================================================
// EXPORTS
// ==================================================

module.exports = {
  executePlan,
  executeSingleOperation,
};