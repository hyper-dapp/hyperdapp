import { Dropdown } from "primereact/dropdown";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { updateElementsData } from "../../store/slices/flow";

interface DropdownGroupElementProps {
  id: string;
  label: string;
  items: {
    label: string;
    items: {
      label: string;
      value: any;
    }[];
  }[];
}

const DropdownGroupElement = (props: DropdownGroupElementProps) => {
  const { id, label, items } = props;
  const { data } = useAppSelector((store) => store.flow);
  const dispatch = useAppDispatch();

  const groupedItemTemplate = (option: any) => {
    return <div className="bg-gray-200 font-bold">{option.label}</div>;
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="font-bold">{label}</p>
      <Dropdown
        value={data.elements[id]?.value}
        options={items}
        onChange={(e) => dispatch(updateElementsData({ id, value: e.value }))}
        optionLabel="label"
        optionGroupLabel="label"
        optionGroupChildren="items"
        optionGroupTemplate={groupedItemTemplate}
      />
    </div>
  );
};

export default DropdownGroupElement;
