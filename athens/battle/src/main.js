import Phaser from './lib/phaser.js';
import { SCENE_KEYS } from './scenes/scene-keys.js';
import { PreloadScene } from './scenes/preload-scene.js';
import { BattleScene } from './scenes/battle-scene.js';
import { IntroScene } from './scenes/intro-scene.js';
import { OutroScene } from './scenes/outro-scene.js';
import { CreditsScene } from './scenes/credits-scene.js';

const game = new Phaser.Game({
	type: Phaser.CANVAS,
  	pixelArt: false,
	scale: {
    	parent: 'game-container',
    	width: 1024,
    	height: 576,
    	mode: Phaser.Scale.FIT,
    	autoCenter: Phaser.Scale.CENTER_BOTH,
	},
	backgroundColor: '#5974c5',
});

game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene);
game.scene.add(SCENE_KEYS.BATTLE_SCENE, BattleScene);
game.scene.add(SCENE_KEYS.INTRO_SCENE, IntroScene);
game.scene.add(SCENE_KEYS.OUTRO_SCENE, OutroScene);
game.scene.add(SCENE_KEYS.CREDITS_SCENE, CreditsScene);
game.scene.start(SCENE_KEYS.PRELOAD_SCENE);