import { InputText } from "primereact/inputtext";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { updateElementsData } from "../../store/slices/flow";

const FunctionInputsForm = ({ id }: { id: string }) => {
  const { inputs, params } = useAppSelector((store) => store.flow.data?.[id]);
  const contracts = useAppSelector((store) => store.contracts);
  const dispatch = useAppDispatch();

  if (!params) return <></>;

  const [contractAddress, methodName] = params;
  const method = contracts?.[contractAddress]?.methods?.map?.[methodName];

  return (
    <div className="flex flex-col gap-2">
      {method.inputs.map((input, index) => {
        const { name, type } = input;

        return (
          <div className="flex flex-col gap-2" key={index}>
            <label className="p-d-block" htmlFor={name}>
              {name}
            </label>
            <InputText
              className="p-d-block"
              name={name}
              placeholder={type}
              value={inputs?.[name]}
              onChange={(e) => {
                dispatch(
                  updateElementsData({
                    id,
                    inputs: { ...inputs, [name]: e.target.value },
                  })
                );
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default FunctionInputsForm;
