import type { GlobalControls } from '../types/sound.types';

interface ControlPanelProps {
  globalControls: GlobalControls;
  onStopAll: () => void;
  onTogglePauseAll: () => void;
  onToggleMuteAll: () => void;
  onVolumeChange: (volume: number) => void;
  onSpeedChange: (speed: number) => void;
}

export function ControlPanel({
  globalControls,
  onStopAll,
  onTogglePauseAll,
  onToggleMuteAll,
  onVolumeChange,
  onSpeedChange,
}: ControlPanelProps) {
  return (
    <div className="control-panel">
      <div className="control-buttons">
        <button
          className="control-button control-button-stop"
          onClick={onStopAll}
          aria-label="Stop all sounds"
        >
          ⏹ Stop All
        </button>
        <button
          className="control-button control-button-pause"
          onClick={onTogglePauseAll}
          aria-label={globalControls.isPaused ? 'Resume all sounds' : 'Pause all sounds'}
          aria-pressed={globalControls.isPaused}
        >
          {globalControls.isPaused ? '▶ Resume All' : '⏸ Pause All'}
        </button>
        <button
          className="control-button control-button-mute"
          onClick={onToggleMuteAll}
          aria-label={globalControls.isMuted ? 'Unmute all sounds' : 'Mute all sounds'}
          aria-pressed={globalControls.isMuted}
        >
          {globalControls.isMuted ? '🔊 Unmute All' : '🔇 Mute All'}
        </button>
      </div>

      <div className="control-sliders">
        <div className="slider-group">
          <label htmlFor="volume-slider">
            Volume: {Math.round(globalControls.volume * 100)}%
          </label>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="100"
            value={globalControls.volume * 100}
            onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
            className="slider"
            aria-label="Master volume"
          />
        </div>

        <div className="slider-group">
          <label htmlFor="speed-slider">
            Speed: {globalControls.speed.toFixed(2)}x
          </label>
          <input
            id="speed-slider"
            type="range"
            min="50"
            max="200"
            step="10"
            value={globalControls.speed * 100}
            onChange={(e) => onSpeedChange(Number(e.target.value) / 100)}
            className="slider"
            aria-label="Playback speed"
          />
        </div>
      </div>
    </div>
  );
}
