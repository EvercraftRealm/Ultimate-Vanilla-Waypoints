export const unpluggedBotTag = "unplugged.bot";

export function isReadableRealPlayer(player) {
  if (!player) return false;
  try {
    return player.isValid && !player.hasTag(unpluggedBotTag);
  } catch {
    return false;
  }
}
