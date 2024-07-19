import { Logger } from "utils/logging";
import doOrMove from "utils/doOrMove";

export enum Action {
  MineSource = 1,
  Pickup = 2,
  Explore = 3,
  Transfer = 4,
}

export interface Intent {
  action: Action;
  target: Id<any>;
}

type IntentExecutor = (creep: Creep, intent: Intent, logger: Logger) => void;

function mineSourceExecutor(creep: Creep, intent: Intent, logger: Logger) {
  // TODO change source if all available slots on the current source are occupied
  const execLogger = logger.child("mining", { name: creep.name })

  if (Game.time % 10 == 0) {
    execLogger.debug("miner dropping resources")
    creep.drop(RESOURCE_ENERGY);
  } else {
    const source = Game.getObjectById(intent.target) as Source

    doOrMove(creep, source.pos, 1, () => { creep.harvest(source) }, execLogger);
  }
}

function pickupExecutor(creep: Creep, intent: Intent, logger: Logger) {
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


export function executeCreepIntent(creep: Creep, logger: Logger) {
  if (!creep.memory.intent) {
    return
  }
  switch (creep.memory.intent.action) {
    case Action.MineSource:
      mineSourceExecutor(creep, creep.memory.intent, logger);
      return;
    case Action.Pickup:
      pickupExecutor(creep, creep.memory.intent, logger);
      return;
    case Action.Transfer:
      transferExecutor(creep, creep.memory.intent, logger);
    default:
      logger.error("unknown intent action", {intent: creep.memory.intent.action.toString()})
  }
}
