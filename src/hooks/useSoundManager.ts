import { useState, useEffect, useCallback, useRef } from 'react';
import { sound } from '@pixi/sound';
import type { SoundFile, SoundState, GlobalControls } from '../types/sound.types';

/**
 * Manages sound playback using PixiJS Sound library
 * Handles loading, playing, looping, progress tracking, and global controls
 */
export function useSoundManager(sounds: SoundFile[]) {
  const [soundStates, setSoundStates] = useState<Map<string, SoundState>>(new Map());
  const [globalControls, setGlobalControls] = useState<GlobalControls>({
    volume: 1.0,
    speed: 1.0,
    isMuted: false,
    isPaused: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const animationFrameRef = useRef<number>();
  const soundInstancesRef = useRef<Map<string, any>>(new Map());

  // Initialize PixiJS Sound
  useEffect(() => {
    sound.volumeAll = globalControls.volume;
    return () => {
      // Cleanup all sounds on unmount
      sound.stopAll();
      sound.removeAll();
    };
  }, []);

  // Load sounds from soundpack
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Stop all current sounds
    sound.stopAll();
    sound.removeAll();
    soundInstancesRef.current.clear();

    // Initialize sound states
    const initialStates = new Map<string, SoundState>();
    sounds.forEach(soundFile => {
      initialStates.set(soundFile.id, {
        id: soundFile.id,
        isPlaying: false,
        isPaused: false,
        isLooping: false,
        progress: 0,
        volume: 1.0,
      });

      // Add sound to library
      try {
        sound.add(soundFile.id, {
          url: soundFile.path,
          preload: true,
        });
      } catch (err) {
        console.error(`Failed to load sound: ${soundFile.id}`, err);
        setError(`Failed to load sound: ${soundFile.displayName}`);
      }
    });

    setSoundStates(initialStates);
    setIsLoading(false);

    return () => {
      // Cleanup when sounds change
      sound.stopAll();
    };
  }, [sounds]);

  // Progress tracking loop
  useEffect(() => {
    const updateProgress = () => {
      setSoundStates(prevStates => {
        const newStates = new Map(prevStates);
        let hasPlayingSounds = false;

        soundInstancesRef.current.forEach((instance, id) => {
          if (instance && !instance.paused) {
            const state = newStates.get(id);
            if (state) {
              newStates.set(id, {
                ...state,
                progress: instance.progress || 0,
              });
              hasPlayingSounds = true;
            }
          }
        });

        return newStates;
      });

      // Continue animation frame if there are playing sounds
      if (soundInstancesRef.current.size > 0) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    if (soundInstancesRef.current.size > 0) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [soundStates]);

  // Play or toggle a sound
  const playSound = useCallback((soundId: string) => {
    const currentState = soundStates.get(soundId);
    if (!currentState) return;

    // If already playing, stop it
    if (currentState.isPlaying) {
      const instance = soundInstancesRef.current.get(soundId);
      if (instance) {
        instance.stop();
        soundInstancesRef.current.delete(soundId);
      }

      setSoundStates(prev => {
        const newStates = new Map(prev);
        newStates.set(soundId, {
          ...currentState,
          isPlaying: false,
          isPaused: false,
          progress: 0,
        });
        return newStates;
      });
      return;
    }

    // Play the sound
    try {
      const instance = sound.play(soundId, {
        loop: currentState.isLooping,
        singleInstance: true,
        volume: currentState.volume * globalControls.volume,
        speed: globalControls.speed,
        complete: () => {
          soundInstancesRef.current.delete(soundId);
          setSoundStates(prev => {
            const newStates = new Map(prev);
            const state = newStates.get(soundId);
            if (state) {
              newStates.set(soundId, {
                ...state,
                isPlaying: false,
                isPaused: false,
                progress: 0,
              });
            }
            return newStates;
          });
        },
      });

      soundInstancesRef.current.set(soundId, instance);

      setSoundStates(prev => {
        const newStates = new Map(prev);
        newStates.set(soundId, {
          ...currentState,
          isPlaying: true,
          isPaused: false,
        });
        return newStates;
      });
    } catch (err) {
      console.error(`Failed to play sound: ${soundId}`, err);
      setError(`Failed to play sound`);
    }
  }, [soundStates, globalControls]);

  // Toggle loop mode for a sound
  const toggleLoop = useCallback((soundId: string) => {
    setSoundStates(prev => {
      const newStates = new Map(prev);
      const state = newStates.get(soundId);
      if (state) {
        const newLoopState = !state.isLooping;
        newStates.set(soundId, {
          ...state,
          isLooping: newLoopState,
        });

        // If currently playing, update the instance
        const instance = soundInstancesRef.current.get(soundId);
        if (instance) {
          instance.loop = newLoopState;
        }
      }
      return newStates;
    });
  }, []);

  // Stop all sounds
  const stopAll = useCallback(() => {
    sound.stopAll();
    soundInstancesRef.current.clear();

    setSoundStates(prev => {
      const newStates = new Map(prev);
      newStates.forEach((state, id) => {
        newStates.set(id, {
          ...state,
          isPlaying: false,
          isPaused: false,
          progress: 0,
        });
      });
      return newStates;
    });
  }, []);

  // Pause/Resume all sounds
  const togglePauseAll = useCallback(() => {
    sound.togglePauseAll();

    setGlobalControls(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));

    setSoundStates(prev => {
      const newStates = new Map(prev);
      const newPauseState = !globalControls.isPaused;

      newStates.forEach((state, id) => {
        if (state.isPlaying) {
          newStates.set(id, {
            ...state,
            isPaused: newPauseState,
          });
        }
      });
      return newStates;
    });
  }, [globalControls.isPaused]);

  // Mute/Unmute all sounds
  const toggleMuteAll = useCallback(() => {
    sound.toggleMuteAll();

    setGlobalControls(prev => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  }, []);

  // Set master volume
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    sound.volumeAll = clampedVolume;

    setGlobalControls(prev => ({
      ...prev,
      volume: clampedVolume,
    }));

    // Update all playing instances
    soundInstancesRef.current.forEach((instance, id) => {
      const state = soundStates.get(id);
      if (instance && state) {
        instance.volume = state.volume * clampedVolume;
      }
    });
  }, [soundStates]);

  // Set playback speed
  const setSpeed = useCallback((speed: number) => {
    const clampedSpeed = Math.max(0.5, Math.min(2.0, speed));

    setGlobalControls(prev => ({
      ...prev,
      speed: clampedSpeed,
    }));

    // Update all playing instances
    soundInstancesRef.current.forEach(instance => {
      if (instance) {
        instance.speed = clampedSpeed;
      }
    });
  }, []);

  return {
    soundStates,
    globalControls,
    isLoading,
    error,
    playSound,
    toggleLoop,
    stopAll,
    togglePauseAll,
    toggleMuteAll,
    setVolume,
    setSpeed,
  };
}
