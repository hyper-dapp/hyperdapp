import { useNavigate } from "react-router-dom";

const HyperdappLogo = ({ clickable }: { clickable?: boolean }) => {
  const navigate = useNavigate();

  return (
    <img
      className="cursor-pointer mr-8"
      src="/images/hyperdapp-logo.png"
      onClick={() => (clickable ? navigate("/") : null)}
      width="170"
      height="70"
      alt="hyperdapp-logo"
    />
  );
};

export default HyperdappLogo;
