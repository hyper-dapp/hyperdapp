import { InputText } from "primereact/inputtext";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { updateElementsData } from "../../store/slices/flow";

interface TextElementProps {
  id: string;
  label: string;
  value: any;
}

const TextElement = (props: TextElementProps) => {
  const { id, label } = props;
  const { data } = useAppSelector((store) => store.flow);
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col gap-2">
      <p className="font-bold">{label}</p>
      <InputText
        value={data.elements[id]?.value}
        onChange={(e) =>
          dispatch(updateElementsData({ id, value: e.target.value }))
        }
      />
    </div>
  );
};

export default TextElement;
