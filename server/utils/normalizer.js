function parseColumnValue(column) {
  if (!column) return null;

  // Monday already provides a readable text value
  if (column.text !== undefined && column.text !== "") {
    return column.text;
  }

  // Some columns have null text but useful JSON in value
  if (column.value) {
    try {
      const parsed = JSON.parse(column.value);

      if (parsed.date) return parsed.date;
      if (parsed.index !== undefined) return parsed.index;
      if (parsed.ids) return parsed.ids;

      return parsed;
    } catch {
      return column.value;
    }
  }

  return null;
}


function normalizeItem(item) {
  const normalized = {
    id: item.id,
    name: item.name,
  };

  if (Array.isArray(item.column_values)) {
    item.column_values.forEach((column) => {
      normalized[column.id] = parseColumnValue(column);
    });
  }

  return normalized;
}


function normalizeBoard(board) {
  return {
    id: board.id,
    name: board.name,
    state: board.state,

    columns: board.columns.map((column) => ({
      id: column.id,
      title: column.title,
      type: column.type,
    })),

    items: board.items_page.items.map(normalizeItem),
  };
}


function normalizeBothBoards(data) {
  return {
    deals: {
      ...normalizeBoard(data.deals),
      items: data.deals.items_page.items.map(normalizeDeal),
    },

    workOrders: {
  ...normalizeBoard(data.workOrders),
  items: data.workOrders.items_page.items.map(normalizeWorkOrder),
},
  };
}

const DEAL_FIELD_MAP = {
  "dropdown_mm7b4cgz": "ownerCode",
  "dropdown_mm7bamhy": "clientCode",
  "color_mm7brywj": "dealStatus",
  "date_mm7bc0p0": "closeDate",
  "dropdown_mm7bmqws": "closeProbability",
  "numeric_mm7bxf1x": "dealValue",
  "date_mm7bw4q8": "tentativeCloseDate",
  "color_mm7bpn78": "dealStage",
  "dropdown_mm7bs8n6": "productDeal",
  "dropdown_mm7brt9h": "sector",
  "date_mm7bf25c": "createdDate",
};

const WORK_ORDER_FIELD_MAP = {
  "dropdown_mm7b4cgz": "ownerCode",
  "dropdown_mm7bamhy": "clientCode",
  "dropdown_mm7b7mqb": "customerNameCode",
  "dropdown_mm7bxrjn": "serialNumber",
  "color_mm7bm0h2": "natureOfWork",
  "color_mm7bb710": "lastExecutedMonth",
  "color_mm7b4b4": "executionStatus",
  "date_mm7bxpws": "dataDeliveryDate",
  "date_mm7bhcnw": "poDate",
  "color_mm7be1j6": "documentType",
  "date_mm7b1b6p": "probableStartDate",
  "date_mm7bzbb6": "probableEndDate",
  "color_mm7bg214": "bdKamPersonnelCode",
  "color_mm7bz1bs": "sector",
  "color_mm7b2gsz": "typeOfWork",
  "color_mm7bw1dn": "softwarePlatform",
  "date_mm7btrah": "lastInvoiceDate",
  "text_mm7bv4ea": "latestInvoiceNo",

  "numeric_mm7br99v": "amountExclGST",
  "numeric_mm7bnhak": "amountInclGST",
  "numeric_mm7bdgr7": "billedValueExclGST",
  "numeric_mm7bexb4": "billedValue",
  "numeric_mm7bzyfy": "collectedAmount",
  "numeric_mm7bhr50": "amountToBeBilledExclGST",
  "numeric_mm7bqphh": "amountToBeBilled",
  "numeric_mm7bgmd0": "amountReceivable",

  "color_mm7b3g4f": "arPriorityAccount",
  "numeric_mm7bvbad": "quantityByOps",
  "dropdown_mm7b8nqq": "quantityAsPerPO",
  "numeric_mm7bv37j": "quantityBilled",
  "numeric_mm7bht4m": "balanceQuantity",
  "color_mm7b54qj": "invoiceStatus",

  "text_mm7bmvk9": "expectedBillingMonth",
  "text_mm7bkp90": "actualBillingMonth",
  "text_mm7b69p1": "actualCollectionMonth",

  "color_mm7b4h1e": "woStatusBilled",
  "text_mm7b4wsr": "collectionStatus",
  "text_mm7b6whk": "collectionDate",
  "color_mm7b3tfn": "billingStatus"

};



function normalizeDeal(item) {
  const deal = {
    id: item.id,
    name: item.name,
  };

  const values = {};

  // Convert Monday's column_values array into a simple lookup object
  if (Array.isArray(item.column_values)) {
    item.column_values.forEach((column) => {
      values[column.id] = parseColumnValue(column);
    });
  }

  // Map Monday column IDs to business-friendly names
  for (const [columnId, fieldName] of Object.entries(DEAL_FIELD_MAP)) {
    deal[fieldName] = values[columnId] ?? null;
  }

  return deal;
}

function normalizeWorkOrder(item) {
  const workOrder = {
    id: item.id,
    name: item.name,
  };

  const values = {};

  if (Array.isArray(item.column_values)) {
    item.column_values.forEach((column) => {
      values[column.id] = parseColumnValue(column);
    });
  }

  for (const [columnId, fieldName] of Object.entries(WORK_ORDER_FIELD_MAP)) {
    workOrder[fieldName] = values[columnId] ?? null;
  }

  return workOrder;
}

module.exports = {
  parseColumnValue,
  normalizeItem,
  normalizeBoard,
  normalizeBothBoards,
  normalizeDeal,
  normalizeWorkOrder,
};