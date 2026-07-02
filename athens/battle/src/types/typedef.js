import Phaser from './phaser.js';

/**
 * @typedef BattleGuyConfig
 * @type {Object}
 * @property {Phaser.Scene} scene
 * @property {Guy} guyDetails
 */

/**
 * @typedef AttackConfig
 * @type {Object}
 * @property {string} spriteKey
 * @property {import('./typedef.js').Coordinate} position
 * @property {number} frameRate
 * @property {number} scale
 * @property {string} sound
 * @property {boolean} animation
 */

/**
 * @typedef Guy
 * @type {Object}
 * @property {string} name
 * @property {string} assetKey
 * @property {number} [assetFrame=0]
 * @property {number} maxHp
 */

/**
 * @typedef Coordinate
 * @type {Object}
 * @property {number} x
 * @property {number} y
 */