import { useState } from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { Button, PermissionBadge, Input, Card, Modal } from './components/common';


/* ── 아이콘 ── */
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── 컴포넌트 미리보기 페이지 ── */
function ComponentPreview() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <h1 style={{ margin: 0, fontSize: '24px' }}>공통 컴포넌트 미리보기</h1>

      {/* Button */}
      <section>
        <h2 style={{ fontSize: '16px', color: '#888', marginBottom: '12px' }}>Button</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <Button variant="primary" icon={<PlusIcon />}>거래 등록</Button>
          <Button variant="secondary" icon={<BackIcon />}>뒤로 가기</Button>
          <Button variant="primary" size="small">전체</Button>
          <Button variant="secondary" size="small">전체</Button>
        </div>
      </section>

      {/* PermissionBadge */}
      <section>
        <h2 style={{ fontSize: '16px', color: '#888', marginBottom: '12px' }}>PermissionBadge</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <PermissionBadge variant="danger">나가기</PermissionBadge>
          <PermissionBadge variant="danger">예산 초과</PermissionBadge>
          <PermissionBadge variant="warning">80% 초과</PermissionBadge>
          <PermissionBadge variant="success">진행 중</PermissionBadge>
          <PermissionBadge variant="danger">미납 3명</PermissionBadge>
          <PermissionBadge variant="success">전원 납부</PermissionBadge>
          <PermissionBadge variant="staff">운영진</PermissionBadge>
          <PermissionBadge variant="general">일반</PermissionBadge>
          <PermissionBadge variant="danger">미납</PermissionBadge>
          <PermissionBadge variant="success">납부</PermissionBadge>
        </div>
      </section>

      {/* Input */}
      <section>
        <h2 style={{ fontSize: '16px', color: '#888', marginBottom: '12px' }}>Input</h2>
        <div style={{ maxWidth: '320px' }}>
          <Input label="금액" placeholder="0" />
        </div>
      </section>

      {/* Card */}
      <section>
        <h2 style={{ fontSize: '16px', color: '#888', marginBottom: '12px' }}>Card</h2>
        <Card title="예산 요약">
          <p style={{ margin: 0, color: '#555' }}>카드 내용이 여기에 들어갑니다.</p>
        </Card>
      </section>

      {/* Modal */}
      <section>
        <h2 style={{ fontSize: '16px', color: '#888', marginBottom: '12px' }}>Modal</h2>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          모달 열기
        </Button>
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="삭제 확인"
          actions={
            <>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                취소
              </Button>
              <Button variant="primary" onClick={() => setModalOpen(false)}>
                확인
              </Button>
            </>
          }
        >
          정말 삭제하시겠습니까?
        </Modal>
      </section>
    </div>
  );
}

/* ── Sidebar 네비용 더미 페이지 ── */
function DummyPage({ title }) {
  return (
    <div>
      <h1 style={{ margin: 0, fontSize: '24px' }}>{title}</h1>
      <p style={{ color: '#888', marginTop: '8px' }}>Sidebar 메뉴 클릭 테스트용 페이지입니다.</p>
    </div>
  );
}

/* ── App ── */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<ComponentPreview />} />
          <Route path="dashboard" element={<DummyPage title="대시보드" />} />
          <Route path="ledger" element={<DummyPage title="가계부" />} />
          <Route path="event" element={<DummyPage title="행사" />} />
          <Route path="group-manage" element={<DummyPage title="단체" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


