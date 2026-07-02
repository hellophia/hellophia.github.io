import { MUSIC_KEYS } from '../_misc/asset-keys.js';
import { TextMenu } from '../battle/text-menu.js';
import { SCENE_KEYS } from './scene-keys.js';
import Phaser from '../lib/phaser.js';

export class OutroScene extends Phaser.Scene {
    /** @type {TextMenu} */
    #textMenu;
    /** @type {number} */
    #pause;
    /** @type {Object} */
    #lines;
    /** @type {number} */
    #defaultCharacterDelay;
    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    #cursorKeys;
    #outroMusic;

    constructor() {
        super({
            key: SCENE_KEYS.OUTRO_SCENE,
        });

        this.#lines = [
            {
                character: "af",
                mood: "neutral",
                text: "You... have... defeated me...",
            },
            {
                character: "af",
                mood: "neutral",
                text: "... well done, Danny.",
            },
            {
                character: "af",
                mood: "neutral",
                text: "For you see... I wasn't really the final boss.",
            },
            {
                character: "af",
                mood: "neutral",
                text: "This was... only a test. The real boss... is called...",
            },
            {
                character: "af",
                mood: "neutral",
                text: "... capitalism.",
            },
            {
                character: "danny",
                mood: "neutral",
                text: "...",
            },
            {
                character: "af",
                mood: "neutral",
                text: "You see, Danny... capitalism is one of many possible ways that human society can organize itself.",
                characterDelay: 40,
            },
            {
                character: "af",
                mood: "neutral",
                text: "Under capitalism, there is one class that controls the means of production, and leverages that control over the working class, who need to earn money for food and other necessities by selling their labor. Workers become alienated from their labor, and survival becomes a constant struggle.",
                characterDelay: 30,
            },
            {
                character: "danny",
                mood: "surprised",
                text: "...???",
            },
            {
                character: "af",
                mood: "neutral",
                text: "Throughout human history there have been other economic paradigms, and human beings did not always have to depend on the market for basic survival, but in the modern era a culture of increased privatization has made it less possible for people to control their own means of production. By creating an environment of scarcity, capitalism convinces people that the only way to live is to hoard resources.",
                characterDelay: 20,
            },
            {
                character: "danny",
                mood: "yelling",
                text: "?????",
            },
            {
                character: "af",
                mood: "neutral",
                text: "Capitalism says that we shouldn't share, and that we shouldn't be friends with each other, but actually...",
            },
            {
                character: "af",
                mood: "neutral",
                text: "Sharing is good, and friendship is good too.",
            },
            {
                character: "af",
                mood: "neutral",
                text: "And even though I pretended to be evil and dropped a big book on your head, I'm also your friend.",
            },
            {
                character: "af",
                mood: "neutral",
                text: "And your friends will always try to help you, because we love you very much.",
            },
            {
                character: "danny",
                mood: "neutral",
                text: ".....",
                characterDelay: 300,
            },
            {
                character: "danny",
                mood: "yelling",
                text: "BORING!!!!!",
            },
        ];

        this.#pause = 1000;
        this.#defaultCharacterDelay = 25;
    }

    init() {
    }

    create() {

        this.sound.stopAll();
        this.#outroMusic = this.sound.add(MUSIC_KEYS.OUTRO_MUSIC);

        this.#cursorKeys = this.input.keyboard.createCursorKeys();

        //black bg
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000).setOrigin(0).setPosition(0, 0);

        this.#textMenu = new TextMenu(this);
        this.#textMenu._currentSpeaker = "af";
        this.time.delayedCall(500, () => {
            this.playLine(0);
        })

    }

    update() {

        if (Phaser.Input.Keyboard.JustDown(this.#cursorKeys.space) || Phaser.Input.Keyboard.JustDown(this.#cursorKeys.shift)) {
            this.#textMenu.handlePlayerInput('OK');
        }

    }

    /**
    * @param {number} index
    */
    playLine(index) {

        if (index === 5) {
            this.#outroMusic.play();
        }

        if (index === Object.keys(this.#lines).length) {

            this.tweens.add({
                targets: this.#outroMusic,
                volume: 0,
                duration: 1000,
                onComplete: () => {
                    this.#outroMusic.stop();
                }
            });

            this.cameras.main.fadeOut(3000, 0, 0, 0);

            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                this.time.delayedCall(1000, () => {
                    this.scene.start(SCENE_KEYS.CREDITS_SCENE);
                })
            });

            return;
        }

        const line = this.#lines[index];

        this.#textMenu.updateMessageWaitForInput(
            line.character,
            line.mood,
            line.text,
            line.characterDelay ?? this.#defaultCharacterDelay,
            () => this.playLine(index + 1)
        );
    }

}