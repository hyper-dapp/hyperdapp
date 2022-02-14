import { Fragment } from "react";
import { Outlet } from "react-router-dom";
import RequireAuth from "../../guards/RequireAuth";
import Navbar from "../../components/NavBar/Navbar";
import SideNav from "../../components/SideNav/SideNav";

const Home = () => {
  return (
    <RequireAuth>
      <Fragment>
        <Navbar />
        <div className="flex flex-row h-full w-full overflow-x-hidden text-gray-800">
          <SideNav />
          <div className="flex flex-col flex-auto h-full">
            <div className="flex flex-col flex-auto flex-shrink-0 bg-gray-100 h-full p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </Fragment>
    </RequireAuth>
  );
};

export default Home;
