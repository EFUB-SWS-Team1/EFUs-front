import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Button } from "../../components/common";
import groupIcon from "../../assets/efub로고2.svg";
import usersIcon from "../../assets/Users.svg";
import searchIcon from "../../assets/searchIcon.svg";

import useGroup from "../../hooks/useGroup";

import MemberItem from "./components/MemberItem";
import InviteCodeModal from "./components/InviteCodeModal";
import GenerationCloseModal from "./components/GenerationCloseModal";
import MemberDetailPanel from "./components/MemberDetailPanel";
import SuccessModal from "./components/SuccessModal";

import styles from "./GroupManagePage.module.css";

import {
  closeGeneration,
  getMemberDetail,
  getMembers,
} from "../../api";

const PAGE_SIZE = 7;

function formatShortDate(dateStr) {
  if (!dateStr) return "";

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }

  return [
    String(date.getFullYear()).slice(-2),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join(".");
}

function errorMessage(error) {
  return (
    error.response?.data?.message ??
    error.message ??
    "요청을 처리하지 못했습니다."
  );
}

export default function GroupManagePage() {
  const {
    currentTerm,
    currentTermId,
    role,
    termStatus,
  } = useGroup();

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedMemberId = searchParams.get("member");

  const [members, setMembers] = useState([]);
  const [totalElements, setTotalElements] = useState(0);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const [memberDetail, setMemberDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const isStaff = String(role).toUpperCase() === "STAFF";
  const isActive = String(termStatus).toUpperCase() === "ACTIVE";

  const loadMembers = useCallback(async () => {
    if (currentTermId == null) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await getMembers(currentTermId, {
        keyword: search.trim(),
        role: roleFilter,
        page,
        size: PAGE_SIZE,
      });

      setMembers(result.content);
      setTotalElements(result.totalElements);
    } catch (requestError) {
      setError(errorMessage(requestError));
      setMembers([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [currentTermId, page, roleFilter, search]);

  useEffect(() => {
    // Async API synchronization intentionally starts when query state changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    if (!selectedMemberId || currentTermId == null) {
      setMemberDetail(null);
      setDetailError("");
      return;
    }

    let active = true;

    // Async API synchronization intentionally starts for the URL member id.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDetailLoading(true);
    setDetailError("");

    getMemberDetail(currentTermId, selectedMemberId)
      .then((detail) => {
        if (active) {
          setMemberDetail(detail);
        }
      })
      .catch((requestError) => {
        if (active) {
          setMemberDetail(null);
          setDetailError(errorMessage(requestError));
        }
      })
      .finally(() => {
        if (active) {
          setDetailLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [currentTermId, selectedMemberId]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalElements / PAGE_SIZE),
  );

  const selectMember = (termMemberId) => {
    setSearchParams({
      member: String(termMemberId),
    });
  };

  const closeDetail = () => {
    setSearchParams({});
  };

  async function handleGenerationClose(endDate) {
    await closeGeneration(currentTermId, endDate);

    setIsCloseOpen(false);
    setIsSuccessOpen(true);
  }

  return (
    <div
      className={[
        styles.pageRoot,
        selectedMemberId ? styles.pageRootWithPanel : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <MemberDetailPanel
        isOpen={Boolean(selectedMemberId)}
        termId={currentTermId}
        termMemberId={selectedMemberId}
        detail={memberDetail}
        loading={detailLoading}
        error={detailError}
        onClose={closeDetail}
      />

      <div className={styles.page}>
        <header className={styles.header}>
          <img
            src={groupIcon}
            alt=""
            className={styles.headerIcon}
          />

          <h1 className={styles.title}>
            단체 관리
          </h1>
        </header>

        <section className={styles.generationCard}>
          <div>
            <h2 className={styles.generationLabel}>
              {currentTerm?.name ?? "-"}
            </h2>

            <p className={styles.generationDate}>
              {currentTerm?.startDate
                ? `${formatShortDate(currentTerm.startDate)} -${
                    currentTerm.endDate
                      ? ` ${formatShortDate(currentTerm.endDate)}`
                      : ""
                  }`
                : "-"}
            </p>
          </div>

          {isStaff && isActive && (
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
            />

            <span>{totalElements}</span>
          </h3>

          {isStaff && isActive && (
            <button
              type="button"
              className={styles.inviteBtn}
              onClick={() => setIsInviteOpen(true)}
            >
              멤버 초대
            </button>
          )}
        </div>

        <div className={styles.filters}>
          <div className={styles.searchCard}>
            <img
              src={searchIcon}
              alt=""
              className={styles.searchIcon}
            />

            <input
              type="search"
              className={styles.searchInput}
              placeholder="이름으로 검색"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
            />
          </div>

          <select
            className={styles.roleFilter}
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value);
              setPage(0);
            }}
            aria-label="역할 필터"
          >
            <option value="">
              전체 역할
            </option>

            <option value="STAFF">
              운영진
            </option>

            <option value="MEMBER">
              일반
            </option>
          </select>
        </div>

        <section className={styles.listCard}>
          {loading && (
            <p className={styles.empty}>
              불러오는 중...
            </p>
          )}

          {!loading && error && (
            <p className={styles.empty}>
              {error}
            </p>
          )}

          {!loading && !error && (
            <ul className={styles.memberList}>
              {members.map((member) => (
                <li key={member.termMemberId}>
                  <MemberItem
                    member={member}
                    isSelected={
                      String(selectedMemberId) ===
                      String(member.termMemberId)
                    }
                    onClick={() =>
                      selectMember(member.termMemberId)
                    }
                  />
                </li>
              ))}
            </ul>
          )}

          {!loading &&
            !error &&
            members.length === 0 && (
              <p className={styles.empty}>
                구성원이 없습니다.
              </p>
            )}

          {!loading &&
            !error &&
            totalElements > 0 && (
              <div className={styles.pagination}>
                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={page === 0}
                  onClick={() =>
                    setPage((value) => value - 1)
                  }
                >
                  ‹
                </button>

                <span className={styles.pageInfo}>
                  {page + 1} / {totalPages}
                </span>

                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={page + 1 >= totalPages}
                  onClick={() =>
                    setPage((value) => value + 1)
                  }
                >
                  ›
                </button>
              </div>
            )}
        </section>
      </div>

      {isStaff && isActive && (
        <>
          <InviteCodeModal
            isOpen={isInviteOpen}
            termId={currentTermId}
            onClose={() =>
              setIsInviteOpen(false)
            }
          />

          <GenerationCloseModal
            isOpen={isCloseOpen}
            generationLabel={currentTerm?.name ?? ""}
            onClose={() =>
              setIsCloseOpen(false)
            }
            onSubmit={handleGenerationClose}
          />

          <SuccessModal
            isOpen={isSuccessOpen}
            message="기수가 성공적으로 종료되었어요!"
            onClose={() =>
              setIsSuccessOpen(false)
            }
          />
        </>
      )}
    </div>
  );
}