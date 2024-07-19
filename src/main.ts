import config from "config";
import { Action, executeCreepIntent, Intent } from "intent";
import { filterAllCreeps, hasAtLeastBodyParts } from "inventory";
import { EveryXTicks, Scheduler } from "kernel";
import { Logger, LogLevel } from "logging";
import { ErrorMapper } from "utils/ErrorMapper";
import doOrMove from "utils/doOrMove";

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

function basicSpawn(logger: Logger, spawnName: string, parts: BodyPartConstant[], maxNumber: number, baseName: string, getOptions?: () => SpawnOptions) {
  for (let i = 0; i < maxNumber; ++i) {
    const name = baseName + i.toString();

    if (Game.creeps[name] === undefined) {
      logger.info("spawning creep", { name: name })

      const options = getOptions ? getOptions() : {};
      Game.spawns[spawnName].spawnCreep(parts, name, options);
    }
  }
}

function assignPickupTasks(logger: Logger) {
  const creepsToPickup = filterAllCreeps(hasAtLeastBodyParts(CARRY, 1), (creep) => creep.store.getFreeCapacity() > 0);

  creepsToPickup.forEach((creep) => {
    const target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);

    if (!target) {
      return;
    }

    creep.memory.intent = {
      action: Action.Pickup,
      target: target.id,
    }
  })
}

function assignTransferTasks(logger: Logger) {
  const creepsToTransfer = filterAllCreeps(hasAtLeastBodyParts(CARRY, 1), (creep) => creep.store.getFreeCapacity() === 0)

  creepsToTransfer.forEach((creep) => {
    var target: Structure | undefined | null = creep.room.controller;

    if (!target) {
      target = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
      if (!target) {
        return
      }
    }

    creep.memory.intent = {
      action: Action.Transfer,
      target: target.id,
    }
  })
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

  scheduler.addTask("spawnMiners", EveryXTicks(1), (logger: Logger) => {
    basicSpawn(logger, "Spawn1", [WORK, MOVE], config.spawning.miners, "Miner", () => {
      const source = Game.spawns["Spawn1"].pos.findClosestByPath(FIND_SOURCES_ACTIVE);

      if (source) {
        return {
          memory: {
            intent: {
              action: Action.MineSource,
              target: source.id,
            }
          }
        }
      }

      return {}
    })
  });

  scheduler.addTask("spawnBasicCreeps", EveryXTicks(1), (logger: Logger) => {
    basicSpawn(logger, "Spawn1", [WORK, MOVE, CARRY], config.spawning.gatherers, "Gatherer")
  });
  scheduler.addTask("assignTransferTasks", EveryXTicks(1), assignTransferTasks)
  scheduler.addTask("assignPickupTasks", EveryXTicks(1), assignPickupTasks)


  scheduler.addTask("executeActions", EveryXTicks(1), executeActions)
  scheduler.addTask("cleanupPhase", EveryXTicks(1), cleanupPhase)

  scheduler.schedule();
});
