import doOrMove from "../utils/doOrMove";
import { Action, BasicIntentHandler, Intent } from "../os/intent";
import { Logger } from "../utils/logging";
import { flatten } from "lodash";
import { filterAllCreeps, filterCreeps, hasAtLeastBodyParts, hasTarget } from "../os/inventory";

function countAdjacentPlains(pos: RoomPosition) {
  const room = Game.rooms[pos.roomName];

  if (!room) {
    return 0;
  }

  const terrain = room.getTerrain();

  const resultsArray = [-1, 1].map(yOffset => {
    return [-1, 1].map((xOffset: number): boolean => {
      const terrainAt = terrain.get(pos.x + xOffset, pos.y + yOffset);

      return terrainAt === 0;
    })
  })

  return flatten([resultsArray]).filter(res => res).length;
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

  if (minersTargetingSource > adjacentPlains) {
    creep.memory.intent = undefined;
    return;
  }

  doOrMove(creep, source.pos, 1, () => { creep.harvest(source) }, execLogger);
}

function assignMiners(creeps: Creep[]) {
  filterCreeps(creeps, hasAtLeastBodyParts(WORK, 1)).forEach((creep: Creep) => {
    const sources = creep.room.find(FIND_SOURCES_ACTIVE);

    sources.forEach((source: Source) => {
      const numMiners = filterAllCreeps(hasTarget(source.id)).length;
      const adjacentPlains = countAdjacentPlains(source.pos);

      if (numMiners < adjacentPlains) {
        creep.memory.intent = {
          action: Action.MineSource,
          target: source.id
        }
      }
    })
  })
}

const handler = new BasicIntentHandler(
  Action.MineSource,
  mineSourceExecutor,
  assignMiners)

export default handler;
