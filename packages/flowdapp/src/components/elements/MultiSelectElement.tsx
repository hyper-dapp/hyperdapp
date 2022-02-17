import { MultiSelect } from "primereact/multiselect";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { updateElementsData } from "../../store/slices/flow";

interface MultiSelectProps {
  id: string;
  label: string;
  fieldName: string;
  items: { label: string; value: any }[];
}

const MultiSelectElement = (props: MultiSelectProps) => {
  const { id, label, fieldName, items } = props;
  const data = useAppSelector((store) => store.flow.data?.[id]);
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col gap-2">
      <p className="font-bold">{label}</p>
      <MultiSelect
        value={data?.[fieldName]}
        options={items}
        onChange={(e) =>
          dispatch(updateElementsData({ id, [fieldName]: e.value }))
        }
        optionLabel="label"
        placeholder="Select addresses"
        display="chip"
      />
    </div>
  );
};

export default MultiSelectElement;
