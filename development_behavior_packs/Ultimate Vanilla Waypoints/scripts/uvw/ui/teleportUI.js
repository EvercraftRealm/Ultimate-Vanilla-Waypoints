import { GameMode, system, world } from "@minecraft/server";
import { waypointsEntity } from "../lib/waypoints/entity/entity";
import { waypointsInfo } from "../lib/waypoints/info/general";
import { Variables, iconPathId } from "../lib/variables";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { apiConfig } from "../lib/player/config";
import { apiNumbers } from "../lib/math/numbers";
import { apiVec3 } from "../lib/math/vector";
import { apiWarn } from "../lib/player/warn";
import { blf } from "../lib/blf";
export function waypointUITeleport(player, waypointList, onBack) {
  const waypoints = waypointList ?? waypointsInfo.getAll(player);
  if (waypoints.length < 1)
    return apiWarn.notify(player, "warn.uvw:dontHavePoints", {
      type: "action_bar",
      sound: "warn.uvw:bass",
    });
  const config = apiConfig.get(player);
  const buttons = waypoints.map((way) => {
    const cost = apiNumbers.calculateCost(player.location, way.pos);
    return {
      id: `${config.pos ? `${way.name.slice(0, 21)}${way.name.length > 21 ? "..." : ""}` : way.name}${formatCost(cost)}`,
      name: way.name,
      icon: way.icon,
      visible: way.visible,
      pos: way.pos,
      dimension: way.dimension,
      public: way.public,
      ownerName: way.ownerName,
      cost: cost,
    };
  });
  const form = new ActionFormData().title("ui.uvw:tp.title");
  buttons.forEach((button) => {
    form.button(
      `${button.id}${config.pos ? `\n${apiVec3.formatColored(button.pos)}` : ""}`,
      `textures/uvw/ui/${iconPathId[button.icon]}_${button.visible}`,
    );
  });
  form.show(player).then((r) => {
    if (r.canceled || r.selection == undefined) return onBack?.(player);
    const button = buttons[r.selection];
    if (!button) return;
    const creative = player.getGameMode() == GameMode.Creative;
    if (!checkTeleportPayment(player, button, creative)) return;
    if (!creative && button.cost > 0 && Variables.teleportCostMode != "none")
      return confirmPaidTeleport(player, button, () =>
        waypointUITeleport(player, waypointList, onBack),
      );
    teleport(player, button, creative);
  });
}
function confirmPaidTeleport(player, button, onBack) {
  new MessageFormData()
    .title("ui.uvw:tp.confirm.title")
    .body({
      translate: "ui.uvw:tp.confirm.body",
      with: [button.name, formatCost(button.cost).replace(/^ - /, "")],
    })
    .button1("ui.uvw:yes")
    .button2("ui.uvw:no")
    .show(player)
    .then(({ canceled, selection }) => {
      if (canceled || selection != 0) return onBack();
      teleport(player, button, false);
    });
}
function checkTeleportPayment(player, button, creative) {
  let scoreboard;
  let score = 0;
  if (
    !creative &&
    button.cost > 0 &&
    Variables.teleportCostMode == "xp" &&
    player.level < button.cost
  )
    return void apiWarn.notify(player, "warn.uvw:insufficientXp", {
      type: "action_bar",
      sound: "warn.uvw:bass",
    });
  if (
    !creative &&
    button.cost > 0 &&
    Variables.teleportCostMode == "scoreboard"
  ) {
    scoreboard = world.scoreboard.getObjective(
      Variables.teleportScoreboardObjective,
    );
    const objectiveName =
      scoreboard?.displayName ?? Variables.teleportScoreboardObjective;
    if (!scoreboard || !player.scoreboardIdentity)
      return void apiWarn.notify(
        player,
        { translate: "warn.uvw:insufficientScore", with: [objectiveName] },
        { type: "action_bar", sound: "warn.uvw:bass" },
      );
    score = scoreboard.getScore(player.scoreboardIdentity) ?? 0;
    if (score < button.cost)
      return void apiWarn.notify(
        player,
        { translate: "warn.uvw:insufficientScore", with: [objectiveName] },
        { type: "action_bar", sound: "warn.uvw:bass" },
      );
  }
  if (
    !creative &&
    button.cost > 0 &&
    Variables.teleportCostMode == "ender_pearl" &&
    countInventoryItem(player, "minecraft:ender_pearl") < button.cost
  )
    return void apiWarn.notify(player, "warn.uvw:insufficientPearls", {
      type: "action_bar",
      sound: "warn.uvw:bass",
    });
  return { scoreboard, score };
}
function teleport(player, button, creative) {
  const payment = checkTeleportPayment(player, button, creative);
  if (!payment) return;
  const origin = { ...player.location };
  const originDimension = player.dimension.id;
  if (
    !player.tryTeleport({ x: button.pos.x, y: button.pos.y, z: button.pos.z })
  )
    return apiWarn.notify(player, "warn.uvw:teleportFailed", {
      type: "action_bar",
      sound: "warn.uvw:bass",
    });
  if (!creative && button.cost > 0 && Variables.teleportCostMode == "xp")
    player.addLevels(-button.cost);
  if (
    !creative &&
    button.cost > 0 &&
    Variables.teleportCostMode == "scoreboard"
  )
    payment.scoreboard.setScore(
      player.scoreboardIdentity,
      payment.score - button.cost,
    );
  if (
    !creative &&
    button.cost > 0 &&
    Variables.teleportCostMode == "ender_pearl"
  )
    removeInventoryItem(player, "minecraft:ender_pearl", button.cost);
  const publicDescription = button.public
    ? ` public waypoint published by ${blf.text(button.ownerName)}`
    : " waypoint";
  blf.info(
    `${blf.player(player)} teleported from ${blf.location(origin, originDimension)} to${publicDescription} "${blf.text(button.name)}" at ${blf.location(button.pos, button.dimension ?? originDimension)}; cost: ${teleportCostDescription(button.cost, creative)}.`,
  );
  system.runTimeout(() => {
    waypointsEntity.recoverWaypoints(player);
  }, 40);
}
function teleportCostDescription(cost, creative) {
  if (creative) return "free (Creative mode)";
  if (cost < 1 || Variables.teleportCostMode == "none") return "free";
  if (Variables.teleportCostMode == "scoreboard") {
    const objectiveName =
      world.scoreboard.getObjective(Variables.teleportScoreboardObjective)
        ?.displayName ?? Variables.teleportScoreboardObjective;
    return Variables.teleportScoreboardSymbol
      ? `${Variables.teleportScoreboardSymbol}${cost}`
      : `${cost} ${objectiveName}`;
  }
  if (Variables.teleportCostMode == "ender_pearl")
    return `${cost} Ender Pearl${cost == 1 ? "" : "s"}`;
  return `${cost} XP level${cost == 1 ? "" : "s"}`;
}
function formatCost(cost) {
  if (cost < 1 || Variables.teleportCostMode == "none") return "";
  if (Variables.teleportCostMode == "scoreboard") {
    const objectiveName =
      world.scoreboard.getObjective(Variables.teleportScoreboardObjective)
        ?.displayName ?? Variables.teleportScoreboardObjective;
    const costLabel = Variables.teleportScoreboardSymbol
      ? `${Variables.teleportScoreboardSymbol}${cost}`
      : `${cost} ${objectiveName}`;
    return ` - §l§6${costLabel}§r`;
  }
  if (Variables.teleportCostMode == "ender_pearl")
    return ` - §l§5${cost} Ender Pearl${cost == 1 ? "" : "s"}§r`;
  return cost > 3 ? " - §l§2" + xpSprite[4] + cost + "§r" : xpSprite[cost];
}
function countInventoryItem(player, typeId) {
  const container = player.getComponent("minecraft:inventory")?.container;
  if (!container) return 0;
  let total = 0;
  for (let slot = 0; slot < container.size; slot++) {
    const item = container.getItem(slot);
    if (item?.typeId == typeId) total += item.amount;
  }
  return total;
}
function removeInventoryItem(player, typeId, amount) {
  const container = player.getComponent("minecraft:inventory")?.container;
  if (!container) return false;
  let remaining = amount;
  for (let slot = 0; slot < container.size && remaining > 0; slot++) {
    const item = container.getItem(slot);
    if (item?.typeId != typeId) continue;
    const removed = Math.min(item.amount, remaining);
    remaining -= removed;
    if (removed == item.amount) container.setItem(slot);
    else {
      item.amount -= removed;
      container.setItem(slot, item);
    }
  }
  return remaining == 0;
}
const xpSprite = ["", " - \ue701", " - \ue702", " - \ue703", "\ue700"];
