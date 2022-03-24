import React, { FC, useEffect, useState } from "react";
import Blockie from "../Blockie";
import { PromptHistory } from "./helpers/PromptHistory";
import { renderPrompts } from "./helpers/renderPrompts";
import { IPromptHistory, Prompt, PromptsListProps } from "./PromptsList.types";

const PromptsList: FC<PromptsListProps> = ({ address, flow, layout }) => {
  const [promptsList, setPromptsList] = useState<Prompt[][]>([]);
  const [promptHistory, setPromptHistory] = useState<IPromptHistory>();

  useEffect(() => {
    if (promptHistory) return;

    const initPromptHistory = async () => {
      const history = new PromptHistory(flow);
      await history.init();
      setPromptsList(history.all());
      setPromptHistory(history);
    };

    initPromptHistory();
  }, [flow, promptHistory]);

  if (!promptHistory) {
    return <div>Generating UI...</div>;
  }

  const executeBtnAction = async (action: Prompt[]) => {
    await promptHistory.execute.bind(promptHistory)(action);
    setPromptsList(promptHistory.all());
  };

  const onInputChange = async (acceptedValue: any) => {
    await promptHistory.handleInput.bind(promptHistory)(acceptedValue);
    setPromptsList(promptHistory.all());
  };

  const promptsUI = (prompts: Prompt[], index: number) => {
    const isLatest = index === promptHistory.length - 1;

    return renderPrompts({
      flow,
      prompts,
      isLatest,
      className: "",
      executeBtnAction,
      onInputChange,
    });
  };

  switch (layout) {
    case "chat":
      return (
        <div className="grid grid-cols-12 gap-y-2">
          <div className="col-start-1 col-end-8 p-3 rounded-lg">
            {promptsList.map((prompts, index: number) => {
              return (
                <div
                  key={index}
                  className="col-start-1 col-end-8 p-3 rounded-lg"
                >
                  <div className="flex flex-row gap-2 items-center">
                    <div className="relative">
                      <Blockie address={address} size={10} />
                      <span
                        className="absolute rounded-full border-2 border-gray-100 bg-green-400"
                        style={{
                          width: "15px",
                          height: "15px",
                          right: "-2px",
                          bottom: "-2px",
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-2 p-4 rounded-xl shadow text-black dark:bg-gray-700">
                      {promptsUI(prompts, index)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    case "divider":
      return (
        <div className="p-4 bg-gray-100 dark:bg-gray-700 divide-y">
          {promptsList.map((prompts, index: number) => (
            <div
              key={index}
              className="flex flex-col items-center py-6 space-y-4 dark:border-gray-600"
            >
              {promptsUI(prompts, index)}
            </div>
          ))}
        </div>
      );
  }
};

export default PromptsList;
