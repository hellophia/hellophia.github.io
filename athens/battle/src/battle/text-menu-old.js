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

export class TextMenuOld {
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
        this.#createPlayerInputCursor();
    }

    /**
     * @param {string} speaker
     * @param {string} mood
     * @param {string} message
     * @param {number} wait
     * @param {number} delay
     * @param {() => void} [callback]
     * @returns {void}
     */
    updateMessageNoInputRequired(speaker, mood, message, wait, delay, callback) {

        const startTyping = () => {

            this.#battleTextLines.forEach(line => {
                line.setText("").setAlpha(1);
            });

            const lines =
                this.#splitMessageIntoLines(message);

            const indices =
                this.#getTargetLineIndices(lines.length);

            this.#animateLines(
                lines,
                indices,
                delay,
                () => {

                    this.#scene.time.delayedCall(
                        wait,
                        () => {

                            if (callback) {
                                callback();
                            }

                        }
                    );

                }
            );

        };

        if (speaker === this.#currentSpeaker) {
            this.#portrait.setFrame(
                PORTRAIT_FRAMES[speaker + "_" + mood]
            );
            startTyping();
            return;
        }

        this.#currentSpeaker = speaker;

        this.#textContainer.setAlpha(0);

        this.#scene.time.delayedCall(500, () => {
            this.#portrait.setFrame(
                PORTRAIT_FRAMES[speaker + "_" + mood]
            );
            this.#textContainer.setAlpha(1);
            startTyping();
        });

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

        this.#textContainer = this.#scene.add.container(19, 376, [
            this.#textWindowTop,
            this.#textWindowMiddle,
            this.#textWindowBottom,
            this.#portrait,
            this.#portraitFrame,
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

        const middleHeight =
            this.#lineSpacing * Math.max(lines.length, 2);

        this.#textWindowMiddle.setDisplaySize(984, middleHeight);

        this.#textWindowTop.setY(this.#textWindowMiddle.y - middleHeight - 44);

        this.#portraitFrame.setY(this.#textWindowTop.y);

        this.#portrait.setY(this.#portraitFrame.y + 23);

        console.log("textWindow width " + this.#textWindowMiddle.width + " and x " + this.#textWindowMiddle.x);

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

    handlePlayerInput() {
        if (this.#waitingForPlayerInput) {
            this.#updateMessage();
            return;
        }
    }

    updateMessagesWaitForInput(messages, callback) {
        this.#queuedMessages = messages;
        this.#queuedMessagesCallback = callback;

        this.#updateMessage();
    }

    #updateMessage() {
        this.#waitingForPlayerInput = false;
        this.#userInputCursor.setAlpha(0);

        //print line to text window
    }

    #createPlayerInputCursor() {
        this.#userInputCursor = this.#scene.add.image(0, 0, UI_ASSET_KEYS.CURSOR);
        this.#userInputCursor.setAngle(90).setScale(.25);
        this.#userInputCursor.setAlpha(0);
    }

}