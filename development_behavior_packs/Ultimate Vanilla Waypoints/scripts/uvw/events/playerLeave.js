import { playersEntity } from "../functions/locator";
import { apiWaypointsCache } from "../lib/waypoints/info/cache";
import { world } from "@minecraft/server";
import { isReadableRealPlayer } from "../lib/player/readable";
world.beforeEvents.playerLeave.subscribe(({ player }) => {
  if (!isReadableRealPlayer(player)) return;
  playersEntity.delete(player.id);
  apiWaypointsCache.unload(player);
});
