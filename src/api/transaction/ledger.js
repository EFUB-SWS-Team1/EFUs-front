import axiosInstance from "../axiosInstance";

/**
 * ledger.js — 가계부 (transaction + receipt)
 */

const USE_MOCK = false;

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

function formatDisplayDate(dateString) {
  if (!dateString) return "";

  return String(dateString)
    .slice(0, 10)
    .replaceAll("-", ".");
}

function mapCashFlowType(value) {
  const normalizedValue = String(value ?? "").toUpperCase();

  if (
    normalizedValue === "EXPENSE" ||
    normalizedValue === "지출"
  ) {
    return "expense";
  }

  return "income";
}

/**
 * 백엔드 통합 가계부 항목을 목록 UI 형식으로 변환합니다.
 */
function mapLedgerItem(item) {
  const entryType = String(
    item.entryType ?? "TRANSACTION",
  ).toUpperCase();

  const cashFlow = mapCashFlowType(
    item.cashFlowType ?? item.transactionType,
  );

  const amount =
  entryType === "CHARGE"
    ? (
        item.paidAmount ??
        item.requestedAmount ??
        item.amount ??
        0
      )
    : item.amount ?? 0;

  const signedAmount =
    cashFlow === "expense"
      ? -Math.abs(amount)
      : Math.abs(amount);

  return {
    id: item.entryId ?? item.id ?? item.transactionId,
    event: item.fundingName ?? item.event ?? "-",
    desc: item.title ?? item.desc ?? "",
    amount: signedAmount,
    type: cashFlow,
    entryType,
    date: item.date ?? item.transactionDate,
    deleted: item.deleted ?? false,
    hasReceipt: item.hasReceipt ?? false,
    receiptId: item.receiptId ?? null,
    paymentStatus: item.paymentStatus ?? null,
    requestedAmount: item.requestedAmount ?? null,
    paidAmount: item.paidAmount ?? null,
    unpaidAmount: item.unpaidAmount ?? null,
    createdAt: item.createdAt ?? null,
  };
}

/**
 * 가계부 항목을 날짜별로 그룹화합니다.
 */
function groupByDate(items) {
  const dateMap = new Map();

  for (const item of items) {
    const date = formatDisplayDate(item.date) || "-";

    if (!dateMap.has(date)) {
      dateMap.set(date, []);
    }

    dateMap.get(date).push(item);
  }

  return Array.from(dateMap.entries()).map(
    ([date, groupedItems]) => ({
      date,
      items: groupedItems,
    }),
  );
}

/**
 * 거래 등록 요청 데이터를 백엔드 형식으로 변환합니다.
 */
function toTransactionBody(payload) {
  const type = String(
    payload.transactionType ?? payload.type ?? "",
  ).toLowerCase();

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
    amount: Math.abs(Number(payload.amount) || 0),
    transactionDate:
      payload.transactionDate ?? payload.date,
    fundingId: payload.fundingId ?? null,
    memo: payload.memo ?? null,
  };
}

/**
 * 통합 가계부 목록 조회
 *
 * @param {number|string} termId
 * @param {object} [params]
 * @param {"ALL"|"INCOME"|"EXPENSE"} [params.type]
 * @param {number|string} [params.fundingId]
 * @param {string} [params.fromDate]
 * @param {string} [params.toDate]
 * @param {boolean} [params.includeDeleted]
 * @param {number} [params.page]
 * @param {number} [params.size]
 */
export async function getLedgerEntries(
  termId,
  params = {},
) {
  const response = await axiosInstance.get(
    `/terms/${termId}/ledger-entries`,
    {
      params: {
        type: params.type ?? "ALL",
        fundingId: params.fundingId,
        fromDate: params.fromDate,
        toDate: params.toDate,
        includeDeleted:
          params.includeDeleted ?? false,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    },
  );

  const payload = response.data?.data ?? {};

  const entries = Array.isArray(payload.entries)
    ? payload.entries
    : [];

  const mappedEntries = entries.map(mapLedgerItem);

  return {
    termId: payload.termId ?? termId,
    totalIncome: payload.totalIncome ?? 0,
    totalExpense: payload.totalExpense ?? 0,
    balance: payload.balance ?? 0,
    groups: groupByDate(mappedEntries),
    pageInfo: {
      page:
        payload.pageInfo?.page ??
        params.page ??
        0,
      size:
        payload.pageInfo?.size ??
        params.size ??
        20,
      totalElements:
        payload.pageInfo?.totalElements ?? 0,
      totalPages:
        payload.pageInfo?.totalPages ?? 0,
      hasNext:
        payload.pageInfo?.hasNext ?? false,
    },
  };
}

/**
 * 일반 거래 등록
 */
export async function createTransaction(
  termId,
  payload,
) {
  if (USE_MOCK) {
    await new Promise((resolve) =>
      setTimeout(resolve, 200),
    );

    return {
      id: Date.now(),
      ...toTransactionBody(payload),
    };
  }

  const response = await axiosInstance.post(
    `/terms/${termId}/transactions`,
    toTransactionBody(payload),
  );

  return response.data;
}

/**
 * 일반 거래 상세 조회
 */
export async function getTransaction(transactionId) {
  if (USE_MOCK) {
    return (
      MOCK_TRANSACTIONS[transactionId] ?? {
        id: transactionId,
        transactionType: "EXPENSE",
        title: "샘플 거래",
        amount: 10000,
        transactionDate: "2026-06-23",
        fundingId: null,
        fundingName: "-",
        memo: "",
        deleted: false,
        hasReceipt: false,
      }
    );
  }

  const response = await axiosInstance.get(
    `/transactions/${transactionId}`,
  );

  return response.data;
}

/**
 * 일반 거래 수정
 */
export async function updateTransaction(
  transactionId,
  payload,
) {
  if (USE_MOCK) {
    return {
      id: transactionId,
      ...toTransactionBody(payload),
    };
  }

  const response = await axiosInstance.patch(
    `/transactions/${transactionId}`,
    toTransactionBody(payload),
  );

  return response.data;
}

/**
 * 일반 거래 소프트 삭제
 */
export async function deleteTransaction(
  transactionId,
) {
  if (USE_MOCK) {
    return { success: true };
  }

  await axiosInstance.delete(
    `/transactions/${transactionId}`,
  );

  return { success: true };
}

/**
 * 영수증 조회
 */
export async function getReceipt(transactionId) {
  if (USE_MOCK) {
    return {
      url: null,
      fileName: null,
    };
  }

  const response = await axiosInstance.get(
    `/transactions/${transactionId}/receipt`,
  );

  return response.data;
}

/**
 * 영수증 등록·교체
 *
 * 현재 Mock 단계입니다.
 * 실제 연동에서는 Presigned URL 방식을 사용해야 합니다.
 */
export async function uploadReceipt(
  transactionId,
  file,
) {
  if (USE_MOCK) {
    return {
      success: true,
      fileName: file?.name,
    };
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.put(
    `/transactions/${transactionId}/receipt`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

/**
 * 영수증 삭제
 */
export async function deleteReceipt(transactionId) {
  if (USE_MOCK) {
    return { success: true };
  }

  await axiosInstance.delete(
    `/transactions/${transactionId}/receipt`,
  );

  return { success: true };
}

/**
 * 거래 수정·삭제 이력 조회
 */
export async function getTransactionHistories(
  transactionId,
  params = {},
) {
  if (USE_MOCK) {
    return [
      {
        date: "2026.06.23",
        author: "홍길동",
        content: "생성",
      },
    ];
  }

  const response = await axiosInstance.get(
    `/transactions/${transactionId}/histories`,
    {
      params: {
        page: params.page,
        size: params.size,
      },
    },
  );

  const payload = response.data?.data;

  const histories = Array.isArray(payload)
    ? payload
    : payload?.histories ?? [];

  return histories.map((item) => ({
    date: String(item.changedAt ?? item.date ?? "")
      .slice(0, 10)
      .replaceAll("-", "."),
    author: item.actorName ?? item.author ?? "-",
    content:
      item.summary ?? item.actionType ?? "-",
  }));
}
