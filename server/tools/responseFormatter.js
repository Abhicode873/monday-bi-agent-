// ============================================
// RESPONSE FORMATTER
// ============================================


// --------------------------------------------------
// Format Currency
// --------------------------------------------------

function formatCurrency(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "₹0";
  }

  return `₹${number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}


// --------------------------------------------------
// Format Number
// --------------------------------------------------

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}


// --------------------------------------------------
// Format Top N
// --------------------------------------------------

function formatTopN(result) {
  const records = result.result || [];

  if (!Array.isArray(records) || records.length === 0) {
    return "No records found.";
  }

  const lines = records.map((item, index) => {
    const name = item.name || `Record ${index + 1}`;

    const value = formatCurrency(
      item[result.field]
    );

    return `${index + 1}. ${name} — ${value}`;
  });

  return (
    `Top ${result.n} records by ${result.field}:\n\n` +
    lines.join("\n")
  );
}


// --------------------------------------------------
// Format Filter Result
// --------------------------------------------------

function formatFilter(result) {
  const records = result.result || [];

  if (!Array.isArray(records)) {
    return "No matching records found.";
  }

  if (records.length === 0) {
    return "No matching records found.";
  }

  return (
    `Found ${records.length} matching records ` +
    `where ${result.field} = ${result.value}.`
  );
}


// --------------------------------------------------
// Format Group By
// --------------------------------------------------

function formatGroupBy(result) {
  const groups = result.result || {};

  const entries = Object.entries(groups);

  if (entries.length === 0) {
    return "No grouped records found.";
  }

  const lines = entries.map(
    ([group, items]) => {
      const count = Array.isArray(items)
        ? items.length
        : Number(items) || 0;

      return `${group}: ${formatNumber(count)}`;
    }
  );

  return (
    `Breakdown by ${result.field}:\n\n` +
    lines.join("\n")
  );
}


// --------------------------------------------------
// Format Count
// --------------------------------------------------

function formatCount(result) {
  return `Total records: ${formatNumber(result.result)}`;
}


// --------------------------------------------------
// Format Sum
// --------------------------------------------------

function formatSum(plan, result) {
  return (
    `Total ${plan.field}: ` +
    formatCurrency(result.result)
  );
}


// --------------------------------------------------
// Format Average
// --------------------------------------------------

function formatAverage(plan, result) {
  return (
    `Average ${plan.field}: ` +
    formatCurrency(result.result)
  );
}


// --------------------------------------------------
// Format Minimum
// --------------------------------------------------

function formatMin(plan, result) {
  return (
    `Minimum ${plan.field}: ` +
    formatCurrency(result.result)
  );
}


// --------------------------------------------------
// Format Maximum
// --------------------------------------------------

function formatMax(plan, result) {
  return (
    `Maximum ${plan.field}: ` +
    formatCurrency(result.result)
  );
}


// --------------------------------------------------
// Main Response Formatter
// --------------------------------------------------

function formatResult(plan, result) {

  if (!result) {
    return "No result was returned.";
  }

  if (!plan) {
    return "No BI plan was provided.";
  }

  // Unsupported question
  if (plan.tool === "unsupported") {
    return (
      result.message ||
      plan.reason ||
      "This question is not supported."
    );
  }

  switch (plan.tool) {

    // --------------------------------------------
    // COUNT
    // --------------------------------------------

    case "count":
      return formatCount(result);


    // --------------------------------------------
    // SUM
    // --------------------------------------------

    case "sum":
      return formatSum(plan, result);


    // --------------------------------------------
    // AVERAGE
    // --------------------------------------------

    case "average":
      return formatAverage(plan, result);


    // --------------------------------------------
    // TOP N
    // --------------------------------------------

    case "topN":
      return formatTopN(result);


    // --------------------------------------------
    // MIN
    // --------------------------------------------

    case "min":
      return formatMin(plan, result);


    // --------------------------------------------
    // MAX
    // --------------------------------------------

    case "max":
      return formatMax(plan, result);


    // --------------------------------------------
    // FILTER
    // --------------------------------------------

    case "filter":
      return formatFilter(result);


    // --------------------------------------------
    // GROUP BY
    // --------------------------------------------

    case "groupBy":
      function formatGroupBy(result) {
  const groups = result.result || {};

  const entries = Object.entries(groups);

  if (entries.length === 0) {
    return "No grouped records found.";
  }

  const lines = entries.map(
    ([group, count]) =>
      `${group}: ${count}`
  );

  return `Breakdown by ${result.field}:\n\n${lines.join("\n")}`;
}

    // --------------------------------------------
    // UNKNOWN TOOL
    // --------------------------------------------

    default:
      return JSON.stringify(result);
  }
}


// ============================================
// EXPORTS
// ============================================

module.exports = {
  formatResult,
  formatCurrency,
  formatNumber,
  formatTopN,
  formatFilter,
  formatGroupBy,
};