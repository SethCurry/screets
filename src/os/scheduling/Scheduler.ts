// ScheduleCondition is a function used to determine

import { Logger } from "../../utils/logging";
import { Task } from "./Task";

// whether a task needs to run this tick or not.
export type ScheduleCondition = () => boolean

// Scheduler holds a collection of tasks that it will execute when
// their conditions determine that they need to be run.
//
// Later functionality could add fuzzy scheduling to tasks, allowing
// them to be delayed or run early.
export default class Scheduler {
  private tasks: Task[];
  private logger: Logger;

  constructor(logger: Logger) {
    this.tasks = [];
    this.logger = logger;
  }

  // Add a task to be run by the scheduler
  addTask(name: string, condition: ScheduleCondition, exec: (logger: Logger) => void): void {
    const task = new Task(name, condition, exec);
    this.tasks.push(task);
  }

  // Run all tasks whose condition says they need
  // to run this tick.
  schedule(): void {
    this.findTasksToRun().map((task) => task.exec( new Logger(task.name)))
  }

  private findTasksToRun(): Task[] {
    return this.tasks.filter((task) => {
      return task.condition();
    })
  }
}
