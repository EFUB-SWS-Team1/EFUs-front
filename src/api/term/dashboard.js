import axiosInstance from "../axiosInstance";

/**
 * dashboard.js
 *
 * API: GET /api/terms/{termId}/dashboard
 * - 총수입, 총지출, 잔액, 사용률
 * - 최근 가계부 내역
 * - 행사별 예산 현황
 *
 * USE_MOCK = true  → mock
 * USE_MOCK = false → 실제 API
 */

const USE_MOCK = false;

const MOCK_DASHBOARD = {
  "efub-6": {
    generation: {
      id: "efub-6",
      name: "EFUB 6기",
      isCurrent: true,
      period: null,
    },
    summary: {
      totalIncome: 2000000,
      totalExpense: 600000,
      balance: 1400000,
      usageRate: 30,
    },
    recentTransactions: [
      { id: 1, date: "2026.06.23", eventName: "1학기 종강파티", description: "공간 대여", amount: -50000 },
      { id: 2, date: "2026.06.23", eventName: "-", description: "1학기 벌금", amount: 30000 },
      { id: 3, date: "2026.06.08", eventName: "-", description: "동아리 지원금", amount: 600000 },
    ],
    events: [
      { id: 1, name: "8월 MT", status: "ongoing", spent: 300000, budget: 600000, percent: 50 },
      { id: 2, name: "1학기 종강파티", status: "warning", spent: 190000, budget: 200000, percent: 95 },
      { id: 3, name: "3월 OT 회식", status: "over", spent: 150000, budget: 100000, percent: 150, overAmount: 50000 },
    ],
  },
  "efub-5": {
    generation: {
      id: "efub-5",
      name: "EFUB 5기",
      isCurrent: false,
      period: "2025.03 - 2026.02",
    },
    summary: {
      totalIncome: 2000000,
      totalExpense: 1950000,
      balance: 50000,
      usageRate: 97.5,
    },
    recentTransactions: [
      { id: 1, date: "2026.02.23", eventName: "-", description: "5기 마지막 회식", amount: -250000 },
      { id: 2, date: "2026.02.22", eventName: "-", description: "5기 굿즈 제작", amount: -150000 },
      { id: 3, date: "2026.02.08", eventName: "-", description: "2학기 벌금", amount: 50000 },
    ],
    events: [
      { id: 1, name: "2월 MT", status: "warning", spent: 580000, budget: 600000, percent: 97 },
      { id: 2, name: "2학기 종강파티", status: "warning", spent: 190000, budget: 200000, percent: 95 },
      { id: 3, name: "겨울방학 해커톤", status: "over", spent: 150000, budget: 100000, percent: 150, overAmount: 50000 },
    ],
  },
};

/**
 * 대시보드 요약 데이터 조회
 * @param {string|number} termId - 기수 id (명세서: termId)
 *   지금은 useGroup mock이 "efub-6"이라
 *   실제 숫자 termId로 바꿔야 함
 */
export async function getDashboardSummary(termId) {
  if (USE_MOCK) {
    const data = MOCK_DASHBOARD[termId] ?? MOCK_DASHBOARD["efub-6"];
    return data;
  }

  const { data } = await axiosInstance.get(`/terms/${termId}/dashboard`);

  
  return data;
}