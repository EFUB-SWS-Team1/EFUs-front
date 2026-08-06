import { useContext } from "react";
import { GroupContext } from "../context/GroupStateContext";

export default function useGroup() {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error("useGroup은 GroupProvider 안에서 사용해야 합니다.");
  }
  return context;
}
