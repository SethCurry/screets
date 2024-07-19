export type CreepFilter = (creeps: Creep) => boolean;

export function creepsArray(): Creep[] {
  const creeps: Creep[] = [];

  for (const name in Game.creeps) {
    creeps.push(Game.creeps[name]);
  }

  return creeps;
}

export const hasNoIntent: CreepFilter = (creep: Creep) => {
  return creep.memory.intent === undefined
}

export function hasAtLeastBodyParts(part: BodyPartConstant, partCount: number): CreepFilter {
  const impl = (creep: Creep) => {
    return creep.getActiveBodyparts(part) >= partCount
  }

  return impl
}

export function filterCreeps(creeps: Creep[], ...filters: CreepFilter[]): Creep[] {
  return creeps.filter((c) => {
    filters.map(f => f(c)).filter(v => v === false).length === 0;
  })
}

export function filterAllCreeps(...filters: CreepFilter[]): Creep[] {
  return filterCreeps(creepsArray(), ...filters)
}
