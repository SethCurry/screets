import { Logger, LogLevel } from "logging";

// ScheduleCondition is a function used to determine
// whether a task needs to run this tick or not.
type ScheduleCondition = () => boolean

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

// EveryXTicks is a ScheduleCondition that runs a task every X ticks
export function EveryXTicks(x: number): ScheduleCondition {
  return () => {
    return Game.time % x === 0;
  }
}

// Scheduler holds a collection of tasks that it will execute when
// their conditions determine that they need to be run.
//
// Later functionality could add fuzzy scheduling to tasks, allowing
// them to be delayed or run early.
export class Scheduler {
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
    this.findTasksToRun().map((task) => task.exec( new Logger(task.name, LogLevel.DEBUG)))
  }

  private findTasksToRun(): Task[] {
    return this.tasks.filter((task) => {
      return task.condition();
    })
  }
}
