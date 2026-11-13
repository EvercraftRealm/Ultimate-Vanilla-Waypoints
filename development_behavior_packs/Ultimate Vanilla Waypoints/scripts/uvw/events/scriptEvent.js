import { apiWaypointCreate } from "../lib/waypoints/info/create";
import { waypointsEntity } from "../lib/waypoints/entity/entity";
import { waypointsInfo } from "../lib/waypoints/info/general";
import { world, system } from "@minecraft/server";
import { apiScoreboard } from "../lib/math/scoreboard";
import { isReadableRealPlayer } from "../lib/player/readable";
system.afterEvents.scriptEventReceive.subscribe(
  ({ id, message }) => {
    const args = message
      .match(/"([^"]*)"|[^\s]+/g)
      ?.map((a) => a.replace(/^"|"$/g, ""));
    const player = world
      .getPlayers({ name: args?.[0] ?? "" })
      .find(isReadableRealPlayer);
    if (!player)
      return console.warn(
        `[§cUltimate Vanilla Waypoints§r]: Target is not a Player.`,
      );
    const execute = scriptEventsFunction[id];
    if (typeof execute != "function")
      return console.warn(
        `[§cUltimate Vanilla Waypoints§r]: Unknown command "${id}"`,
      );
    execute(player, args?.slice(1));
  },
  { namespaces: ["uvw"] },
);
const scriptEventsFunction = {
  "uvw:create": (player, args) => {
    if (!args || args.length == 0)
      return console.warn(
        `[§cUltimate Vanilla Waypoints§r]: Syntax error. Expected this Structure: "§e/scriptevent uvw:create <player_name: string> <waypoint_name: string> [location: x y z] [icon: int] [color: int] [turn_off: boolean]§r"`,
      );
    const [name, posX, posY, posZ, iconStr, colorStr, turnOffStr] = args;
    if (!name) return;
    const x = parseInt(posX ?? ""),
      y = parseInt(posY ?? ""),
      z = parseInt(posZ ?? "");
    if (isNaN(x) || isNaN(y) || isNaN(z))
      return apiWaypointCreate.create(player, {
        name: name,
        pos: {
          x: player.location.x,
          y: player.location.y + 1,
          z: player.location.z,
        },
        icon: 1,
        color: Math.floor(Math.random() * 16),
        turnOff: false,
      });
    const iconRaw = parseInt(iconStr ?? "");
    const icon = iconRaw < 0 || iconRaw > 2 ? 1 : iconRaw;
    if (isNaN(icon))
      return apiWaypointCreate.create(player, {
        name: name,
        pos: { x, y, z },
        icon: 1,
        color: Math.floor(Math.random() * 16),
        turnOff: false,
      });
    const colorRaw = parseInt(colorStr ?? "");
    const color = colorRaw < 0 || colorRaw > 15 ? 0 : colorRaw;
    if (isNaN(color))
      return apiWaypointCreate.create(player, {
        name: name,
        pos: { x, y, z },
        icon: icon,
        color: Math.floor(Math.random() * 16),
        turnOff: false,
      });
    apiWaypointCreate.create(player, {
      name: name,
      pos: { x, y, z },
      icon: icon,
      color: color,
      turnOff: turnOffStr == "true",
    });
  },
  "uvw:delete": (player, args) => {
    const name = args?.[0];
    if (!name)
      return console.warn(
        `[§cUltimate Vanilla Waypoints§r]: Syntax error. Expected this Structure: "§e/scriptevent uvw:delete <player_name: string> <waypoint_name: string>§r"`,
      );
    if (
      !apiScoreboard.hasObj(
        "uvw/" +
          player.id +
          "/" +
          player.dimension.id.replace("minecraft:", "") +
          "/" +
          name,
      )
    )
      return;
    waypointsEntity.remove(player, name);
    waypointsInfo.remove(player, name);
  },
};
