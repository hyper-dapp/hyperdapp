import { InputText } from "primereact/inputtext";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { updateElementsData } from "../../store/slices/flow";

interface TextElementProps {
  id: string;
  label: string;
  fieldName: string;
}

const TextElement = (props: TextElementProps) => {
  const { id, label, fieldName } = props;
  const data = useAppSelector((store) => store.flow.data?.[id]);
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col gap-2">
      <p className="font-bold">{label}</p>
      <InputText
        value={data?.[fieldName]}
        onChange={(e) =>
          dispatch(updateElementsData({ id, [fieldName]: e.target.value }))
        }
      />
    </div>
  );
};

export default TextElement;
