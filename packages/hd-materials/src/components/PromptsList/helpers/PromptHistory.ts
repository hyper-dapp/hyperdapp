import { IPromptHistory, Prompt, PromptEnum } from "../PromptsList.types";

export class PromptHistory implements IPromptHistory {
  private readonly flow: any;
  private history: Prompt[][];

  constructor(_flow: any) {
    this.flow = _flow;
    this.history = [];
  }

  get length(): number {
    return this.history.length;
  }

  all(): Prompt[][] {
    return this.history;
  }

  log(): void {
    console.log("prompts>", this.history[this.history.length - 1]);
  }

  reset(): void {
    this.history = [];
  }

  async init(): Promise<void> {
    this.history = [...this.history, await this.flow.getPrompts()];
    this.log();
  }

  async execute(action: Prompt[]): Promise<void> {
    console.log("execute>", action);
    const { effects } = await this.flow.execute(action);
    console.log("effects>", effects);

    let effectPrompts: Prompt[] = [];

    for (let [effectType, ...effectArgs] of effects) {
      if (effectType === PromptEnum.LOG) {
        effectPrompts.push([effectType, ...effectArgs]);
      } else {
        console.log(`[effect/unrecognized-type]`, effectType, effectArgs);
      }
    }

    let newPrompts = await this.flow.getPrompts();
    if (effectPrompts.length) newPrompts = effectPrompts.concat(newPrompts);
    this.history = [...this.history, newPrompts];
    this.log();
  }

  async handleInput(acceptedValue: any): Promise<void> {
    // TODO: Write ui queue system to properly update browser input value
    console.log("acceptedValue", acceptedValue);
    // Grab new prompts first so we can change array atomically
    const newPrompts = await this.flow.getPrompts();
    this.history.pop();
    this.history.push(newPrompts);
    this.log();
  }
}
