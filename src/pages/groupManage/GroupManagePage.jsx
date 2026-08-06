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
          <img src={groupIcon} alt="" className={styles.headerIcon} />
          <h1 className={styles.title}>단체 관리</h1>
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
            <img src={usersIcon} alt="" className={styles.memberIcon} />
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
            <img src={searchIcon} alt="" className={styles.searchIcon} />
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
            <option value="">전체 역할</option>
            <option value="STAFF">운영진</option>
            <option value="MEMBER">일반</option>
          </select>
        </div>

        <section className={styles.listCard}>
          {loading && (
            <p className={styles.empty}>불러오는 중...</p>
          )}

          {!loading && error && (
            <p className={styles.empty}>{error}</p>
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
                    onClick={() => selectMember(member.termMemberId)}
                  />
                </li>
              ))}
            </ul>
          )}

          {!loading && !error && members.length === 0 && (
            <p className={styles.empty}>구성원이 없습니다.</p>
          )}

          {!loading && !error && totalElements > 0 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={page === 0}
                onClick={() => setPage((value) => value - 1)}
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
                onClick={() => setPage((value) => value + 1)}
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
            onClose={() => setIsInviteOpen(false)}
          />

          <GenerationCloseModal
            isOpen={isCloseOpen}
            generationLabel={currentTerm?.name ?? ""}
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
    </div>
  );
}