import HyperdappLogo from "./HyperdappLogo";

const Loader = () => {
  return (
    <div className="flex flex-col gap-2 items-center justify-center h-full">
      <HyperdappLogo />
      <i
        className="pi pi-spin pi-spinner"
        style={{ color: "#07c8d6", fontSize: "2em" }}
      />
    </div>
  );
};

export default Loader;
