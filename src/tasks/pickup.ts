import { Action } from "os/intent";
import { filterAllCreeps, hasAtLeastBodyParts } from "os/inventory";
import { Logger } from "utils/logging";

export function assignPickupIntents(logger: Logger) {
  const creepsToPickup = filterAllCreeps(hasAtLeastBodyParts(CARRY, 1), (creep) => creep.store.getFreeCapacity() > 0);

  creepsToPickup.forEach((creep) => {
    const target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);

    if (!target) {
      return;
    }

    logger.debug("assigning pickup task", { creepName: creep.name, target: target.id });

    creep.memory.intent = {
      action: Action.Pickup,
      target: target.id,
    }
  })
}

export function assignTransferIntents(logger: Logger) {
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
