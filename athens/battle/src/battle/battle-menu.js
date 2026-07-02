import Phaser from '../lib/phaser.js';
import { UI_ASSET_KEYS } from '../_misc/asset-keys.js';
import { DIRECTION } from '../_misc/direction.js';
import { exhaustiveGuard } from '../_misc/guard.js';
import { ACTIVE_BATTLE_MENU, BATTLE_MENU_OPTIONS } from './battle-menu-options.js';
import { BATTLE_UI_TEXT_STYLE } from './battle-menu-config.js';
import { BattleGuy } from './battle-guy.js';
import { animateText } from '../_misc/text.js';

const CURSOR_PADDING = 125;

const CURSOR_POSITIONS = Object.freeze({
  UPPER_LEFT: {
    x: 233 - CURSOR_PADDING,
    y: 31,
  },

  UPPER_RIGHT: {
    x: 700 - CURSOR_PADDING,
    y: 31,
  },

  LOWER_LEFT: {
    x: 233 - CURSOR_PADDING,
    y: 94,
  },

  LOWER_RIGHT: {
    x: 700 - CURSOR_PADDING,
    y: 94,
  },
});

const ATTACK_MENU_CURSOR_POS = Object.freeze({
  x: 42,
  y: 38,
});

const PLAYER_INPUT_CURSOR_POS = Object.freeze({
  x: 975,
  y: 525,
});

export class BattleMenu {
  /** @type {Phaser.Scene} */
  #scene;
  /** @type {Phaser.GameObjects.Container} */
  #mainBattleMenuContainer;
  /** @type {Phaser.GameObjects.Container} */
  #attackMenuContainer;
  /** @type {Phaser.GameObjects.Text} */
  #battleTextLine1;
  /** @type {Phaser.GameObjects.Text} */
  #battleTextLine2;
  /** @type {Phaser.GameObjects.Image} */
  #mainBattleMenuCursor;
  /** @type {Phaser.GameObjects.Image} */
  #attackMenuCursor;
  /** @type {Phaser.GameObjects.Image} */
  #attackMenuScrollBar;
  /** @type {import('./battle-menu-options.js').BattleMenuOptions} */
  #selectedBattleMenuOption;
  /** @type {import('./battle-menu-options.js').ActiveBattleMenu} */
  #activeBattleMenu;
  /** @type {string[]} */
  #queuedMessages;
  /** @type {(() => void) | undefined} */
  #queuedMessagesCallback;
  /** @type {boolean} */
  #waitingForPlayerInput;
  /** @type {number | undefined} */
  #selectedAttackIndex;
  /** @type {number | undefined} */
  #visibleAttackStartIndex;
  /** @type {string[] | undefined} */
  #visibleAttackLabels;
  /** @type {BattleGuy} */
  #activePlayerGuy;
  /** @type {Phaser.GameObjects.Image} */
  #userInputCursor;
  /** @type {boolean} */
  #queuedMessageAnimationPlaying;
  /** @type {Phaser.GameObjects.Image} */
  #textWindow;
  /** @type {import('./battle-menu-options.js').BattleMenuOptions | undefined}*/
  #chosenBattleMenuOption;

  /**
 *
 * @param {Phaser.Scene} scene the Phaser 3 Scene the battle menu will be added to
 * @param {BattleGuy} activePlayerGuy
 */
  constructor(scene, activePlayerGuy) {
    this.#scene = scene;
    this.#activePlayerGuy = activePlayerGuy;
    this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.HIT;
    this.#queuedMessagesCallback = undefined;
    this.#queuedMessages = [];
    this.#waitingForPlayerInput = false;
    this.#selectedAttackIndex = undefined;
    this.#visibleAttackStartIndex = 0;
    this.#visibleAttackLabels = [];
    this.#queuedMessageAnimationPlaying = false;
    this.#createTextWindow();
    this.#createMainBattleMenu();
    this.#createAttackMenu();
    this.#createPlayerInputCursor();
    this.#chosenBattleMenuOption = undefined;
  }

  /** @type {number | undefined} */
  get chosenAttack() {
    return this.#selectedAttackIndex;
  }

  get selectedOption() {
    return this.#selectedBattleMenuOption;
  }

  get activeMenu() {
    return this.#activeBattleMenu;
  }

  get chosenBattleMenuOption() {
    return this.#chosenBattleMenuOption;
  }

  showTextWindow() {
    this.#textWindow.setAlpha(1);
  }

  showMainBattleMenu() {
    this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
    this.#mainBattleMenuContainer.setAlpha(1);
    this.#battleTextLine1.setAlpha(0);
    this.#battleTextLine2.setAlpha(0);
    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.HIT;
    this.#mainBattleMenuCursor.setPosition(CURSOR_POSITIONS.UPPER_LEFT.x, CURSOR_POSITIONS.UPPER_LEFT.y);
    this.#selectedAttackIndex = 0;
    this.#chosenBattleMenuOption = undefined;
  }

  hideMainBattleMenu() {
    this.#mainBattleMenuContainer.setAlpha(0);
    this.#battleTextLine1.setAlpha(0);
    this.#battleTextLine2.setAlpha(0);
  }

  showAttackMenu() {
    this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT;
    this.#attackMenuContainer.setAlpha(1);
    this.#selectedAttackIndex = undefined;
    this.#visibleAttackStartIndex = 0;
    this.#attackMenuCursor.setPosition(CURSOR_POSITIONS.UPPER_LEFT.x, CURSOR_POSITIONS.UPPER_LEFT.y);
    this.#renderAttackMenu();
  }

  hideAttackMenu() {
    this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
    this.#attackMenuContainer.setAlpha(0);
  }

  /**
    *
    * @param {import('../_misc/direction.js').Direction|'OK'|'CANCEL'} input
    */
  handlePlayerInput(input) {

    if (this.#queuedMessageAnimationPlaying && input === 'OK') {
      return;
    }

    if (this.#waitingForPlayerInput && (input === 'CANCEL' || input === 'OK')) {
      this.#updateMessage();
      return;
    }

    if (input === 'CANCEL') {
      this.switchToMainBattleMenu();
      return;
    }
    if (input === 'OK') {
      if (this.#activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
        this.#handlePlayerChooseMainBattleOption();
        return;
      }
      if (this.#activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
        this.#handlePlayerChooseAttack();
        return;
      }
      return;
    }

    this.#updateSelectedBattleMenuOptionFromInput(input);
    this.#updateSelectedAttackFromInput(input);
    this.#moveMainBattleMenuCursor();
    this.#moveAttackMenuCursor();
  }

  /**
   * @param {string} message
   * @param {() => void} [callback]
   * @returns {void}
   */
  updateMessageNoInputRequired(message, callback) {
    this.#battleTextLine1.setText('').setAlpha(1);

    animateText(this.#scene, this.#battleTextLine1, message, {
      delay: 50,
      callback: () => {
        this.#waitingForPlayerInput = false;
        if (callback) {
          callback();
        }
      },
    });
  }

  /**
   * @param {string[]} messages
   * @param {() => void} [callback]
   * @returns {void}
   */
  updateMessagesWaitForInput(messages, callback) {
    this.#queuedMessages = messages;
    this.#queuedMessagesCallback = callback;

    this.#updateMessage();
  }

  #updateMessage() {
    this.#waitingForPlayerInput = false;
    this.#battleTextLine1.setText('').setAlpha(1);
    this.#userInputCursor.setAlpha(0);

    // check if all messages have been displayed from the queue and call the callback
    if (this.#queuedMessages.length === 0) {
      if (this.#queuedMessagesCallback) {
        this.#queuedMessagesCallback();
        this.#queuedMessagesCallback = undefined;
      }
      return;
    }

    // get first message from queue and animate message
    const messageToDisplay = this.#queuedMessages.shift();

    this.#queuedMessageAnimationPlaying = true;
    animateText(this.#scene, this.#battleTextLine1, messageToDisplay, {
      delay: 50,
      callback: () => {
        this.#userInputCursor.setAlpha(1);
        this.#waitingForPlayerInput = true;
        this.#queuedMessageAnimationPlaying = false;
      },
    });
  }

  #createMainBattleMenu() {
    this.#battleTextLine1 = this.#scene.add.text(70, 433, "", BATTLE_UI_TEXT_STYLE);
    this.#battleTextLine2 = this.#scene.add.text(70, 477, "", BATTLE_UI_TEXT_STYLE);

    this.#mainBattleMenuCursor = this.#scene.add
      .image(278, 436, UI_ASSET_KEYS.CURSOR, 0)
      .setOrigin(0.5)
      .setScale(.25);

    this.#mainBattleMenuContainer = this.#scene.add.container(45, 405, [
      this.#scene.add.text(0, 0, BATTLE_MENU_OPTIONS.HIT, BATTLE_UI_TEXT_STYLE).setOrigin(.5).setPosition(233, 31),
      this.#scene.add.text(0, 0, BATTLE_MENU_OPTIONS.FIGHT, BATTLE_UI_TEXT_STYLE).setOrigin(.5).setPosition(700, 31),
      this.#scene.add.text(0, 0, BATTLE_MENU_OPTIONS.SNACK, BATTLE_UI_TEXT_STYLE).setOrigin(.5).setPosition(233, 94),
      this.#scene.add.text(0, 0, BATTLE_MENU_OPTIONS.PRANK, BATTLE_UI_TEXT_STYLE).setOrigin(.5).setPosition(700, 94),
      this.#mainBattleMenuCursor,
    ]);

    this.hideMainBattleMenu();
  }

  #createAttackMenu() {
    this.#attackMenuCursor = this.#scene.add
      .image(233, 31, UI_ASSET_KEYS.CURSOR, 0)
      .setOrigin(0.5)
      .setScale(.25);

    this.#attackMenuScrollBar = this.#scene.add.image(0, 0, UI_ASSET_KEYS.SCROLL_BAR, 0).setOrigin(0).setScale(.25);

    const labelPositions = [
      { x: 233, y: 31 },
      { x: 700, y: 31 },
      { x: 233, y: 94 },
      { x: 700, y: 94 },
    ];

    for (let i = 0; i < 4; i += 1) {
      const label = this.#scene.add.text(0, 0, '', BATTLE_UI_TEXT_STYLE).setOrigin(.5);
      this.#visibleAttackLabels.push(label);
    }

    this.#attackMenuContainer = this.#scene.add.container(45, 405, [
      this.#visibleAttackLabels[0].setPosition(labelPositions[0].x, labelPositions[0].y),
      this.#visibleAttackLabels[1].setPosition(labelPositions[1].x, labelPositions[1].y),
      this.#visibleAttackLabels[2].setPosition(labelPositions[2].x, labelPositions[2].y),
      this.#visibleAttackLabels[3].setPosition(labelPositions[3].x, labelPositions[3].y),
      this.#attackMenuCursor,
      this.#scene.add.image(0, 0, UI_ASSET_KEYS.SCROLL_UP, 0).setOrigin(0).setScale(.25).setPosition(885, 9),
      this.#scene.add.image(0, 0, UI_ASSET_KEYS.SCROLL_DOWN, 0).setOrigin(0).setScale(.25).setPosition(885, 95),
      this.#attackMenuScrollBar.setPosition(885, 38),
    ]);

    this.#renderAttackMenu();
    this.hideAttackMenu();
  }

  #renderAttackMenu() {
    const attacks = this.#activePlayerGuy.attacks;
    const start = this.#visibleAttackStartIndex;
    for (let i = 0; i < 4; i += 1) {
      const attack = attacks[start + i];
      this.#visibleAttackLabels[i].setText(attack?.name || '');
    }

    // update scrollbar
    const totalAttacks = this.#activePlayerGuy.attacks.length;
    const rows = Math.ceil(totalAttacks / 2);
    if (rows <= 2) {
      this.#attackMenuScrollBar.setAlpha(0);
    } else {
      this.#attackMenuScrollBar.setAlpha(1);

      const visibleRowIndex = (this.#visibleAttackStartIndex || 0) / 2;
      const maxRowOffset = rows - 2;

      const upY = 37;
      const downY = 75;
      const fraction = Phaser.Math.Clamp(visibleRowIndex / maxRowOffset, 0, 1);

      const scrollY = Phaser.Math.Linear(upY, downY, fraction);
      this.#attackMenuScrollBar.setPosition(this.#attackMenuScrollBar.x, scrollY);
    }
  }

  #createTextWindow() {

    this.#textWindow = this.#scene.add.image(0, 0, UI_ASSET_KEYS.TEXT_WINDOW)
      .setOrigin(0).setScale(.25).setPosition(19, 379);

    this.#textWindow.setAlpha(0);
  }

  /**
  * @param {import('../_misc/direction.js').Direction} direction
  */
  #updateSelectedBattleMenuOptionFromInput(direction) {

    if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
      return;
    }

    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT) {
      switch (direction) {
        case DIRECTION.LEFT:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.HIT;
          return;
        case DIRECTION.DOWN:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.PRANK;
          return;
        case DIRECTION.RIGHT:
        case DIRECTION.UP:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.HIT) {
      switch (direction) {
        case DIRECTION.RIGHT:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
          return;
        case DIRECTION.DOWN:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SNACK;
          return;
        case DIRECTION.LEFT:
        case DIRECTION.UP:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.SNACK) {
      switch (direction) {
        case DIRECTION.RIGHT:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.PRANK;
          return;
        case DIRECTION.UP:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.HIT;
          return;
        case DIRECTION.LEFT:
        case DIRECTION.DOWN:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.PRANK) {
      switch (direction) {
        case DIRECTION.LEFT:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SNACK;
          return;
        case DIRECTION.UP:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
          return;
        case DIRECTION.RIGHT:
        case DIRECTION.DOWN:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }
    exhaustiveGuard(this.#selectedBattleMenuOption);
  }

  #moveMainBattleMenuCursor() {

    if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
      return;
    }

    switch (this.#selectedBattleMenuOption) {
      case BATTLE_MENU_OPTIONS.HIT:
        this.#mainBattleMenuCursor.setPosition(CURSOR_POSITIONS.UPPER_LEFT.x, CURSOR_POSITIONS.UPPER_LEFT.y);
        return;
      case BATTLE_MENU_OPTIONS.FIGHT:
        this.#mainBattleMenuCursor.setPosition(CURSOR_POSITIONS.UPPER_RIGHT.x, CURSOR_POSITIONS.UPPER_RIGHT.y);
        return;
      case BATTLE_MENU_OPTIONS.SNACK:
        this.#mainBattleMenuCursor.setPosition(CURSOR_POSITIONS.LOWER_LEFT.x, CURSOR_POSITIONS.LOWER_LEFT.y);
        return;
      case BATTLE_MENU_OPTIONS.PRANK:
        this.#mainBattleMenuCursor.setPosition(CURSOR_POSITIONS.LOWER_RIGHT.x, CURSOR_POSITIONS.LOWER_RIGHT.y);
        return;
      default:
        exhaustiveGuard(this.#selectedBattleMenuOption);
    }
  }

  #updateSelectedAttackFromInput(direction) {
    if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
      return;
    }

    const attacks = this.#activePlayerGuy.attacks;
    const totalAttacks = attacks.length;
    if (totalAttacks === 0) return;

    let nextIndex = this.#selectedAttackIndex ?? 0;

    switch (direction) {
      case DIRECTION.LEFT:
        if (nextIndex % 2 === 1) nextIndex -= 1;
        break;
      case DIRECTION.RIGHT:
        if (nextIndex % 2 === 0 && nextIndex + 1 < totalAttacks) nextIndex += 1;
        break;
      case DIRECTION.UP:
        if (nextIndex - 2 >= 0) nextIndex -= 2;
        break;
      case DIRECTION.DOWN:
        if (nextIndex + 2 < totalAttacks) nextIndex += 2;
        break;
      default:
        exhaustiveGuard(direction);
    }

    this.#selectedAttackIndex = nextIndex;
    this.#adjustAttackWindow();
    this.#renderAttackMenu();
  }

  #adjustAttackWindow() {
    const attacks = this.#activePlayerGuy.attacks;
    const totalAttacks = attacks.length;
    if (this.#selectedAttackIndex === undefined) return;

    if (this.#selectedAttackIndex < this.#visibleAttackStartIndex) {
      this.#visibleAttackStartIndex = this.#selectedAttackIndex - (this.#selectedAttackIndex % 2);
    }

    // For a 2-column grid, valid window starts are even numbers; compute max while preserving grid structure
    const maxStart = Math.max(0, Math.floor((totalAttacks - 1) / 2) * 2 - 2);
    const end = this.#visibleAttackStartIndex + 4;

    if (this.#selectedAttackIndex >= end) {
      this.#visibleAttackStartIndex = Math.min(
        maxStart,
        Math.max(0, this.#selectedAttackIndex - (this.#selectedAttackIndex % 2) - 2)
      );
    }
  }

  #moveAttackMenuCursor() {

    if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
      return;
    }

    const slot = (this.#selectedAttackIndex ?? this.#visibleAttackStartIndex) - this.#visibleAttackStartIndex;

    switch (Phaser.Math.Clamp(slot, 0, 3)) {
      case 0:
        this.#attackMenuCursor.setPosition(CURSOR_POSITIONS.UPPER_LEFT.x, CURSOR_POSITIONS.UPPER_LEFT.y);
        return;
      case 1:
        this.#attackMenuCursor.setPosition(CURSOR_POSITIONS.UPPER_RIGHT.x, CURSOR_POSITIONS.UPPER_RIGHT.y);
        return;
      case 2:
        this.#attackMenuCursor.setPosition(CURSOR_POSITIONS.LOWER_LEFT.x, CURSOR_POSITIONS.LOWER_LEFT.y);
        return;
      case 3:
        this.#attackMenuCursor.setPosition(CURSOR_POSITIONS.LOWER_RIGHT.x, CURSOR_POSITIONS.LOWER_RIGHT.y);
        return;
    }

  }

  switchToMainBattleMenu() {
    this.#waitingForPlayerInput = false;
    this.#userInputCursor.setAlpha(0);
    this.hideAttackMenu();
    this.showMainBattleMenu();
  }

  #handlePlayerChooseMainBattleOption() {
    this.hideMainBattleMenu();

    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT) {
      this.showAttackMenu();
      return;
    }

    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.SNACK) {
      this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_SNACK;
      this.#chosenBattleMenuOption = this.#selectedBattleMenuOption;
      return;
    }

    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.HIT) {
      this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_HIT;
      this.#chosenBattleMenuOption = this.#selectedBattleMenuOption;
      return;
    }

    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.PRANK) {
      this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_PRANK;
      this.#chosenBattleMenuOption = this.#selectedBattleMenuOption;
      return;
    }

    exhaustiveGuard(this.#selectedBattleMenuOption);
  }

  #handlePlayerChooseAttack() {
    this.#selectedAttackIndex ??= 0;
    this.#selectedAttackIndex = Math.min(this.#selectedAttackIndex, this.#activePlayerGuy.attacks.length - 1);
    this.#chosenBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
    this.hideAttackMenu();
  }

  #createPlayerInputCursor() {
    this.#userInputCursor = this.#scene.add.image(0, 0, UI_ASSET_KEYS.CURSOR).setAngle(90).setScale(.25).setAlpha(0).setPosition(940,490);
  }

}