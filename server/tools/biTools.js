function count(items) {
  if (!Array.isArray(items)) return 0;
  return items.length;
}

function sum(items, field) {
  if (!Array.isArray(items)) return 0;

  return items.reduce((total, item) => {
    const value = Number(item[field]);

    return total + (Number.isFinite(value) ? value : 0);
  }, 0);
}

function average(items, field) {
  if (!Array.isArray(items) || items.length === 0) return 0;

  const validValues = items
    .map((item) => Number(item[field]))
    .filter((value) => Number.isFinite(value));

  if (validValues.length === 0) return 0;

  return (
    validValues.reduce((total, value) => total + value, 0) /
    validValues.length
  );
}

function filter(items, field, value) {
  if (!Array.isArray(items)) return [];

  return items.filter((item) => {
    return String(item[field]).toLowerCase() === String(value).toLowerCase();
  });
}

function groupBy(items, field) {
  if (!Array.isArray(items)) return {};

  return items.reduce((groups, item) => {
    const key = item[field] ?? "Unknown";

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(item);

    return groups;
  }, {});
}

function sortBy(items, field, direction = "desc") {
  if (!Array.isArray(items)) return [];

  return [...items].sort((a, b) => {
    const aValue = Number(a[field]);
    const bValue = Number(b[field]);

    if (!Number.isFinite(aValue) || !Number.isFinite(bValue)) {
      return 0;
    }

    return direction === "asc"
      ? aValue - bValue
      : bValue - aValue;
  });
}

function topN(items, field, n = 10) {
  return sortBy(items, field, "desc").slice(0, n);
}

function min(items, field) {
  if (!Array.isArray(items) || items.length === 0) return 0;

  const values = items
    .map((item) => Number(item[field]))
    .filter((value) => Number.isFinite(value));

  return values.length > 0 ? Math.min(...values) : 0;
}

function max(items, field) {
  if (!Array.isArray(items) || items.length === 0) return 0;

  const values = items
    .map((item) => Number(item[field]))
    .filter((value) => Number.isFinite(value));

  return values.length > 0 ? Math.max(...values) : 0;
}

module.exports = {
  count,
  sum,
  average,
  filter,
  groupBy,
  sortBy,
  topN,
  min,
  max,
};