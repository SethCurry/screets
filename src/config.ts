import { LogLevel } from "utils/logging";

interface SpawnConfig {
  minimum: number;
  preferred: number;
}

export default {
  logLevel: LogLevel.DEBUG,
  spawning: {
    miners: {
      minimum: 3,
      preferred: 8,
    },
    gatherers: {
      minimum: 3,
      preferred: 10,
    },
  }
}
