import config from "../config";
import { Action } from "../os/intent";
import { Logger } from "../utils/logging";


function basicSpawn(logger: Logger, spawnName: string, parts: BodyPartConstant[], maxNumber: number, baseName: string, getOptions?: () => SpawnOptions) {
  for (let i = 0; i < maxNumber; ++i) {
    const name = baseName + i.toString();

    if (Game.creeps[name] === undefined) {
      logger.info("spawning creep", { name: name });

      const options = getOptions ? getOptions() : {};
      Game.spawns[spawnName].spawnCreep(parts, name, options);
    }
  }
}

function createMinerIntent() {
    const source = Game.spawns["Spawn1"].pos.findClosestByPath(FIND_SOURCES_ACTIVE);

    if (source) {
      return {
        memory: {
          intent: {
            action: Action.MineSource,
            target: source.id,
          }
        }
      }
    }

    return {}
}


export function spawnMinersPreferredTask(logger: Logger) {
  basicSpawn(logger, "Spawn1", [WORK, MOVE], config.spawning.miners.preferred, "Miner", createMinerIntent);
}

export function spawnMinersMinimumTask(logger: Logger) {
  basicSpawn(logger, "Spawn1", [WORK, MOVE], config.spawning.miners.preferred, "Miner", createMinerIntent);
}

export function spawnGatherersMinimumTask(logger: Logger) {
  basicSpawn(logger, "Spawn1", [MOVE, WORK, WORK, CARRY], config.spawning.gatherers.minimum, "Gatherer");
}

export function spawnGatherersPreferredTask(logger: Logger) {
  basicSpawn(logger, "Spawn1", [MOVE, WORK, WORK, CARRY], config.spawning.gatherers.preferred, "Gatherer");
}
