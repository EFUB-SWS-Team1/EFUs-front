import { useState } from 'react';
import styles from './MemberPage.module.css';
import MemberInviteModal from './components/MemberInviteModal';
import MemberDetailPanel from './components/MemberDetailPanel';

const DUMMY_CURRENT_USER = {
  id: 1,
  role: 'admin', // 'admin' | 'member' — 나중에 API 로그인 응답값으로 교체
};

const DUMMY_MEMBERS = [
  { id: 1, name: '홍길동', role: 'admin', email: 'hong1@email.com', duesPaid: 15000, duesUnpaid: 10000, dues: [{ name: '5월 회비', amount: 10000, due: '05.07', status: 'unpaid' }, { name: '4월 회비', amount: 5000, due: '04.09', status: 'paid' }, { name: '3월 회비', amount: 10000, due: '03.05', status: 'paid' }] },
  { id: 2, name: '홍길동', role: 'admin', email: 'hong2@email.com', duesPaid: 15000, duesUnpaid: 0, dues: [] },
  { id: 3, name: '김민지', role: 'admin', email: 'honggildong@email.com', duesPaid: 15000, duesUnpaid: 10000, dues: [{ name: '5월 회비', amount: 10000, due: '05.07', status: 'unpaid' }, { name: '4월 회비', amount: 5000, due: '04.09', status: 'paid' }, { name: '3월 회비', amount: 10000, due: '03.05', status: 'paid' }] },
  { id: 4, name: '홍길동', role: 'member', email: 'hong4@email.com', duesPaid: 10000, duesUnpaid: 5000, dues: [] },
  { id: 5, name: '홍길동', role: 'member', email: 'hong5@email.com', duesPaid: 10000, duesUnpaid: 0, dues: [] },
  { id: 6, name: '홍길동', role: 'member', email: 'hong6@email.com', duesPaid: 10000, duesUnpaid: 0, dues: [] },
  { id: 7, name: '홍길동', role: 'member', email: 'hong7@email.com', duesPaid: 10000, duesUnpaid: 0, dues: [] },
  { id: 8, name: '홍길동', role: 'member', email: 'hong8@email.com', duesPaid: 10000, duesUnpaid: 0, dues: [] },
  { id: 9, name: '홍길동', role: 'member', email: 'hong9@email.com', duesPaid: 10000, duesUnpaid: 0, dues: [] },
  { id: 10, name: '홍길동', role: 'member', email: 'hong10@email.com', duesPaid: 10000, duesUnpaid: 0, dues: [] },
];

const PAGE_SIZE = 10;

function MemberPage() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [members, setMembers] = useState(DUMMY_MEMBERS);

  const isAdmin = DUMMY_CURRENT_USER.role === 'admin';

  // 검색 필터
  const filtered = members.filter((m) =>
    m.name.includes(search)
  );

  // 페이지네이션
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
    setSelectedMember(null);
  };

  const handleSelectMember = (member) => {
    setSelectedMember(member);
  };

  const handleRoleChange = (memberId, newRole) => {
    setMembers((prev) =>
      prev.map((m) => m.id === memberId ? { ...m, role: newRole } : m)
    );
    setSelectedMember((prev) => ({ ...prev, role: newRole }));
  };

  const handleClosePanel = () => setSelectedMember(null);

  return (
    <div className={styles.pageWrapper}>

      {/* 멤버 상세 패널 (왼쪽에서 슬라이드) */}
      {selectedMember && (
        <MemberDetailPanel
          member={selectedMember}
          isAdmin={isAdmin}
          onClose={handleClosePanel}
          onRoleChange={handleRoleChange}
        />
      )}

      {/* 메인 콘텐츠 */}
      <div className={`${styles.page} ${selectedMember ? styles.pageShifted : ''}`}>

        {/* 헤더 */}
        <div className={styles.pageHeader}>
          <div className={styles.titleRow}>
            <span className={styles.groupIcon}>⠿</span>
            <h1 className={styles.title}>멤버</h1>
            <span className={styles.memberCount}>👥 {members.length}</span>
          </div>
          {isAdmin && (
            <button className={styles.inviteBtn} onClick={() => setShowInviteModal(true)}>
              멤버 초대
            </button>
          )}
        </div>

        {/* 검색 */}
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            placeholder="이름으로 검색"
            value={search}
            onChange={handleSearch}
          />
        </div>

        {/* 멤버 리스트 */}
        <div className={styles.memberList}>
          {paginated.map((member) => (
            <div
              key={member.id}
              className={`${styles.memberItem} ${selectedMember?.id === member.id ? styles.memberItemActive : ''}`}
              onClick={() => handleSelectMember(member)}
            >
              <div className={styles.avatar} />
              <span className={`${styles.roleBadge} ${member.role === 'admin' ? styles.adminBadge : styles.generalBadge}`}>
                {member.role === 'admin' ? '운영진' : '일반'}
              </span>
              <span className={styles.memberName}>{member.name}</span>
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>{currentPage} / {totalPages}</span>
            <button
              className={styles.pageBtn}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              〉
            </button>
          </div>
        )}
      </div>

      {/* 초대 모달 */}
      {showInviteModal && (
        <MemberInviteModal onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
}

export default MemberPage;