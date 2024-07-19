import config from "config";
import { Action, executeCreepIntent, Intent } from "intent";
import { EveryXTicks, Scheduler } from "kernel";
import { Logger } from "logging";
import { assignPickupIntents, assignTransferIntents } from "tasks/pickup";
import { spawnGatherersTask, spawnMinersTask } from "tasks/spawn";
import { ErrorMapper } from "utils/ErrorMapper";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    intent?: Intent;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

// Removes any entries in Memory.creeps for creeps that do not exist in Game.creeps.
// This prevents leaking memory as creeps die.
function deleteMemoryOfMissingCreeps(logger: Logger) {
  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      logger.debug(`deleting creep memory for non-existing creep`, {name: name});
      delete Memory.creeps[name];
    }
  }
}

// cleanupPhase calls all of the functions that do some form of cleanup after the tick
// is over.
function cleanupPhase(logger: Logger) {
  deleteMemoryOfMissingCreeps(logger.child("deleteMemoryOfMissingCreeps"));
}

function executeActions(logger: Logger) {
  for (const creepName in Game.creeps) {
    const creep = Game.creeps[creepName];

    executeCreepIntent(creep, logger);
  }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  const logger = new Logger("main", config.logLevel);

  logger.info("Starting game tick", { tick: Game.time });

  const scheduler = new Scheduler(new Logger("scheduler", config.logLevel));

  scheduler.addTask("spawnMiners", EveryXTicks(1), spawnMinersTask);
  scheduler.addTask("spawnGatherers", EveryXTicks(1), spawnGatherersTask);

  scheduler.addTask("assignTransferTasks", EveryXTicks(1), assignTransferIntents);
  scheduler.addTask("assignPickupTasks", EveryXTicks(1), assignPickupIntents);

  scheduler.addTask("executeActions", EveryXTicks(1), executeActions);

  scheduler.addTask("cleanupPhase", EveryXTicks(1), cleanupPhase);

  scheduler.schedule();
});
