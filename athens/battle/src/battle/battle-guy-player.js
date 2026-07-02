import { BATTLE_ASSET_KEYS, DATA_ASSET_KEYS, FIGHTER_ASSET_KEYS } from '../_misc/asset-keys.js';
import { BattleGuy } from './battle-guy.js';
import { HealthBar } from './health-bar.js';

/** @type {import('../types/typedef.js').Coordinate} */
const PLAYER_POSITION = Object.freeze({
  x: 236,
  y: 300,
});

export class PlayerBattleGuy extends BattleGuy {
  /**
   *
   * @param {import("../types/typedef.js").BattleGuyConfig} config
   */
  constructor(config) {
    super(config, PLAYER_POSITION);
    this._loadAttacksFromCache(DATA_ASSET_KEYS.PLAYER_ATTACKS);

    this._scene.anims.create({
      key: 'player-idle',
      frames: this._scene.anims.generateFrameNumbers(
        FIGHTER_ASSET_KEYS.PLAYER,
        {
          start: 8,
          end: 8,
        }
      ),
      frameRate: 6,
      repeat: -1,
    });

    this._scene.anims.create({
      key: 'player-spin',
      frames: this._scene.anims.generateFrameNumbers(
        FIGHTER_ASSET_KEYS.PLAYER,
        {
          start: 0,
          end: 8,
        }
      ),
      frameRate: 6,
      repeat: 0,
    });

    this._scene.anims.create({
      key: 'player-hurt',
      frames: this._scene.anims.generateFrameNumbers(
        FIGHTER_ASSET_KEYS.PLAYER,
        {
          start: 9,
          end: 9,
        }
      ),
      frameRate: 6,
      repeat: 0,
    });

    this._scene.anims.create({
      key: 'player-attack',
      frames: this._scene.anims.generateFrameNumbers(
        FIGHTER_ASSET_KEYS.PLAYER,
        {
          start: 10,
          end: 11,
        }
      ),
      frameRate: 3,
      repeat: 0,
    });

    this._scene.anims.create({
      key: 'player-snack',
      frames: this._scene.anims.generateFrameNumbers(
        FIGHTER_ASSET_KEYS.PLAYER,
        {
          start: 12,
          end: 14,
        }
      ),
      frameRate: 3,
      repeat: 0,
    });

    this._scene.anims.create({
      key: 'player-prank',
      frames: this._scene.anims.generateFrameNumbers(
        FIGHTER_ASSET_KEYS.PLAYER,
        {
          start: 15,
          end: 16,
        }
      ),
      frameRate: 3,
      repeat: 0,
    });

    this._scene.anims.create({
      key: 'player-hit',
      frames: this._scene.anims.generateFrameNumbers(
        FIGHTER_ASSET_KEYS.PLAYER,
        {
          start: 17,
          end: 18,
        }
      ),
      frameRate: 3,
      repeat: 0,
    });

  }

  /**
   * @param {() => void} callback
   * @returns {void}
   */
  playGuyAppearAnimation(callback) {
    const startXPos = this._scene.scale.width / 2;
    this._guyGameSprite.setPosition(startXPos, PLAYER_POSITION.y + 50).setScale(.75);
    this._guyGameSprite.setAlpha(1);

    this._scene.time.delayedCall(1500, ()=> {
      this._guyGameSprite.play("player-spin");
      this._scene.tweens.add({
        duration: 1500,
        x: {
          from: startXPos,
          start: startXPos,
          to: PLAYER_POSITION.x,
        },
        scale: {
          from: .75,
          start: .75,
          to: .35,
        },
        y: {
          from: PLAYER_POSITION.y + 50,
          start: PLAYER_POSITION.y + 50,
          to: PLAYER_POSITION.y,
        },
        targets: this._guyGameSprite,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this._guyGameSprite.play("player-idle");
          callback();
        },
      });
    })

  }

  /**
     * @param {() => void} callback
     * @returns {void}
     */
  playGuyHealthBarAppearAnimation(callback) {
    this._phaserHealthBarGameContainer.setAlpha(1);
    callback();
  }

  playTakeDamageAnimation() {
    this._guyGameSprite.play("player-hurt");
    this._scene.time.delayedCall(1000, () => {
      this._guyGameSprite.play("player-idle");
    });
  }

  playAttackAnimation() {
    this._guyGameSprite.play("player-attack");
    this._scene.time.delayedCall(1000, () => {
      this._guyGameSprite.play("player-idle");
    });
  }

  playSnackAnimation() {
    this._guyGameSprite.play("player-snack");
    this._scene.time.delayedCall(1000, () => {
      this._guyGameSprite.play("player-idle");
    });
  };

  playPrankAnimation() {
    this._guyGameSprite.play("player-prank");
    this._scene.time.delayedCall(1000, () => {
      this._guyGameSprite.play("player-idle");
    });
  };

  playHitAnimation() {
    console.log("hit animation");
    this._guyGameSprite.play("player-hit");
    this._scene.time.delayedCall(1000, () => {
      this._guyGameSprite.play("player-idle");
    });
  };

  /**
 * @param {number} index
 */
  removeAttackAt(index) {
    if (!Array.isArray(this._guyAttacks) || typeof index !== 'number') return;
    if (index < 0 || index >= this._guyAttacks.length) return;
    this._guyAttacks.splice(index, 1);
  }

  createHealthBarComponents() {
    this._healthBar = new HealthBar(this._scene, 21, 66);

    this._guyNameGameText = this._scene.add.text(313, 0, this.name.toUpperCase(), {
      color: '#bb6900',
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

    this._phaserHealthBarGameContainer.setPosition(542, 276);
  }

}