import { Logger } from "../utils/logging";
import { filterCreeps, hasAtLeastBodyParts } from "../os/inventory";
import { Action, BasicIntentHandler, Intent } from "../os/intent";
import doOrMove from "../utils/doOrMove";

function assignTransferIntents(creepsWithoutIntents: Creep[]) {
  const creepsToTransfer = filterCreeps(creepsWithoutIntents, hasAtLeastBodyParts(CARRY, 1), (creep) => creep.store.getFreeCapacity() === 0)

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


function transferExecutor(creep: Creep, intent: Intent, logger: Logger) {
  const execLogger = logger.child("transfer", { name: creep.name });

  if (creep.store.getUsedCapacity() == 0) {
    execLogger.debug("storage empty, unsetting transfer task");
    creep.memory.intent = undefined;
    return;
  }

  const structure = Game.getObjectById(intent.target) as Structure;

  doOrMove(creep, structure.pos, 2, () => {
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
