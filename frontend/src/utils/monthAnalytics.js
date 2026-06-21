export const toMonthKey = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getMonth() + 1}/${d.getFullYear()}`;
};

export const monthKeyToDate = (monthKey) => {
  const [month, year] = monthKey.split('/').map(Number);
  return new Date(year, month - 1, 1);
};

export const getCurrentMonthStart = (now = new Date()) => (
  new Date(now.getFullYear(), now.getMonth(), 1)
);

export const isFutureMonth = (monthDate, now = new Date()) => (
  monthDate > getCurrentMonthStart(now)
);

export const formatMonthShortLabel = (monthDate, showYear = false) => (
  monthDate.toLocaleString('en-US', {
    month: 'short',
    ...(showYear ? { year: '2-digit' } : {}),
  })
);

const aggregateByMonthKey = (processed) => {
  const map = {};
  processed.forEach((entry) => {
    if (!map[entry.monthKey]) {
      map[entry.monthKey] = {
        key: entry.monthKey,
        monthDate: monthKeyToDate(entry.monthKey),
        total: 0,
      };
    }
    map[entry.monthKey].total += entry.amount;
  });
  return map;
};

const withBarMetrics = (slots, now = new Date()) => {
  const uniqueYears = new Set(slots.map((entry) => entry.monthDate.getFullYear()));
  const showYear = uniqueYears.size > 1;
  const max = Math.max(...slots.map((entry) => entry.total), 1);

  return slots.map((entry, index) => ({
    key: entry.key,
    label: formatMonthShortLabel(entry.monthDate, showYear),
    total: entry.total,
    sortDate: entry.monthDate,
    isFuture: isFutureMonth(entry.monthDate, now),
    pct: (entry.total / max) * 100,
    delay: index * 0.05,
  }));
};

/** Chart: current month + N months back + any future months that have expenses. */
export const buildTrendChartData = (processed, { pastMonths = 6, now = new Date() } = {}) => {
  const currentMonthStart = getCurrentMonthStart(now);
  const slotMap = new Map();

  for (let offset = -pastMonths; offset <= 0; offset += 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const key = toMonthKey(monthDate);
    slotMap.set(key, { key, monthDate, total: 0 });
  }

  Object.values(aggregateByMonthKey(processed)).forEach((entry) => {
    if (entry.monthDate > currentMonthStart && !slotMap.has(entry.key)) {
      slotMap.set(entry.key, { key: entry.key, monthDate: entry.monthDate, total: 0 });
    }
  });

  const slots = [...slotMap.values()].sort((a, b) => a.monthDate - b.monthDate);

  processed.forEach((entry) => {
    const slot = slotMap.get(entry.monthKey);
    if (slot) slot.total += entry.amount;
  });

  return withBarMetrics(slots, now);
};

/** Dropdown: every past month with expenses + future months with planned expenses. */
export const buildMonthFilterOptions = (processed, now = new Date()) => {
  const currentMonthStart = getCurrentMonthStart(now);
  const monthMap = aggregateByMonthKey(processed);
  const past = [];
  const future = [];

  Object.values(monthMap).forEach((entry) => {
    const option = {
      key: entry.key,
      monthDate: entry.monthDate,
      total: entry.total,
      isFuture: isFutureMonth(entry.monthDate, now),
    };
    if (entry.monthDate <= currentMonthStart) past.push(option);
    else future.push(option);
  });

  past.sort((a, b) => b.monthDate - a.monthDate);
  future.sort((a, b) => a.monthDate - b.monthDate);

  const allEntries = [...past, ...future];
  const uniqueYears = new Set(allEntries.map((entry) => entry.monthDate.getFullYear()));
  const showYear = uniqueYears.size > 1;

  const toOption = (entry) => ({
    key: entry.key,
    label: formatMonthShortLabel(entry.monthDate, showYear),
    total: entry.total,
    isFuture: entry.isFuture,
  });

  return {
    past: past.map(toOption),
    future: future.map(toOption),
    all: allEntries.map(toOption),
    pastByYear: groupOptionsByYear(past.map(toOption)),
  };
};

export const groupOptionsByYear = (options) => {
  const groups = new Map();
  options.forEach((option) => {
    const year = monthKeyToDate(option.key).getFullYear();
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(option);
  });

  return [...groups.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, entries]) => ({ year, options: entries }));
};

export const getMonthOptionLabel = (monthFilterOptions, monthKey) => {
  if (!monthKey || monthKey === 'All') return null;
  return monthFilterOptions.all.find((option) => option.key === monthKey)?.label ?? monthKey;
};
