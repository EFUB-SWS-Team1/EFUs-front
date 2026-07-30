/*
 *
 * 반환 형태:
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
    
    console.log("switchGeneration:", generationId);
  }

  return { currentGeneration, generations, switchGeneration };
}