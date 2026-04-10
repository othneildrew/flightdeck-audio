/**
 * Represents an audio file from a soundpack
 */
export interface SoundFile {
  id: string;
  name: string;
  displayName: string;
  path: string;
  pack: string;
}

/**
 * Tracks the playback state of a single sound
 */
export interface SoundState {
  id: string;
  isPlaying: boolean;
  isPaused: boolean;
  isLooping: boolean;
  progress: number; // 0 to 1
  volume: number; // 0 to 1
}

/**
 * Represents a collection of sounds from a folder
 */
export interface Soundpack {
  name: string;
  displayName: string;
  sounds: SoundFile[];
}

/**
 * Global audio controls that affect all sounds
 */
export interface GlobalControls {
  volume: number; // 0 to 1
  speed: number; // 0.5 to 2.0
  isMuted: boolean;
  isPaused: boolean;
}

/**
 * Overall state managed by useSoundManager hook
 */
export interface SoundManagerState {
  soundStates: Map<string, SoundState>;
  globalControls: GlobalControls;
  isLoading: boolean;
  error: string | null;
}
