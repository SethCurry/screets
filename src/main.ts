import config from "config";
import { executeCreepIntent, Intent } from "os/intent";
import { EveryXTicks, Scheduler } from "os/kernel";
import { Logger } from "utils/logging";
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

  // Create a new Scheduler that we can add tasks to.
  const scheduler = new Scheduler(new Logger("scheduler", config.logLevel));

  // Add a task that runs every tick to spawn miners if any are missing.
  // Configuration for how many to spawn is in config.ts
  scheduler.addTask("spawnMiners", EveryXTicks(1), spawnMinersTask);

  // Add a task that runs every tick to spawn gatherers if any are missing.
  // Configuration for how many to spawn is in config.ts
  scheduler.addTask("spawnGatherers", EveryXTicks(1), spawnGatherersTask);

  // Add a task that runs every tick to look for creeps with full storage and no current intent
  // to have them transfer their resources to some kind of storage.
  scheduler.addTask("assignTransferTasks", EveryXTicks(1), assignTransferIntents);

  // Add a task that runs every tick to look for creeps that can carry resources, have no current intent,
  // and do not have full storage.  Those creeps will be assigned to pick up a resource off the ground.
  scheduler.addTask("assignPickupTasks", EveryXTicks(1), assignPickupIntents);

  // Add a task that runs every tick to execute each creeps' intent.
  scheduler.addTask("executeActions", EveryXTicks(1), executeActions);

  // Add a task that runs every turn to do some cleanup, like deleting the memory of dead creeps.
  scheduler.addTask("cleanupPhase", EveryXTicks(1), cleanupPhase);

  scheduler.schedule();
});
