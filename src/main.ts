import { Intent } from "intent";
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

// Removes any entries in Memory.creeps for creeps that do not exist in Game.creeps.
// This prevents leaking memory as creeps die.
function deleteMemoryOfMissingCreeps() {
  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
}

// cleanupPhase calls all of the functions that do some form of cleanup after the tick
// is over.
function cleanupPhase() {
  deleteMemoryOfMissingCreeps();
}

function basicSpawnCreeps(spawnName: string, maxCreeps: number) {
  for (let i = 0; i < maxCreeps; ++i) {
    const name = "Worker" + i.toString();
    Game.spawns[spawnName].spawnCreep([WORK, MOVE], name);
  }
}

function basicSpawnHarvesters(spawnName: string, maxHarvesters: number) {
  for (let i = 0; i < maxHarvesters; ++i) {
    const name = "Harvester" + i.toString();
    Game.spawns[spawnName].spawnCreep([WORK, CARRY, MOVE], name);
  }
}

function naiveHarvesting() {
  for (const creepName in Game.creeps) {
    if (!creepName.startsWith("Worker")) {
      continue;
    }

    const creep = Game.creeps[creepName];
    if (Game.time % 10 == 0) {
      creep.drop(RESOURCE_ENERGY);
    }


    const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE) as Source;

    if (creep.pos.getRangeTo(source.pos.x, source.pos.y) <= 1) {
      creep.harvest(source);
    } else {
      creep.moveTo(source.pos.x, source.pos.y);
    }
  }
}

function naiveGathering() {
  for (const creepName in Game.creeps) {
    if (!creepName.startsWith("Harvester")) continue;

    const creep = Game.creeps[creepName];

    if (!creep.room.controller) {
      continue
    }

    if (creep.store.getFreeCapacity() > 0) {
      const resource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES) as Resource;

      if (creep.pos.getRangeTo(resource.pos.x, resource.pos.y) > 1) {
        creep.moveTo(resource.pos.x, resource.pos.y);
      } else {
        creep.pickup(resource);
      }
    } else {
        creep.moveTo(creep.room.controller.pos.x, creep.room.controller.pos.y);
    }
    if (creep.pos.getRangeTo(creep.room.controller.pos.x, creep.room.controller.pos.y) <= 2 && creep.store.getUsedCapacity() > 0) {
      creep.transfer(creep.room.controller, RESOURCE_ENERGY);
    }
  }
}

// doOrMove function that will either perform action if the screep is close enough,
// or move towards the target if not

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  cleanupPhase();
  basicSpawnCreeps("Spawn1", 5);
  basicSpawnHarvesters("Spawn1", 2);
  naiveHarvesting();
  naiveGathering();
});
