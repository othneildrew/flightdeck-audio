import { useMemo } from 'react';
import type { Soundpack, SoundFile } from '../types/sound.types';

/**
 * Discovers soundpack folders and their audio files using Vite's import.meta.glob
 * Automatically scans public/soundpacks/ for all folders containing audio files
 */
export function useSoundpacks() {
  const soundpacks = useMemo(() => {
    // Use Vite's import.meta.glob to discover all audio files in soundpacks
    const soundFiles = import.meta.glob('/public/soundpacks/**/*.{mp3,wav,ogg,m4a}', {
      eager: true,
      as: 'url',
    });

    // Group files by soundpack folder
    const soundpackMap = new Map<string, SoundFile[]>();

    Object.entries(soundFiles).forEach(([path, url]) => {
      // Parse the path: /public/soundpacks/[pack-name]/[file-name].mp3
      const match = path.match(/\/public\/soundpacks\/([^/]+)\/([^/]+)$/);

      if (match) {
        const [, packName, fileName] = match;
        const fileNameWithoutExt = fileName.replace(/\.(mp3|wav|ogg|m4a)$/i, '');

        // Convert filename to display name: "my_sound_file" -> "My Sound File"
        const displayName = fileNameWithoutExt
          .split(/[-_]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        const soundFile: SoundFile = {
          id: `${packName}/${fileName}`,
          name: fileName,
          displayName,
          path: url as string,
          pack: packName,
        };

        if (!soundpackMap.has(packName)) {
          soundpackMap.set(packName, []);
        }
        soundpackMap.get(packName)!.push(soundFile);
      }
    });

    // Convert map to array of Soundpack objects
    const packs: Soundpack[] = Array.from(soundpackMap.entries()).map(([name, sounds]) => {
      // Convert pack name to display name
      const displayName = name
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        name,
        displayName,
        sounds: sounds.sort((a, b) => a.displayName.localeCompare(b.displayName)),
      };
    });

    // Sort soundpacks alphabetically
    return packs.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, []);

  return soundpacks;
}
