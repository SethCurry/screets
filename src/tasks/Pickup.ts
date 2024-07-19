import doOrMove from "../utils/doOrMove";
import { Action, BasicIntentHandler, Intent } from "../os/intent";
import { filterCreeps, hasAtLeastBodyParts } from "../os/inventory";
import { Logger } from "utils/logging";

export function assignPickupIntents(creeps: Creep[]) {
  const creepsToPickup = filterCreeps(creeps, hasAtLeastBodyParts(CARRY, 1), (creep) => creep.store.getFreeCapacity() > 0);

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


export function pickupExecutor(creep: Creep, intent: Intent, logger: Logger) {
  const execLogger = logger.child("pickup", { name : creep.name }) ;
  const target = Game.getObjectById(intent.target) as Resource|null;

  if (creep.store.getFreeCapacity() === 0 || target === null) {
    creep.memory.intent = undefined
    return
  }

  doOrMove(creep, target.pos, 1, () => {
    execLogger.info("picking up resources");
    creep.pickup(target);
    creep.memory.intent = undefined;
  }, logger)
}

const handler = new BasicIntentHandler(Action.Pickup, pickupExecutor, assignPickupIntents)

export default handler;
