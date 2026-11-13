import { colorRBG } from "../../variables";
import { waypointsEntity } from "../entity/entity";
import { stringFormat } from "../../stringFormat";
import { apiVec3 } from "../../math/vector";
import { apiWarn } from "../../player/warn";
import { waypointsInfo } from "./general";
import { waypointsShare } from "./share";
import { blf } from "../../blf";
export const apiWaypointsEdit = new (class ApiWaypointsEdit {
  edit(player, oldInfo, info, message = true) {
    waypointsInfo.remove(player, oldInfo.name, false);
    waypointsEntity.remove(player, oldInfo.name);
    if (oldInfo.name != info.name)
      waypointsShare.removeFromList(player, oldInfo.name);
    const name = stringFormat.sameNames(
      info.name,
      waypointsInfo.getAllName(player, oldInfo.name),
    );
    const color =
      info.color != oldInfo.color
        ? (colorRBG[info.color] ?? { red: 200, green: 200, blue: 200 })
        : { red: info.colorR, green: info.colorG, blue: info.colorB };
    const icon = waypointsEntity.getIcon(info.icon, name);
    const waypointInfo = {
      name,
      dimension: player.dimension.id,
      icon,
      color: info.color,
      rgb: color,
      turnOffClose: info.turnOff,
      visible: info.visible,
    };
    const storedInfo = { ...waypointInfo, pos: apiVec3.floor(info.pos) };
    waypointsInfo.set(player, storedInfo);
    if (info.visible)
      waypointsEntity.spawn(
        player,
        { ...waypointInfo, pos: apiVec3.bottomCenter(info.pos) },
        true,
      );
    message &&
      apiWarn.notify(
        player,
        { translate: `warn.uvw:editPoint`, with: [name] },
        { sound: "warn.uvw:break_amethyst" },
      );
    blf.info(
      `${blf.player(player)} edited waypoint ${blf.waypoint(oldInfo)} to ${blf.waypoint(storedInfo)}.`,
    );
  }
})();
