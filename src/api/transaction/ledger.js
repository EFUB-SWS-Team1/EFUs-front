import axiosInstance from "../axiosInstance";

/**
 * ledger.js — 가계부 (transaction + receipt)
 */

const USE_MOCK = true;

const MOCK_ENTRIES = [
  {
    date: "2026.06.23",
    items: [
      { id: 1, event: "1학기 종강파티", desc: "공간 대여", amount: -50000, type: "expense", entryType: "TRANSACTION" },
      { id: 2, event: "-", desc: "1학기 벌금", amount: 30000, type: "income", entryType: "TRANSACTION" },
    ],
  },
  {
    date: "2026.06.08",
    items: [
      { id: 3, event: "-", desc: "동아리 지원금", amount: 600000, type: "income", entryType: "TRANSACTION" },
    ],
  },
  {
    date: "2026.06.05",
    items: [
      { id: 4, event: "-", desc: "6월 정기 회비", amount: 240000, type: "income", entryType: "CHARGE" },
      { id: 5, event: "8월 MT", desc: "MT 숙소비", amount: -300000, type: "expense", entryType: "TRANSACTION" },
    ],
  },
];

const MOCK_TRANSACTIONS = {
  1: {
    id: 1,
    transactionType: "EXPENSE",
    title: "공간 대여",
    amount: 50000,
    transactionDate: "2026-06-23",
    fundingId: 1,
    fundingName: "1학기 종강파티",
    memo: "",
    deleted: false,
    hasReceipt: false,
  },
};

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  return data?.content ?? data?.ledgerEntries ?? data?.entries ?? [];
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  // 2026-06-23 → 2026.06.23
  return String(dateStr).slice(0, 10).replaceAll("-", ".");
}

function mapCashFlowType(value) {
  const v = String(value ?? "").toUpperCase();
  if (v === "EXPENSE" || v === "지출") return "expense";
  return "income";
}

/** 명세 통합 가계부 항목 → 목록 UI 아이템 */
function mapLedgerItem(item) {
  const entryType = String(item.entryType ?? "TRANSACTION").toUpperCase();
  const cashFlow = mapCashFlowType(item.cashFlowType ?? item.transactionType);

  let amount = 0;
  if (entryType === "CHARGE") {
    // 회비: 납부액 우선, 없으면 총청구액
    amount = item.paidAmount ?? item.requestedAmount ?? item.amount ?? 0;
  } else {
    amount = item.amount ?? 0;
  }

  const signedAmount = cashFlow === "expense" ? -Math.abs(amount) : Math.abs(amount);

  return {
    id: item.entryId ?? item.id ?? item.transactionId,
    event: item.fundingName ?? item.event ?? "-",
    desc: item.title ?? item.desc ?? "",
    amount: signedAmount,
    type: cashFlow, // 'income' | 'expense'
    entryType, // 'TRANSACTION' | 'CHARGE'
    deleted: item.deleted ?? false,
    transactionDate: item.transactionDate,
    paymentStatus: item.paymentStatus ?? null,
    requestedAmount: item.requestedAmount ?? null,
    paidAmount: item.paidAmount ?? null,
    unpaidAmount: item.unpaidAmount ?? null,
  };
}

/** 날짜별 그룹 (LedgerCreatePage initialData 형태) */
function groupByDate(items) {
  const map = new Map();

  for (const item of items) {
    const date = formatDisplayDate(item.transactionDate) || "-";
    if (!map.has(date)) map.set(date, []);
    map.get(date).push(item);
  }

  return Array.from(map.entries()).map(([date, grouped]) => ({
    date,
    items: grouped,
  }));
}

function toTransactionBody(payload) {
  // 화면: income/expense, title, amount, date, fundingId?, memo?
  const type = String(payload.transactionType ?? payload.type ?? "").toLowerCase();
  const transactionType =
    type === "income" || type === "INCOME".toLowerCase()
      ? "INCOME"
      : type === "INCOME"
        ? "INCOME"
        : String(payload.transactionType ?? "").toUpperCase() === "INCOME"
          ? "INCOME"
          : "EXPENSE";

  const normalizedType =
    payload.transactionType === "INCOME" ||
    payload.transactionType === "EXPENSE"
      ? payload.transactionType
      : type === "income"
        ? "INCOME"
        : "EXPENSE";

  return {
    transactionType: normalizedType,
    title: payload.title,
    amount: Math.abs(Number(payload.amount) || 0), // 명세: 금액은 항상 양수
    transactionDate: payload.transactionDate ?? payload.date,
    fundingId: payload.fundingId ?? null,
    memo: payload.memo ?? null,
  };
}

/**
 * 통합 가계부 목록
 * @param {number|string} termId
 * @param {object} [params]
 * @param {'ALL'|'INCOME'|'EXPENSE'} [params.type]
 * @param {string} [params.fromDate] yyyy-MM-dd
 * @param {string} [params.toDate]
 * @param {boolean} [params.includeDeleted]
 * @param {number} [params.page]
 * @param {number} [params.size]
 * @returns {Promise<Array<{ date: string, items: Array }>>}
 */
export async function getLedgerEntries(termId, params = {}) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    const filter = String(params.type ?? "ALL").toUpperCase();
    if (filter === "ALL") return MOCK_ENTRIES;

    return MOCK_ENTRIES.map((group) => ({
      date: group.date,
      items: group.items.filter((item) =>
        filter === "INCOME" ? item.type === "income" : item.type === "expense",
      ),
    })).filter((group) => group.items.length > 0);
  }

  const { data } = await axiosInstance.get(`/terms/${termId}/ledger-entries`, {
    params: {
      type: params.type ?? "ALL",
      fromDate: params.fromDate,
      toDate: params.toDate,
      includeDeleted: params.includeDeleted,
      page: params.page,
      size: params.size,
    },
  });

  const mapped = unwrapList(data).map(mapLedgerItem);
  return groupByDate(mapped);
}

/** 일반 거래 등록 (수입/지출) */
export async function createTransaction(termId, payload) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return {
      id: Date.now(),
      ...toTransactionBody(payload),
    };
  }

  const { data } = await axiosInstance.post(
    `/terms/${termId}/transactions`,
    toTransactionBody(payload),
  );
  return data;
}

/** 거래 상세 */
export async function getTransaction(transactionId) {
  if (USE_MOCK) {
    return (
      MOCK_TRANSACTIONS[transactionId] ?? {
        id: transactionId,
        transactionType: "EXPENSE",
        title: "샘플 거래",
        amount: 10000,
        transactionDate: "2026-06-23",
        fundingName: "-",
        memo: "",
        deleted: false,
        hasReceipt: false,
      }
    );
  }

  const { data } = await axiosInstance.get(`/transactions/${transactionId}`);
  return data;
}

/** 거래 수정 */
export async function updateTransaction(transactionId, payload) {
  if (USE_MOCK) {
    return { id: transactionId, ...toTransactionBody(payload) };
  }

  const { data } = await axiosInstance.patch(
    `/transactions/${transactionId}`,
    toTransactionBody(payload),
  );
  return data;
}

/** 거래 소프트 삭제 */
export async function deleteTransaction(transactionId) {
  if (USE_MOCK) {
    return { success: true };
  }

  await axiosInstance.delete(`/transactions/${transactionId}`);
  return { success: true };
}

/** 영수증 조회 (Presigned URL) */
export async function getReceipt(transactionId) {
  if (USE_MOCK) {
    return { url: null, fileName: null };
  }

  const { data } = await axiosInstance.get(
    `/transactions/${transactionId}/receipt`,
  );
  return data;
}

/** 영수증 등록·교체 (multipart) */
export async function uploadReceipt(transactionId, file) {
  if (USE_MOCK) {
    return { success: true, fileName: file?.name };
  }

  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axiosInstance.put(
    `/transactions/${transactionId}/receipt`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data;
}

/** 영수증 삭제 */
export async function deleteReceipt(transactionId) {
  if (USE_MOCK) {
    return { success: true };
  }

  await axiosInstance.delete(`/transactions/${transactionId}/receipt`);
  return { success: true };
}

/** 거래 수정·삭제 이력 */
export async function getTransactionHistories(transactionId, params = {}) {
  if (USE_MOCK) {
    return [
      {
        date: "2026.06.23",
        author: "홍길동",
        content: "생성",
      },
    ];
  }

  const { data } = await axiosInstance.get(
    `/transactions/${transactionId}/histories`,
    { params: { page: params.page, size: params.size } },
  );

  const list = Array.isArray(data) ? data : data?.content ?? data?.histories ?? [];

  return list.map((item) => ({
    date: String(item.changedAt ?? item.date ?? "").slice(0, 10).replaceAll("-", "."),
    author: item.actorName ?? item.author ?? "-",
    content: item.summary ?? item.actionType ?? "-",
  }));
}