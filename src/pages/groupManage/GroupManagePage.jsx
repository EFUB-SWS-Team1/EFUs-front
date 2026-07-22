import { useCallback, useEffect, useMemo, useState } from "react";
import {
  closeGeneration,
  getGroupManageOverview,
  getMemberDetail,
} from "../../api/groupManage";

import { Button } from "../../components/common";
import groupIcon from "../../assets/efub로고2.svg";
import usersIcon from "../../assets/Users.svg";
import searchIcon from "../../assets/searchIcon.svg";
import MemberItem from "./components/MemberItem";
import InviteCodeModal from "./components/InviteCodeModal";
import GenerationCloseModal from "./components/GenerationCloseModal";
import MemberDetailPanel from "./components/MemberDetailPanel";
import SuccessModal from "./components/SuccessModal";
import styles from "./GroupManagePage.module.css";

/*loadOverview로 GroupManagePage에 데이터를 불러옴, formatShortDate 는 날짜 다듬기, 
멤버를 검색 및 페이지 별로 보여줌 : filteredMembers, totalPages, pagedMembers, 
멤버 클릭하면 팝업창 띄움 : handleMemberClick */

const GENERATION_ID = "efub-6";
const PAGE_SIZE = 7;

function formatShortDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  const y = String(date.getFullYear()).slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

export default function GroupManagePage() {
  const [generation, setGeneration] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [memberDetail, setMemberDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const isStaff = currentUser?.role === "staff";

  const loadOverview = useCallback(() => {
    getGroupManageOverview(GENERATION_ID).then((data) => {
      setGeneration(data.generation);
      setCurrentUser(data.currentUser);
      setMembers(data.members);
    });
  }, []);

  /*loadOverview: getGroupManageOverview를 실행해서 데이터를 받아온 뒤, 화면 상태(State)에 저장하는 역할*/

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const filteredMembers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return members;
    return members.filter((m) => m.name.toLowerCase().includes(keyword));
  }, [members, search]);
  /*filteredMembers : 검색하는거*/

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  /*totalPages : 총 몇페이지가 필요한지 전체 페이지 계산*/

  const pagedMembers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredMembers.slice(start, start + PAGE_SIZE);
  }, [filteredMembers, page]);
  /*pagedMembers : 현재 페이지에 보여줄 멤버*/

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  async function handleMemberClick(memberId) {
    setSelectedMemberId(memberId);
    setDetailLoading(true);

    try {
      const detail = await getMemberDetail(GENERATION_ID, memberId);
      setMemberDetail(detail);
    } finally {
      setDetailLoading(false);
    }
  }
  /*handleMemberClick : 김민지 클릭 --> id 파악 --> getMemberDetail 실행 --> 김민지 납부 현황 데이터 가져옴*/

  function handleCloseDetail() {
    setSelectedMemberId(null);
    setMemberDetail(null);
  }

  async function handleGenerationClose(endDate) {
    await closeGeneration(GENERATION_ID, endDate);
    setIsCloseOpen(false);
    setIsSuccessOpen(true);
    loadOverview();
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <img src={groupIcon} alt="" className={styles.headerIcon} />
        <h1 className={styles.title}>단체 관리</h1>
      </header>

      <section className={styles.generationCard}>
        <div className={styles.generationInfo}>
          <h2 className={styles.generationLabel}>{generation?.label ?? "-"}</h2>
          <p className={styles.generationDate}>
            {generation?.startDate
              ? `${formatShortDate(generation.startDate)} -${
                  generation.endDate
                    ? ` ${formatShortDate(generation.endDate)}`
                    : ""
                }`
              : "-"}
          </p>
        </div>
        {isStaff && generation?.isActive && (
          <Button
            variant="primary"
            className={styles.closeGenBtn}
            onClick={() => setIsCloseOpen(true)}
          >
            기수 종료
          </Button>
        )}
      </section>

      <div className={styles.memberToolbar}>
        <h3 className={styles.memberCount}>
          <span>멤버</span>
          <img
            src={usersIcon}
            alt=""
            className={styles.memberIcon}
            aria-hidden="true"
          />
          <span>{members.length}</span>
        </h3>
        {isStaff && (
          <button
            type="button"
            className={styles.inviteBtn}
            onClick={() => setIsInviteOpen(true)}
          >
            멤버 초대
          </button>
        )}
      </div>

      <div className={styles.searchCard}>
        <img
          src={searchIcon}
          alt=""
          className={styles.searchIcon}
          aria-hidden="true"
        />
        <input
          type="search"
          className={styles.searchInput}
          placeholder="이름으로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <section className={styles.listCard}>
        <ul className={styles.memberList}>
          {pagedMembers.map((member) => (
            <li key={member.id}>
              <MemberItem
                member={member}
                isSelected={selectedMemberId === member.id}
                onClick={() => handleMemberClick(member.id)}
              />
            </li>
          ))}
        </ul>
        {filteredMembers.length === 0 && (
          <p className={styles.empty}>검색 결과가 없습니다.</p>
        )}

        {filteredMembers.length > 0 && (
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="이전 페이지"
            >
              ‹
            </button>
            <span className={styles.pageInfo}>
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="다음 페이지"
            >
              ›
            </button>
          </div>
        )}
      </section>

      {isStaff && (
        <>
          <InviteCodeModal
            isOpen={isInviteOpen}
            generationId={GENERATION_ID}
            onClose={() => setIsInviteOpen(false)}
          />

          <GenerationCloseModal
            isOpen={isCloseOpen}
            generationLabel={generation?.label ?? ""}
            onClose={() => setIsCloseOpen(false)}
            onSubmit={handleGenerationClose}
          />

          <SuccessModal
            isOpen={isSuccessOpen}
            message="기수가 성공적으로 종료되었어요!"
            onClose={() => setIsSuccessOpen(false)}
          />
        </>
      )}

      <MemberDetailPanel
        isOpen={selectedMemberId != null}
        detail={memberDetail}
        loading={detailLoading}
        onClose={handleCloseDetail}
      />
    </div>
  );
}
