import axiosInstance from "../axiosInstance";

function mapOrg(item) {
  return {
    id: item.id ?? item.organizationId,
    name: item.name,
    memberCount: item.activeTerm?.memberCount,
    currentTerm: item.currentTerm ?? item.activeTerm ?? null,
    role: item.role ?? null,
  };
}

function mapInviteCodes(data) {
  const codes = data.inviteCodes ?? data.invitations ?? data;
  if (Array.isArray(codes)) {
    const staff = codes.find((c) => String(c.role).toUpperCase() === "STAFF");
    const member = codes.find((c) => String(c.role).toUpperCase() === "MEMBER");
    return {
      staff: staff?.code ?? "",
      general: member?.code ?? "",
    };
  }
  return {
    staff: codes.staff ?? codes.staffCode ?? "",
    general: codes.general ?? codes.member ?? codes.memberCode ?? "",
  };
}

function todayDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function getMyOrganizations() {
  const response = await axiosInstance.get("/organizations");
  const payload = response.data?.data;
  const list = Array.isArray(payload)
    ? payload
    : payload?.content ?? payload?.organizations ?? [];
  return list.map(mapOrg);
}

export async function getOrganization(organizationId) {
  const response = await axiosInstance.get(`/organizations/${organizationId}`);
  return mapOrg(response.data?.data);
}

export async function createOrganization({
  name,
  initialTermName,
  initialTermStartDate,
}) {
  const body = {
    name: name.trim(),
    initialTermName: initialTermName?.trim() || "1기",
    initialTermStartDate: initialTermStartDate || todayDateString(),
  };

  const response = await axiosInstance.post("/organizations", body);
  const data = response.data?.data;

  return {
    org: mapOrg(data.organization ?? data.org ?? data),
    inviteCodes: mapInviteCodes(data),
  };
}
