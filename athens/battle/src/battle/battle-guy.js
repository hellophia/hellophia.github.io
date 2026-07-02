import { BATTLE_ASSET_KEYS, DATA_ASSET_KEYS } from '../_misc/asset-keys.js';
import { HealthBar } from '../battle/health-bar.js';

export class BattleGuy {
  /** @protected @type {Phaser.Scene} */
  _scene;
  /** @protected @type {import('../types/typedef.js').Guy} */
  _guyDetails;
  /** @protected @type {Phaser.GameObjects.Sprite} */
  _guyGameSprite;
  /** @protected @type {number} */
  _currentHealth;
  /** @protected @type {number} */
  _maxHealth;
  /** @protected @type {import('../types/typedef.js').Attack[]} */
  _guyAttacks;
  /** @protected @type {Phaser.GameObjects.Container} */
  _phaserHealthBarGameContainer;
  /** @protected @type {Phaser.GameObjects.Text} */
  _guyNameGameText;
  /** @protected @type {Phaser.GameObjects.Image} */
  _healthBarBgImage;
  /** @protected @type {HealthBar} */
  _healthBar;

  /**
   * @param {import('../types/typedef.js').BattleGuyConfig} config
   * @param {import('../types/typedef.js').Coordinate} position
   */
  constructor(config, position) {
    this._scene = config.scene;
    this._guyDetails = config.guyDetails;
    this._maxHealth = this._guyDetails.maxHp;
    this._currentHealth = this._maxHealth;
    this._guyAttacks = [];

    this._guyGameSprite = this._scene.add.sprite(
      position.x,
      position.y,
      this._guyDetails.assetKey,
      0,
    ).setAlpha(0)
    this.createHealthBarComponents();
  }

  _loadAttacksFromCache(key) {
    const data = this._scene.cache.json.get(key);
    this._guyAttacks.push(...data);
  }

  /** @type {boolean} */
  get isFainted() {
    return this._currentHealth <= 0;
  }

  /** @type {string} */
  get name() {
    return this._guyDetails.name;
  }

  get attacks() {
    return [...this._guyAttacks];
  }

  /** @type {number} */
  get currentHealth() {
    return this._currentHealth;
  }

  /** @type {number} */
  get maxHealth() {
    return this._maxHealth;
  }

  /**
   * @param {number} damage
   * @param {() => void} [callback]
   */
  takeDamage(damage, callback) {
    this._currentHealth -= damage;
    if (this._currentHealth < 0) {
      this._currentHealth = 0;
    }
    this._healthBar.setMeterPercentageAnimated(this._currentHealth / this._maxHealth, { callback });
  }

  /**
 * @param {() => void} [callback]
 */
  heal(callback) {
    console.log("heal called. current health " + this._currentHealth + "max health " + this._maxHealth);
    console.log("healing...");
    const healAmount = Math.min(
      this.maxHealth * 0.10,
      this.maxHealth - this._currentHealth
    );
    console.log("heal amount " + healAmount);
    this._currentHealth += healAmount;
    this._healthBar.setMeterPercentageAnimated(this._currentHealth / this._maxHealth, { callback });
  }

  /**
* @param {() => void} callback
* @returns {void}
*/
  playGuyAppearAnimation(callback) {
    throw new Error('playMonsterAppearAnimation is not implemented.');
  }

  /**
   * @param {() => void} callback
   * @returns {void}
   */
  playGuyHealthBarAppearAnimation(callback) {
    throw new Error('playMonsterHealthBarAppearAnimation is not implemented.');
  }

  /**
   * @param {() => void} callback
   * @returns {void}
   */
  playTakeDamageAnimation(callback) {
    console.log("playtakedamageanimation problem");
  }

  /**
   * @param {() => void} callback
   * @returns {void}
   */
  playDeathAnimation(callback) {
    console.log("playdeathanimation problem");
  }

  createHealthBarComponents() {
    console.log("createhealthbarcomponents problem");
  }

}