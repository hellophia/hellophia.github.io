import Phaser from '../lib/phaser.js';
import { AttackAnimations } from './attack-animations.js';
import { BattleGuy } from './battle-guy.js';

export class Attack {
  /** @protected @type {Phaser.Scene} */
  _scene;
  /** @protected @type {import("../types/typedef.js").Coordinate} */
  _position;
  /** @protected @type {boolean} */
  _isAnimationPlaying;
  /** @protected @type {Phaser.GameObjects.Sprite} */
  _attackGameSprite;
  /** @protected @type {string} */
  _spriteKey;
  /** @protected @type {number} */
  _frameRate;
  /** @protected @type {Number} */
  _scale;
  /** @protected @type {string} */
  _sound;
  /** @protected @type {boolean} */
  _animation;
  /** @type {BattleGuy} */
  _player;
  /** @type {BattleGuy} */
  _enemy;

  /**
   * @param {Phaser.Scene} scene
   * @param {import('../types/typedef.js').AttackConfig} config
   * @param {BattleGuy} player
   * @param {BattleGuy} enemy
   */
  constructor(scene, config, player, enemy) {
    this._scene = scene;
    this._isAnimationPlaying = false;
    this._spriteKey = config.spriteKey;
    this._position = config.position;
    this._frameRate = config.frameRate ?? 8;
    this._scale = config.scale ?? 1;
    this._sound = config.sound ?? null;
    this._animation = config.animation ?? null
    this._player = player;
    this._enemy = enemy;

    this._scene.anims.create({
      key: this._spriteKey,
      frames: this._scene.anims.generateFrameNumbers(this._spriteKey),
      frameRate: this._frameRate,
      repeat: 0,
      delay: 0,
    });

    this._attackGameSprite = this._scene.add
      .sprite(this._position.x, this._position.y, this._spriteKey, 0)
      .setOrigin(.5)
      .setScale(this._scale)
      .setAlpha(0);

    console.log(this._spriteKey +" "+ this._attackGameSprite.width);
  }

  /**
   * @param {() => void} [callback]
   * @returns {void}
   */
  playAnimation(callback) {
    if (this._isAnimationPlaying) {
      console.log("playAnimation: animation is already playing. returning... ")
      return;
    }

    this._isAnimationPlaying = true;
    this._attackGameSprite.setAlpha(1);

    const cleanup = () => {
      this._isAnimationPlaying = false;
      this._attackGameSprite.setAlpha(0).setFrame(0);
    };

    if (this._animation) {
      console.log("playing custom animation...")
      AttackAnimations.play(this._spriteKey, this, callback, cleanup);
    } else {
      console.log("playing default animation...")
      this._playDefaultAnimation(callback);
    }
  }

  _playDefaultAnimation(callback) {

    if (this._sound) {
      this._scene.sound.play(this._sound);
    }

    this._attackGameSprite.play(this._spriteKey);

    this._attackGameSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + this._spriteKey, () => {

      this._isAnimationPlaying = false;
      this._attackGameSprite.setAlpha(0).setFrame(0);
      if (callback) {
        callback();
      }

    });
  }

}