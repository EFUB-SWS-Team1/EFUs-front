import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useGroup from "../../hooks/useGroup";
import ProfileHeader from "./components/ProfileHeader";
import OrgEmptyState from "./components/OrgEmptyState";
import OrgList from "./components/OrgList";
import OrgSelectActions from "./components/OrgSelectActions";
import InviteCodeModal from "./components/InviteCodeModal";
import CreateOrgModal from "./components/CreateOrgModal";
import CreateOrgSuccessModal from "./components/CreateOrgSuccessModal";
import styles from "./OrgSelectPage.module.css";
import {
  createOrganization,
  getInviteCodes,
  getMyOrganizations,
  joinOrganizationByCode,
  validateInvitation,
} from "../../api";

export default function OrgSelectPage() {
  const { user } = useAuth();
  const { selectOrganization } = useGroup();
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  // null | 'invite' | 'create' | 'createSuccess'
  const [createdInviteCodes, setCreatedInviteCodes] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function fetchOrgs() {
      try {
        const data = await getMyOrganizations();
        if (!ignore) setOrganizations(data);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    fetchOrgs();
    return () => {
      ignore = true;
    };
  }, []);

  const handleEnterOrg = async (orgId) => {
    const organization = organizations.find(
      (item) => String(item.id) === String(orgId),
    );
    if (!organization) return;
    await selectOrganization(organization);
    navigate("/dashboard");
  };

  const handleJoinByCode = async (code) => {
    await joinOrganizationByCode(code);
    setOrganizations(await getMyOrganizations());
    setActiveModal(null);
  };

  const handleCreateOrg = async (payload) => {
    const result = await createOrganization(payload);
    const inviteCodes = await getInviteCodes(result.termId);
    setOrganizations((prev) => [...prev, result.org]);
    setCreatedInviteCodes(inviteCodes);
    setActiveModal("createSuccess");
  };

  const hasOrgs = organizations.length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <ProfileHeader user={user} />

        <div className={styles.body}>
          {isLoading ? (
            <p className={styles.statusText}>불러오는 중...</p>
          ) : hasOrgs ? (
            <OrgList organizations={organizations} onEnter={handleEnterOrg} />
          ) : (
            <OrgEmptyState />
          )}
        </div>

        <OrgSelectActions
          onInviteClick={() => setActiveModal("invite")}
          onCreateClick={() => setActiveModal("create")}
        />
      </div>

      <InviteCodeModal
        isOpen={activeModal === "invite"}
        onClose={() => setActiveModal(null)}
        onSubmit={handleJoinByCode}
        onValidate={validateInvitation}
      />

      <CreateOrgModal
        isOpen={activeModal === "create"}
        onClose={() => setActiveModal(null)}
        onSubmit={handleCreateOrg}
      />

      <CreateOrgSuccessModal
        isOpen={activeModal === "createSuccess"}
        inviteCodes={createdInviteCodes}
        onClose={() => {
          setActiveModal(null);
          setCreatedInviteCodes(null);
        }}
      />
    </div>
  );
}
