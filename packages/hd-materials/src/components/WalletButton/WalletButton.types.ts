export interface WalletButtonProps {
  account: string | null;
  chainId: string | null;
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  onConnect(): Promise<void>;
  onDisconnect(): Promise<void>;
}
