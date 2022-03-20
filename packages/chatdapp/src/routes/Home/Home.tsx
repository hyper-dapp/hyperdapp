import { Outlet } from "react-router-dom";
import RequireAuth from "../../guards/RequireAuth";
import Navbar from "../../components/NavBar/Navbar";
import SideNav from "../../components/SideNav/SideNav";

const Home = () => {
  return (
    <RequireAuth>
      <>
        <Navbar />
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
