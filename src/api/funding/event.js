import axiosInstance from "../axiosInstance";

/**
 * event.js
 *
 * funding API 연결
 * USE_MOCK = true  → mock
 * USE_MOCK = false → 실제 API
 */

const USE_MOCK = false;

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
  const budget = item.budgetAmount ?? 0;
  const spent = item.spentAmount ?? 0;
  const percent = item.progressRate ?? item.usageRate ?? 0; 
  const statusValue = item.status ?? item.budgetStatus ?? item.scheduleStatus;

  return {
    id: item.fundingId ?? item.id,
    name: item.name,
    status: mapStatus(statusValue),
    spent,
    budget,
    percent,
    overAmount: item.overBudgetAmount ?? item.exceededAmount ?? Math.max(spent - budget, 0),
    participants: item.participantCount ?? 0,
    startDate: item.startDate,
    endDate: item.endDate,
  };
}

function mapSummary(data) {
  return {
    totalBudget: data.totalBudgetAmount ?? data.totalBudget ?? 0,
    totalSpent: data.totalSpentAmount ?? data.totalSpent ?? 0,
    balance: data.totalRemainingAmount ?? data.balance ?? 0,
  };
}

function mapTransaction(item) {
  const rawAmount = item.amount ?? 0;
  const type = String(item.transactionType ?? item.cashFlowType ?? item.type ?? "").toUpperCase();
  const amount =
    type === "EXPENSE" ? -Math.abs(rawAmount) : type === "INCOME" ? Math.abs(rawAmount) : rawAmount;

  return {
    id: item.transactionId ?? item.entryId ?? item.id,
    date: item.transactionDate ?? item.date,
    description: item.title ?? item.description ?? "",
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
    const [summaryResponse, listResponse] =
      await Promise.all([
        axiosInstance.get(
          `/terms/${termId}/fundings/summary`,
        ),
        axiosInstance.get(
          `/terms/${termId}/fundings`,
          {
            params: {
              page: 0,
              size: 100,
            },
          },
        ),
      ]);

    const summaryPayload =
      summaryResponse.data?.data ?? {};

    const listPayload =
      listResponse.data?.data ?? {};

    const events = Array.isArray(listPayload)
      ? listPayload
      : listPayload.fundings ?? [];

    return {
      summary: mapSummary(summaryPayload),
      events: events.map(mapEvent),
    };
  }

export async function getEventDetail(termId, fundingId) {
  const [detailRes, ledgerRes] = await Promise.all([
    axiosInstance.get(`/terms/${termId}/fundings/${fundingId}`),
    axiosInstance.get(`/fundings/${fundingId}/ledger-entries`),
  ]);

  const detailData = detailRes.data?.data ?? detailRes.data;
  const ledgerData = ledgerRes.data?.data ?? ledgerRes.data;

  let transactions = Array.isArray(ledgerData) ? ledgerData : ledgerData?.ledgerEntries ?? ledgerData?.content ?? [];
  if (!transactions || transactions.length === 0) {
    transactions = detailData.transactions ?? [];
  }

  return {
    event: mapEvent(detailData),
    transactions: transactions.map(mapTransaction),
  };
}

export async function createEvent(
  termId,
  payload,
) {
  const response = await axiosInstance.post(
    `/terms/${termId}/fundings`,
    toFundingBody(payload),
  );

  const funding = response.data?.data;

  if (!funding) {
    throw new Error(
      "등록된 행사 정보를 받지 못했습니다.",
    );
  }

  return mapEvent(funding);
}

export async function updateEvent(fundingId, payload) {
  const { data } = await axiosInstance.patch(`/fundings/${fundingId}`, toFundingBody(payload));
  return mapEvent(data?.data ?? data);
}