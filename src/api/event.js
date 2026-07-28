/**
 * dashboard.js 와 동일한 패턴
 * USE_MOCK = false 로 바꾸면 실제 API 호출
 */

const USE_MOCK = true;

const MOCK_EVENTS_BY_GENERATION = {
  'efub-6': {
    summary: {
      totalBudget: 1000000,
      totalSpent: 640000,
      balance: 360000,
    },
    events: [
      {
        id: 1,
        name: '8월 MT',
        status: 'ongoing',
        spent: 300000,
        budget: 600000,
        percent: 50,
        participants: 25,
        startDate: '2025-08-08',
        endDate: '2026-08-09',
      },
      {
        id: 2,
        name: '1학기 종강파티',
        status: 'warning',
        spent: 190000,
        budget: 200000,
        percent: 95,
        participants: 30,
        startDate: '2025-06-01',
        endDate: '2025-06-01',
      },
      {
        id: 3,
        name: '3월 OT 회식',
        status: 'over',
        spent: 150000,
        budget: 100000,
        percent: 150,
        overAmount: 50000,
        participants: 20,
        startDate: '2025-03-15',
        endDate: '2025-03-15',
      },
    ],
  },
};

const MOCK_TRANSACTIONS_BY_EVENT = {
  1: [
    { id: 1, date: '2026-07-05', description: 'MT 회비', amount: 600000 },
    { id: 2, date: '2026-07-03', description: 'MT 숙소비', amount: -300000 },
  ],
};

function getMockData(generationId) {
  return MOCK_EVENTS_BY_GENERATION[generationId] ?? MOCK_EVENTS_BY_GENERATION['efub-6'];
}

export async function getEvents(generationId) {
  if (USE_MOCK) return getMockData(generationId);

  
  throw new Error('axiosInstance가 아직 준비되지 않았습니다. USE_MOCK을 true로 바꾸셈');
}

export async function getEventDetail(generationId, eventId) {
  if (USE_MOCK) {
    const { events } = getMockData(generationId);
    const event = events.find((item) => String(item.id) === String(eventId));
    if (!event) throw new Error('행사를 찾을 수 없습니다.');
    return {
      event,
      transactions: MOCK_TRANSACTIONS_BY_EVENT[eventId] ?? [],
    };
  }

  // const { data } = await axiosInstance.get(`/generations/${generationId}/events/${eventId}`);
  // return data;
  throw new Error('axiosInstance가 아직 준비되지 않았습니다. USE_MOCK을 true로 둬야함');
}

export async function createEvent(generationId, payload) {
  if (USE_MOCK) {
    const data = getMockData(generationId);
    const newEvent = {
      id: Date.now(),
      status: 'ongoing',
      spent: 0,
      percent: 0,
      ...payload,
    };
    data.events.unshift(newEvent);
    return newEvent;
  }

  // const { data } = await axiosInstance.post(`/generations/${generationId}/events`, payload);
  // return data;
  throw new Error('axiosInstance가 아직 준비되지 않았습니다. USE_MOCK을 true로.');
}

export async function updateEvent(generationId, eventId, payload) {
  if (USE_MOCK) {
    const data = getMockData(generationId);
    const index = data.events.findIndex((item) => String(item.id) === String(eventId));
    if (index === -1) throw new Error('행사를 찾을 수 없습니다.');
    data.events[index] = { ...data.events[index], ...payload };
    return data.events[index];
  }

  // const { data } = await axiosInstance.put(`/generations/${generationId}/events/${eventId}`, payload);
  // return data;
  throw new Error('axiosInstance가 아직 준비되지 않았습니다. USE_MOCK을 true로 두세요.');
}