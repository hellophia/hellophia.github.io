import { BATTLE_BACKGROUND_ASSET_KEYS, MUSIC_KEYS, UI_ASSET_KEYS } from '../_misc/asset-keys.js';
import { TextMenu } from '../battle/text-menu.js';
import { SCENE_KEYS } from './scene-keys.js';

export class IntroScene extends Phaser.Scene {
    /** @type {TextMenu} */
    #textMenu;
    /** @type {number} */
    #pause;
    /** @type {Object} */
    #lines;
    /** @type {number} */
    #totalTime;
    /** @type {number} */
    #defaultCharacterDelay;

    constructor() {
        super({
            key: SCENE_KEYS.INTRO_SCENE,
        });

        this.#totalTime = 49500;
        this.#lines = [
            {
                character: "danny",
                mood: "worried",
                text: "... hello?",
            },
            {
                character: "danny",
                mood: "yelling",
                text: "Is anyone there??",
            },
            {
                character: "mystery",
                mood: "none",
                text: "... well done, Danny...",
                characterDelay: 75,
            },
            {
                character: "danny",
                mood: "surprised",
                text: "Who said that?!",

            },
            {
                character: "danny",
                mood: "yelling",
                text: "Who are you!!!",

            },
            {
                character: "mystery",
                mood: "none",
                text: "You have completed my quest...",
                characterDelay: 75,
            },
            {
                character: "mystery",
                mood: "none",
                text: "... and you have arrived at my secret lair...",
                characterDelay: 75,
            },
            {
                character: "mystery",
                mood: "none",
                text: "I see that your friends have given you some little trinkets...",
                characterDelay: 75,
            },
            {
                character: "mystery",
                mood: "none",
                text: "... that was certainly kind of them.",
                characterDelay: 75,
            },
            {
                character: "mystery",
                mood: "none",
                text: "... but will it be enough, Danny?",
                characterDelay: 75,
            }
        ];

        this.#defaultCharacterDelay = 25;

        const revealTime = this.#lines.reduce((sum, line) => {
            const characterDelay =
                line.characterDelay ?? this.#defaultCharacterDelay;

            return sum + line.text.length * characterDelay;
        }, 0);

        this.#pause = Math.max(
            0,
            (this.#totalTime - revealTime) / Object.keys(this.#lines).length
        );
    }

    init() {
    }

    create() {

        const introMusic = this.sound.add(MUSIC_KEYS.INTRO_MUSIC);

        //black bg
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000).setOrigin(0).setPosition(0, 0);

        const startButton = this.add.text(
            640,
            360,
            "click here",
            {
                fontSize: "18px",
                color: "#ffffff",
            }
        )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        startButton.on("pointerdown", () => {

            startButton.destroy();

            introMusic.play();

            this.time.delayedCall(3000, () => {
                this.#textMenu = new TextMenu(this);
                this.#textMenu._currentSpeaker = "danny";
                this.time.delayedCall(500, () => {
                    this.playLine(0);
                })
            }
            );

        });

    }

    /**
* @param {number} index
*/
    playLine(index) {

        if (index === Object.keys(this.#lines).length) {
            this.#textMenu.finalMessage(
                "... will it be enough...",
                " to defeat me...?",
                this.#pause,
                100,
                () => {
                    this.time.delayedCall(1500, () => {
                        this.scene.start(SCENE_KEYS.BATTLE_SCENE);
                    })
                });
            return;
        }

        const line = this.#lines[index];

        this.#textMenu.updateMessageNoInputRequired(line.character, line.mood, line.text, this.#pause, line.characterDelay ?? this.#defaultCharacterDelay,
            () => this.playLine(index + 1)
        );
    }

}