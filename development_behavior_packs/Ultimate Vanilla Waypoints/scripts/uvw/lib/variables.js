import { world, system } from "@minecraft/server";
export const globalWaypointsCache = new Map();
const render = 25;
const turnOff = 10;
export const Variables = {
  updateRate: 20,
  maxName: 13,
  maxDistance: 9999999,
  minRenderDistance: render * render,
  turnOffDistance: turnOff * turnOff,
  teleportEnabled: false,
  teleportCostMode: "xp",
  teleportCostAmount: 1,
  teleportBlocksPerCharge: 500,
  teleportMinimumDistance: 500,
  teleportScoreboardObjective: "waypoint_currency",
  teleportScoreboardSymbol: "",
  teleportMinimumCost: undefined,
  teleportMaximumCost: undefined,
};
system.run(() => {
  Variables.teleportEnabled = ((r) =>
    typeof r == "boolean" ? r : Variables.teleportEnabled)(
    world.getDynamicProperty("c:tp"),
  );
  const legacyCostEnabled = world.getDynamicProperty("c:tpcost");
  const legacyRate = world.getDynamicProperty("c:tpdis");
  Variables.teleportCostMode = ((r) =>
    ["none", "xp", "scoreboard", "ender_pearl"].includes(r)
      ? r
      : typeof legacyCostEnabled == "boolean" && !legacyCostEnabled
        ? "none"
        : Variables.teleportCostMode)(world.getDynamicProperty("c:tpmode"));
  Variables.teleportCostAmount = ((r) =>
    typeof r == "number" && r >= 1 ? r : Variables.teleportCostAmount)(
    world.getDynamicProperty("c:tpamount"),
  );
  Variables.teleportBlocksPerCharge = ((r) =>
    typeof r == "number" && r >= 1
      ? r
      : typeof legacyRate == "number" && legacyRate > 0
        ? 1 / legacyRate
        : Variables.teleportBlocksPerCharge)(
    world.getDynamicProperty("c:tpblocks"),
  );
  Variables.teleportMinimumDistance = ((r) =>
    typeof r == "number" && r >= 0 ? r : Variables.teleportBlocksPerCharge)(
    world.getDynamicProperty("c:tpmin"),
  );
  Variables.teleportScoreboardObjective = ((r) =>
    typeof r == "string" && r.length > 0
      ? r
      : Variables.teleportScoreboardObjective)(
    world.getDynamicProperty("c:tpscore"),
  );
  Variables.teleportScoreboardSymbol = ((r) =>
    typeof r == "string" ? r.trim() : "")(
    world.getDynamicProperty("c:tpsymbol"),
  );
  Variables.teleportMinimumCost = ((r) =>
    typeof r == "number" && r >= 0 ? Math.floor(r) : undefined)(
    world.getDynamicProperty("c:tpmincost"),
  );
  Variables.teleportMaximumCost = ((r) =>
    typeof r == "number" && r >= 0 ? Math.floor(r) : undefined)(
    world.getDynamicProperty("c:tpmaxcost"),
  );
});
export const colorRBG = [
  { red: 200, green: 200, blue: 200 },
  { red: 128, green: 128, blue: 128 },
  { red: 90, green: 90, blue: 90 },
  { red: 0, green: 0, blue: 0 },
  { red: 70, green: 25, blue: 0 },
  { red: 255, green: 0, blue: 0 },
  { red: 255, green: 165, blue: 0 },
  { red: 255, green: 255, blue: 0 },
  { red: 0, green: 255, blue: 0 },
  { red: 0, green: 128, blue: 0 },
  { red: 25, green: 90, blue: 180 },
  { red: 0, green: 255, blue: 255 },
  { red: 0, green: 0, blue: 240 },
  { red: 160, green: 0, blue: 200 },
  { red: 90, green: 0, blue: 140 },
  { red: 240, green: 50, blue: 150 },
];
export const iconPathId = [
  "a_icon",
  "b_icon",
  "c_icon",
  "d_icon",
  "e_icon",
  "f_icon",
  "g_icon",
  "h_icon",
  "i_icon",
  "j_icon",
  "k_icon",
  "l_icon",
  "m_icon",
  "n_icon",
  "o_icon",
  "p_icon",
  "q_icon",
  "r_icon",
  "s_icon",
  "t_icon",
  "u_icon",
  "v_icon",
  "w_icon",
  "x_icon",
  "y_icon",
  "z_icon",
  "waypoint_icon",
  "death_icon",
  "house_icon",
  "sword_icon",
  "pickaxe_icon",
  "axe_icon",
  "hoe_icon",
  "town_icon",
  "gear_icon",
  "signpost_icon",
];
export const iconOptions = [
  { key: "basic", id: 26 },
  { key: "first_letter", id: -1 },
  { key: "death", id: 27 },
  { key: "sword", id: 29 },
  { key: "pickaxe", id: 30 },
  { key: "axe", id: 31 },
  { key: "hoe", id: 32 },
  { key: "house", id: 28 },
  { key: "town", id: 33 },
  { key: "gear", id: 34 },
  { key: "signpost", id: 35 },
];
