import {
  CommandPermissionLevel,
  PlayerPermissionLevel,
} from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { waypointsEntity } from "../lib/waypoints/entity/entity";
import { system } from "@minecraft/server";
import { apiConfig } from "../lib/player/config";
import { apiWarn } from "../lib/player/warn";
import { waypointUIOptionsAdmin } from "./configAdminUI";
export function waypointUIOptions(player, onBack) {
  const form = new ActionFormData()
    .title("ui.uvw:options.title")
    .button("ui.uvw:options.general.title", "textures/ui/automation_glyph")
    .button("ui.uvw:options.recover.title", "textures/ui/refresh_hover");
  const actions = [
    (player) => waypointOptions[0](player, onBack),
    (player) => waypointOptions[1](player, onBack),
  ];
  if (canConfigureWaypoints(player)) {
    form.button(
      "ui.uvw:config.button.admin",
      "textures/uvw/ui/command_block_icon",
    );
    actions.push((player) =>
      waypointUIOptionsAdmin(player, (player) =>
        waypointUIOptions(player, onBack),
      ),
    );
  }
  form.show(player).then((r) => {
    if (r.canceled || r.selection == undefined) return onBack?.(player);
    actions[r.selection]?.(player);
  });
}
function canConfigureWaypoints(player) {
  try {
    return (
      player.playerPermissionLevel == PlayerPermissionLevel.Operator ||
      player.commandPermissionLevel >= CommandPermissionLevel.GameDirectors
    );
  } catch {
    return false;
  }
}
export const dateType = [
  "hh:mm:ss - MM:DD:YY",
  "hh:mm:ss - DD:MM:YY",
  "hh:mm:ss - YY:MM:DD",
  "hh:mm:ss - MM:DD:YYYY",
  "hh:mm:ss - DD:MM:YYYY",
  "hh:mm:ss - YYYY:MM:DD",
];
const UTCList = [
  "UTC-12",
  "UTC-11",
  "UTC-10",
  "UTC-9",
  "UTC-8",
  "UTC-7",
  "UTC-6",
  "UTC-5",
  "UTC-4",
  "UTC-3",
  "UTC-2",
  "UTC-1",
  "UTC 0",
  "UTC+1",
  "UTC+2",
  "UTC+3",
  "UTC+4",
  "UTC+5",
  "UTC+6",
  "UTC+7",
  "UTC+8",
  "UTC+9",
  "UTC+10",
  "UTC+11",
  "UTC+12",
];
export const waypointOptions = new (class waypointOptions {
  0(player, onBack) {
    const config = apiConfig.get(player);
    new ModalFormData()
      .title("ui.uvw:options.general.title")
      .toggle("ui.uvw:options.general.toggle.showName", {
        defaultValue: config.name,
      })
      .toggle("ui.uvw:options.general.toggle.showDistance", {
        defaultValue: config.dis,
      })
      .toggle("ui.uvw:options.general.toggle.showBeacon", {
        defaultValue: config.beam,
      })
      .toggle("ui.uvw:options.general.toggle.alwaysShowInfo", {
        defaultValue: config.showInfo,
      })
      .toggle("ui.uvw:options.general.toggle.alwaysShowBeam", {
        defaultValue: config.showBeam,
      })
      .toggle("ui.uvw:options.general.toggle.showPos", {
        defaultValue: config.pos,
      })
      .toggle("ui.uvw:options.general.toggle.reciveSharing", {
        defaultValue: config.share,
      })
      .toggle("ui.uvw:options.general.toggle.createDeathPoint", {
        defaultValue: config.createDP,
      })
      .dropdown("ui.uvw:options.general.dropdown.deathPointDate", dateType, {
        defaultValueIndex: config.DPType,
      })
      .dropdown("ui.uvw:options.general.dropdown.deathPointUTC", UTCList, {
        defaultValueIndex: config.utc + 12,
      })
      .submitButton("ui.uvw:create.button_save")
      .show(player)
      .then((r) => {
        if (r.canceled || r.formValues == undefined)
          return waypointUIOptions(player, onBack);
        const [
          showName,
          showDistance,
          showBeacon,
          showInfo,
          showBeam,
          showPos,
          reciveSharing,
          createDeath,
          deathDate,
          deathUTC,
        ] = r.formValues;
        config.name = typeof showName == "boolean" ? showName : true;
        config.dis = typeof showDistance == "boolean" ? showDistance : true;
        config.beam = typeof showBeacon == "boolean" ? showBeacon : true;
        config.showInfo = typeof showInfo == "boolean" ? showInfo : false;
        config.showBeam = typeof showBeam == "boolean" ? showBeam : false;
        config.pos = typeof showPos == "boolean" ? showPos : true;
        config.share = typeof reciveSharing == "boolean" ? reciveSharing : true;
        config.createDP = typeof createDeath == "boolean" ? createDeath : true;
        config.DPType = typeof deathDate == "number" ? deathDate : 0;
        config.utc = typeof deathUTC == "number" ? deathUTC - 12 : -3;
        apiConfig.set(player, config);
        apiWarn.notify(player, "warn.uvw:saveOptions", {
          type: "action_bar",
          sound: "warn.uvw:break_amethyst",
        });
        system.runTimeout(() => {
          waypointsEntity.recoverWaypoints(player);
        });
      });
  }
  1(player) {
    waypointsEntity.recoverWaypoints(player);
  }
})();
