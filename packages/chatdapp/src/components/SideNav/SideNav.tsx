import { useChain, useMoralis } from "react-moralis";
import { getChainName } from "../../helpers/networks";
import Address from "../Address";
import ActionBtnContainer from "./ActionBtnContainer";
import ChatList from "./ChatList";

const SideNav = () => {
  const { account } = useMoralis();
  const { chainId } = useChain();
  const networkName = getChainName(chainId);

  return (
    <>
      <div className="flex flex-col flex-shrink-0 w-64 bg-white">
        <div
          className="flex flex-col items-center gap-2 w-full py-6 px-4"
          style={{ backgroundColor: "#07c8d6" }}
        >
          <Address
            address={account}
            size={20}
            avatar="top"
            textStyles="font-normal text-sm uppercase"
          />
          <div className="font-normal text-xs uppercase">{networkName}</div>
        </div>
        <div className="h-full relative">
          <ChatList />
          <ActionBtnContainer />
        </div>
      </div>
    </>
  );
};

export default SideNav;
