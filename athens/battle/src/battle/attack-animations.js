import Phaser from '../lib/phaser.js';
import { Attack } from './attacks.js';

export class AttackAnimations {

    static get registry() {
        return {
            NANCY: this.nancy,
            STATUES: this.statues,
            SWAN: this.swan,
            MUSHROOM: this.mushroom,
            PORKCHOP: this.porkchop,
            CHUPA: this.chupa,
            POOL: this.pool,
            DIRTBIKE: this.dirtbike,
            CHICKEN: this.chicken,
        };
    }

    static #context = {
        scene: null,
        sprite: null,
        width: 0,
        height: 0,
    };

    /**
     * @param {string} key
     * @param {Attack} attack
     * @param {() => void} callback
     * @param {() => void} cleanup
     */
    static play(key, attack, callback, cleanup) {

        const scene = attack._scene;
        const sprite = attack._attackGameSprite;

        this.#context.scene = scene;
        this.#context.sprite = sprite;
        this.#context.width = scene.scale.width;
        this.#context.height = scene.scale.height;

        const fn = this.registry[key] || this.default;
        fn.call(this, attack, callback, cleanup);
    }

    static default(attack, callback, cleanup) {
        console.log("reverted to default")
        attack._playDefaultAnimation(callback);
    }

    static playSound(attack) {
        attack._scene.sound.play(attack._sound);
    }

    /*
      _   _                        
     | \ | | __ _ _ __   ___ _   _ 
     |  \| |/ _` | '_ \ / __| | | |
     | |\  | (_| | | | | (__| |_| |
     |_| \_|\__,_|_| |_|\___|\__, |
                             |___/ 
    */
    static nancy(attack, callback, cleanup) {

        const { scene, sprite, width, height } = this.#context;

        const groundY = scene.scale.height / 4;

        sprite.setScale(.5);

        sprite.setPosition(-100, groundY);
        sprite.setAlpha(1);

        scene.tweens.chain({

            targets: sprite,

            tweens: [

                {
                    x: scene.scale.width * 0.33,
                    y: groundY - 180,
                    duration: 400,
                    ease: 'Sine.Out',
                },

                {
                    x: scene.scale.width * 0.33,
                    y: groundY,

                    duration: 250,
                    ease: 'Bounce.Out',

                    onComplete: () => {
                        this.playSound(attack);
                    },
                },

                {
                    x: scene.scale.width * 0.66,
                    y: groundY - 120,
                    duration: 350,
                    ease: 'Sine.Out',
                },

                {
                    x: scene.scale.width * 0.66,
                    y: groundY,

                    duration: 250,
                    ease: 'Bounce.Out',

                    onComplete: () => {
                        this.playSound(attack);
                        callback();
                    },
                },

                {
                    x: scene.scale.width + 150,
                    y: groundY - 40,
                    duration: 500,
                    ease: 'Sine.In',
                },

            ],

            onComplete: cleanup,
        });
    }

    /*
      ____                     
     / ___|_      ____ _ _ __  
     \___ \ \ /\ / / _` | '_ \ 
      ___) \ V  V / (_| | | | |
     |____/ \_/\_/ \__,_|_| |_|
    */
    static swan(attack, callback, cleanup) {

        const { scene, sprite, width, height } = this.#context;

        this.playSound(attack);

        const path = new Phaser.Curves.Spline([
            -100, 50,
            scene.scale.width * 0.33, scene.scale.height * 0.33,
            scene.scale.width * 0.66, scene.scale.height * 0.33,
            scene.scale.width + 100, 50,
        ]);

        scene.tweens.add({
            delay: 0,
            duration: 200,
            targets: attack._attackGameSprite,
            alpha: {
                from: 0,
                start: 0,
                to: 1,
            }
        });

        const follower = { t: 0 };

        scene.tweens.add({
            targets: follower,
            t: 1,
            duration: 2000,
            ease: 'Linear',

            onUpdate: () => {

                const point = path.getPoint(follower.t);

                sprite.setPosition(point.x, point.y);
            },

            onComplete: () => {
                cleanup();
                callback();
            },
        });
    }

    /*
      ____  _        _                   
     / ___|| |_ __ _| |_ _   _  ___  ___ 
     \___ \| __/ _` | __| | | |/ _ \/ __|
      ___) | || (_| | |_| |_| |  __/\__ \
     |____/ \__\__,_|\__|\__,_|\___||___/                        
    */
    static statues(attack, callback, cleanup) {

        const { scene, sprite, width, height } = this.#context;

        const startX = -sprite.width;
        const centerX = (scene.scale.width / 2) - (sprite.width / 2);
        const y = 30 + (sprite.height / 2);

        sprite.setPosition(startX, y);
        sprite.setAlpha(1);

        scene.tweens.add({
            targets: sprite,
            x: centerX,
            duration: 1000,
            ease: 'Sine.Out',

            onComplete: () => {

                scene.time.delayedCall(500, () => {

                    this.playSound(attack);

                    const laser = scene.add.graphics();

                    laser.lineStyle(6, 0xff0000);

                    const startLaserX = sprite.x - (sprite.width / 4);
                    const startLaserY = sprite.y - (sprite.height / 4);

                    const endLaserX = scene.scale.width * 0.75;
                    const endLaserY = scene.scale.height * 0.25;

                    laser.beginPath();
                    laser.moveTo(startLaserX, startLaserY);
                    laser.lineTo(endLaserX, endLaserY);
                    laser.strokePath();

                    scene.tweens.add({
                        targets: laser,
                        alpha: 0,
                        duration: 250,
                        onComplete: () => {
                            laser.destroy();
                            callback();
                        }
                    });

                    scene.time.delayedCall(500, () => {
                        scene.tweens.add({
                            targets: sprite,
                            x: startX,
                            duration: 1000,
                            ease: 'Sine.In',
                            onComplete: cleanup
                        });
                    });

                });

            },
        });
    }

    /*
      __  __           _                               
     |  \/  |_   _ ___| |__  _ __ ___   ___  _ __ ___  
     | |\/| | | | / __| '_ \| '__/ _ \ / _ \| '_ ` _ \ 
     | |  | | |_| \__ \ | | | | | (_) | (_) | | | | | |
     |_|  |_|\__,_|___/_| |_|_|  \___/ \___/|_| |_| |_|
    */
    static mushroom(attack, callback, cleanup) {

        const { scene, sprite, width, height } = this.#context;
        const key = attack._spriteKey;
        const player = attack._player;
        sprite.setAlpha(0);

        const startX = scene.scale.width * 0.75;
        const startY = scene.scale.height * 0.25;

        const targetX = scene.scale.width * 0.25;
        const targetY = scene.scale.height * 0.75;

        let finished = 0;

        for (let frame = 0; frame < 5; frame++) {

            scene.time.delayedCall(frame * 100, () => {

                const mushroom = scene.add.sprite(
                    startX,
                    startY,
                    key,
                    frame
                ).setScale(0.25);

                this.playSound(attack);

                scene.tweens.add({
                    targets: mushroom,
                    x: targetX,
                    y: targetY,
                    scale: .5,
                    duration: 500,

                    onComplete: () => {

                        if (frame === 0) {
                            player.playTakeDamageAnimation()
                        }

                        const angle =
                            Phaser.Math.FloatBetween(0, Math.PI * 2);

                        const distance =
                            Phaser.Math.Between(500, 900);

                        const endX =
                            targetX + Math.cos(angle) * distance;

                        const endY =
                            targetY + Math.sin(angle) * distance;

                        scene.tweens.add({
                            targets: mushroom,
                            x: endX,
                            y: endY,
                            rotation:
                                Phaser.Math.FloatBetween(
                                    -10,
                                    10
                                ),
                            duration: 500,

                            onComplete: () => {

                                mushroom.destroy();

                                finished++;

                                if (finished === 5) {
                                    cleanup();
                                    callback();
                                }
                            }
                        });
                    }
                });
            });
        }
    }

    /*
      ____            _        _                 
     |  _ \ ___  _ __| | _____| |__   ___  _ __  
     | |_) / _ \| '__| |/ / __| '_ \ / _ \| '_ \ 
     |  __/ (_) | |  |   < (__| | | | (_) | |_) |
     |_|   \___/|_|  |_|\_\___|_| |_|\___/| .__/ 
                                          |_|    
    */
    static porkchop(attack, callback, cleanup) {

        const { scene, sprite, width, height } = this.#context;
        const key = attack._spriteKey;
        const player = attack._player;
        sprite.setAlpha(0);

        const bounceY = scene.scale.height * 0.66;

        let finished = 0;

        scene.time.delayedCall(500, () => {
            player.playTakeDamageAnimation()

        })

        for (let i = 0; i < 15; i++) {

            const x =
                Phaser.Math.Between(
                    50,
                    scene.scale.width - 50
                );

            const pork = scene.add.sprite(
                x,
                -100,
                key
            );

            scene.tweens.chain({

                delay: i * 60,

                targets: pork,

                tweens: [

                    {
                        y: bounceY,
                        duration: 500,
                        ease: 'Quad.In',
                        onComplete: () => {
                            this.playSound(attack);
                        }
                    },

                    {
                        y: bounceY - 80,
                        duration: 200,
                        ease: 'Quad.Out',
                    },

                    {
                        y: scene.scale.height + 200,
                        duration: 500,
                        ease: 'Quad.In',
                    },

                ],

                onComplete: () => {

                    pork.destroy();

                    finished++;

                    if (finished === 15) {
                        cleanup();
                        callback();
                    }
                },
            });
        }
    }

    /*
       ____ _                       
      / ___| |__  _   _ _ __   __ _ 
     | |   | '_ \| | | | '_ \ / _` |
     | |___| | | | |_| | |_) | (_| |
      \____|_| |_|\__,_| .__/ \__,_|
                       |_|          
    */
    static chupa(attack, callback, cleanup) {

        const { scene, sprite, width, height } = this.#context;

        const marginX = sprite.width / 2;
        const marginY = sprite.height / 2;

        sprite.setAlpha(1);

        let jumps = 0;

        const teleport = () => {

            this.playSound(attack);

            const x = Phaser.Math.Between(
                marginX,
                scene.scale.width - marginX
            );

            const y = Phaser.Math.Between(
                marginY,
                scene.scale.height - marginY
            );

            sprite.setPosition(x, y);

            sprite.setAngle(
                Phaser.Math.Between(-30, 30)
            );

            jumps++;

            if (jumps >= 7) {
                cleanup();
                callback();
                return;
            }

            scene.time.delayedCall(
                250,
                teleport
            );
        };

        teleport();
    }

    static dirtbike(attack, callback, cleanup) {

        const { scene, sprite, width, height } = this.#context;

        const startX = -(sprite.width);
        const stopX = width / 3;
        const endX = width + sprite.width;

        const y = height * 0.2;

        sprite
            .setPosition(startX, y)
            .setAlpha(1)
            .setScale(.5);

        scene.tweens.add({
            targets: sprite,
            x: stopX,
            duration: 700,
            ease: 'Back.Out',

            onComplete: () => {

                this.playSound(attack);
                sprite.play(attack._spriteKey);
                scene.time.delayedCall(1000, () => { callback(); });

                sprite.once(
                    Phaser.Animations.Events.ANIMATION_COMPLETE,
                    () => {

                        scene.tweens.add({
                            targets: sprite,
                            x: endX,
                            duration: 500,
                            ease: 'Quad.In',

                            onComplete: () => {
                                sprite.setAlpha(0).setFrame(0);

                                cleanup();
                            }
                        });

                    }
                );
            }
        });
    }

    static chicken(attack, callback, cleanup) {

        const { scene, sprite, width, height } = this.#context;

        const startX = -sprite.width;
        const endX = width + sprite.width;

        const groundY = height * 0.25;
        sprite.setScale(.5);

        sprite
            .setPosition(startX, groundY)
            .setAlpha(1);

        scene.tweens.chain({

            tweens: [

                // first bounce
                {
                    targets: sprite,
                    x: width * 0.25,
                    y: groundY - 120,
                    duration: 300,
                    ease: 'Sine.Out',
                },
                {
                    targets: sprite,
                    y: groundY,
                    duration: 250,
                    ease: 'Sine.In',
                },

                // second bounce
                {
                    targets: sprite,
                    x: width * 0.55,
                    y: groundY - 80,
                    duration: 250,
                    ease: 'Sine.Out',
                },
                {
                    targets: sprite,
                    y: groundY,
                    duration: 200,
                    ease: 'Sine.In',
                },

                // third bounce
                {
                    targets: sprite,
                    x: width * 0.8,
                    y: groundY - 50,
                    duration: 200,
                    ease: 'Sine.Out',
                },
                {
                    targets: sprite,
                    y: groundY,
                    duration: 150,
                    ease: 'Sine.In',
                    onComplete: () => {
                        this.playSound(attack);
                        callback();
                    }
                },

                // exit screen right
                {
                    targets: sprite,
                    x: endX,
                    duration: 300,
                    ease: 'Sine.In',
                },

            ],

            onComplete: () => {
                cleanup();
            }

        });
    }

    static pool(attack, callback, cleanup) {

        const { scene, sprite, width, height } = this.#context;

        const startX = -sprite.width;
        const hoverX = width * 0.8;
        const hoverY = height * 0.2;
        const endX = width + sprite.width;

        sprite
            .setPosition(startX, hoverY)
            .setRotation(0)
            .setAlpha(1);

        scene.tweens.chain({

            tweens: [

                {
                    targets: sprite,
                    x: hoverX,
                    duration: 700,
                    ease: 'Sine.Out',
                },

                {
                    targets: sprite,
                    angle: 180,
                    duration: 300,

                    onStart: () => {
                        this.playSound(attack);
                        attack._enemy.playWetAnimation();
                        sprite.play(attack._spriteKey);
                    }
                },

                {
                    targets: sprite,
                    duration: 1000,
                },

                {
                    targets: sprite,
                    x: endX,
                    duration: 500,
                    ease: 'Quad.In',

                    onComplete: () => {
                        sprite
                            .setAlpha(0)
                            .setAngle(0)
                            .setFrame(0);

                        if (callback) {
                            callback();
                            cleanup();
                        }
                    }
                }

            ]

        });
    }

}