import doOrMove from "../../utils/doOrMove";
import { Action, Intent } from "../Intent";
import { Logger } from "../../utils/logging";
import { flatten } from "lodash";
import { filterAllCreeps, filterCreeps, hasAtLeastBodyParts, hasTarget, lacksBodyPart } from "../../inventory/creeps";
import { BasicIntentHandler } from "../BasicIntentHandler";

function countAdjacentPlains(pos: RoomPosition) {
  const room = Game.rooms[pos.roomName];

  if (!room) {
    return 0;
  }

  const terrain = room.getTerrain();

  const resultsArray = [-1, 0, 1].map(yOffset => {
    return [-1, 0, 1].map((xOffset: number): boolean => {
      if (xOffset === 0 && yOffset === 0) {
        return false;
      }

      const terrainAt = terrain.get(pos.x + xOffset, pos.y + yOffset);

      return terrainAt !== 1;
    })
  })

  return flatten(resultsArray).filter(res => res).length;
}

function mineSourceExecutor(creep: Creep, intent: Intent, logger: Logger) {
  // TODO change source if all available slots on the current source are occupied
  const execLogger = logger.child("mining", { name: creep.name })

  if (!creep.memory.intent) {
    return;
  }

  const source = Game.getObjectById(creep.memory.intent.target) as Source;
  if (!source) {
    creep.memory.intent = undefined;
    return;
  }

  const adjacentPlains = countAdjacentPlains(source.pos);

  const minersTargetingSource = filterAllCreeps(hasTarget(source.id)).length

  if (minersTargetingSource > adjacentPlains || source.energy === 0) {
    creep.memory.intent = undefined;
    return;
  }

  doOrMove(creep, source.pos, 1, () => { creep.harvest(source) }, execLogger);
}

function assignMiners(creeps: Creep[], logger: Logger) {
  filterCreeps(creeps, hasAtLeastBodyParts(WORK, 1), lacksBodyPart(CARRY)).forEach((creep: Creep) => {
    const sources = creep.room.find(FIND_SOURCES_ACTIVE);

    for (const source of sources) {
      const numMiners = filterAllCreeps(hasTarget(source.id)).length;
      const adjacentPlains = countAdjacentPlains(source.pos);

      if (numMiners < adjacentPlains) {
        logger.debug("setting mining intent", {creepName: creep.name, sourcePos: `${source.pos.x}:${source.pos.y}`})
        creep.memory.intent = {
          action: Action.MineSource,
          target: source.id
        }
        break;
      } else {
        logger.debug("source too occupied to mine", {creepName: creep.name, sourcePos: `${source.pos.x}:${source.pos.y}`, adjacentPlains: adjacentPlains, numMiners: numMiners})
      }
    }
  })
}

const handler = new BasicIntentHandler(
  Action.MineSource,
  mineSourceExecutor,
  assignMiners)

export default handler;
