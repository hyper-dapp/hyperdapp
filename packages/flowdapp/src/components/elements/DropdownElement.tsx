import { Dropdown } from "primereact/dropdown";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { updateElementsData } from "../../store/slices/flow";

interface DropdownElementProps {
  id: string;
  label: string;
  fieldName: string;
  items: {
    label: string;
    value: any;
  }[];
}

const DropdownElement = (props: DropdownElementProps) => {
  const { id, label, fieldName, items } = props;
  const data = useAppSelector((store) => store.flow.data?.[id]);
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col gap-2">
      <p className="font-bold">{label}</p>
      <Dropdown
        value={data?.[fieldName]}
        options={items}
        onChange={(e) =>
          dispatch(updateElementsData({ id, [fieldName]: e.value }))
        }
        optionLabel="label"
      />
    </div>
  );
};

export default DropdownElement;
