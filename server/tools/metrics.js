function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const number = Number(String(value).replace(/,/g, ""));

  return Number.isFinite(number) ? number : 0;
}

function calculateMetrics(deals = [], workOrders = []) {
  const totalDeals = deals.length;
  const totalWorkOrders = workOrders.length;

  const totalDealValue = deals.reduce(
    (sum, deal) => sum + toNumber(deal.dealValue),
    0
  );

  const totalBilledValue = workOrders.reduce(
    (sum, workOrder) => sum + toNumber(workOrder.billedValue),
    0
  );

  const totalCollectedAmount = workOrders.reduce(
    (sum, workOrder) => sum + toNumber(workOrder.collectedAmount),
    0
  );

  const totalReceivable = workOrders.reduce(
    (sum, workOrder) => sum + toNumber(workOrder.amountReceivable),
    0
  );

  const openDeals = deals.filter(
    (deal) =>
      String(deal.dealStatus || "").toLowerCase() === "open"
  ).length;

  const closedDeals = deals.filter(
    (deal) =>
      String(deal.dealStatus || "").toLowerCase() === "closed"
  ).length;

  return {
    totalDeals,
    openDeals,
    closedDeals,
    totalWorkOrders,
    totalDealValue,
    totalBilledValue,
    totalCollectedAmount,
    totalReceivable,
  };
}

module.exports = {
  calculateMetrics,
};