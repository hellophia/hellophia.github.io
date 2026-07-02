import { MUSIC_KEYS } from "../_misc/asset-keys.js";
import Phaser from "../lib/phaser.js";

export class CreditsScene extends Phaser.Scene {

    #numberofletters;

    #letters = [];

    constructor() {
        super("CREDITS_SCENE");
        this.#numberofletters = 18;
    }

    create() {
    this.sound.stopAll();
        const creditsMusic = this.sound.add(MUSIC_KEYS.CREDITS_MUSIC);
        creditsMusic.play();

        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xe3e3e3).setOrigin(0).setPosition(0, 0);

        const startX = 350;
        const topY = 100;

        const xSpacing = 80;
        const rowSpacing = 150;

        const ROW_BREAKS = [5, 13];

        const slope = 12;

        for (let i = 0; i < this.#numberofletters; i++) {

            let row;
            let col;

            if (i < ROW_BREAKS[0]) {
                row = 0;
                col = i;
            }
            else if (i < ROW_BREAKS[1]) {
                row = 1;
                col = i - ROW_BREAKS[0];
            }
            else {
                row = 2;
                col = i - ROW_BREAKS[1];
            }

            let rowXOffset = 0;
            let rowYOffset = 0;

            if (row === 1) {
                rowXOffset = -100;
                rowYOffset = -12;
            }

            const x =
                startX
                + col * xSpacing
                + rowXOffset;
            const y =
                topY
                + row * rowSpacing
                + col * slope
                + rowYOffset;

            const letter = this.add.image(
                x,
                y,
                `letter-${i}`
            ).setScale(.25);

            this.#letters.push(letter);

            this.tweens.add({
                targets: letter,
                y: y - 8,
                duration: Phaser.Math.Between(2000, 3000),
                ease: "Sine.inOut",
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 1000),
            });

        }

        this.#scheduleRandomSpin();

    }

    #scheduleRandomSpin() {

        const delay = Phaser.Math.Between(3000, 5000);

        this.time.delayedCall(delay, () => {

            const letter =
                Phaser.Utils.Array.GetRandom(
                    this.#letters
                );

            this.#fakeSpin(letter);

            this.#scheduleRandomSpin();

        });

    }

    #fakeSpin(letter) {

        this.tweens.add({

            targets: letter,

            scaleX: 0,

            duration: 250,

            ease: "Sine.inOut",

            yoyo: true,

        });

    }

}