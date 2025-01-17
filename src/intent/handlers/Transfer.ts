import { Logger } from "../../utils/logging";
import { filterCreeps, hasAtLeastBodyParts } from "../../inventory/creeps";
import { Action, BasicIntentHandler, Intent } from "../Intent";
import doOrMove from "../../utils/doOrMove";

function assignTransferIntents(creepsWithoutIntents: Creep[], logger: Logger) {
  const creepsToTransfer = filterCreeps(creepsWithoutIntents, hasAtLeastBodyParts(CARRY, 1), (creep) => creep.store.getFreeCapacity() === 0)

  creepsToTransfer.forEach((creep) => {
    const spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
    const controller: Structure | undefined | null = creep.room.controller;

    var target: Structure | undefined | null = undefined;

    if (spawn) {
      const freeCapacity = spawn.store.getFreeCapacity(RESOURCE_ENERGY)

      if (freeCapacity !== null && freeCapacity > 0) {
        target = spawn;
      }
    }

    if (target === undefined && controller) {
      target = controller;
    }

    if (!target) {
      return
    }

    creep.memory.intent = {
      action: Action.Transfer,
      target: target.id,
    }
  })
}


function transferExecutor(creep: Creep, intent: Intent, logger: Logger) {
  const execLogger = logger.child("transfer", { name: creep.name });

  if (creep.store.getUsedCapacity() == 0) {
    execLogger.debug("storage empty, unsetting transfer task");
    creep.memory.intent = undefined;
    return;
  }

  const structure = Game.getObjectById(intent.target) as Structure | AnyStoreStructure | null;

  if (!structure) {
    creep.memory.intent = undefined;
    return;
  }

  const asStore = structure as AnyStoreStructure;

  if (asStore.store && asStore.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
    creep.memory.intent = undefined;
    return;
  }

  var maxRange = 1;

  if (structure.structureType === STRUCTURE_CONTROLLER) {
    maxRange = 3;
  }


  doOrMove(creep, structure.pos, maxRange, () => {
    execLogger.debug("starting transfer of resource");
    creep.transfer(structure, RESOURCE_ENERGY);
  }, logger)
}

const handler = new BasicIntentHandler(
  Action.Transfer,
  transferExecutor,
  assignTransferIntents,
);

export default handler;
