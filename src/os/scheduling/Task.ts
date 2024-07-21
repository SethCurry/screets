import { Logger } from "../../utils/logging";
import { ScheduleCondition } from "./Scheduler";

// Task is a single task to be run by the scheduler.
export class Task {
  // Name of the task
  name: string;

  // Function to execute when the task is run
  exec: (logger: Logger) => void;

  // Function to determine whether the task should run this tick or not
  condition: ScheduleCondition;

  constructor(name: string, condition: ScheduleCondition, exec: (logger: Logger) => void) {
    this.name = name;
    this.exec = exec;
    this.condition = condition;
  }
}
