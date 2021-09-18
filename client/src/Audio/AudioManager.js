import { useMemo } from 'react';
import cardSound from './card.mp3';
import cardSound2 from './card2.mp3';
import handSound from './shuffling.mp3';

const SoundManager = {
	playCardSound: () => {
		new Audio(cardSound2).play();
	},

	playHandSound: () => {
		new Audio(handSound).play();
	}
};

export default SoundManager;