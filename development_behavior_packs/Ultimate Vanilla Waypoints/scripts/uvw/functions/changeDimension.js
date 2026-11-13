import { waypointsEntity } from "../lib/waypoints/entity/entity";
import { world, system } from "@minecraft/server";
import { isReadableRealPlayer } from "../lib/player/readable";
world.afterEvents.playerDimensionChange.subscribe(({ player: player }) => {
  if (!isReadableRealPlayer(player)) return;
  waypointsEntity.removeAll(player);
  system.runTimeout(() => {
    if (isReadableRealPlayer(player)) waypointsEntity.recoverWaypoints(player);
  }, 30);
});
