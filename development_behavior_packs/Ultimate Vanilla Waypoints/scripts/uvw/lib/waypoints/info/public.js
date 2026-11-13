import { world } from "@minecraft/server";
import { apiScoreboard } from "../../math/scoreboard";
import { waypointsInfo } from "./general";
import { stringFormat } from "../../stringFormat";
import { blf } from "../../blf";

const publicPrefix = "uvw_public/";

export const publicWaypointsInfo = new (class ApiPublicWaypointInfo {
  getAll(player) {
    const dimension = player.dimension.id;
    return world.scoreboard
      .getObjectives()
      .filter((score) => score.id.startsWith(publicPrefix))
      .map((score) => this.read(score, player))
      .filter((info) => info && info.dimension == dimension)
      .sort(
        (a, b) =>
          a.name.localeCompare(b.name) ||
          a.ownerName.localeCompare(b.ownerName),
      );
  }
  getOwned(player) {
    return this.getAll(player).filter((info) => info.ownerId == player.id);
  }
  setVisible(player, info, visible) {
    if (info.ownerId == player.id) {
      const personal = this.getOwnedPersonalWaypoint(player, info);
      if (personal) {
        personal.visible = visible;
        waypointsInfo.set(player, personal);
      }
    }
    const hidden = this.getHidden(player);
    if (visible) hidden.delete(info.scoreId);
    else hidden.add(info.scoreId);
    this.saveHidden(player, hidden);
    blf.info(
      `${blf.player(player)} set public waypoint ${blf.waypoint(info)} visibility to ${visible ? "shown" : "hidden"}.`,
    );
  }
  publish(player, info) {
    const scoreId = `${publicPrefix}${player.id}/${info.dimension.replace("minecraft:", "")}/${info.name}`;
    const existed = apiScoreboard.hasObj(scoreId);
    const score = apiScoreboard.addObj(
      scoreId,
      stringFormat.playerName(player.name),
    );
    apiScoreboard.setScore(score, "icon", info.icon);
    apiScoreboard.setScore(score, "colorI", info.color);
    apiScoreboard.setScore(score, "R", info.rgb.red);
    apiScoreboard.setScore(score, "G", info.rgb.green);
    apiScoreboard.setScore(score, "B", info.rgb.blue);
    apiScoreboard.setScore(score, "X", Math.floor(info.pos.x));
    apiScoreboard.setScore(score, "Y", Math.floor(info.pos.y));
    apiScoreboard.setScore(score, "Z", Math.floor(info.pos.z));
    blf.info(
      `${blf.player(player)} ${existed ? "updated published" : "published"} waypoint ${blf.waypoint(info)}.`,
    );
    return existed;
  }
  remove(player, info) {
    if (info?.scoreId && apiScoreboard.hasObj(info.scoreId)) {
      apiScoreboard.removeObj(info.scoreId);
      blf.info(
        `${blf.player(player)} unpublished waypoint ${blf.waypoint(info)}.`,
      );
    }
  }
  read(score, player) {
    const parts = score.id.split("/");
    const ownerId = parts[1];
    const dimension = parts[2];
    const name = parts.slice(3).join("/");
    if (!ownerId || !dimension || !name) return;
    const info = {
      name,
      ownerId,
      ownerName: stringFormat.playerName(score.displayName),
      scoreId: score.id,
      entityKey: `public/${ownerId}/${name}`,
      pos: {
        x: apiScoreboard.getScore(score, "X") + 0.5,
        y: apiScoreboard.getScore(score, "Y"),
        z: apiScoreboard.getScore(score, "Z") + 0.5,
      },
      dimension: dimension.includes(":") ? dimension : `minecraft:${dimension}`,
      icon: apiScoreboard.getScore(score, "icon"),
      color: apiScoreboard.getScore(score, "colorI"),
      rgb: {
        red: apiScoreboard.getScore(score, "R"),
        green: apiScoreboard.getScore(score, "G"),
        blue: apiScoreboard.getScore(score, "B"),
      },
      visible: !this.getHidden(player).has(score.id),
      turnOffClose: false,
      public: true,
    };
    if (ownerId == player.id) {
      const personal = this.getOwnedPersonalWaypoint(player, info);
      if (personal) info.visible = personal.visible;
    }
    return info;
  }
  getOwnedPersonalWaypoint(player, publicInfo) {
    return waypointsInfo
      .getAll(player)
      .find(
        (personal) =>
          personal.name == publicInfo.name &&
          Math.floor(personal.pos.x) == Math.floor(publicInfo.pos.x) &&
          Math.floor(personal.pos.y) == Math.floor(publicInfo.pos.y) &&
          Math.floor(personal.pos.z) == Math.floor(publicInfo.pos.z),
      );
  }
  getHidden(player) {
    try {
      const value = JSON.parse(
        player.getDynamicProperty("uvw:publicHidden") ?? "[]",
      );
      return new Set(
        Array.isArray(value) ? value.filter((id) => typeof id == "string") : [],
      );
    } catch {
      return new Set();
    }
  }
  saveHidden(player, hidden) {
    player.setDynamicProperty(
      "uvw:publicHidden",
      hidden.size > 0 ? JSON.stringify([...hidden]) : undefined,
    );
  }
})();
