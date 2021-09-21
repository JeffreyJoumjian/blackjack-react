import cardSound from './card.mp3';
import handSound from './shuffling.mp3';
import winSound from './win.wav';

const SoundManager = {
	playCardSound: () => {
		new Audio(cardSound).play();
	},

	playHandSound: () => {
		new Audio(handSound).play();
	},
	playWinSound: () => {
		new Audio(winSound).play();
	}
};

export default SoundManager;