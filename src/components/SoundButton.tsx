import type { SoundState } from '../types/sound.types';

interface SoundButtonProps {
  soundId: string;
  displayName: string;
  soundState: SoundState;
  onPlay: (soundId: string) => void;
  onToggleLoop: (soundId: string) => void;
}

export function SoundButton({
  soundId,
  displayName,
  soundState,
  onPlay,
  onToggleLoop,
}: SoundButtonProps) {
  const handleClick = () => {
    onPlay(soundId);
  };

  const handleLoopToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLoop(soundId);
  };

  return (
    <div className="sound-button">
      <button
        className="sound-button-main"
        onClick={handleClick}
        aria-label={`Play ${displayName}`}
        aria-pressed={soundState.isPlaying}
      >
        <div className="sound-button-content">
          <span className="sound-name">{displayName}</span>
          <div className="sound-icons">
            {soundState.isPlaying ? (
              <span className="icon icon-playing">⏸</span>
            ) : (
              <span className="icon icon-play">▶</span>
            )}
          </div>
        </div>
        <div
          className="progress-bar"
          style={{ width: `${soundState.progress * 100}%` }}
        />
      </button>
      <button
        className={`loop-toggle ${soundState.isLooping ? 'active' : ''}`}
        onClick={handleLoopToggle}
        aria-label={`Toggle loop for ${displayName}`}
        aria-pressed={soundState.isLooping}
        title={soundState.isLooping ? 'Looping enabled' : 'Loop disabled'}
      >
        <span className="loop-icon">🔁</span>
      </button>
    </div>
  );
}
