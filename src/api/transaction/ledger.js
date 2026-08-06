import axiosInstance from "../axiosInstance";

/**
 * ledger.js — 가계부 (transaction + receipt)
 */

function formatDisplayDate(dateString) {
  if (!dateString) return "";

  return String(dateString).slice(0, 10).replaceAll("-", ".");
}

function mapCashFlowType(value) {
  const normalizedValue = String(value ?? "").toUpperCase();

  return normalizedValue === "EXPENSE" || normalizedValue === "지출"
    ? "expense"
    : "income";
}

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
      : (item.amount ?? 0);

  return {
    id: item.entryId ?? item.id ?? item.transactionId,
    event: item.fundingName ?? item.event ?? "-",
    desc: item.title ?? item.desc ?? "",
    amount:
      cashFlow === "expense"
        ? -Math.abs(amount)
        : Math.abs(amount),
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

function toTransactionBody(payload) {
  const normalizedType = String(
    payload.transactionType ?? payload.type ?? "",
  ).toUpperCase();

  return {
    transactionType:
      normalizedType === "INCOME" ? "INCOME" : "EXPENSE",

    title: payload.title?.trim(),

    amount: Math.abs(Number(payload.amount) || 0),

    fundingId:
      payload.fundingId == null || payload.fundingId === ""
        ? null
        : Number(payload.fundingId),

    transactionDate:
      payload.transactionDate ?? payload.date,

    memo: payload.memo?.trim() || null,
  };
}

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

/**
 * 통합 가계부 목록 조회
 */
export async function getLedgerEntries(termId, params = {}) {
  const response = await axiosInstance.get(
    `/terms/${termId}/ledger-entries`,
    {
      params: {
        type: params.type ?? "ALL",
        fundingId: params.fundingId,
        fromDate: params.fromDate,
        toDate: params.toDate,
        includeDeleted: params.includeDeleted ?? false,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    },
  );

  const payload = unwrapResponse(response) ?? {};

  const entries = Array.isArray(payload.entries)
    ? payload.entries
    : [];

  return {
    termId: payload.termId ?? termId,
    totalIncome: payload.totalIncome ?? 0,
    totalExpense: payload.totalExpense ?? 0,
    balance: payload.balance ?? 0,

    groups: groupByDate(entries.map(mapLedgerItem)),

    pageInfo: {
      page: payload.pageInfo?.page ?? params.page ?? 0,
      size: payload.pageInfo?.size ?? params.size ?? 20,
      totalElements: payload.pageInfo?.totalElements ?? 0,
      totalPages: payload.pageInfo?.totalPages ?? 0,
      hasNext: payload.pageInfo?.hasNext ?? false,
    },
  };
}

/**
 * 일반 거래 등록
 */
export async function createTransaction(termId, payload) {
  const response = await axiosInstance.post(
    `/terms/${termId}/transactions`,
    toTransactionBody(payload),
  );

  return unwrapResponse(response);
}

/**
 * 거래 상세 조회
 */
export async function getTransaction(termId, transactionId) {
  const response = await axiosInstance.get(
    `/terms/${termId}/transactions/${transactionId}`,
  );

  return unwrapResponse(response);
}

/**
 * 거래 수정
 */
export async function updateTransaction(
  termId,
  transactionId,
  payload,
) {
  const response = await axiosInstance.patch(
    `/terms/${termId}/transactions/${transactionId}`,
    toTransactionBody(payload),
  );

  return unwrapResponse(response);
}

/**
 * 거래 삭제
 */
export async function deleteTransaction(termId, transactionId) {
  await axiosInstance.delete(
    `/terms/${termId}/transactions/${transactionId}`,
  );
}

/**
 * 영수증 조회
 */
export async function getReceipt(transactionId) {
  const response = await axiosInstance.get(
    `/transactions/${transactionId}/receipt`,
  );

  return unwrapResponse(response);
}

/**
 * 영수증 업로드
 */
export async function uploadReceipt(transactionId, file) {
  const contentType =
    file.type || "application/octet-stream";

  const metadataResponse = await axiosInstance.put(
    `/transactions/${transactionId}/receipt/presigned-url`,
    {
      originalFilename: file.name,
      contentType,
      fileSize: file.size,
    },
  );

  const receipt = unwrapResponse(metadataResponse);

  if (!receipt?.presignedUrl) {
    throw new Error(
      "영수증 업로드 URL을 받지 못했습니다.",
    );
  }

  const uploadResponse = await fetch(
    receipt.presignedUrl,
    {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body: file,
    },
  );

  if (!uploadResponse.ok) {
    throw new Error(
      "영수증 파일 업로드에 실패했습니다.",
    );
  }

  return receipt;
}

/**
 * 영수증 삭제
 */
export async function deleteReceipt(transactionId) {
  await axiosInstance.delete(
    `/transactions/${transactionId}/receipt`,
  );
}

/**
 * 거래 수정/삭제 이력 조회
 */
export async function getTransactionHistories(
  transactionId,
  params = {},
) {
  const response = await axiosInstance.get(
    `/transactions/${transactionId}/histories`,
    {
      params: {
        page: params.page,
        size: params.size,
      },
    },
  );

  const payload = unwrapResponse(response);

  const histories = Array.isArray(payload)
    ? payload
    : (payload?.histories ?? []);

  return histories.map((item) => ({
    date: String(
      item.changedAt ?? item.date ?? "",
    )
      .slice(0, 10)
      .replaceAll("-", "."),

    author:
      item.actorName ?? item.author ?? "-",

    content:
      item.summary ?? item.actionType ?? "-",
  }));
}
