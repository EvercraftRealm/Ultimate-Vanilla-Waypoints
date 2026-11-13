import { waypointsInfo } from "./general";
import { waypointsEntity } from "../entity/entity";
import { stringFormat } from "../../stringFormat";
import { apiVec3 } from "../../math/vector";
import { apiWarn } from "../../player/warn";
import { colorRBG } from "../../variables";
import { forceUpdateList } from "../../../functions/locator";
import { blf } from "../../blf";
export const apiWaypointCreate = new (class ApiWaypointCreate {
  create(player, info, message = "create", isShare = false) {
    const name = stringFormat.sameNames(
      info.name,
      waypointsInfo.getAllName(player),
    );
    const icon = waypointsEntity.getIcon(info.icon, info.name);
    const color = colorRBG[info.color] ?? { red: 200, green: 200, blue: 200 };
    const turnOff = name.startsWith("Death") ? 1 : info.turnOff ? 1 : 0;
    const waypointInfo = {
      name,
      dimension: player.dimension.id,
      icon,
      color: info.color,
      rgb: color,
      turnOffClose: !!turnOff,
      visible: true,
    };
    const storedInfo = { ...waypointInfo, pos: apiVec3.floor(info.pos) };
    waypointsInfo.set(player, storedInfo);
    if (message == "create")
      apiWarn.notify(
        player,
        { translate: "warn.uvw:createPoint", with: [name] },
        { sound: "warn.uvw:enchanting_table" },
      );
    if (isShare)
      apiWarn.notify(
        player,
        { translate: "warn.uvw:reciveWaypoint", with: [name, message] },
        { sound: "warn.uvw:enchanting_table" },
      );
    forceUpdateList.add(player.id);
    waypointsEntity.spawn(
      player,
      { ...waypointInfo, pos: apiVec3.bottomCenter(info.pos) },
      true,
    );
    blf.info(
      `${blf.player(player)} created waypoint ${blf.waypoint(storedInfo)}${isShare ? `, shared by ${blf.text(message)}` : ""}.`,
    );
    return storedInfo;
  }
})();
