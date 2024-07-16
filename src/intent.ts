import { Logger } from "logging";

export enum Action {
  Mine = 1,
  Pickup = 2,
  Explore = 3,
  Transfer = 4,
}

export interface Intent {
  action: Action;
  target: Id<any>;
}

type IntentExecutor = (creep: Creep, intent: Intent, logger: Logger) => void;

