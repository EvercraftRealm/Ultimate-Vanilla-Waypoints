# Ultimate Vanilla Waypoints

Ultimate Vanilla Waypoints is a modified edition of Advanced Waypoints v8.2 for Minecraft Bedrock 1.26.60 or newer. Its namespace is `uvw`.

Maintained for the Evercraft community by [EvercraftRealm](https://github.com/EvercraftRealm).

## Installation

Download the latest `.mcaddon` from the GitHub release, open it with Minecraft, and enable both Ultimate Vanilla Waypoints packs on the world. For development, copy the corresponding folders from `development_behavior_packs` and `development_resource_packs` into Minecraft's development pack directories.

## Changes

- One item: **Waypoints** (`uvw:waypoint_item`).
- One shapeless crafting recipe: Book & Quill + Compass + Spyglass.
- The vanilla 16x16 Book & Quill inventory texture with its brown binding recolored purple.
- Teleportation is disabled by default.
- `/uvw:waypointconfig` provides four payment modes: Free, XP Levels, Scoreboard, and Ender Pearls.
- Teleport costs can be configured with a cost per charge, blocks per charge, and minimum distance before charging.
- Scoreboard mode uses a configurable objective ID. The objective must already exist and players must have a score in it.
- Players can publish personal waypoints to a world-wide Public Waypoints collection, browse public entries, and unpublish their own entries.
- Public waypoint markers appear automatically to every player in the same dimension without copying or sharing them into personal waypoint data.
- Waypoint icons include Basic, First Letter, Death, Sword, Pickaxe, Axe, Hoe, House, Town, Gear, and Signpost.

## Teleport cost formula

Trips shorter than the configured minimum distance are free. At or beyond that distance, the first charge applies. Another charge applies for each full `blocks per charge` interval after the minimum.

Creative-mode players are never charged. XP levels, scoreboard points, or Ender Pearls are deducted only after a successful teleport.

Scoreboard costs can optionally use a currency symbol or supported emoji code instead of displaying the objective name. For example, `:heart:` displays a cost of 100 as `:heart:100`.

## BedLog integration

When the optional BedLog behavior pack is active, Ultimate Vanilla Waypoints sends `info` entries to the Bedrock Logging Framework for waypoint creation, edits, deletion, visibility changes, sharing, publishing, publication updates, unpublishing, and successful teleports. Entries include the acting player, waypoint, dimension and coordinates, plus teleport costs where applicable.

BedLog is optional. No hard pack dependency is declared, and waypoint functionality is unaffected when it is not installed.

## Source and license

Based on Advanced Waypoints v8.2 by Endermen76428 and Heartiorn. Distributed under the MIT License; see `LICENSE`.
