import { useCallback, useEffect, useMemo, useState } from "react";
import { getMyOrganizations, getOrganizationTerms, getTerm } from "../api";
import { GroupContext } from "./GroupStateContext";

const ORGANIZATION_STORAGE_KEY = "selectedOrganizationId";
const TERM_STORAGE_KEY = "selectedTermId";

function getId(item, key) {
  return item?.[key] ?? item?.id ?? null;
}

function selectDefaultTerm(terms) {
  const activeTerm = terms.find(
    (term) => String(term.status).toUpperCase() === "ACTIVE",
  );
  if (activeTerm) return activeTerm;

  return [...terms].sort(
    (a, b) => new Date(b.startDate ?? 0) - new Date(a.startDate ?? 0),
  )[0] ?? null;
}

export function GroupProvider({ children }) {
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [terms, setTerms] = useState([]);
  const [currentTerm, setCurrentTerm] = useState(null);
  const [isGroupLoading, setIsGroupLoading] = useState(true);

  const clearSelection = useCallback(() => {
    localStorage.removeItem(ORGANIZATION_STORAGE_KEY);
    localStorage.removeItem(TERM_STORAGE_KEY);
    setCurrentOrganization(null);
    setTerms([]);
    setCurrentTerm(null);
  }, []);

  const loadTerm = useCallback(async (termId) => {
    const detail = await getTerm(termId);
    if (!detail || getId(detail, "termId") == null) {
      throw new Error("유효한 기수 정보를 찾을 수 없습니다.");
    }
    setCurrentTerm(detail);
    localStorage.setItem(TERM_STORAGE_KEY, String(getId(detail, "termId")));
    return detail;
  }, []);

  const selectOrganization = useCallback(async (organization) => {
    const organizationId = getId(organization, "organizationId");
    if (organizationId == null) throw new Error("유효한 단체 ID가 없습니다.");

    setIsGroupLoading(true);
    try {
      const organizationTerms = await getOrganizationTerms(organizationId);
      const defaultTerm = selectDefaultTerm(organizationTerms);
      if (!defaultTerm) throw new Error("선택할 수 있는 기수가 없습니다.");

      setCurrentOrganization(organization);
      setTerms(organizationTerms);
      localStorage.setItem(ORGANIZATION_STORAGE_KEY, String(organizationId));
      await loadTerm(getId(defaultTerm, "termId"));
    } catch (error) {
      clearSelection();
      throw error;
    } finally {
      setIsGroupLoading(false);
    }
  }, [clearSelection, loadTerm]);

  const selectTerm = useCallback(async (termId) => {
    const belongsToOrganization = terms.some(
      (term) => String(getId(term, "termId")) === String(termId),
    );
    if (!belongsToOrganization) throw new Error("현재 단체에 속하지 않은 기수입니다.");

    setIsGroupLoading(true);
    try {
      return await loadTerm(termId);
    } finally {
      setIsGroupLoading(false);
    }
  }, [loadTerm, terms]);

  useEffect(() => {
    let active = true;

    async function restoreSelection() {
      const storedOrganizationId = localStorage.getItem(ORGANIZATION_STORAGE_KEY);
      const storedTermId = localStorage.getItem(TERM_STORAGE_KEY);
      if (!storedOrganizationId) {
        if (active) setIsGroupLoading(false);
        return;
      }

      try {
        const organizations = await getMyOrganizations();
        const organization = organizations.find(
          (item) => String(getId(item, "organizationId")) === storedOrganizationId,
        );
        if (!organization) throw new Error("저장된 단체가 유효하지 않습니다.");

        const organizationTerms = await getOrganizationTerms(storedOrganizationId);
        const storedTerm = organizationTerms.find(
          (term) => String(getId(term, "termId")) === storedTermId,
        );
        const termToRestore = storedTerm ?? selectDefaultTerm(organizationTerms);
        if (!termToRestore) throw new Error("복원할 기수가 없습니다.");

        const detail = await getTerm(getId(termToRestore, "termId"));
        if (!active) return;

        setCurrentOrganization(organization);
        setTerms(organizationTerms);
        setCurrentTerm(detail);
        localStorage.setItem(
          TERM_STORAGE_KEY,
          String(getId(detail, "termId")),
        );
      } catch {
        if (active) clearSelection();
      } finally {
        if (active) setIsGroupLoading(false);
      }
    }

    restoreSelection();
    return () => {
      active = false;
    };
  }, [clearSelection]);

  const currentOrganizationId = getId(currentOrganization, "organizationId");
  const currentTermId = getId(currentTerm, "termId");
  const value = useMemo(() => ({
    currentOrganization,
    currentOrganizationId,
    terms,
    currentTerm,
    currentTermId,
    termStatus: currentTerm?.status ?? null,
    role: currentTerm?.role ?? currentTerm?.userRole ?? null,
    isGroupLoading,
    selectOrganization,
    selectTerm,
    clearSelection,
  }), [
    clearSelection,
    currentOrganization,
    currentOrganizationId,
    currentTerm,
    currentTermId,
    isGroupLoading,
    selectOrganization,
    selectTerm,
    terms,
  ]);

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
}
