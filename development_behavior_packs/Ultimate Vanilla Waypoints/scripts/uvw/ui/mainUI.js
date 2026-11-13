import { ActionFormData } from "@minecraft/server-ui";
import { waypointUITeleport } from "./teleportUI";
import { waypointUIOptions } from "./configUI";
import { waypointsUICreate } from "./createUI";
import { waypointsUIRemove } from "./removeUI";
import { Variables } from "../lib/variables";
import { waypointUIShare } from "./shareUI";
import { waypointsUIEdit } from "./editUI";
import { waypointUIPublic } from "./publicUI";
export function waypointMenu(player, quickCreate) {
  if (quickCreate)
    return waypointsUICreate(player, undefined, (player) =>
      waypointMenu(player, false),
    );
  const form = new ActionFormData()
    .title("ui.uvw:config.title")
    .button("ui.uvw:config.button.my", "textures/uvw/items/waypoint_item")
    .button("ui.uvw:config.button.public", "textures/uvw/ui/waypoint_icon_true")
    .button(
      "ui.uvw:config.button.options",
      "textures/ui/settings_glyph_color_2x",
    );
  const actions = [
    waypointUIMyWaypoints,
    (player) =>
      waypointUIPublic(player, (player) => waypointMenu(player, false)),
    (player) =>
      waypointUIOptions(player, (player) => waypointMenu(player, false)),
  ];
  form.show(player).then(({ canceled, selection }) => {
    if (canceled || selection == undefined) return;
    actions[selection]?.(player);
  });
}
export function waypointUIMyWaypoints(player) {
  const form = new ActionFormData().title("ui.uvw:config.button.my");
  const actions = [];
  const back = waypointUIMyWaypoints;
  if (Variables.teleportEnabled) {
    form.button("ui.uvw:config.button.teleport", "textures/ui/realmsIcon");
    actions.push((player) => waypointUITeleport(player, undefined, back));
  }
  form
    .button("ui.uvw:config.button.create", "textures/ui/plus")
    .button("ui.uvw:config.button.edit", "textures/ui/editIcon")
    .button("ui.uvw:config.button.remove", "textures/ui/icon_trash")
    .button("ui.uvw:config.button.share", "textures/ui/share_microsoft");
  actions.push(
    (player) => waypointsUICreate(player, undefined, back),
    (player) => waypointsUIEdit(player, back),
    (player) => waypointsUIRemove(player, back),
    (player) => waypointUIShare(player, back),
  );
  form.show(player).then(({ canceled, selection }) => {
    if (canceled || selection == undefined) return waypointMenu(player, false);
    actions[selection]?.(player);
  });
}
