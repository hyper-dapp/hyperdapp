import { ethers } from "ethers";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createFlow } from "hyperdapp";
// @ts-ignore
import contractPrologProgram from "../../prolog/tuition-contract.pl";

const { ethereum } = window as any;
const provider = new ethers.providers.Web3Provider(ethereum);
const signer = provider.getSigner();

interface IFlowSlice {
  [contractAddress: string]: any;
}

const initialState: IFlowSlice = {};

async function connectToMetamask() {
  try {
    console.log("Signed in", await signer.getAddress());
  } catch (err) {
    console.log("Not signed in");
    await provider.send("eth_requestAccounts", []);
  }
}

export const initFlow = createAsyncThunk(
  "flows/initFlow",
  async (contractAddress: string) => {
    try {
      const code = (await (await fetch(contractPrologProgram)).text()).replace(
        `{{contractAddress}}`,
        contractAddress
      );

      const flow = await createFlow(code, {
        async onCallFn({
          block,
          signer,
          contractAddress,
          functionSig,
          paramTypes,
          args,
          returnType,
          value,
          mutability,
        }: any) {
          console.log("onCallFn", contractAddress, functionSig, args, block);

          const cacheKey =
            functionSig +
            (paramTypes.length === 0
              ? ""
              : ethers.utils.defaultAbiCoder.encode(paramTypes, args));

          // TODO: Handle more cases
          if (mutability.view && block.cache[cacheKey]) {
            return block.cache[cacheKey];
          }

          const returns = returnType.length
            ? ` ${mutability.view ? "view " : ""}returns (${returnType.join(
                ","
              )})`
            : "";

          const iface = new ethers.utils.Interface([
            // Constructor
            `function ${functionSig}${
              mutability.payable ? " payable" : ""
            }${returns}`,
          ]);
          const contract = new ethers.Contract(
            contractAddress,
            iface,
            provider
          );

          const result = await contract
            .connect(signer)
            .functions[functionSig](...args, { value: value })
            .then(
              (yes) => {
                // @ts-ignore
                return console.log("yes", yes) || yes;
              },
              (no) => {
                console.log("no", no);
                throw no;
              }
            );

          console.log("Result", result);

          block.cache[cacheKey] = result;

          return result;
        },
      });

      await connectToMetamask();
      await flow.init(signer, await signer.getAddress(), 100);

      return { contractAddress, flow };
    } catch (error) {}
  }
);

const contracts = createSlice({
  name: "flows",
  initialState,
  reducers: {
    resetContractState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initFlow.fulfilled, (state, action) => {
      if (!action.payload) return;
      const { contractAddress } = action.payload;
      state[contractAddress] = action.payload.flow;
    });
  },
});

const { actions, reducer } = contracts;
export const { resetContractState } = actions;
export default reducer;
