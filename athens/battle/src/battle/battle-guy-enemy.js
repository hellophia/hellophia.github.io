import { BattleGuy } from './battle-guy.js';
import { animateText } from '../_misc/text.js';
import { BATTLE_ASSET_KEYS, DATA_ASSET_KEYS, FIGHTER_ASSET_KEYS } from '../_misc/asset-keys.js';
import { HealthBar } from './health-bar.js';

/** @type {import('../types/typedef.js').Coordinate} */
const ENEMY_POSITION = Object.freeze({
  x: 738,
  y: 160,
});

export class EnemyBattleGuy extends BattleGuy {
  /** @protected @type {boolean} */
  _isStunned;

  /**
   *
   * @param {import("../types/typedef.js").BattleGuyConfig} config
   */
  constructor(config) {
    super(config, ENEMY_POSITION);
    this._loadAttacksFromCache(DATA_ASSET_KEYS.ENEMY_ATTACKS);
    this._isStunned = false;
    this._guyGameSprite.setScale(.22);

    this._scene.anims.create({
      key: 'enemy-idle-1',
      frames: this._scene.anims.generateFrameNumbers(
        FIGHTER_ASSET_KEYS.ENEMY,
        {
          start: 0,
          end: 0,
        }
      ),
      frameRate: 6,
      repeat: -1,
    });

    this._scene.anims.create({
      key: 'enemy-idle-2',
      frames: this._scene.anims.generateFrameNumbers(
        FIGHTER_ASSET_KEYS.ENEMY,
        {
          start: 1,
          end: 1,
        }
      ),
      frameRate: 6,
      repeat: -1,
    });

    this._scene.anims.create({
      key: 'enemy-idle-3',
      frames: this._scene.anims.generateFrameNumbers(
        FIGHTER_ASSET_KEYS.ENEMY,
        {
          start: 2,
          end: 2,
        }
      ),
      frameRate: 6,
      repeat: -1,
    });

    this._scene.anims.create({
      key: 'enemy-idle-4',
      frames: this._scene.anims.generateFrameNumbers(
        FIGHTER_ASSET_KEYS.ENEMY,
        {
          start: 3,
          end: 3,
        }
      ),
      frameRate: 6,
      repeat: -1,
    });

    this._scene.anims.create({
      key: 'enemy-hurt',
      frames: this._scene.anims.generateFrameNumbers(
        FIGHTER_ASSET_KEYS.ENEMY,
        {
          start: 4,
          end: 4,
        }
      ),
      frameRate: 6,
      repeat: 0,
    });

    this._scene.anims.create({
      key: 'enemy-attack',
      frames: this._scene.anims.generateFrameNumbers(
        FIGHTER_ASSET_KEYS.ENEMY,
        {
          start: 5,
          end: 5,
        }
      ),
      frameRate: 6,
      repeat: 0,
    });

    this._scene.anims.create({
      key: 'enemy-pranked',
      frames: this._scene.anims.generateFrameNumbers(
        FIGHTER_ASSET_KEYS.ENEMY,
        {
          start: 6,
          end: 8,
        }
      ),
      frameRate: .5,
      repeat: 0,
    });

    this._scene.anims.create({
      key: 'enemy-sulk',
      frames: this._scene.anims.generateFrameNumbers(
        FIGHTER_ASSET_KEYS.ENEMY,
        {
          start: 9,
          end: 9,
        }
      ),
      frameRate: 3,
      repeat: 0,
    });

    this._scene.anims.create({
      key: 'enemy-sus',
      frames: this._scene.anims.generateFrameNumbers(
        FIGHTER_ASSET_KEYS.ENEMY,
        {
          start: 10,
          end: 10,
        }
      ),
      frameRate: 3,
      repeat: 0,
    });

    this._scene.anims.create({
      key: 'enemy-wet',
      frames: this._scene.anims.generateFrameNumbers(
        FIGHTER_ASSET_KEYS.ENEMY,
        {
          start: 11,
          end: 14,
        }
      ),
      frameRate: 2,
      repeat: 0,
    });
  }

  get isStunned() {
    return this._isStunned;
  }

  stun() {
    this._isStunned = true;
  }

  unStun() {
    this._isStunned = false;
  }

  /**
   * @param {() => void} callback
   * @returns {void}
   */
  playGuyAppearAnimation(callback) {
    this.playIdleAnimation();
    const startXPos = -30;
    const endXPos = ENEMY_POSITION.x;
    this._guyGameSprite.setPosition(startXPos, ENEMY_POSITION.y);
    this._guyGameSprite.setAlpha(1);

    this._scene.time.delayedCall(2200, () => {
      this._scene.tweens.add({
        delay: 0,
        duration: 1800,
        x: {
          from: startXPos,
          start: startXPos,
          to: endXPos,
        },
        ease: 'Sine.easeOut',
        targets: this._guyGameSprite,
        onComplete: () => {
          callback();
        },
      });
    });
  }

  /**
   * @param {() => void} callback
   * @returns {void}
   */
  playGuyHealthBarAppearAnimation(callback) {
    const duration = 4250;
    const nameduration = duration - 2000;

    this._guyNameGameText.text = '';
    this._healthBar.setMeterPercentage(0);

    this._phaserHealthBarGameContainer.setAlpha(1);

    this._healthBar.appearAnimated(1, { duration });

    const nameLength = Math.max(1, this.name.length);
    const perCharDelay = Math.max(1, Math.floor(nameduration / nameLength));

    this._scene.time.delayedCall((duration - nameduration) / 2, () => {
      animateText(this._scene, this._guyNameGameText, this.name.toUpperCase(), { delay: perCharDelay });
    })

    this._scene.time.delayedCall(duration, () => {
      if (callback) callback();
    });
  }

  playIdleAnimation() {
    if (this._currentHealth >= 75) {
      this._guyGameSprite.play("enemy-idle-1");
    } else if (this._currentHealth >= 50) {
      this._guyGameSprite.play("enemy-idle-2");
    } else if (this._currentHealth >= 25) {
      this._guyGameSprite.play("enemy-idle-3");
    } else {
      this._guyGameSprite.play("enemy-idle-4");
    }
  }

  playTakeDamageAnimation() {
    this._guyGameSprite.play("enemy-hurt");
    this._scene.time.delayedCall(1000, () => {
      this.playIdleAnimation();
    });
  }

  playAttackAnimation() {
    this._guyGameSprite.play("enemy-attack");
    this._scene.time.delayedCall(1000, () => {
      this.playIdleAnimation();
    });
  };

  playPrankedAnimation() {
    this._guyGameSprite.play("enemy-pranked");
  };

  playSulkAnimation() {
    this._guyGameSprite.play("enemy-sulk");
    this._scene.time.delayedCall(1000, () => {
      this._guyGameSprite.play('enemy-pranked');
      this._guyGameSprite.anims.setProgress(1);
      //this._guyGameSprite.anims.get('enemy-pranked').getLastFrame();
    });
  };

  playSusAnimation() {
    this._guyGameSprite.play("enemy-sus");
    this._scene.time.delayedCall(1000, () => {
      this.playIdleAnimation();
    });
  };

  playSnackAnimation() {
    //this._guyGameSprite.play("enemy-snack");
    this._scene.time.delayedCall(1000, () => {
      this.playIdleAnimation();
    });
  };

  playWetAnimation() {
    this._guyGameSprite.play("enemy-wet");
    this._scene.time.delayedCall(1000, () => {
      this.playIdleAnimation();
    });
  };

  /**
   * @param {() => void} callback
   * @returns {void}
   */
  playDeathAnimation(callback) {
    const startYPos = this._guyGameSprite.y;
    const endYPos = startYPos - 400;

    this._scene.tweens.add({
      delay: 0,
      duration: 2000,
      y: {
        from: startYPos,
        start: startYPos,
        to: endYPos,
      },
      targets: this._guyGameSprite,
      onComplete: () => {
        callback();
      },
    });
  }

  /**
 * @returns {void}
 */
  rotateAttacksLeft() {
    if (!Array.isArray(this._guyAttacks) || this._guyAttacks.length < 2) return;
    this._guyAttacks.push(this._guyAttacks.shift());
  }

  createHealthBarComponents() {
    this._healthBar = new HealthBar(this._scene, 21, 66);

    this._guyNameGameText = this._scene.add.text(20, 0, this.name.toUpperCase(), {
      color: '#9a0000',
      fontSize: '40px',
      fontFamily: 'VT323'
    });

    this._healthBarBgImage = this._scene.add.image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
      .setOrigin(0).setScale(.25).setPosition(0, 40);

    this._phaserHealthBarGameContainer = this._scene.add.container(0, 0, [
      this._healthBarBgImage,
      this._guyNameGameText,
      this._healthBar.container,
    ]).setAlpha(0);

    this._phaserHealthBarGameContainer.setPosition(76, 29);
  }

}