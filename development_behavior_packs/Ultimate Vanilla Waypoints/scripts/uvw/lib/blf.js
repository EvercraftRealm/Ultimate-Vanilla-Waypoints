import { system } from "@minecraft/server";

const source = "Ultimate Vanilla Waypoints";

export const blf = new (class BedLogFramework {
  log(message, level = "info") {
    try {
      system.sendScriptEvent(
        "blf:log",
        JSON.stringify({
          source,
          level,
          message: this.text(message).slice(0, 1000),
        }),
      );
    } catch {}
  }
  info(message) {
    this.log(message, "info");
  }
  player(player) {
    return this.text(player?.name ?? player?.nameTag ?? "Unknown player");
  }
  text(value) {
    return String(value ?? "")
      .replace(/§./g, "")
      .replace(/[\r\n\t]+/g, " ")
      .replace(/ +/g, " ")
      .trim();
  }
  location(pos, dimension) {
    const dimensionName = this.text(dimension ?? "unknown").replace(
      "minecraft:",
      "",
    );
    return `${Math.floor(pos?.x ?? 0)}, ${Math.floor(pos?.y ?? 0)}, ${Math.floor(pos?.z ?? 0)} in ${dimensionName}`;
  }
  waypoint(info) {
    return `"${this.text(info?.name)}" at ${this.location(info?.pos, info?.dimension)}`;
  }
})();
