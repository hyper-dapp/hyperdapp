import { useNavigate } from "react-router-dom";

const HyperdappLogo = ({
  clickable,
  redirectTo,
}: {
  clickable?: boolean;
  redirectTo?: string;
}) => {
  const navigate = useNavigate();

  return (
    <img
      className="cursor-pointer mr-8"
      src="/images/hyperdapp-logo.png"
      onClick={() =>
        clickable ? navigate(redirectTo ? redirectTo : "/") : null
      }
      width="170"
      height="70"
      alt="hyperdapp-logo"
    />
  );
};

export default HyperdappLogo;
