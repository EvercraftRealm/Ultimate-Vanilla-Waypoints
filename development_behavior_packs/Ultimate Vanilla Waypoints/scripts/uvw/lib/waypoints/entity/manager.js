import { EntityComponentTypes } from "@minecraft/server";
import { Variables } from "../../variables";
import { apiConfig } from "../../player/config";
import { apiWaypointsEdit } from "../info/edit";
import { waypointsInfo } from "../info/general";
import {
  forceUpdateList,
  LocatorWaypointsList,
} from "../../../functions/locator";
export class WaypointLocatorManager {
  constructor(waypoint, entity, player, forceUpdate = false) {
    this.forceUpdate = false;
    const config = apiConfig.get(player);
    const deathpoint = waypoint.name.split(" - ");
    const rawName =
      deathpoint.length == 3
        ? (deathpoint[0] ?? "Death")
        : waypoint.name.trim();
    const nameShowed =
      `${rawName.slice(0, rawName.length > Variables.maxName ? Variables.maxName - 3 : Variables.maxName)}${rawName.length > Variables.maxName ? "..." : ""}`
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    this.waypoint = {
      ...waypoint,
      stopExpression:
        "v.waypoint_x=" +
        waypoint.pos.x +
        ";" +
        "v.waypoint_y=" +
        waypoint.pos.y +
        ";" +
        "v.waypoint_z=" +
        waypoint.pos.z +
        ";" +
        nameShowed
          .split("")
          .map(
            (value, index) =>
              `v.letter${nameShowed.length - index}=${(value.codePointAt(0) ?? 32) - 32};`,
          )
          .join("") +
        ";" +
        "v.name_amount=" +
        nameShowed.length +
        ";" +
        "v.need_look_show_info=" +
        !config.showInfo +
        ";" +
        "v.need_look_show_beam=" +
        !config.showBeam +
        ";" +
        "v.show_name=" +
        config.name +
        ";" +
        "v.show_distance=" +
        config.dis +
        ";" +
        "v.show_beam=" +
        config.beam +
        ";" +
        "v.max_distance=" +
        Variables.maxDistance +
        ";" +
        "v.waypoint_scale_default=" +
        config.scale / 25 +
        ";" +
        "v.color_r=" +
        waypoint.rgb.red +
        ";" +
        "v.color_g=" +
        waypoint.rgb.green +
        ";" +
        "v.color_b=" +
        waypoint.rgb.blue +
        ";" +
        "v.icon=" +
        waypoint.icon +
        ";" +
        "v.is_visible = true;",
    };
    this.entity = entity;
    this.player = player;
    this.forceUpdate = forceUpdate;
  }
  update(dirX = 0, dirZ = 0) {
    if (!this.entity.isValid) return this.respawn(dirX, dirZ);
    this.updateRenderState(this.entity);
    const WDisX = this.waypoint.pos.x - this.player.location.x;
    const WDisY = this.waypoint.pos.y - this.player.location.y;
    const WDisZ = this.waypoint.pos.z - this.player.location.z;
    const WDistance = WDisX * WDisX + WDisY * WDisY + WDisZ * WDisZ;
    if (this.waypoint.turnOffClose && WDistance <= Variables.turnOffDistance) {
      if (
        (this.player.getComponent(EntityComponentTypes.Health)?.currentValue ??
          0) > 0
      ) {
        if (this.waypoint.name.startsWith("Death")) {
          const waypointList = LocatorWaypointsList.get(this.player.id);
          waypointList?.delete(this.waypoint.entityKey ?? this.waypoint.name);
          waypointsInfo.remove(this.player, this.waypoint.name);
          this.despawn();
          return;
        }
        return apiWaypointsEdit.edit(
          this.player,
          this.waypoint,
          {
            name: this.waypoint.name,
            pos: this.waypoint.pos,
            turnOff: false,
            icon: this.waypoint.icon < 26 ? -1 : this.waypoint.icon,
            color: this.waypoint.color,
            colorR: this.waypoint.rgb.red,
            colorG: this.waypoint.rgb.green,
            colorB: this.waypoint.rgb.blue,
            visible: false,
          },
          false,
        );
      }
    }
    const EDisX = this.entity.location.x - this.player.location.x;
    const EDisY = this.entity.location.y - this.player.location.y;
    const EDisZ = this.entity.location.z - this.player.location.z;
    const EDistance = EDisX * EDisX + EDisY * EDisY + EDisZ * EDisZ;
    if (EDistance < Variables.minRenderDistance) return;
    this.respawn(dirX, dirZ);
  }
  updateRenderState(entity) {
    entity.playAnimation("animation.uvw.waypoint.offset", {
      players: [this.player],
      nextState: "none",
      stopExpression: this.waypoint.stopExpression,
    });
  }
  despawn() {
    this.entity.isValid && this.entity.remove();
  }
  respawn(dirX = 0, dirZ = 0) {
    if (this.entity.isValid) this.entity.triggerEvent("uvw:start_despawn");
    try {
      const entity = this.player.dimension.spawnEntity(
        "uvw:waypoint",
        getWaypointAnchor(this.player, dirX, dirZ),
      );
      entity.addTag(`waypointOwner: ${this.player.id}`);
      entity.addTag(
        `waypointName: ${this.waypoint.entityKey ?? this.waypoint.name}`,
      );
      this.entity = entity;
      this.forceUpdate = true;
      forceUpdateList.add(this.player.id);
    } catch {}
  }
}

export function getWaypointAnchor(player, dirX = 0, dirZ = 0) {
  const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
  let offsetX = 6;
  let offsetZ = 6;
  if (length > 0.01) {
    const forwardX = dirX / length;
    const forwardZ = dirZ / length;
    offsetX = forwardX * 6 - forwardZ * 6;
    offsetZ = forwardZ * 6 + forwardX * 6;
  }
  return {
    x: Math.floor(player.location.x) + offsetX + 0.5,
    y: Math.floor(player.location.y) + 8.5,
    z: Math.floor(player.location.z) + offsetZ + 0.5,
  };
}
