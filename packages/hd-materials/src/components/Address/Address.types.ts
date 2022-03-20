export interface AddressProps {
  address: string | null;
  avatar?: "left" | "right" | "top" | "bottom";
  copyable?: boolean;
  scale?: number | undefined;
  size?: number | undefined;
  textStyles?: string;
}
