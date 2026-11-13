import { apiScoreboard } from "../../math/scoreboard";
import { apiWaypointsCache } from "./cache";
import { blf } from "../../blf";
export const waypointsInfo = new (class ApiWaypointInfo {
  getAll(player) {
    return [...apiWaypointsCache.getDimension(player).values()].sort((a, b) => {
      if (a.visible !== b.visible) {
        return a.visible ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }
  getAllName(player, exclude = "\u0000") {
    return [...apiWaypointsCache.getDimension(player).keys()]
      .sort((a, b) => a.localeCompare(b))
      .filter((value) => value != exclude);
  }
  set(player, info) {
    const scoreInfo = apiScoreboard.getObj(
      `uvw/${player.id}/${info.dimension.replace("minecraft:", "")}/${info.name}`,
    );
    apiScoreboard.setScore(scoreInfo, "visible", info.visible ? 1 : 0);
    apiScoreboard.setScore(scoreInfo, "icon", info.icon);
    apiScoreboard.setScore(scoreInfo, "colorI", info.color);
    apiScoreboard.setScore(scoreInfo, "R", info.rgb.red);
    apiScoreboard.setScore(scoreInfo, "G", info.rgb.green);
    apiScoreboard.setScore(scoreInfo, "B", info.rgb.blue);
    apiScoreboard.setScore(scoreInfo, "X", info.pos.x);
    apiScoreboard.setScore(scoreInfo, "Y", info.pos.y);
    apiScoreboard.setScore(scoreInfo, "Z", info.pos.z);
    apiScoreboard.setScore(
      scoreInfo,
      "turnOffClose",
      info.turnOffClose ? 1 : 0,
    );
    apiWaypointsCache.set(player, info);
  }
  remove(player, name, logAction = true) {
    const info = apiWaypointsCache.getDimension(player).get(name);
    apiScoreboard.removeObj(
      "uvw/" +
        player.id +
        "/" +
        player.dimension.id.replace("minecraft:", "") +
        "/" +
        name,
    );
    apiWaypointsCache.remove(player, name);
    if (logAction)
      blf.info(
        `${blf.player(player)} deleted waypoint ${info ? blf.waypoint(info) : `"${blf.text(name)}" in ${player.dimension.id.replace("minecraft:", "")}`}.`,
      );
  }
})();
