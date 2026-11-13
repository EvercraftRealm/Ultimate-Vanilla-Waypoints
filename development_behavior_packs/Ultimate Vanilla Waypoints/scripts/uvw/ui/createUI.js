import { apiWaypointCreate } from "../lib/waypoints/info/create";
import { apiWaypointsEdit } from "../lib/waypoints/info/edit";
import { ModalFormData } from "@minecraft/server-ui";
import { apiWarn } from "../lib/player/warn";
import { waypointsUIEdit } from "./editUI";
import { iconOptions } from "../lib/variables";
export function waypointsUICreate(player, edit, onBack) {
  const location = edit?.pos ?? {
    x: player.location.x,
    y: player.location.y + 1,
    z: player.location.z,
  };
  const defaultIconIndex = edit
    ? Math.max(
        0,
        iconOptions.findIndex(
          (option) => option.id == (edit.icon < 26 ? -1 : edit.icon),
        ),
      )
    : 0;
  const form = new ModalFormData()
    .title(`ui.uvw:${!edit ? "create" : "edit"}.title`)
    .textField("ui.uvw:create.name", "ui.uvw:create.name_hold", {
      defaultValue: edit?.name,
    })
    .textField("ui.uvw:create.pos", "ui.uvw:create.pos_hold", {
      defaultValue: `${Math.floor(location.x)}, ${Math.floor(location.y)}, ${Math.floor(location.z)}`,
    })
    .toggle("ui.uvw:create.turn_off_close", {
      defaultValue: edit?.turnOffClose ?? false,
    })
    .dropdown("ui.uvw:create.icon", icons, {
      defaultValueIndex: defaultIconIndex,
    })
    .dropdown("ui.uvw:create.color", colorList, {
      defaultValueIndex: edit?.color ?? Math.floor(Math.random() * 16),
    });
  if (edit) {
    form
      .slider({ translate: "ui.uvw:create.slider_r" }, 0, 255, {
        valueStep: 1,
        defaultValue: edit.rgb.red,
      })
      .slider({ translate: "ui.uvw:create.slider_g" }, 0, 255, {
        valueStep: 1,
        defaultValue: edit.rgb.green,
      })
      .slider({ translate: "ui.uvw:create.slider_b" }, 0, 255, {
        valueStep: 1,
        defaultValue: edit.rgb.blue,
      });
  }
  form
    .submitButton("ui.uvw:create.button_save")
    .show(player)
    .then((r) => {
      if (r.canceled || r.formValues == undefined) {
        if (onBack) return onBack(player);
        if (edit) return waypointsUIEdit(player);
        return;
      }
      const [name, position, turnOff, icon, color, colorR, colorG, colorB] =
        r.formValues;
      if (typeof name != "string" || !name)
        return apiWarn.notify(player, "warn.uvw:invalidName", {
          type: "action_bar",
          sound: "warn.uvw:bass",
        });
      if (typeof position != "string" || !name)
        return apiWarn.notify(player, "warn.uvw:invalidName", {
          type: "action_bar",
          sound: "warn.uvw:bass",
        });
      const xyz = position
        .split(/[^0-9.,-]+/)
        .filter((p) => p !== ",")
        .map((p) => parseInt(p))
        .map((n, index) => (isNaN(n) ? location[vectorLoc[index] ?? "x"] : n));
      let pos = {
        x: xyz[0] ?? location.x,
        y: xyz[1] ?? location.y,
        z: xyz[2] ?? location.z,
      };
      if (typeof icon != "number")
        return apiWarn.notify(player, "warn.uvw:failCreatePoint", {
          type: "action_bar",
          sound: "warn.uvw:break",
        });
      const selectedIcon = iconOptions[icon]?.id;
      if (typeof selectedIcon != "number")
        return apiWarn.notify(player, "warn.uvw:failCreatePoint", {
          type: "action_bar",
          sound: "warn.uvw:break",
        });
      if (typeof color != "number")
        return apiWarn.notify(player, "warn.uvw:failCreatePoint", {
          type: "action_bar",
          sound: "warn.uvw:break",
        });
      if (edit) {
        return apiWaypointsEdit.edit(player, edit, {
          name: name,
          pos: pos,
          turnOff: typeof turnOff != "boolean" ? false : turnOff,
          icon: selectedIcon,
          color: color,
          colorR: typeof colorR != "number" ? 200 : colorR,
          colorG: typeof colorG != "number" ? 200 : colorG,
          colorB: typeof colorB != "number" ? 200 : colorB,
          visible: edit.visible,
        });
      }
      apiWaypointCreate.create(player, {
        name: name,
        pos: pos,
        turnOff: typeof turnOff != "boolean" ? false : turnOff,
        icon: selectedIcon,
        color: color,
      });
    });
}
const vectorLoc = ["x", "y", "z"];
const colorList = Array(16)
  .fill(0)
  .map((value, index) => `ui.uvw.create.color.${index}`);
const icons = iconOptions.map((option) => `ui.uvw:create.icon.${option.key}`);
