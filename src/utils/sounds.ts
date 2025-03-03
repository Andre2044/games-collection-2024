/**
 * Sound utility functions for game audio
 */

// Sound volumes 
const VOLUMES = {
  ambient: 0.2,
  effect: 0.4,
  ui: 0.3
};

// Cache for audio objects to prevent excessive creation
const audioCache = new Map<string, HTMLAudioElement>();

/**
 * Play a sound effect with error handling
 * @param soundPath Path to the sound file
 * @param volume Volume level (0-1)
 * @param loop Whether to loop the sound
 * @returns The audio element for further control
 */
export const playSound = (
  soundPath: string, 
  volume: number = VOLUMES.effect,
  loop: boolean = false
): HTMLAudioElement | null => {
  try {
    // Try to use cached audio if available
    let audio = audioCache.get(soundPath);
    
    if (!audio) {
      audio = new Audio(soundPath);
      audioCache.set(soundPath, audio);
    }
    
    // Reset the audio if it was already played
    if (audio.currentTime > 0) {
      audio.currentTime = 0;
    }
    
    audio.volume = volume;
    audio.loop = loop;
    
    // Play with error handling
    audio.play().catch(error => {
      console.warn(`Failed to play sound ${soundPath}:`, error);
    });
    
    return audio;
  } catch (error) {
    console.warn(`Error with sound ${soundPath}:`, error);
    return null;
  }
};

/**
 * Play card dealing/flipping sound
 */
export const playCardSound = () => {
  return playSound('/sounds/card-flip.mp3', VOLUMES.effect);
};

/**
 * Play chip movement sound
 */
export const playChipSound = () => {
  return playSound('/sounds/chip-sound.mp3', VOLUMES.effect);
};

/**
 * Play win sound
 */
export const playWinSound = () => {
  return playSound('/sounds/win.mp3', VOLUMES.effect);
};

/**
 * Play lose sound
 */
export const playLoseSound = () => {
  return playSound('/sounds/lose.mp3', VOLUMES.effect);
};

/**
 * Play push/tie sound
 */
export const playPushSound = () => {
  return playSound('/sounds/push.mp3', VOLUMES.effect);
};

/**
 * Play cash register sound (for loans/payouts)
 */
export const playCashSound = () => {
  return playSound('/sounds/cash-register.mp3', VOLUMES.effect);
};

/**
 * Play ambient casino sounds
 * @returns Audio element that can be stopped later
 */
export const playAmbientSound = (): HTMLAudioElement | null => {
  return playSound('/sounds/table-ambience.mp3', VOLUMES.ambient, true);
};

/**
 * Stop a sound that is currently playing
 */
export const stopSound = (audio: HTMLAudioElement | null) => {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
};

/**
 * Pause a sound that is currently playing
 */
export const pauseSound = (audio: HTMLAudioElement | null) => {
  if (audio) {
    audio.pause();
  }
};

/**
 * Resume a paused sound
 */
export const resumeSound = (audio: HTMLAudioElement | null) => {
  if (audio) {
    audio.play().catch(error => {
      console.warn('Failed to resume sound:', error);
    });
  }
};

/**
 * Mute all sounds in the cache
 */
export const muteAllSounds = () => {
  audioCache.forEach(audio => {
    audio.muted = true;
  });
};

/**
 * Unmute all sounds in the cache
 */
export const unmuteAllSounds = () => {
  audioCache.forEach(audio => {
    audio.muted = false;
  });
}; 