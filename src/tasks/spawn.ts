import config from "config";
import { Action } from "os/intent";
import { Logger } from "utils/logging";


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


export function spawnMinersTask(logger: Logger) {
  basicSpawn(logger, "Spawn1", [WORK, MOVE], config.spawning.miners, "Miner", () => {
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
  });
}

export function spawnGatherersTask(logger: Logger) {
  basicSpawn(logger, "Spawn1", [WORK, MOVE, CARRY], config.spawning.gatherers, "Gatherer");
}
