import Blockies from "react-blockies";
import { Skeleton } from "primereact/skeleton";

interface BlockieProps {
  address: string | null;
  size?: number | undefined;
  scale?: number | undefined;
}

const Blockie = (props: BlockieProps) => {
  const { address } = props;
  const size = props.size || 15;
  const scale = props.scale || 4;

  if (!address) {
    const px = `${size * scale}px`;
    return <Skeleton shape="circle" width={px} height={px} />;
  }

  return (
    <Blockies
      className="rounded-full"
      seed={address.toLowerCase()}
      size={size}
      scale={scale}
    />
  );
};

export default Blockie;
