import {
  world,
  system,
  CommandPermissionLevel,
  CustomCommandStatus,
  Player,
} from "@minecraft/server";
import { backwardCompatibilityWorld } from "../lib/backwardCompatibility";
import { apiWaypointsCache } from "../lib/waypoints/info/cache";
import { waypointUIOptionsAdmin } from "../ui/configAdminUI";
import { waypointMenu } from "../ui/mainUI";
import { isReadableRealPlayer } from "../lib/player/readable";
import { addonInfo } from "../lib/addonInfo";

function runPlayerCommand(player, callback) {
  if (!(player instanceof Player) || !isReadableRealPlayer(player)) return;
  system.run(() => callback(player));
}

system.beforeEvents.startup.subscribe(
  ({ itemComponentRegistry: customI, customCommandRegistry: customC }) => {
    console.info(
      `[${addonInfo.name}] v${addonInfo.version} initialized | namespace: ${addonInfo.namespace} | Minecraft: ${addonInfo.minimumMinecraftVersion}+ | Server API: ${addonInfo.serverApiVersion}`,
    );
    customI.registerCustomComponent("uvw:use", {
      onUse: ({ source: player }) => {
        if (!isReadableRealPlayer(player)) return;
        return waypointMenu(player, player.isSneaking);
      },
    });
    customC.registerCommand(
      {
        name: "uvw:waypoint",
        description: "commands.uvw.main_panel",
        cheatsRequired: false,
        permissionLevel: CommandPermissionLevel.Any,
      },
      ({ sourceEntity: player }) => {
        runPlayerCommand(player, waypointMenu);
        return { status: CustomCommandStatus.Success };
      },
    );

    customC.registerCommand(
      {
        name: "uvw:waypointconfig",
        description: "commands.uvw.teleport",
        cheatsRequired: false,
        // Admin is not reported consistently for players on Realms. GameDirectors
        // is Bedrock's operator permission tier and still excludes normal players.
        permissionLevel: CommandPermissionLevel.GameDirectors,
      },
      ({ sourceEntity: player }) => {
        runPlayerCommand(player, waypointUIOptionsAdmin);
        return { status: CustomCommandStatus.Success };
      },
    );
  },
);
system.run(() => {
  if (world.getDynamicProperty("uvw:8.0"))
    world
      .getAllPlayers()
      .filter(isReadableRealPlayer)
      .forEach((player) => {
        apiWaypointsCache.load(player);
      });
  if (!world.getDynamicProperty("uvw:8.1"))
    backwardCompatibilityWorld.convert_v8_1();
});
