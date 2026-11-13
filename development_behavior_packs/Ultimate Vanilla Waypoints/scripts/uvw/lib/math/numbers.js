import { Variables } from "../variables";
export const apiNumbers = new (class apiNumbers {
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  randomBetween(min, max) {
    return Math.random() * (max - min + 1) + min;
  }
  calculateCost(playerPos, waypointPos) {
    const disX = waypointPos.x - playerPos.x;
    const disZ = waypointPos.z - playerPos.z;
    const distance = Math.sqrt(disX * disX + disZ * disZ);
    if (
      Variables.teleportCostMode == "none" ||
      distance < Variables.teleportMinimumDistance
    )
      return 0;
    const chargeCount =
      Math.floor(
        (distance - Variables.teleportMinimumDistance) /
          Variables.teleportBlocksPerCharge,
      ) + 1;
    let cost = chargeCount * Variables.teleportCostAmount;
    if (Variables.teleportMinimumCost != undefined)
      cost = Math.max(cost, Variables.teleportMinimumCost);
    if (Variables.teleportMaximumCost != undefined)
      cost = Math.min(cost, Variables.teleportMaximumCost);
    return cost;
  }
})();
