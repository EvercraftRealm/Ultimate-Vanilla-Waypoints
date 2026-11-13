import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { Variables } from "../lib/variables";
export function waypointUIOptionsAdmin(player, onBack) {
  const costModes = [
    "ui.uvw:config.cost.none",
    "ui.uvw:config.cost.xp",
    "ui.uvw:config.cost.scoreboard",
    "ui.uvw:config.cost.ender_pearl",
  ];
  const modeIndex = Math.max(
    0,
    ["none", "xp", "scoreboard", "ender_pearl"].indexOf(
      Variables.teleportCostMode,
    ),
  );
  new ModalFormData()
    .title("ui.uvw:config.title")
    .toggle("ui.uvw:config.tp", { defaultValue: Variables.teleportEnabled })
    .dropdown("ui.uvw:config.cost.mode", costModes, {
      defaultValueIndex: modeIndex,
    })
    .slider({ translate: "ui.uvw:config.cost.amount" }, 1, 100, {
      valueStep: 1,
      defaultValue: Variables.teleportCostAmount,
    })
    .textField(
      "ui.uvw:config.cost.blocks",
      "ui.uvw:config.cost.blocks.placeholder",
      { defaultValue: Variables.teleportBlocksPerCharge.toString() },
    )
    .slider({ translate: "ui.uvw:config.cost.minimum" }, 0, 10000, {
      valueStep: 10,
      defaultValue: Variables.teleportMinimumDistance,
    })
    .textField(
      "ui.uvw:config.cost.minimum_cost",
      "ui.uvw:config.cost.optional",
      { defaultValue: Variables.teleportMinimumCost?.toString() ?? "" },
    )
    .textField(
      "ui.uvw:config.cost.maximum_cost",
      "ui.uvw:config.cost.optional",
      { defaultValue: Variables.teleportMaximumCost?.toString() ?? "" },
    )
    .textField(
      "ui.uvw:config.cost.objective",
      "ui.uvw:config.cost.objective.placeholder",
      { defaultValue: Variables.teleportScoreboardObjective },
    )
    .textField(
      "ui.uvw:config.cost.scoreboard_symbol",
      "ui.uvw:config.cost.scoreboard_symbol.placeholder",
      { defaultValue: Variables.teleportScoreboardSymbol },
    )
    .show(player)
    .then(({ canceled, formValues }) => {
      if (canceled || formValues == undefined) return onBack?.(player);
      const tp = typeof formValues[0] == "boolean" ? formValues[0] : false;
      const mode =
        ["none", "xp", "scoreboard", "ender_pearl"][formValues[1]] ?? "xp";
      const amount = typeof formValues[2] == "number" ? formValues[2] : 1;
      const blocks = parseBoundedInteger(
        formValues[3],
        10,
        10000,
        Variables.teleportBlocksPerCharge,
      );
      const minimum = typeof formValues[4] == "number" ? formValues[4] : blocks;
      const minimumCost = parseOptionalCost(formValues[5]);
      const maximumCost = parseOptionalCost(formValues[6]);
      const objective =
        typeof formValues[7] == "string" && formValues[7].trim().length > 0
          ? formValues[7].trim()
          : "waypoint_currency";
      const scoreboardSymbol =
        typeof formValues[8] == "string" ? formValues[8].trim() : "";
      world.setDynamicProperty("c:tp", tp);
      Variables.teleportEnabled = tp;
      world.setDynamicProperty("c:tpmode", mode);
      Variables.teleportCostMode = mode;
      world.setDynamicProperty("c:tpamount", amount);
      Variables.teleportCostAmount = amount;
      world.setDynamicProperty("c:tpblocks", blocks);
      Variables.teleportBlocksPerCharge = blocks;
      world.setDynamicProperty("c:tpmin", minimum);
      Variables.teleportMinimumDistance = minimum;
      world.setDynamicProperty("c:tpscore", objective);
      Variables.teleportScoreboardObjective = objective;
      world.setDynamicProperty("c:tpsymbol", scoreboardSymbol || undefined);
      Variables.teleportScoreboardSymbol = scoreboardSymbol;
      world.setDynamicProperty("c:tpmincost", minimumCost);
      Variables.teleportMinimumCost = minimumCost;
      world.setDynamicProperty("c:tpmaxcost", maximumCost);
      Variables.teleportMaximumCost = maximumCost;
    });
}
function parseBoundedInteger(value, minimum, maximum, fallback) {
  if (typeof value != "string" || value.trim() == "") return fallback;
  const number = Number(value.trim());
  if (!Number.isFinite(number)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.floor(number)));
}
function parseOptionalCost(value) {
  if (typeof value != "string" || value.trim() == "") return undefined;
  const cost = Number(value.trim());
  return Number.isFinite(cost) && cost >= 0 ? Math.floor(cost) : undefined;
}
