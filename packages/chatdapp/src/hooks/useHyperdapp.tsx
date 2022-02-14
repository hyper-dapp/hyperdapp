import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useChain, useMoralis } from "react-moralis";
import { toast } from "react-toastify";
import { useAppDispatch } from "../store/store";
import { getChats, updateChatsState } from "../store/slices/chats";
import { getOnlineUsers } from "../store/slices/users";
import { TOAST_TXT } from "../models/toast.models";
import { ChatMoralisEntity } from "../models/chat.models";
import { ethers } from "ethers";
import { getEllipsisTxt } from "../helpers/formatters";
import { getExplorer } from "../helpers/networks";
import { Button } from "primereact/button";

interface PartysliceHook {
  connectWallet(): Promise<void>;
  disconnectWallet(): Promise<void>;
}

const signingMessage = `Welcome to Hyperdapp! 

Please sign this message to log in Hyperdapp.
        
This request will not trigger a blockchain transaction or cost any gas fees.
        
Your authentication status will reset after 24 hours.`;

export const useHyperdapp = (): PartysliceHook => {
  const { account, isAuthenticated, user, Moralis, authenticate, logout } =
    useMoralis();
  const { chainId } = useChain();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!chainId || !isAuthenticated || !user) return;

    const initData = async () => {
      user.set("isOnline", true);
      await user.save();
      await dispatch(getOnlineUsers());
      await dispatch(getChats({ userId: user.id, chainId }));
    };

    initData();
  }, [chainId, isAuthenticated, user, dispatch]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const initChatsSubscription = async () => {
      const userId = user.id;
      const query = new Moralis.Query("Chat");
      query.containsAll("users", [userId]);
      query.select("createdBy", "name", "users");
      const subscription = await query.subscribe();
      subscription.on("create", (chat) => {
        const { id, attributes } = chat;
        dispatch(updateChatsState({ id, ...attributes } as ChatMoralisEntity));
        if (attributes.createdBy.id === userId) {
          toast.success(
            <div>
              <strong>{attributes.isPrivate ? "Private" : "Public"}</strong>{" "}
              chat room <strong>{attributes.name}</strong> has been created!
            </div>
          );
        } else {
          toast.info(
            <div>
              You have been added to <strong>{attributes.name}</strong> chat
              room
            </div>
          );
        }
      });
    };

    initChatsSubscription();
  }, [isAuthenticated, user, dispatch, Moralis]);

  useEffect(() => {
    if (!isAuthenticated || !account || !chainId) return;

    const transactionNotification = (
      fromAddress: string,
      value: string,
      symbol: string,
      hash: string
    ) => {
      const ethValue = ethers.utils.formatEther(value);
      const sender = getEllipsisTxt(fromAddress);
      const amount = Number(ethValue).toFixed(2);
      const url = `${getExplorer(chainId)}tx/${hash}`;
      toast.success(
        <div>
          <p>
            You've just received{" "}
            <strong>
              {amount}
              {symbol}
            </strong>{" "}
            from <strong>{sender}</strong>
          </p>
          <Button
            className="p-button-text p-0"
            label={getEllipsisTxt(hash)}
            icon="pi pi-external-link"
            onClick={() => window.open(url, "_blank")}
          />
        </div>
      );
    };

    const getEthTransactions = async () => {
      const query = new Moralis.Query("EthTransactions");
      query.equalTo("to_address", account);

      const subscription = await query.subscribe();
      subscription.on("create", (data) => {
        const { value, from_address, hash } = data.attributes;
        transactionNotification(from_address, value, "Ξ", hash);
      });
    };

    const getTokenTransfers = async () => {
      const query = new Moralis.Query("EthTokenTransfers");
      query.equalTo("to_address", account);
      const subscription = await query.subscribe();
      subscription.on("create", async (data) => {
        const { value, from_address, transaction_hash, token_address } =
          data.attributes;
        const [{ symbol }] = await Moralis.Web3API.token.getTokenMetadata({
          chain: chainId as any,
          addresses: [token_address],
        });
        transactionNotification(from_address, value, symbol, transaction_hash);
      });
    };

    getEthTransactions();

    getTokenTransfers();
  }, [isAuthenticated, account, chainId, Moralis]);

  const connectWallet = async () => {
    toast.loading(TOAST_TXT.CONNECTING, { autoClose: false });
    await authenticate({
      signingMessage,
      onSuccess: () => {
        toast.dismiss();
        toast.success(TOAST_TXT.CONNECTED);
      },
      onError: (error) => {
        toast.dismiss();
        toast.error(error.message);
      },
    });
    navigate((location.state as any)?.from?.pathname || "/", { replace: true });
  };

  const disconnectWallet = () => logout();

  return { connectWallet, disconnectWallet };
};
