/**
 * event.js 와 동일한 패턴
 * USE_MOCK = false 로 바꾸면 실제 API 호출
 */

const USE_MOCK = true;

const MOCK_DATA = {
  'efub-6': {
    generation: {
      id: 6,
      label: '6기',
      startDate: '2026-03-03',
      endDate: null,
      isActive: true,
    },
    currentUser: {
      id: 2,
      role: 'staff', // 'staff' | 'general'
    },
    inviteCodes: {
      staff: 'AB1C34',
      general: 'F2XC4L',
      expiresInDays: 7,
    },
    members: [
      { id: 1, name: '홍길동', role: 'staff', email: 'hong@email.com' },
      { id: 2, name: '김민지', role: 'staff', email: 'kimminji@email.com' },
      { id: 3, name: '홍길동', role: 'staff', email: 'hong2@email.com' },
      { id: 4, name: '홍길동', role: 'general', email: 'hong3@email.com' },
      { id: 5, name: '홍길동', role: 'general', email: 'hong4@email.com' },
      { id: 6, name: '홍길동', role: 'general', email: 'hong5@email.com' },
      { id: 7, name: '홍길동', role: 'general', email: 'hong6@email.com' },
      { id: 8, name: '이수진', role: 'general', email: 'lee@email.com' },
      { id: 9, name: '박철수', role: 'general', email: 'park@email.com' },
      { id: 10, name: '최영희', role: 'general', email: 'choi@email.com' },
      { id: 11, name: '정민호', role: 'general', email: 'jung@email.com' },
      { id: 12, name: '한지우', role: 'general', email: 'han@email.com' },
      { id: 13, name: '오세훈', role: 'general', email: 'oh@email.com' },
      { id: 14, name: '윤서연', role: 'general', email: 'yoon@email.com' },
      { id: 15, name: '강다은', role: 'general', email: 'kang@email.com' },
      { id: 16, name: '임재현', role: 'general', email: 'lim@email.com' },
      { id: 17, name: '송하늘', role: 'general', email: 'song@email.com' },
      { id: 18, name: '류민석', role: 'general', email: 'ryu@email.com' },
      { id: 19, name: '조은별', role: 'general', email: 'jo@email.com' },
      { id: 20, name: '신유나', role: 'general', email: 'shin@email.com' },
    ],
    memberDetails: {
      2: {
        paidTotal: 15000,
        unpaidTotal: 10000,
        dues: [
          { id: 1, label: '5월 회비', amount: 10000, dueDate: '05.07', status: 'unpaid' },
          { id: 2, label: '4월 회비', amount: 5000, dueDate: '04.09', status: 'paid' },
          { id: 3, label: '3월 회비', amount: 10000, dueDate: '03.05', status: 'paid' },
        ],
      },
    },
  },
};

function getMockStore(generationId) {
  return MOCK_DATA[generationId] ?? MOCK_DATA['efub-6'];
}

export async function getGroupManageOverview(generationId) {
  if (USE_MOCK) {
    const data = getMockStore(generationId);
    return {
      generation: data.generation,
      currentUser: data.currentUser,
      members: data.members,
      totalCount: data.members.length,
    };
  }

  //여기서 getGroupManageOverview 는 groupManage 의 메인화면에 띄울 정보를 한번에 끌어오는 거
  //ex)상단기수 6기, 시작일, 현재 로그인한 사용자의 권한, 하단 멤버 목록 등

  //generationId 는 몇기의 정보를 가져올지 구분
  //getGroupManageOverview('efub-6')에서의 efub-6이 generationId

  throw new Error('나중에 USE_MOCK을 false 로 두고 이곳에 axios 통신 코드 작성');
}

export async function getInviteCodes(generationId) {
  if (USE_MOCK) {
    return getMockStore(generationId).inviteCodes;
  }

  throw new Error('나중에 USE_MOCK을 false 로 두고 이곳에 axios 통신 코드 작성');
}

export async function getMemberDetail(generationId, memberId) {
  if (USE_MOCK) {
    const data = getMockStore(generationId);
    const member = data.members.find((m) => m.id === Number(memberId));
    if (!member) throw new Error('멤버를 찾을 수 없습니다.');

    const detail = data.memberDetails[memberId] ?? {
      paidTotal: 0,
      unpaidTotal: 0,
      dues: [],
    };

    return { member, ...detail };
  }

  throw new Error('나중에 USE_MOCK을 false 로 두고 이곳에 axios 통신 코드 작성');
}

export async function closeGeneration(generationId, endDate) {
  if (USE_MOCK) {
    const data = getMockStore(generationId);
    data.generation.endDate = endDate;
    data.generation.isActive = false;
    return { success: true };
  }

  throw new Error('아직 준비되지 않았습니다');
}

/*나중에 백엔드 미리 보기*/
/*
*import axiosInstance from '.axiosInstance'; // 설정해둔 axios 불러오기
*const USE_MOCK = false; // mock 을 끈다
*/