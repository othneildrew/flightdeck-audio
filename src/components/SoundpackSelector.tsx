import type { Soundpack } from '../types/sound.types';

interface SoundpackSelectorProps {
  soundpacks: Soundpack[];
  selectedPack: string | null;
  onSelectPack: (packName: string) => void;
}

export function SoundpackSelector({
  soundpacks,
  selectedPack,
  onSelectPack,
}: SoundpackSelectorProps) {
  if (soundpacks.length === 0) {
    return (
      <div className="soundpack-selector">
        <p className="no-soundpacks">
          No soundpacks found. Add audio files to <code>public/soundpacks/[folder-name]/</code>
        </p>
      </div>
    );
  }

  return (
    <div className="soundpack-selector">
      <select
        id="soundpack-select"
        value={selectedPack || ''}
        onChange={(e) => onSelectPack(e.target.value)}
        className="soundpack-dropdown"
        aria-label="Select soundpack"
      >
        {soundpacks.map((pack) => (
          <option key={pack.name} value={pack.name}>
            {pack.displayName} ({pack.sounds.length} sounds)
          </option>
        ))}
      </select>
    </div>
  );
}
