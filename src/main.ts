import { Intent } from "intent";
import { EveryXTicks, Scheduler } from "kernel";
import { Logger, LogLevel } from "logging";
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
    intent: Intent;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

interface Position {
  x: number;
  y: number;
}

function doOrMove(creep: Creep, target: Position, withinRange: number, fn: () => void) {
  if (creep.pos.getRangeTo(target.x, target.y) <= withinRange) {
     fn();
  } else {
    creep.moveTo(target.x, target.y)
  }
  return
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

function basicSpawn(logger: Logger, spawnName: string, parts: BodyPartConstant[], maxNumber: number, baseName: string) {
  for (let i = 0; i < maxNumber; ++i) {
    const name = baseName + i.toString();

    if (Game.creeps[name] === undefined) {
      logger.info("spawning creep", {name: name})
      Game.spawns[spawnName].spawnCreep(parts, name);
    }
  }
}

function naiveMining(logger: Logger) {
  for (const creepName in Game.creeps) {
    if (!creepName.startsWith("Miner")) {
      continue;
    }

    const creep = Game.creeps[creepName];
    if (Game.time % 10 == 0) {
      creep.drop(RESOURCE_ENERGY);
    }


    const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE) as Source;

    doOrMove(creep, source.pos, 1, () => { creep.harvest(source) });
  }
}

function naiveGathering(logger: Logger) {
  for (const creepName in Game.creeps) {
    if (!creepName.startsWith("Gatherer")) continue;

    const creep = Game.creeps[creepName];

    if (!creep.room.controller) {
      continue
    }

    if (creep.store.getFreeCapacity() > 0) {
      const resource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES) as Resource;

      doOrMove(creep, resource.pos, 1, () => {
        creep.pickup(resource);
      })
    }

    if (creep.pos.getRangeTo(creep.room.controller.pos.x, creep.room.controller.pos.y) <= 2 && creep.store.getUsedCapacity() > 0) {
      creep.transfer(creep.room.controller, RESOURCE_ENERGY);
    }
  }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  const logger = new Logger("main", LogLevel.DEBUG);

  console.log(`Current game tick is ${Game.time}`);

  const scheduler = new Scheduler();

  scheduler.addTask("spawnMiners", EveryXTicks(1), (logger: Logger) => {
    basicSpawn(logger, "Spawn1", [WORK, MOVE], 5, "Miner")
  })

  scheduler.addTask("spawnBasicCreeps", EveryXTicks(1), (logger: Logger) => {
    basicSpawn(logger, "Spawn1", [WORK, MOVE, CARRY], 3, "Gatherer")
  })

  scheduler.addTask("doHarvesting", EveryXTicks(1), naiveMining)
  scheduler.addTask("doGathering", EveryXTicks(1), naiveGathering)
  scheduler.addTask("cleanupPhase", EveryXTicks(1), cleanupPhase)

  scheduler.schedule();
});
