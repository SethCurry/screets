import { Logger } from "../utils/logging";
import { filterAllCreeps, filterCreeps, hasIntent, hasNoIntent } from "../inventory/creeps";

export enum Action {
  MineSource = 1,
  Pickup = 2,
  Explore = 3,
  Transfer = 4,
}

export interface Intent {
  action: Action;
  target: Id<any>;
}

export type IntentExecutor = (creep: Creep, intent: Intent, logger: Logger) => void;

export abstract class IntentHandler {
  abstract execute(creep: Creep, intent: Intent, logger: Logger): void;
  abstract action: Action;
  abstract assignTasks(creeps: Creep[], logger: Logger): void;
}
