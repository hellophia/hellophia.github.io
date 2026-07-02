import {
  BATTLE_BACKGROUND_ASSET_KEYS,
  FIGHTER_ASSET_KEYS,
  MUSIC_KEYS,
} from '../_misc/asset-keys.js';
import { AttackManager } from '../battle/attack-manager.js';
import { EnemyBattleGuy } from '../battle/battle-guy-enemy.js';
import { PlayerBattleGuy } from '../battle/battle-guy-player.js';
import { BattleMenu } from '../battle/battle-menu.js';
import { DIRECTION } from '../_misc/direction.js';
import Phaser from '../lib/phaser.js';
import { StateMachine } from '../_misc/state-machine.js';
import { SCENE_KEYS } from './scene-keys.js';
import { BATTLE_MENU_OPTIONS } from '../battle/battle-menu-options.js';

const BATTLE_STATES = Object.freeze({
  INTRO: 'INTRO',
  PRE_BATTLE: 'PRE_BATTLE',
  PLAYER_INPUT: 'PLAYER_INPUT',
  BATTLE: 'BATTLE',
  POST_ATTACK_CHECK: 'POST_ATTACK_CHECK',
  FINISHED: 'FINISHED',
});

export class BattleScene extends Phaser.Scene {
  /** @type {BattleMenu} */
  #battleMenu;
  /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
  #cursorKeys;
  /** @type {EnemyBattleGuy} */
  #activeEnemyGuy;
  /** @type {PlayerBattleGuy} */
  #activePlayerGuy;
  /** @type {number} */
  #activePlayerAttackIndex;
  /** @type {StateMachine} */
  #battleStateMachine;
  /** @type {AttackManager} */
  #attackManager;
  /** @type {import('../_battle/battle-menu-options.js').BattleMenuOptions} */
  #pendingPlayerAction

  constructor() {
    super({
      key: SCENE_KEYS.BATTLE_SCENE,
    });
  }

  init() {
    this.#activePlayerAttackIndex = -1;
  }

  create() {
    this.sound.stopAll();
    const battleMusic = this.sound.add(MUSIC_KEYS.BATTLE_MUSIC);
    battleMusic.play({
      loop: true
    });

    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xffffff).setOrigin(0, 0).setPosition(0, 0);
    //this.add.image(0, 0, BATTLE_BACKGROUND_ASSET_KEYS.CAVE).setOrigin(0).setAlpha(.5);

    this.#activeEnemyGuy = new EnemyBattleGuy({
      scene: this,
      guyDetails: {
        name: "Aaron Fu",
        assetKey: FIGHTER_ASSET_KEYS.ENEMY,
        assetFrame: 0,
        maxHp: 100,
      },
    });

    this.#activePlayerGuy = new PlayerBattleGuy({
      scene: this,
      guyDetails: {
        name: "Danny",
        assetKey: FIGHTER_ASSET_KEYS.PLAYER,
        assetFrame: 0,
        maxHp: 100,
      },
    });

    this.#battleMenu = new BattleMenu(this, this.#activePlayerGuy);

    this.#createBattleStateMachine();
    this.#attackManager = new AttackManager(this, this.#activePlayerGuy, this.#activeEnemyGuy);

    this.#cursorKeys = this.input.keyboard.createCursorKeys();

    this.cameras.main.fadeIn(2000);

    /*
    this.time.delayedCall(2000, () => {
      this.#attackManager.playAttackAnimation("CHUPA", () => { })
    });*/

  }

  update() {
    this.#battleStateMachine.update();

    const wasSpaceKeyPressed = Phaser.Input.Keyboard.JustDown(this.#cursorKeys.space);
    // limit input based on the current battle state we are in
    // if we are not in the right battle state, return early and do not process input
    if (
      wasSpaceKeyPressed &&
      (this.#battleStateMachine.currentStateName === BATTLE_STATES.PRE_BATTLE ||
        this.#battleStateMachine.currentStateName === BATTLE_STATES.POST_ATTACK_CHECK)
    ) {
      this.#battleMenu.handlePlayerInput('OK');
      return;
    }

    if (this.#battleStateMachine.currentStateName !== BATTLE_STATES.PLAYER_INPUT) {
      return;
    }

    if (wasSpaceKeyPressed) {

      this.#battleMenu.handlePlayerInput('OK');

      const battleMenuChoice = this.#battleMenu.chosenBattleMenuOption;

      if (battleMenuChoice === BATTLE_MENU_OPTIONS.FIGHT) {

        if (this.#battleMenu.chosenAttack === undefined) {
          return;
        }

        //if it's not time for potato...
        const attackName = this.#activePlayerGuy.attacks[this.#battleMenu.chosenAttack]?.name ?? '';
        const isPotato = attackName === 'Potato';
        const isLastAttack = this.#activePlayerGuy.attacks.length === 1;
        if (isPotato && !isLastAttack) {
          this.#battleMenu.hideAttackMenu();
          this.#battleMenu.updateMessagesWaitForInput(
            [`It's not time to use POTATO yet!`],
            () => {
              this.time.delayedCall(500, () => {
                this.#battleMenu.switchToMainBattleMenu();
              });
            }
          );
          return;
        }

        this.#activePlayerAttackIndex = this.#battleMenu.chosenAttack;

        if (!this.#activePlayerGuy.attacks[this.#activePlayerAttackIndex]) {
          return;
        }

        console.log(`player selected the following move: ${this.#battleMenu.chosenAttack}`);

        this.#battleMenu.hideAttackMenu();
        this.#pendingPlayerAction = BATTLE_MENU_OPTIONS.FIGHT;
        this.#battleStateMachine.setState(BATTLE_STATES.BATTLE);

      }
      else if (battleMenuChoice === BATTLE_MENU_OPTIONS.HIT) {

        this.#battleMenu.hideAttackMenu();
        this.#pendingPlayerAction = BATTLE_MENU_OPTIONS.HIT;
        this.#battleStateMachine.setState(BATTLE_STATES.BATTLE);

      }
      else if (battleMenuChoice === BATTLE_MENU_OPTIONS.SNACK) {

        this.#battleMenu.hideAttackMenu();
        this.#pendingPlayerAction = BATTLE_MENU_OPTIONS.SNACK;
        this.#battleStateMachine.setState(BATTLE_STATES.BATTLE);

      }
      else if (battleMenuChoice === BATTLE_MENU_OPTIONS.PRANK) {

        this.#battleMenu.hideAttackMenu();
        this.#pendingPlayerAction = BATTLE_MENU_OPTIONS.PRANK;
        this.#battleStateMachine.setState(BATTLE_STATES.BATTLE);

      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.#cursorKeys.shift)) {
      this.#battleMenu.handlePlayerInput('CANCEL');
      return;
    }

    /** @type {import('../_misc/direction.js').Direction} */
    let selectedDirection = DIRECTION.NONE;
    if (Phaser.Input.Keyboard.JustDown(this.#cursorKeys.left)) {
      selectedDirection = DIRECTION.LEFT;
    } else if (Phaser.Input.Keyboard.JustDown(this.#cursorKeys.right)) {
      selectedDirection = DIRECTION.RIGHT;
    } else if (Phaser.Input.Keyboard.JustDown(this.#cursorKeys.up)) {
      selectedDirection = DIRECTION.UP;
    } else if (Phaser.Input.Keyboard.JustDown(this.#cursorKeys.down)) {
      selectedDirection = DIRECTION.DOWN;
    }

    if (selectedDirection !== DIRECTION.NONE) {
      this.#battleMenu.handlePlayerInput(selectedDirection);
    }
  }

  #playerAttack() {
    const damage = this.#attackManager.calculatePlayerAttackDamage(
      this.#activePlayerGuy.attacks.length,
      this.#activeEnemyGuy.currentHealth,
      this.#activeEnemyGuy.maxHealth
    );

    this.#battleMenu.updateMessageNoInputRequired(
      `${this.#activePlayerGuy.name.toUpperCase()} used ${this.#activePlayerGuy.attacks[this.#activePlayerAttackIndex].name.toUpperCase()}!`,
      () => {
        this.time.delayedCall(500, () => {
          this.#activePlayerGuy.playAttackAnimation();
          this.time.delayedCall(1000, () => {
            this.#attackManager.playAttackAnimation(
              this.#activePlayerGuy.attacks[this.#activePlayerAttackIndex].spriteKey,
              () => {
                this.#activeEnemyGuy.playTakeDamageAnimation();
                this.#activeEnemyGuy.takeDamage(damage, () => {
                  this.#enemyAttack();
                });
              }
            );
            this.#activePlayerGuy.removeAttackAt(this.#activePlayerAttackIndex)
          });
        });
      },
    );
  }
  #playerHit() {

    const enemyPercent =
      this.#activeEnemyGuy.currentHealth /
      this.#activeEnemyGuy.maxHealth;

    const hitEnemy = () => {
      this.#battleMenu.updateMessageNoInputRequired(
        `${this.#activePlayerGuy.name.toUpperCase()} hit ${this.#activeEnemyGuy.name.toUpperCase()}!`,
        () => {
          this.#activePlayerGuy.playHitAnimation();
          this.time.delayedCall(500, () => {
            this.#activeEnemyGuy.playTakeDamageAnimation();
            this.#activeEnemyGuy.takeDamage(5, () => {
              this.#enemyAttack();
            });
          })
        }
      );
    }

    const missEnemy = () => {
      this.#activePlayerGuy.playHitAnimation();
      this.#battleMenu.updateMessageNoInputRequired(
        `${this.#activePlayerGuy.name.toUpperCase()} tried to hit ${this.#activeEnemyGuy.name.toUpperCase()}!`,
        () => {
          this.time.delayedCall(1500, () => {
            this.#battleMenu.updateMessageNoInputRequired(
              `... but ${this.#activeEnemyGuy.name.toUpperCase()} dodged out of the way!`,
              () => {
                this.time.delayedCall(1500, () => {
                  this.#enemyAttack();
                })
              }
            );
          })
        }
      );
    }

    if (enemyPercent <= 0.5) {
      missEnemy();
      return;
    }

    this.#attackManager.increment('HIT');

    if (this.#attackManager.timesHitUsed === 1) {
      hitEnemy();
    } else {
      if (Math.random() < 0.5) {
        hitEnemy();
      } else {
        missEnemy();
      }
    }
  }

  #playerSnack() {

    const healPlayer = () => {
      this.#activePlayerGuy.playSnackAnimation();
      this.#battleMenu.updateMessageNoInputRequired(
        `${this.#activePlayerGuy.name.toUpperCase()} ate a yummy snack!`,
        () => {
          this.time.delayedCall(500, () => {
            this.#activePlayerGuy.heal(() => {
              this.#enemyAttack();
            });
          });
        }
      );
    };

    const healEnemy = () => {
      this.#battleMenu.updateMessageNoInputRequired(
        `${this.#activePlayerGuy.name.toUpperCase()} was about to eat a yummy snack...`,
        () => {
          this.time.delayedCall(1000, () => {
            this.#battleMenu.updateMessageNoInputRequired(
              `${this.#activeEnemyGuy.name.toUpperCase()} stole ${this.#activePlayerGuy.name.toUpperCase()}'s snack and ate it!!!`,
              () => {
                this.time.delayedCall(500, () => {
                  this.#activeEnemyGuy.heal(() => {
                    this.#enemyAttack();
                  });
                });
              });
          });
        });
    };

    const playerMissing =
      this.#activePlayerGuy.maxHealth -
      this.#activePlayerGuy.currentHealth;

    if (playerMissing <= 0) {
      this.#battleMenu.updateMessageNoInputRequired(`${this.#activePlayerGuy.name.toUpperCase()} isn't feeling hungry!`, () => {
        this.time.delayedCall(1000, () => {
          this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
        });
      })
      return;
    }

    this.#attackManager.increment('SNACK');

    if (this.#attackManager.timesSnackUsed === 1) {
      healPlayer();
      return;
    }

    if (this.#attackManager.timesSnackUsed === 2) {
      if (this.#activeEnemyGuy.currentHealth === this.#activeEnemyGuy.maxHealth) {
        healPlayer();
        this.#attackManager.reset('SNACK');
      } else if (this.#activePlayerGuy.currentHealth < (this.#activePlayerGuy.maxHealth * .3)) {
        healPlayer();
        this.#attackManager.reset('SNACK');
      }
      else {
        healEnemy();
      }

      return;
    }

    if (this.#activePlayerGuy.currentHealth < (this.#activePlayerGuy.maxHealth * .3)) {
      healPlayer();
      return;
    }

    if (Math.random() < 0.5) {
      healPlayer();
    } else {
      if (this.#activeEnemyGuy.currentHealth === this.#activeEnemyGuy.maxHealth) {
        healPlayer();
      } else {
        healEnemy();
      }
    }
  }

  #playerPrank() {

    const prank = () => {
      this.#battleMenu.updateMessageNoInputRequired(
        `${this.#activePlayerGuy.name.toUpperCase()} pranked ${this.#activeEnemyGuy.name.toUpperCase()}!`,
        () => {
          this.#activePlayerGuy.playPrankAnimation();
          this.time.delayedCall(1000, () => {
            this.#activeEnemyGuy.playPrankedAnimation();
            this.#battleMenu.updateMessageNoInputRequired(
              `${this.#activeEnemyGuy.name.toUpperCase()} got GOT GOOD!`,
              () => {
                this.time.delayedCall(1000, () => {
                  this.#battleMenu.updateMessageNoInputRequired(
                    `${this.#activeEnemyGuy.name.toUpperCase()} is EMBARRASSED!`,
                    () => {
                      this.time.delayedCall(1000, () => {
                        this.#battleMenu.updateMessageNoInputRequired(
                          `${this.#activeEnemyGuy.name.toUpperCase()} is SULKING!`,
                          () => {
                            this.time.delayedCall(1000, () => {
                              this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
                            });
                          });
                      });
                    });
                });
              });
          });
        });
    };

    const failPrank = () => {
      this.#battleMenu.updateMessageNoInputRequired(
        `${this.#activePlayerGuy.name.toUpperCase()} tried to prank ${this.#activeEnemyGuy.name.toUpperCase()}!`,
        () => {
          this.time.delayedCall(1000, () => {
            this.#battleMenu.updateMessageNoInputRequired(
              `${this.#activeEnemyGuy.name.toUpperCase()} is SUSPICIOUS!`,
              () => {
                this.#activeEnemyGuy.playSusAnimation();
                this.time.delayedCall(1000, () => {
                  this.#battleMenu.updateMessageNoInputRequired(
                    `The PRANK didn't work!`,
                    () => {
                      this.time.delayedCall(1000, () => {
                        this.#enemyAttack();
                      });
                    });
                });
              });
          });
        });
    };

    if (this.#activeEnemyGuy.isStunned) {
      this.#battleMenu.updateMessageNoInputRequired(
        `${this.#activeEnemyGuy.name.toUpperCase()} is already PRANKED!`,
        () => {
          this.time.delayedCall(1000, () => {
            this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
          });
        }
      )
      return;
    }

    this.#attackManager.increment('PRANK');

    if (this.#attackManager.timesPrankUsed === 1) {
      this.#activeEnemyGuy.stun();
      prank();
      return;
    }

    if (this.#attackManager.timesPrankUsed === 2) {
      failPrank();
      return;
    }

    if (Math.random() < 0.5) {
      this.#activeEnemyGuy.stun();
      prank();
    } else {
      failPrank();
    }
  }

  #enemyAttack() {
    console.log("enemy attack... " + this.#activeEnemyGuy.isStunned)
    if (this.#activeEnemyGuy.isFainted) {
      this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
      return;
    }

    if (this.#activeEnemyGuy.isStunned) {

      this.#activeEnemyGuy.unStun();

      this.#battleMenu.updateMessageNoInputRequired(
        `${this.#activeEnemyGuy.name.toUpperCase()} is still SULKING!`,
        () => {
          this.#activeEnemyGuy.playSulkAnimation();
          this.time.delayedCall(1500, () => {
            this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
          });
        }
      );

      return;
    }

    const damage = this.#attackManager.calculateEnemyAttackDamage(
      this.#activePlayerGuy.currentHealth,
      this.#activePlayerGuy.maxHealth
    );

    const noAttackPhrase = [`${this.#activeEnemyGuy.name.toUpperCase()} is checking his phone...`, `${this.#activeEnemyGuy.name.toUpperCase()} is distracted...`, `${this.#activeEnemyGuy.name.toUpperCase()} is busy with something else...`];

    if (damage === 0) {
      this.#battleMenu.updateMessageNoInputRequired(
        noAttackPhrase[0],
        () => {
          this.time.delayedCall(1500, () => {
            this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
          });
        }
      );
      noAttackPhrase.push(noAttackPhrase.shift());
      return;
    }

    this.#battleMenu.updateMessageNoInputRequired(
      `${this.#activeEnemyGuy.name.toUpperCase()} used ${this.#activeEnemyGuy.attacks[0].name.toUpperCase()}!`,
      () => {
        this.time.delayedCall(500, () => {
          this.#activeEnemyGuy.playAttackAnimation();
          this.#attackManager.playAttackAnimation(
            this.#activeEnemyGuy.attacks[0].spriteKey,
            () => {
              this.#activePlayerGuy.takeDamage(damage, () => {
                this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
              });
            }
          );
          this.#activeEnemyGuy.rotateAttacksLeft();
        });
      },
    );
  }

  #handlePlayerAction() {
    switch (this.#pendingPlayerAction) {
      case BATTLE_MENU_OPTIONS.HIT:
        this.#playerHit();
        break;
      case BATTLE_MENU_OPTIONS.FIGHT:
        this.#playerAttack(); // existing method that handles special item attacks
        break;
      case BATTLE_MENU_OPTIONS.SNACK:
        this.#playerSnack();
        break;
      case BATTLE_MENU_OPTIONS.PRANK:
        this.#playerPrank();
        break;
      default:
        this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
    }
    this.#pendingPlayerAction = undefined;
  }

  #postBattleSequenceCheck() {
    if (this.#activeEnemyGuy.isFainted) {
      this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
      return;
    }

    this.#battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
  }

  #transitionToNextScene() {
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENE_KEYS.OUTRO_SCENE);
    });
  }

  #createBattleStateMachine() {
    this.#battleStateMachine = new StateMachine('battle', this);

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.INTRO,
      onEnter: () => {
        // wait for any scene setup and transitions to complete
        this.time.delayedCall(500, () => {
          this.#battleStateMachine.setState(BATTLE_STATES.PRE_BATTLE);
        });
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.PRE_BATTLE,
      onEnter: () => {
        this.#activePlayerGuy.playGuyAppearAnimation(() => { });
        this.#activeEnemyGuy.playGuyAppearAnimation(() => { })
        this.time.delayedCall(4200, () => {
          this.#activeEnemyGuy.playGuyHealthBarAppearAnimation(() => {
            this.time.delayedCall(350, () => {
              this.#activePlayerGuy.playGuyHealthBarAppearAnimation(() => {
                this.time.delayedCall(1000, () => {
                  this.#battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
                });
              });
            }
            );
          });

        });
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.PLAYER_INPUT,
      onEnter: () => {
        this.#battleMenu.showTextWindow();
        this.#battleMenu.showMainBattleMenu();
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.BATTLE,
      onEnter: () => {
        this.#handlePlayerAction();
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.POST_ATTACK_CHECK,
      onEnter: () => {
        this.#postBattleSequenceCheck();
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.FINISHED,
      onEnter: () => {
        this.#transitionToNextScene();
      },
    });

    // start the state machine
    this.#battleStateMachine.setState('INTRO');
  }
}