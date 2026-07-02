
import Phaser from '../lib/phaser.js';

export class HealthBar {
    /** @type {Phaser.Scene} */
    #scene;
    /** @type {Phaser.GameObjects.Container} */
    #healthBarContainer;
    /** @type {number} */
    #fullWidth;
    /** @type {number} */
    #scaleY;
    /** @type {Phaser.GameObjects.Rectangle} */
    _healthBarRectangle
    /** @type {Phaser.GameObjects.Rectangle} */
    #healthBarShadow

    /**
     * @param {Phaser.Scene} scene the Phaser 3 Scene the battle menu will be added to
     * @param {number} x
     * @param {number} y
     */
    constructor(scene, x, y) {
        this.#scene = scene;
        this.#fullWidth = 365;
        this.#scaleY = 0.7;

        this.#healthBarContainer = this.#scene.add.container(x, y, []);
        this.#createHealthBar();
        this.setMeterPercentage(1);
    }

    get container() {
        return this.#healthBarContainer;
    }

    /**
   * @returns {void}
   */
    #createHealthBar() {
        this.#healthBarShadow = this.#scene.add
            .rectangle(
                0,
                0,
                this.#fullWidth,
                18,
                0x444444
            )
            .setOrigin(0, 0.5);

        this.#healthBarContainer.add(this.#healthBarShadow);

        this._healthBarRectangle = this.#scene.add
            .rectangle(
                0,
                0,
                this.#fullWidth,
                18,
                0x00ff00
            )
            .setOrigin(0, 0.5);

        this.#healthBarContainer.add(this._healthBarRectangle);
    }

    setMeterPercentage(percent = 1) {
        const width = this.#fullWidth * percent;
        this._healthBarRectangle.width = width;
    }

    /**
  *
  * @param {number} [percent=1] a number between 0 and 1 that is used for setting how filled the health bar is
  * @param {Object} [options]
  * @param {number} [options.duration=1000]
  * @param {() => void} [options.callback]
  */
    setMeterPercentageAnimated(percent, options) {
        const width = this.#fullWidth * percent;

        this.#scene.tweens.add({
            targets: this._healthBarRectangle,
            width: width,
            duration: options?.duration || 1000,
            ease: Phaser.Math.Easing.Sine.Out,
            onUpdate: () => {
                const isVisible = this._healthBarRectangle.width > 0;
                this._healthBarRectangle.visible = isVisible;
            },
            onComplete: options?.callback,
        });
    }

     appearAnimated(percent, options) {
        const width = this.#fullWidth * percent;

        this.#scene.tweens.add({
            targets: this._healthBarRectangle,
            width: width,
            duration: options?.duration || 1000,
            onUpdate: () => {
                const isVisible = this._healthBarRectangle.width > 0;
                this._healthBarRectangle.visible = isVisible;
            },
            onComplete: options?.callback,
        });
    }
}