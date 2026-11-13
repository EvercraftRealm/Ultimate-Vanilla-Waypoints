import { playersEntity } from "../functions/locator";
import { backwardCompatibilityPlayer } from "../lib/backwardCompatibility";
import { waypointsEntity } from "../lib/waypoints/entity/entity";
import { apiWaypointsCache } from "../lib/waypoints/info/cache";
import { world, system } from "@minecraft/server";
import { isReadableRealPlayer } from "../lib/player/readable";
world.afterEvents.playerSpawn.subscribe(({ initialSpawn, player }) => {
  if (!player) return;
  system.run(() => {
    if (!isReadableRealPlayer(player)) return;
    if (initialSpawn) {
      playersEntity.set(player.id, player);
      if (!player.getDynamicProperty("uvw:7.0"))
        return backwardCompatibilityPlayer.convert_v7_0(player);
      if (!player.getDynamicProperty("uvw:8.0"))
        return backwardCompatibilityPlayer.convert_v8_0(player);
      if (player.getDynamicProperty("uvw:8.0")) apiWaypointsCache.load(player);
    }
    system.runTimeout(() => {
      if (isReadableRealPlayer(player))
        waypointsEntity.recoverWaypoints(player);
    }, 20 * 5);
  });
});
