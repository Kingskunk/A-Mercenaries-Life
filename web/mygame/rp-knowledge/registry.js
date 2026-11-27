/*
 * RP KNOWLEDGE POOLS (2026-11-26; plan: Resources & Quest/RP_KNOWLEDGE_PLAN.md). What AI roleplay characters know of the world,
 * written for the AI only. The player never reads these; the lorebook (lorebook-*.js) is the player's and the AI does not read it.
 *
 * Each pool file calls RPKnowledge.pool(id, { title, entries, rumors }). This file loads first (index.html), the pools after it.
 *
 * Entry: { id, title, aliases: [..], common, learned, secret, when, see }
 *   common   what an ordinary person knows or believes. No common text: common folk do not know it at all.
 *   learned  what a lord, scholar, officer or rich merchant knows, written WHOLE: a learned character gets it in place of
 *            the common text, not added to it. A learned character gets common where there is no learned.
 *   secret   what only insiders know (standing "insider", or a character's own pool).
 *   when     function (stats) -> bool: the entry exists only while it returns true (knowledge that follows the story).
 *   commonIn [pool ids]: the common text is known only to characters who reach one of these pools (a small place's own
 *            region and local pool); a common character outside them does not know the entry. A character who reaches one
 *            of them gets the entry at their standing there, if higher (a learned Vale woman knows the Vale's villages as
 *            learned, though the entries live in the realm pool). Every town and village is a realm-pool entry with it.
 *   see      the lorebook entry on the same subject, for the writer only. Never sent.
 *   Any text may be a function (stats) -> string, so it can change with the story; "" means not known.
 * Rumors: { <entry id>: { common, learned } }: what this pool's folk say about an entry, sent beside it as "folk say".
 * Ids are unique across every pool (tools/rp_knowledge_check.js checks).
 *
 * Writing: short plain facts, neutral, never one character's point of view; two to four sentences a text; no em dashes.
 */
(function (root) {
  "use strict";
  var K = root.RPKnowledge || (root.RPKnowledge = { pools: {}, order: [] });
  K.pools = K.pools || {};
  K.order = K.order || [];
  K.pool = function (id, def) {
    def = def || {};
    def.id = id;
    def.entries = def.entries || [];
    def.rumors = def.rumors || {};
    if (!K.pools[id]) K.order.push(id);
    K.pools[id] = def;
    return def;
  };
})(typeof window !== "undefined" ? window : this);
