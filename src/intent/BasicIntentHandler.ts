import { Logger } from "../utils/logging";
import { Action, Intent, IntentExecutor, IntentHandler } from "./Intent";

export class BasicIntentHandler extends IntentHandler {
  executor: IntentExecutor;
  action: Action;
  assignment: (creeps: Creep[], logger: Logger) => void;

  constructor(action: Action, executor: IntentExecutor, assignment: (creeps: Creep[], logger: Logger) => void) {
    super()
    this.action = action;
    this.executor = executor;
    this.assignment = assignment;
  };

  execute(creep: Creep, intent: Intent, logger: Logger) {
    return this.executor (creep , intent, logger );
  }

  assignTasks(creeps: Creep[], logger: Logger) {
    this.assignment(creeps, logger);
  }
}
