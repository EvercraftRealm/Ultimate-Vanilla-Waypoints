import {
  forceUpdateList,
  LocatorWaypointsList,
} from "../../../functions/locator";
import { system } from "@minecraft/server";
import { getWaypointAnchor, WaypointLocatorManager } from "./manager";
import { waypointsInfo } from "../info/general";
import { publicWaypointsInfo } from "../info/public";
export const waypointsEntity = new (class ApiWaypointEntity {
  spawn(player, info, forceUpdate = false) {
    if (player.dimension.id != info.dimension) return;
    try {
      const entity = player.dimension.spawnEntity(
        "uvw:waypoint",
        getWaypointAnchor(player),
      );
      const entityKey = info.entityKey ?? info.name;
      entity.addTag(`waypointOwner: ${player.id}`);
      entity.addTag(`waypointName: ${entityKey}`);
      const waypointList = LocatorWaypointsList.get(player.id) ?? new Map();
      waypointList.set(
        entityKey,
        new WaypointLocatorManager(info, entity, player, forceUpdate),
      );
      LocatorWaypointsList.set(player.id, waypointList);
      forceUpdate && forceUpdateList.add(player.id);
    } catch (e) {
      system.runTimeout(() => {
        this.spawn(player, info, forceUpdate);
      }, 20 * 2.5);
    }
  }
  remove(player, waypoint) {
    const waypointList = LocatorWaypointsList.get(player.id) ?? new Map();
    waypointList.delete(waypoint);
    LocatorWaypointsList.set(player.id, waypointList);
    if (typeof waypoint == "string") {
      player.dimension
        .getEntities({
          type: "uvw:waypoint",
          tags: [`waypointName: ${waypoint}`, `waypointOwner: ${player.id}`],
        })
        .forEach((entity) => {
          entity.isValid && entity.remove();
        });
      return;
    }
  }
  getIcon(index, name) {
    if (index >= 26) return index;
    if (index > 0) return index + 25;
    const first = name.trim().slice(0, 1).toLocaleUpperCase().codePointAt(0);
    if (first == undefined || first < 65 || first > 90) return 0;
    return first - 65;
  }
  removeAll(player, respawn = false) {
    forceUpdateList.add(player.id);
    LocatorWaypointsList.set(player.id, new Map());
    player.dimension
      .getEntities({ tags: [`waypointOwner: ${player.id}`] })
      .forEach((way) => way.remove());
    if (respawn) {
      const personalWaypoints = waypointsInfo.getAll(player);
      const publicWaypoints = publicWaypointsInfo
        .getAll(player)
        .filter(
          (publicPoint) =>
            !personalWaypoints.some(
              (personalPoint) =>
                publicPoint.ownerId == player.id &&
                personalPoint.name == publicPoint.name &&
                Math.floor(personalPoint.pos.x) ==
                  Math.floor(publicPoint.pos.x) &&
                Math.floor(personalPoint.pos.y) ==
                  Math.floor(publicPoint.pos.y) &&
                Math.floor(personalPoint.pos.z) ==
                  Math.floor(publicPoint.pos.z),
            ),
        );
      [...personalWaypoints, ...publicWaypoints]
        .filter((value) => value.visible)
        .forEach((waypoint) => {
          waypointsEntity.spawn(player, waypoint, true);
        });
    }
  }
  recoverWaypoints(player) {
    this.removeAll(player, true);
  }
})();
