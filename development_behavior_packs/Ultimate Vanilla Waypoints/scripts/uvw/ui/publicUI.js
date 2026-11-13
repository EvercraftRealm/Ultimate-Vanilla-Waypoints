import { world, system } from "@minecraft/server";
import {
  ActionFormData,
  MessageFormData,
  ModalFormData,
} from "@minecraft/server-ui";
import { waypointsInfo } from "../lib/waypoints/info/general";
import { publicWaypointsInfo } from "../lib/waypoints/info/public";
import { waypointsEntity } from "../lib/waypoints/entity/entity";
import { apiConfig } from "../lib/player/config";
import { apiVec3 } from "../lib/math/vector";
import { apiWarn } from "../lib/player/warn";
import { iconPathId, Variables } from "../lib/variables";
import { waypointUITeleport } from "./teleportUI";
import { isReadableRealPlayer } from "../lib/player/readable";

export function waypointUIPublic(player, onBack) {
  const form = new ActionFormData().title("ui.uvw:public.title");
  const actions = [];
  if (Variables.teleportEnabled) {
    form.button("ui.uvw:config.button.teleport", "textures/ui/realmsIcon");
    actions.push((player) =>
      teleportToPublicWaypoint(player, (player) =>
        waypointUIPublic(player, onBack),
      ),
    );
  }
  form
    .button("ui.uvw:public.view", "textures/uvw/ui/waypoint_icon_true")
    .button("ui.uvw:public.publish", "textures/ui/plus")
    .button("ui.uvw:public.manage", "textures/ui/editIcon");
  actions.push(
    (player) => viewPublicWaypoints(player, onBack),
    (player) => publishWaypoint(player, onBack),
    (player) => managePublicWaypoints(player, onBack),
  );
  form.show(player).then(({ canceled, selection }) => {
    if (canceled || selection == undefined) return onBack?.(player);
    actions[selection]?.(player);
  });
}

function teleportToPublicWaypoint(player, onBack) {
  const waypoints = publicWaypointsInfo.getAll(player);
  if (waypoints.length < 1)
    return apiWarn.notify(player, "warn.uvw:noPublicWaypoints", {
      type: "action_bar",
      sound: "warn.uvw:bass",
    });
  waypointUITeleport(player, waypoints, onBack);
}

function viewPublicWaypoints(player, onBack) {
  const waypoints = publicWaypointsInfo.getAll(player);
  if (waypoints.length < 1)
    return apiWarn.notify(player, "warn.uvw:noPublicWaypoints", {
      type: "action_bar",
      sound: "warn.uvw:bass",
    });
  const form = new ActionFormData()
    .title("ui.uvw:public.view")
    .body("ui.uvw:public.current_dimension");
  waypoints.forEach((point) =>
    form.button(
      `${point.name}\n§e${point.ownerName}§r - ${apiVec3.formatColored(point.pos)}`,
      `textures/uvw/ui/${iconPathId[point.icon]}_${point.visible}`,
    ),
  );
  form.show(player).then(({ canceled, selection }) => {
    if (canceled || selection == undefined)
      return waypointUIPublic(player, onBack);
    const point = waypoints[selection];
    if (point) publicWaypointDetails(player, point, onBack);
  });
}

function publicWaypointDetails(player, point, onBack) {
  new ModalFormData()
    .title(point.name)
    .label({
      rawtext: [
        {
          translate: "ui.uvw:public.details.publisher",
          with: [point.ownerName],
        },
        {
          text: `\n${apiVec3.formatWithLetter(point.pos)}\n${point.dimension.replace("minecraft:", "")}`,
        },
      ],
    })
    .toggle("ui.uvw:public.visible", { defaultValue: point.visible })
    .submitButton("ui.uvw:create.button_save")
    .show(player)
    .then(({ canceled, formValues }) => {
      if (canceled || formValues == undefined)
        return viewPublicWaypoints(player, onBack);
      const visible = formValues.find((value) => typeof value == "boolean");
      if (typeof visible == "boolean" && visible != point.visible) {
        publicWaypointsInfo.setVisible(player, point, visible);
        refreshPublicWaypoints();
      }
      viewPublicWaypoints(player, onBack);
    });
}

function publishWaypoint(player, onBack) {
  const waypoints = waypointsInfo.getAll(player);
  if (waypoints.length < 1)
    return apiWarn.notify(player, "warn.uvw:dontHavePoints", {
      type: "action_bar",
      sound: "warn.uvw:bass",
    });
  const config = apiConfig.get(player);
  const form = new ActionFormData()
    .title("ui.uvw:public.publish")
    .body("ui.uvw:public.publish.choose");
  waypoints.forEach((point) =>
    form.button(
      `${point.name}${config.pos ? `\n${apiVec3.formatColored(point.pos)}` : ""}`,
      `textures/uvw/ui/${iconPathId[point.icon]}_${point.visible}`,
    ),
  );
  form.show(player).then(({ canceled, selection }) => {
    if (canceled || selection == undefined)
      return waypointUIPublic(player, onBack);
    const point = waypoints[selection];
    if (!point) return;
    new MessageFormData()
      .title("ui.uvw:public.publish")
      .body({ translate: "ui.uvw:public.publish.confirm", with: [point.name] })
      .button1("ui.uvw:yes")
      .button2("ui.uvw:no")
      .show(player)
      .then(({ canceled: confirmCanceled, selection: confirm }) => {
        if (confirmCanceled || confirm == 1)
          return publishWaypoint(player, onBack);
        const updated = publicWaypointsInfo.publish(player, point);
        refreshPublicWaypoints();
        apiWarn.notify(
          player,
          {
            translate: updated
              ? "warn.uvw:publicUpdated"
              : "warn.uvw:publicPublished",
            with: [point.name],
          },
          { type: "action_bar", sound: "warn.uvw:enchanting_table" },
        );
      });
  });
}

function managePublicWaypoints(player, onBack) {
  const waypoints = publicWaypointsInfo.getOwned(player);
  if (waypoints.length < 1)
    return apiWarn.notify(player, "warn.uvw:noOwnedPublicWaypoints", {
      type: "action_bar",
      sound: "warn.uvw:bass",
    });
  const form = new ActionFormData()
    .title("ui.uvw:public.manage")
    .body("ui.uvw:public.manage.choose");
  waypoints.forEach((point) =>
    form.button(
      `${point.name}\n${apiVec3.formatColored(point.pos)}`,
      `textures/uvw/ui/${iconPathId[point.icon]}_true`,
    ),
  );
  form.show(player).then(({ canceled, selection }) => {
    if (canceled || selection == undefined)
      return waypointUIPublic(player, onBack);
    const point = waypoints[selection];
    if (!point) return;
    new MessageFormData()
      .title("ui.uvw:public.unpublish")
      .body({
        translate: "ui.uvw:public.unpublish.confirm",
        with: [point.name],
      })
      .button1("ui.uvw:yes")
      .button2("ui.uvw:no")
      .show(player)
      .then(({ canceled: confirmCanceled, selection: confirm }) => {
        if (confirmCanceled || confirm == 1)
          return managePublicWaypoints(player, onBack);
        publicWaypointsInfo.remove(player, point);
        refreshPublicWaypoints();
        apiWarn.notify(
          player,
          { translate: "warn.uvw:publicUnpublished", with: [point.name] },
          { type: "action_bar", sound: "warn.uvw:deactive" },
        );
      });
  });
}

function refreshPublicWaypoints() {
  system.run(() =>
    world
      .getAllPlayers()
      .filter(isReadableRealPlayer)
      .forEach((player) => waypointsEntity.recoverWaypoints(player)),
  );
}
