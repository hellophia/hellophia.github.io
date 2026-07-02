import { DATA_ASSET_KEYS } from '../_misc/asset-keys.js';
import { Attack } from './attacks.js';
import { BattleGuy } from './battle-guy.js';

export class AttackManager {
    /** @type {Phaser.Scene} */
    #scene;
    /** @type {Object} */
    #attacks;
    /** @type {number} */
    #timesSnackUsed;
    /** @type {number} */
    #timesPrankUsed;
    /** @type {number} */
    #timesHitUsed;
    /** @type {boolean} */
    #isEnemyStunned;
        /** @type {BattleGuy} */
    #player;
    /** @type {BattleGuy} */
    #enemy;


    /**
     *
     * @param {Phaser.Scene} scene
     */
    constructor(scene,player,enemy) {
        this.#scene = scene;
        this.#attacks = {};
        this.#timesSnackUsed = 0;
        this.#timesPrankUsed = 0;
        this.#timesHitUsed = 0;
        this.#isEnemyStunned = false;
        this.#player = player;
        this.#enemy = enemy;

        const playerConfigs = this.#scene.cache.json.get(DATA_ASSET_KEYS.PLAYER_ATTACKS) || [];
        const enemyConfigs = this.#scene.cache.json.get(DATA_ASSET_KEYS.ENEMY_ATTACKS) || [];
        const configs = [...playerConfigs, ...enemyConfigs];

        for (const config of configs) {
            this.#attacks[config.spriteKey] = new Attack(this.#scene, config, player, enemy);
        }
    }

    /**
     *
     * @param {string} attack
     * @param {() => void} callback
     * @returns {void}
     */
    playAttackAnimation(attack, callback) {
        console.log("attacking with " + attack);
        this.#attacks[attack].playAnimation(callback);
    }

    /** @type {number} */
    get timesHitUsed() {
        return this.#timesHitUsed;
    }

    /** @type {number} */
    get timesSnackUsed() {
        return this.#timesSnackUsed;
    }

    /** @type {number} */
    get timesPrankUsed() {
        return this.#timesPrankUsed;
    }

    /** @type {boolean} */
    get isEnemyStunned() {
        return this.#isEnemyStunned;
    }

    /**
  * @param {string} value
  */
    increment(value) {
        switch (value) {
            case 'SNACK':
                this.#timesSnackUsed += 1;
                break;
            case 'PRANK':
                this.#timesPrankUsed += 1;
                break;
            case 'HIT':
                this.#timesHitUsed += 1;
                break;
        }
    }

    /**
* @param {string} value
*/
    reset(value) {
        switch (value) {
            case 'SNACK':
                this.#timesSnackUsed = 0;
                break;
            case 'PRANK':
                this.#timesPrankUsed = 0;
                break;
            case 'HIT':
                this.#timesHitUsed = 0;
                break;
        }
    }

    /**
    *
    * @param {number} remainingAttacks
    * @param {number} enemyCurrentHp
    * @param {number} enemyMaxHp
    * @returns {number}
    */
    calculatePlayerAttackDamage(remainingAttacks, enemyCurrentHp, enemyMaxHp) {
        const minFinalDamage = enemyMaxHp * 0.1;

        if (remainingAttacks <= 1) {
            return Math.max(enemyCurrentHp, minFinalDamage);
        }

        return Math.min(enemyCurrentHp - minFinalDamage) / (remainingAttacks - 1);
    }

    /**
     * @param {number} playerCurrentHp
     * @param {number} playerMaxHp
     * @returns {number} damage to apply (0 means skip attack)
     */
    calculateEnemyAttackDamage(playerCurrentHp, playerMaxHp) {
        const tenPercent = playerMaxHp * 0.10;
        const fiftyPercent = playerMaxHp * 0.50;

        if (playerCurrentHp <= tenPercent) {
            return 0;
        }
        if (playerCurrentHp > fiftyPercent) {
            return Math.ceil(playerMaxHp * 0.10);
        }
        return Math.ceil(playerMaxHp * 0.05);
    }
}