import { InputTextarea } from "primereact/inputtextarea";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { updateElementsData } from "../../store/slices/flow";

interface TextAreaElementProps {
  id: string;
  label: string;
}

const TextAreaElement = (props: TextAreaElementProps) => {
  const { id, label } = props;
  const { data } = useAppSelector((store) => store.flow);
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col gap-2">
      <p className="font-bold">{label}</p>
      <InputTextarea
        rows={3}
        cols={30}
        value={data.elements[id]?.value}
        onChange={(e) =>
          dispatch(updateElementsData({ id, value: e.target.value }))
        }
      />
    </div>
  );
};

export default TextAreaElement;
