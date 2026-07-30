import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const navigate = useNavigate();

  const handleKakaoLogin = () => {
    
    navigate("/org-select");
  };

  // ...
}