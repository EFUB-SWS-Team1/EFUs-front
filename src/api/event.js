import axiosInstance from "./axiosInstance";

/**
 * event.js
 *
 * funding API 연결
 * USE_MOCK = true  → mock
 * USE_MOCK = false → 실제 API
 */

const USE_MOCK = true;

const MOCK_EVENTS_BY_GENERATION = {
  "efub-6": {
    summary: {
      totalBudget: 1000000,
      totalSpent: 640000,
      balance: 360000,
    },
    events: [
      {
        id: 1,
        name: "8월 MT",
        status: "ongoing",
        spent: 300000,
        budget: 600000,
        percent: 50,
        participants: 25,
        startDate: "2025-08-08",
        endDate: "2026-08-09",
      },
      {
        id: 2,
        name: "1학기 종강파티",
        status: "warning",
        spent: 190000,
        budget: 200000,
        percent: 95,
        participants: 30,
        startDate: "2025-06-01",
        endDate: "2025-06-01",
      },
      {
        id: 3,
        name: "3월 OT 회식",
        status: "over",
        spent: 150000,
        budget: 100000,
        percent: 150,
        overAmount: 50000,
        participants: 20,
        startDate: "2025-03-15",
        endDate: "2025-03-15",
      },
    ],
  },
};

const MOCK_TRANSACTIONS_BY_EVENT = {
  1: [
    { id: 1, date: "2026-07-05", description: "MT 회비", amount: 600000 },
    { id: 2, date: "2026-07-03", description: "MT 숙소비", amount: -300000 },
  ],
};

function getMockData(termId) {
  return MOCK_EVENTS_BY_GENERATION[termId] ?? MOCK_EVENTS_BY_GENERATION["efub-6"];
}

/** 백엔드 상태값 → 화면용 status */
function mapStatus(status) {
  if (!status) return "ongoing";
  const value = String(status).toLowerCase();
  if (value.includes("over") || value.includes("exceed")) return "over";
  if (value.includes("warn") || value.includes("80")) return "warning";
  return "ongoing";
}

/** 목록/상세 행사 객체를 화면용으로 변환 (필드명 다르면 여기만 수정) */
function mapEvent(item) {
  const budget = item.budget ?? item.budgetAmount ?? 0;
  const spent = item.spent ?? item.spentAmount ?? item.totalExpense ?? 0;
  const percent = item.percent ?? item.usageRate ?? item.utilizationRate ?? 0;

  return {
    id: item.id ?? item.fundingId,
    name: item.name,
    status: mapStatus(item.status ?? item.budgetStatus),
    spent,
    budget,
    percent,
    overAmount: item.overAmount ?? Math.max(spent - budget, 0),
    participants: item.participants ?? item.participantCount ?? 0,
    startDate: item.startDate,
    endDate: item.endDate,
  };
}

function mapSummary(data) {
  return {
    totalBudget: data.totalBudget ?? data.budgetAmount ?? 0,
    totalSpent: data.totalSpent ?? data.totalExpense ?? data.spentAmount ?? 0,
    balance: data.balance ?? data.remainingBudget ?? 0,
  };
}

function mapTransaction(item) {
  const rawAmount = item.amount ?? 0;
  const type = String(item.type ?? item.transactionType ?? "").toUpperCase();
  const amount =
    type === "EXPENSE" ? -Math.abs(rawAmount) : type === "INCOME" ? Math.abs(rawAmount) : rawAmount;

  return {
    id: item.id ?? item.transactionId ?? item.ledgerEntryId,
    date: item.date ?? item.transactionDate,
    description: item.description ?? item.title ?? item.memo ?? "",
    amount,
  };
}

/** 프론트엔드 폼에서 입력한 값을 백엔드 api 형태로 */
function toFundingBody(payload) {
  return {
    name: payload.name,
    budgetAmount: payload.budget,
    participantCount: payload.participants,
    startDate: payload.startDate,
    endDate: payload.endDate,
  };
}

export async function getEvents(termId) {
  if (USE_MOCK) return getMockData(termId);

  const [summaryRes, listRes] = await Promise.all([
    axiosInstance.get(`/terms/${termId}/fundings/summary`),
    axiosInstance.get(`/terms/${termId}/fundings`),
  ]);

  const listData = listRes.data;
  const events = Array.isArray(listData)
    ? listData
    : listData?.content ?? listData?.fundings ?? listData?.events ?? [];

  return {
    summary: mapSummary(summaryRes.data),
    events: events.map(mapEvent),
  };
}

export async function getEventDetail(termId, fundingId) {
  if (USE_MOCK) {
    const { events } = getMockData(termId);
    const event = events.find((item) => String(item.id) === String(fundingId));
    if (!event) throw new Error("행사를 찾을 수 없습니다.");
    return {
      event,
      transactions: MOCK_TRANSACTIONS_BY_EVENT[fundingId] ?? [],
    };
  }

  const [detailRes, ledgerRes] = await Promise.all([
    axiosInstance.get(`/terms/${termId}/fundings/${fundingId}`),
    axiosInstance.get(`/fundings/${fundingId}/ledger-entries`),
  ]);

  const ledgerData = ledgerRes.data;
  const transactions = Array.isArray(ledgerData)
    ? ledgerData
    : ledgerData?.content ?? ledgerData?.ledgerEntries ?? [];

  return {
    event: mapEvent(detailRes.data),
    transactions: transactions.map(mapTransaction),
  };
}

export async function createEvent(termId, payload) {
  if (USE_MOCK) {
    const data = getMockData(termId);
    const newEvent = {
      id: Date.now(),
      status: "ongoing",
      spent: 0,
      percent: 0,
      ...payload,
    };
    data.events.unshift(newEvent);
    return newEvent;
  }

  const { data } = await axiosInstance.post(
    `/terms/${termId}/fundings`,
    toFundingBody(payload),
  );
  return mapEvent(data);
}

export async function updateEvent(termId, fundingId, payload) {
  if (USE_MOCK) {
    const data = getMockData(termId);
    const index = data.events.findIndex((item) => String(item.id) === String(fundingId));
    if (index === -1) throw new Error("행사를 찾을 수 없습니다.");
    data.events[index] = { ...data.events[index], ...payload };
    return data.events[index];
  }

  // 수정 API는 URI에 termId 없음야르~
  const { data } = await axiosInstance.patch(
    `/fundings/${fundingId}`,
    toFundingBody(payload),
  );
  return mapEvent(data);
}