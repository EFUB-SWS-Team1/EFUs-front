/**
 * dashboard.js
 *
 * 백엔드 API가 아직 준비되지 않아 우선 mock 데이터를 반환합니다.
 * USE_MOCK을 false로 바꾸면 실제 axiosInstance 호출로 전환됩니다.
 * 응답 형태는 백엔드 스펙 확정 시 이 파일 안에서만 맞추면 되도록
 * 컴포넌트 쪽 prop 형태를 이 mock 구조에 맞춰뒀습니다.
 *
 * 주의: api/axiosInstance.js가 아직 만들어지지 않았기 때문에,
 * 최상단에서 import하지 않고 USE_MOCK이 false일 때만 안에서 불러옵니다.
 * axiosInstance.js가 준비되면 아래 실제 호출 코드의 주석을 해제하고
 * 상단에 `import axiosInstance from "./axiosInstance";`를 추가하면 됩니다.
 */

const USE_MOCK = true;

// 기수별 mock 응답 (generationId 기준)
const MOCK_DASHBOARD = {
  "efub-6": {
    generation: {
      id: "efub-6",
      name: "EFUB 6기",
      isCurrent: true,
      period: null, // 현재 기수는 기간 표시 없음
    },
    summary: {
      totalIncome: 2000000,
      totalExpense: 600000,
      balance: 1400000,
      usageRate: 30, // %
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
 * @param {string} generationId - 조회할 기수 id (예: "efub-6")
 */
export async function getDashboardSummary(generationId) {
  if (USE_MOCK) {
    const data = MOCK_DASHBOARD[generationId] ?? MOCK_DASHBOARD["efub-6"];
    // 실제 API처럼 약간의 지연을 흉내내고 싶다면 아래 주석 해제
    // await new Promise((resolve) => setTimeout(resolve, 300));
    return data;
  }

  // TODO: axiosInstance.js 준비되면 아래 주석 해제 + 상단에 import 추가
  // import axiosInstance from "./axiosInstance";
  // const response = await axiosInstance.get(`/dashboard/${generationId}`);
  // return response.data;
  throw new Error("axiosInstance가 아직 준비되지 않았습니다. USE_MOCK을 true로 두세요.");
}