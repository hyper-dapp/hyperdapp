import { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useChain, useMoralis } from "react-moralis";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { CortexMoralisEntity } from "../../models/cortex.models";
import { useAppDispatch } from "../../store/store";
import { getContractABI } from "../../store/slices/contracts";
import { getCortexData } from "../../store/slices/cortex";
import Loader from "../../components/Loader";

const Cortex = () => {
  const { cortexId } = useParams();
  const { chainId } = useChain();
  const { user } = useMoralis();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initCortexData = async () => {
      if (!cortexId || !chainId || !user) return;
      const { payload } = await dispatch(
        getCortexData({ cortexId, chainId, user })
      );
      const abisDataPromise = (payload as CortexMoralisEntity).abis.map((obj) =>
        dispatch(getContractABI({ ...obj, chainId }))
      );
      await Promise.all(abisDataPromise);
      setIsLoading(false);
    };

    initCortexData();
  }, [cortexId, chainId, user, dispatch]);

  const items = useMemo<MenuItem[]>(() => {
    const baseURI = `/cortex/${cortexId}`;

    return [
      {
        label: "Contract ABIs",
        icon: "pi pi-fw pi-folder",
        command: () => navigate(`${baseURI}/contracts`),
      },
      {
        label: "Cortex Variables",
        icon: "pi pi-fw pi-globe",
        command: () => navigate(`${baseURI}/variables`),
      },
      {
        label: "Cortex Editor",
        icon: "pi pi-fw pi-sitemap",
        command: () => navigate(`${baseURI}/editor`),
      },
    ];
  }, [cortexId, navigate]);

  return (
    <div className="flex flex-row w-full h-full">
      <Menu model={items} style={{ minWidth: "220px" }} />
      <div className="container mx-auto p-10 w-full h-full">
        {isLoading && <Loader />}
        {!isLoading && <Outlet />}
      </div>
    </div>
  );
};

export default Cortex;
