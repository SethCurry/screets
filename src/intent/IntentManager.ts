import { Logger } from "../utils/logging";
import { filterAllCreeps, filterCreeps, hasIntent, hasNoIntent } from "../inventory/creeps";
import { Action, IntentHandler } from "./Intent";

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

  assignTasks(logger: Logger) {
    var creepsWithoutIntents = filterAllCreeps(hasNoIntent);

    for (const handler of this.handlers.values()) {
      handler.assignTasks(creepsWithoutIntents, logger);

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
