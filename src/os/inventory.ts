// inventory.ts contains functions for working with the in-game "inventory" such
// as creeps, objects in rooms, etc.

// CreepFilter defines a type that can be used to filter creeps.
export type CreepFilter = (creeps: Creep) => boolean;

// creepsArray returns an array of all creeps in the game.
// This is a convenience function to allow map and forEach
// to be used.
export function creepsArray(): Creep[] {
  const creeps: Creep[] = [];

  for (const name in Game.creeps) {
    creeps.push(Game.creeps[name]);
  }

  return creeps;
}

// hasNoIntent is a CreepFilter that returns true for creeps that
// have no intent set.
export const hasNoIntent: CreepFilter = (creep: Creep) => {
  return creep.memory.intent === undefined
}

export const hasIntent: CreepFilter = (creep: Creep) => {
  return creep.memory.intent !== undefined;
}

export function hasTarget(target: Id<any>) {
  return function (creep: Creep) {
    return creep.memory.intent !== undefined && creep.memory.intent.target === target;
  }
}

// hasAtLeastBodyParts is a CreepFilter that returns true for creeps with at least the given number
// of the specified body part.
export function hasAtLeastBodyParts(part: BodyPartConstant, partCount: number): CreepFilter {
  const impl = (creep: Creep) => {
    return creep.getActiveBodyparts(part) >= partCount
  }

  return impl
}

// filterCreeps filters an array of creeps using the provided filters.  The filters will be and-ed
// together.
export function filterCreeps(creeps: Creep[], ...filters: CreepFilter[]): Creep[] {
  return creeps.filter((c) => {
    return filters.map(f => f(c)).filter(v => v === false).length === 0;
  })
}

// filterAllCreeps is a convenience function that runs filterCreeps on all of the creeps
// in the game.
export function filterAllCreeps(...filters: CreepFilter[]): Creep[] {
  return filterCreeps(creepsArray(), ...filters)
}
