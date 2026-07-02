/**
 * @typedef {keyof typeof BATTLE_MENU_OPTIONS} BattleMenuOptions
 */
/** @enum {BattleMenuOptions} */
export const BATTLE_MENU_OPTIONS = Object.freeze({
  HIT: 'HIT',
  FIGHT: 'SPECIAL ITEM',
  SNACK: 'SNACK',
  PRANK: 'PRANK',
});

/**
 * @typedef {keyof typeof ACTIVE_BATTLE_MENU} ActiveBattleMenu
 */
/** @enum {ActiveBattleMenu} */
export const ACTIVE_BATTLE_MENU = Object.freeze({
  BATTLE_MAIN: 'BATTLE_MAIN',
  BATTLE_MOVE_SELECT: 'BATTLE_MOVE_SELECT',
  BATTLE_SNACK: 'BATTLE_SNACK',
  BATTLE_HIT: 'BATTLE_HIT',
  BATTLE_PRANK: 'BATTLE_PRANK',
});