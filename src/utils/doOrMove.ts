import { Logger } from "logging";

interface Position {
  x: number;
  y: number;
}

export default function doOrMove(creep: Creep, target: Position, withinRange: number, fn: () => void, logger: Logger) {
  const moveLogger = logger.child("doOrMove", { creepName: creep.name });
  const rangeTo = creep.pos.getRangeTo(target.x, target.y)

  if (rangeTo <= withinRange) {
    moveLogger.info("in position, executing");
    fn();
  } else {
    moveLogger.info("too far away, moving closer", {range: rangeTo})
    creep.moveTo(target.x, target.y)
  }
  return
}
