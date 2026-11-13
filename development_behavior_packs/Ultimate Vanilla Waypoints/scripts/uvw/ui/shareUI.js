import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { waypointsInfo } from "../lib/waypoints/info/general";
import { world } from "@minecraft/server";
import { apiConfig } from "../lib/player/config";
import { iconPathId } from "../lib/variables";
import { apiVec3 } from "../lib/math/vector";
import { apiWarn } from "../lib/player/warn";
import { waypointsShare } from "../lib/waypoints/info/share";
import { isReadableRealPlayer } from "../lib/player/readable";
export function waypointUIShare(player, onBack) {
  const allPlayers = world
    .getPlayers({ excludeNames: [player.nameTag] })
    .filter(isReadableRealPlayer);
  if (allPlayers.length < 1)
    return apiWarn.notify(player, "warn.uvw:noPlayersOnline", {
      type: "action_bar",
      sound: "warn.uvw:bass",
    });
  const allPoints = waypointsInfo.getAll(player);
  if (allPoints.length < 1)
    return apiWarn.notify(player, "warn.uvw:dontHavePoints", {
      type: "action_bar",
      sound: "warn.uvw:bass",
    });
  const config = apiConfig.get(player);
  const form1 = new ActionFormData()
    .title("ui.uvw:config.button.share")
    .body("ui.uvw:share.waypoints");
  allPoints.forEach((button) => {
    form1.button(
      `${button.name}${config.pos ? `\n${apiVec3.formatColored(button.pos)}` : ""}`,
      `textures/uvw/ui/${iconPathId[button.icon]}_${button.visible}`,
    );
  });
  form1.show(player).then(({ canceled, selection }) => {
    if (canceled || selection == undefined) return onBack?.(player);
    const point = allPoints[selection];
    if (!point) return;
    choosePlayer(player, allPlayers, point, onBack);
  });
}

function choosePlayer(player, allPlayers, point, onBack) {
  const form = new ActionFormData()
    .title("ui.uvw:config.button.share")
    .body("ui.uvw:share.players");
  allPlayers.forEach((target) => {
    form.button(target.nameTag);
  });
  form.show(player).then(({ canceled, selection }) => {
    if (canceled || selection == undefined)
      return waypointUIShare(player, onBack);
    const target = allPlayers[selection];
    if (!target) return;
    const targetConfig = apiConfig.get(target);
    if (!targetConfig.share)
      return apiWarn.notify(player, "warn.uvw:targetDontAcceptShare", {
        sound: "warn.uvw:break",
      });
    confirmShare(player, allPlayers, point, target, onBack);
  });
}

function confirmShare(player, allPlayers, point, target, onBack) {
  new MessageFormData()
    .title("ui.uvw:config.button.share")
    .body({
      translate: "ui.uvw:share.confirm.body",
      with: [point.name, target.nameTag],
    })
    .button1("ui.uvw:yes")
    .button2("ui.uvw:no")
    .show(player)
    .then(({ canceled, selection }) => {
      if (canceled || selection == 1)
        return choosePlayer(player, allPlayers, point, onBack);
      waypointsShare.share(player, target, point);
      waypointUIShare(player, onBack);
    });
}
