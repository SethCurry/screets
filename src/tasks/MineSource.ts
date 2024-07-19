import doOrMove from "../utils/doOrMove";
import { Action, BasicIntentHandler, Intent } from "../os/intent";
import { Logger } from "../utils/logging";

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

const handler = new BasicIntentHandler(
  Action.MineSource,
  mineSourceExecutor,
(creeps: Creep[]) => {return})

export default handler;
