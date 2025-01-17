import config from "./config";
import { Intent } from "./intent/Intent";
import { Logger } from "./utils/logging";
import TransferIntent from "intent/handlers/Transfer";
import MineSource from "./intent/handlers/MineSource";
import Pickup from "./intent/handlers/Pickup";
import { spawnGatherersMinimumTask, spawnGatherersPreferredTask, spawnMinersMinimumTask, spawnMinersPreferredTask } from "intent/handlers/spawn";
import { ErrorMapper } from "./utils/ErrorMapper";
import { IntentManager } from "./intent/IntentManager";
import EveryXTicks from "./os/scheduling/EveryXTicks";
import Scheduler from "./os/scheduling/Scheduler";

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

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  const logger = new Logger("main");
  logger.info("Starting game tick", { tick: Game.time });

  const intents = new IntentManager();

  intents.registerIntent(TransferIntent);
  intents.registerIntent(MineSource);
  intents.registerIntent(Pickup);

  // Create a new Scheduler that we can add tasks to.
  const scheduler = new Scheduler(new Logger("scheduler"));

  // Add a task that runs every tick to spawn miners if any are missing.
  // Configuration for how many to spawn is in config.ts
  scheduler.addTask("spawnMinersPreferred", EveryXTicks(1), spawnMinersPreferredTask);

  // Add a task that runs every tick to spawn gatherers if any are missing.
  // Configuration for how many to spawn is in config.ts
  scheduler.addTask("spawnGatherersPreferred", EveryXTicks(1), spawnGatherersPreferredTask);

  scheduler.addTask("spawnGatherersMinimum", EveryXTicks(1), spawnGatherersMinimumTask);
  scheduler.addTask("spawnMinersMinimum", EveryXTicks(1), spawnMinersMinimumTask);

  scheduler.addTask("assignWork", EveryXTicks(1), (logger: Logger) => {
    intents.assignTasks(logger);
  })

  scheduler.addTask("executeIntents", EveryXTicks(1), (logger: Logger) => {
    intents.executeAllIntents(logger);
  })

  // Add a task that runs every turn to do some cleanup, like deleting the memory of dead creeps.
  scheduler.addTask("cleanupPhase", EveryXTicks(1), cleanupPhase);

  scheduler.schedule();
});
