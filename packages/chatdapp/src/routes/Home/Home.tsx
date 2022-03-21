import { HdLogo } from "hd-materials";
import { Menubar } from "primereact/menubar";
import { Outlet } from "react-router-dom";
import RequireAuth from "../../guards/RequireAuth";
import SideNav from "../../components/SideNav/SideNav";
import WalletBtn from "../../components/WalletBtn";

const Home = () => {
  return (
    <RequireAuth>
      <>
        <Menubar
          className="hd-menubar bg-gray-600 border-0 rounded-none"
          start={<HdLogo />}
          end={<WalletBtn />}
        />
        <div className="flex flex-row h-full w-full overflow-x-hidden text-gray-800">
          <SideNav />
          <div className="flex flex-col flex-auto h-full">
            <div className="flex flex-col flex-auto flex-shrink-0 h-full p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </>
    </RequireAuth>
  );
};

export default Home;
