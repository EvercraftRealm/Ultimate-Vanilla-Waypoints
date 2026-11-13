import { apiScoreboard } from "../../math/scoreboard";
import { apiWaypointCreate } from "./create";
import { apiWarn } from "../../player/warn";
import { blf } from "../../blf";
export const waypointsShare = new (class ApiWaypointShare {
  share(player, target, info) {
    if (!target.isValid)
      return apiWarn.notify(player, "warn.uvw:playerOffline", {
        sound: "warn.uvw:break",
      });
    if (this.hasOnList(player, target.nameTag, info))
      return apiWarn.notify(
        player,
        { translate: "warn.uvw:alreadySent", with: [info.name] },
        { sound: "warn.uvw:bass" },
      );
    const shared = apiWaypointCreate.create(
      target,
      {
        name: info.name,
        pos: info.pos,
        color: info.color,
        icon: info.icon < 26 ? -1 : info.icon,
        turnOff: info.turnOffClose,
      },
      player.name,
      true,
    );
    blf.info(
      `${blf.player(player)} shared waypoint ${blf.waypoint(info)} with ${blf.player(target)} as "${blf.text(shared?.name ?? info.name)}".`,
    );
  }
  hasOnList(player, targetName, info) {
    const scoreID = `uvw/${player.id}/${info.dimension.replace("minecraft:", "")}/${info.name}`;
    if (apiScoreboard.hasParticipant(scoreID, `S/${targetName}`)) return true;
    apiScoreboard.setScore(scoreID, `S/${targetName}`, 0);
    return false;
  }
  removeFromList(player, name) {
    const score = apiScoreboard.getObj(`uvw:${player.nameTag}`);
    for (const participant of score
      .getParticipants()
      .filter((value) => value.displayName.endsWith(name))) {
      score.removeParticipant(participant);
    }
  }
})();
