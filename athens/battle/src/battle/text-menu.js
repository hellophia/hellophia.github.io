import Phaser from '../lib/phaser.js';
import { BATTLE_UI_TEXT_STYLE } from './battle-menu-config.js';
import { animateText } from '../_misc/text.js';
import { UI_ASSET_KEYS } from '../_misc/asset-keys.js';

const PORTRAIT_FRAMES = Object.freeze({
    danny_worried: 0,
    danny_neutral: 1,
    danny_yelling: 2,
    danny_surprised: 3,
    mystery_none: 4,
    af_neutral: 4,
});

export class TextMenu {
    /** @type {Phaser.Scene} */
    #scene;
    /** @type {Phaser.GameObjects.Image} */
    #portrait;
    /** @type {Phaser.GameObjects.Image} */
    #portraitFrame;
    /** @type {Phaser.GameObjects.Container} */
    #textContainer;
    /** @type {string | null} */
    _currentSpeaker;
    /** @type {Phaser.GameObjects.Image} */
    #textDialogue;
    /** @type {Array} */
    #battleTextLines = [];
    /** @type {number} */
    #maxLines;
    /** @type {number} */
    #lineSpacing;
    /** @type {number} */
    #maxCharsPerLine;
    /** @type {Phaser.GameObjects.Image} */
    #textWindowTop;
    /** @type {Phaser.GameObjects.Image} */
    #textWindowMiddle;
    /** @type {Phaser.GameObjects.Image} */
    #textWindowBottom;
    /** @type {boolean} */
    #waitingForPlayerInput;
    /** @type {Phaser.GameObjects.Image} */
    #userInputCursor
    #waitingCallback

    /**
   *
   * @param {Phaser.Scene} scene the Phaser 3 Scene the battle menu will be added to
   */
    constructor(scene) {
        this.#scene = scene;
        this.#maxLines = 8;
        this.#lineSpacing = 44;
        this.#maxCharsPerLine = 55;
        this.#createTextWindow();
    }

    updateMessageNoInputRequired(speaker, mood, message, wait, delay, callback) {
        this.#displayMessage(speaker, mood, message, delay, () => {
            this.#scene.time.delayedCall(wait, () => {
                callback?.();
            });
        }
        );
    }

    updateMessageWaitForInput(speaker, mood, message, delay, callback) {
        this.#displayMessage(speaker, mood, message, delay, () => {
            this.#waitingForPlayerInput = true;
            this.#waitingCallback = callback;
            this.#userInputCursor.setAlpha(1);
        }
        );
    }

    #displayMessage(speaker, mood, message, delay, callback) {

        const startTyping = () => {
            this.#clearTextLines();
            const lines = this.#splitMessageIntoLines(message);
            const indices = this.#getTargetLineIndices(lines.length);
            this.#animateLines(lines, indices, delay, callback);
        };

        if (speaker === this._currentSpeaker) {
            this.#portrait.setFrame(
                PORTRAIT_FRAMES[`${speaker}_${mood}`]
            );
            startTyping();
            return;
        }

        this._currentSpeaker = speaker;
        this.#textContainer.setAlpha(0);

        this.#scene.time.delayedCall(500, () => {
            this.#portrait.setFrame(
                PORTRAIT_FRAMES[`${speaker}_${mood}`]
            );
            this.#textContainer.setAlpha(1);
            startTyping();
        });
    }

    #clearTextLines() {
        this.#battleTextLines.forEach(line => {
            line.setText("").setAlpha(1);
        });
    }

    handlePlayerInput() {

        if (!this.#waitingForPlayerInput) {
            return;
        }

        this.#waitingForPlayerInput = false;
        this.#userInputCursor.setAlpha(0);
        this.#waitingCallback();
    }

    /**
 * @param {string} message1
 * @param {string} message2
 * @param {number} wait
 * @param {number} delay
 * @param {() => void} [callback]
 * @returns {void}
 */
    finalMessage(message1, message2, wait, delay, callback) {
        this.#battleTextLines[0].setText('').setAlpha(1);
        this.#battleTextLines[1].setText('').setAlpha(1);

        animateText(this.#scene, this.#battleTextLines[1], message1, {
            delay: delay,
            callback: () => {
                this.#scene.time.delayedCall(wait, () => {
                    animateText(this.#scene, this.#battleTextLines[1], message2, {
                        delay: delay * 2,
                        callback: () => {
                            if (callback) {
                                callback();
                            }
                        },
                    });
                });
            },
        });
    }

    #createTextWindow() {

        for (let i = 0; i < this.#maxLines; i++) {

            const text = this.#scene.add.text(
                186,
                95 - (i * this.#lineSpacing),
                "",
                BATTLE_UI_TEXT_STYLE
            );

            this.#battleTextLines.push(text);
        }

        this.#textWindowTop = this.#scene.add
            .image(0, 0, UI_ASSET_KEYS.TEXT_WINDOW_TOP)
            .setOrigin(0);

        this.#textWindowMiddle = this.#scene.add
            .image(0, 0, UI_ASSET_KEYS.TEXT_WINDOW_MIDDLE)
            .setOrigin(1).setPosition(984, 132);

        this.#textWindowBottom = this.#scene.add
            .image(0, 132, UI_ASSET_KEYS.TEXT_WINDOW_BOTTOM)
            .setOrigin(0);

        //this.#textWindow = this.#scene.add.image(0, 0, UI_ASSET_KEYS.NINESLICE).setOrigin(1).setPosition(986, 178);

        this.#portrait = this.#scene.add.sprite(0, 0, UI_ASSET_KEYS.BATTLE_PORTRAITS)
            .setOrigin(0).setPosition(23, 23);
        this.#portrait.setFrame(0);

        this.#portraitFrame = this.#scene.add.image(0, 0, UI_ASSET_KEYS.TEXT_DIALOGUE, 0).setOrigin(0).setScale(.25).setPosition(0, 0)

        this.#userInputCursor = this.#scene.add.image(0, 0, UI_ASSET_KEYS.CURSOR).setOrigin(0).setAngle(90).setScale(.25).setAlpha(0).setPosition(940,111);

        this.#textContainer = this.#scene.add.container(19, 376, [
            this.#textWindowTop,
            this.#textWindowMiddle,
            this.#textWindowBottom,
            this.#portrait,
            this.#portraitFrame,
            this.#userInputCursor,
        ]);

        this.#textContainer.add(this.#battleTextLines);

    }

    #splitMessageIntoLines(message) {
        const words = message.split(" ");
        const lines = [];

        let currentLine = "";

        words.forEach(word => {

            const testLine =
                currentLine === ""
                    ? word
                    : `${currentLine} ${word}`;

            if (testLine.length <= this.#maxCharsPerLine) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }

        });

        if (currentLine !== "") {
            lines.push(currentLine);
        }

        if (lines.length > this.#maxLines) {
            console.error(
                `message requires ${lines.length} lines, but max is ${this.#maxLines}`
            );
        }

        const middleHeight = this.#lineSpacing * Math.max(lines.length, 2);

        this.#textWindowMiddle.setDisplaySize(984, middleHeight);
        this.#textWindowTop.setY(this.#textWindowMiddle.y - middleHeight - 44);
        this.#portraitFrame.setY(this.#textWindowTop.y);
        this.#portrait.setY(this.#portraitFrame.y + 23);

        return lines.slice(0, this.#maxLines);
    }

    #getTargetLineIndices(numLines) {

        const start =
            numLines === 1
                ? 1
                : numLines - 1;

        const indices = [];

        for (let i = start; i >= 0; i--) {
            indices.push(i);
        }

        return indices;
    }

    #animateLines(lines, indices, delay, callback) {

        const animateNext = (i) => {
            if (i >= lines.length) {
                if (callback) {
                    callback();
                }
                return;
            }

            animateText(
                this.#scene,
                this.#battleTextLines[indices[i]],
                lines[i],
                {
                    delay,
                    callback: () => {
                        animateNext(i + 1);
                    },
                }
            );
        };

        animateNext(0);
    }

}