export const stringFormat = new (class StringFormat {
  playerName(name) {
    if (typeof name != "string") return "Unknown";
    const sanitized = name
      .replace(/§./g, "")
      .replace(/[^A-Za-z0-9 ]/g, "")
      .replace(/ +/g, " ")
      .trim();
    return sanitized || "Unknown";
  }
  sameNames(name, waypoints, excludeAt) {
    if (excludeAt) waypoints.splice(excludeAt, 1);
    let newName = name;
    let counter = 1;
    while (waypoints.includes(newName)) {
      newName = `${name} (${counter})`;
      counter++;
    }
    return newName;
  }
})();
