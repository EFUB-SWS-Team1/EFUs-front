/**
 * useGroup.js (임시 stub)
 *
 * 실제 group/기수 상태 관리는 groupStore.js + group 담당자의 useGroup 구현으로
 * 대체될 예정입니다. dashboard/layout 브랜치를 독립적으로 개발/테스트하기 위한
 * 임시 버전이며, develop 병합 시 실제 훅으로 교체되어야 합니다.
 *
 * 반환 형태 (실제 구현도 이 shape을 따른다고 가정):
 *  {
 *    currentGeneration: {
 *      id: string,
 *      name: string,       // "EFUB 6기"
 *      isCurrent: boolean, // 현재 진행중 기수인지
 *      period: string|null // 지난 기수일 때만 "2025.03 - 2026.02"
 *    },
 *    generations: [{ id, name }], // 사이드바 기수 드롭다운 목록
 *    switchGeneration: (generationId) => void, // 기수 전환
 *  }
 */

export default function useGroup() {
  // TODO: groupStore(zustand 등) 연동 후 실제 선택된 기수로 교체
  const currentGeneration = {
    id: "efub-6",
    name: "EFUB 6기",
    isCurrent: true,
    period: null,
  };

  const generations = [
    { id: "efub-6", name: "EFUB 6기" },
    { id: "efub-5", name: "EFUB 5기" },
    { id: "efub-4", name: "EFUB 4기" },
    { id: "efub-3", name: "EFUB 3기" },
  ];

  function switchGeneration(generationId) {
    // TODO: 실제 구현에서는 groupStore의 선택된 기수를 업데이트
    console.log("switchGeneration:", generationId);
  }

  return { currentGeneration, generations, switchGeneration };
}