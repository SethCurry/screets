import { ScheduleCondition } from "./Scheduler";

// EveryXTicks is a ScheduleCondition that runs a task every X ticks
export default function EveryXTicks(x: number): ScheduleCondition {
  return () => {
    return Game.time % x === 0;
  }
}
