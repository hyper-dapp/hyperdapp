import { Prompt, PromptEnum } from "../../types/prompt.types";
import { MakePromptHistoryApi } from "./makePromptHistory.types";

export const makePromptHistory = (): MakePromptHistoryApi => {
  let flow: any;
  let history: Prompt[][] = [];

  const api = {
    get length(): number {
      return history.length;
    },
    all(): Prompt[][] {
      return history;
    },
    log(): void {
      console.log("prompts>", history[history.length - 1]);
    },
    async init(_flow: any): Promise<void> {
      flow = _flow;
      history = [...history, await flow.getPrompts()];
      api.log();
    },
    async execute(action: Prompt[]): Promise<void> {
      console.log("execute>", action);
      const { effects } = await flow.execute(action);
      console.log("effects>", effects);

      let effectPrompts: Prompt[] = [];

      for (let [effectType, ...effectArgs] of effects) {
        if (effectType === PromptEnum.LOG) {
          effectPrompts.push([effectType, ...effectArgs]);
        } else {
          console.log(`[effect/unrecognized-type]`, effectType, effectArgs);
        }
      }

      let newPrompts = await flow.getPrompts();
      if (effectPrompts.length) newPrompts = effectPrompts.concat(newPrompts);
      history = [...history, newPrompts];
      api.log();
    },
    async handleInput(acceptedValue: any): Promise<void> {
      // TODO: Write ui queue system to properly update browser input value
      console.log("acceptedValue", acceptedValue);
      // Grab new prompts first so we can change array atomically
      const newPrompts = await flow.getPrompts();
      history.pop();
      history.push(newPrompts);
      api.log();
    },
  };

  return api;
};
