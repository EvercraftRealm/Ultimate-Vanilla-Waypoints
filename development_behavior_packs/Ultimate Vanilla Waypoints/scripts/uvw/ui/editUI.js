import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { waypointsEntity } from "../lib/waypoints/entity/entity";
import { waypointsInfo } from "../lib/waypoints/info/general";
import { LocatorWaypointsList } from "../functions/locator";
import { apiConfig } from "../lib/player/config";
import { waypointsUICreate } from "./createUI";
import { iconPathId } from "../lib/variables";
import { apiVec3 } from "../lib/math/vector";
import { apiWarn } from "../lib/player/warn";
import { blf } from "../lib/blf";
export function waypointsUIEdit(player, onBack) {
  const waypoints = waypointsInfo.getAll(player);
  if (waypoints.length < 1)
    return apiWarn.notify(player, "warn.uvw:dontHavePoints", {
      type: "action_bar",
      sound: "warn.uvw:bass",
    });
  const config = apiConfig.get(player);
  const buttons = waypoints.map((way) => ({
    id: config.pos
      ? `${way.name.slice(0, 21)}${way.name.length > 21 ? "..." : ""}`
      : way.name,
    icon: way.icon,
    visible: way.visible,
    pos: way.pos,
  }));
  const form = new ActionFormData()
    .title("ui.uvw:edit.title")
    .button("ui.uvw:edit.visible", "textures/uvw/ui/hide_true");
  buttons.forEach((button) => {
    form.button(
      `${button.id}${config.pos ? `\n${apiVec3.formatColored(button.pos)}` : ""}`,
      `textures/uvw/ui/${iconPathId[button.icon]}_${button.visible}`,
    );
  });
  form.show(player).then((r) => {
    if (r.canceled || r.selection == undefined) return onBack?.(player);
    if (r.selection == 0) return waypointsUIVisible(player, onBack);
    const point = waypoints[r.selection - 1];
    if (point == undefined) return;
    return waypointsUICreate(player, point, (player) =>
      waypointsUIEdit(player, onBack),
    );
  });
}
function waypointsUIVisible(player, onBack) {
  const waypoints = waypointsInfo.getAll(player);
  const config = apiConfig.get(player);
  const form = new ModalFormData().title("ui.uvw:edit.visible");
  waypoints.forEach((button) =>
    form.toggle(
      `${button.name}${config.pos ? ` - ${apiVec3.formatColored(button.pos)}` : ""}`,
      { defaultValue: button.visible },
    ),
  );
  form
    .submitButton("ui.uvw:create.button_save")
    .show(player)
    .then(({ canceled, formValues }) => {
      if (canceled || formValues == undefined)
        return waypointsUIEdit(player, onBack);
      let amountVisible = 0;
      for (const value of formValues) {
        if (amountVisible >= 10) {
          apiWarn.notify(player, "warn.uvw:manyWaypoints", {
            sound: "warn.uvw:pop",
          });
          break;
        }
        if (value == true) amountVisible++;
      }
      const locatorList = LocatorWaypointsList.get(player.id) ?? new Map();
      for (let i = 0; i < formValues.length; i++) {
        const visibility = formValues[i];
        if (typeof visibility != "boolean") continue;
        const info = waypoints[i];
        if (!info) continue;
        if (info.visible == visibility) continue;
        waypointsEntity.remove(player, info.name);
        info.visible = !info.visible;
        waypointsInfo.set(player, info);
        blf.info(
          `${blf.player(player)} set waypoint ${blf.waypoint(info)} visibility to ${visibility ? "shown" : "hidden"}.`,
        );
        if (visibility) {
          waypointsEntity.spawn(player, info, true);
        } else {
          locatorList.delete(info.name);
        }
      }
      LocatorWaypointsList.set(player.id, locatorList);
    });
}
