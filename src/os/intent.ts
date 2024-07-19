import { Logger } from "../utils/logging";
import { filterAllCreeps, filterCreeps, hasIntent, hasNoIntent } from "./inventory";

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

type IntentExecutor = (creep: Creep, intent: Intent, logger: Logger) => void;

export abstract class IntentHandler {
  abstract execute(creep: Creep, intent: Intent, logger: Logger): void;
  abstract action: Action;
  abstract assignTasks(creeps: Creep[]): void;
}

export class BasicIntentHandler extends IntentHandler {
  executor: IntentExecutor;
  action: Action;
  assignment: (creeps: Creep[]) => void;

  constructor(action: Action, executor: IntentExecutor, assignment: (creeps: Creep[]) => void) {
    super()
    this.action = action;
    this.executor = executor;
    this.assignment = assignment;
  };

  execute(creep: Creep, intent: Intent, logger: Logger) {
    return this.executor (creep , intent, logger );
  }

  assignTasks(creeps: Creep[]) {
    this.assignment(creeps);
  }
}

export class IntentManager {
  private handlers = new Map<Action, IntentHandler>();

  constructor() {
  }

  registerIntent(handlerClass: IntentHandler) {
    this.handlers.set(handlerClass.action, handlerClass);
  }

  executeAllIntents(logger: Logger) {
    filterAllCreeps(hasIntent).map((creep) => this.executeIntentForCreep(creep, logger))
  }

  assignTasks() {
    var creepsWithoutIntents = filterAllCreeps(hasNoIntent);

    for (const handler of this.handlers.values()) {
      handler.assignTasks(creepsWithoutIntents);

      creepsWithoutIntents = filterCreeps(creepsWithoutIntents, hasNoIntent)
    }
  }

  executeIntentForCreep(creep: Creep, logger: Logger) {
    if (!creep.memory.intent) {
      return
    }

    const intentHandler = this.handlers.get(creep.memory.intent.action);

    intentHandler?.execute(creep, creep.memory.intent, logger)
  }
}
