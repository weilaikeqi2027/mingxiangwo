class AudioEngine {
  constructor() {
    this.tracks = [
      { type: 'guqin', name: '古琴', file: './audio/guqin.mp3', icon: '🧘' },
      { type: 'yushan', name: '雨声', file: './audio/yushan.mp3', icon: '🌸' },
      { type: 'shuinian', name: '禅音', file: './audio/shuinian.mp3', icon: '🌙' },
      { type: 'yinchang', name: '吟唱', file: './audio/yinchang.mp3', icon: '🙏' }
    ];
    this.currentTrack = null;
    this.currentAudio = null;
    this.volume = 0.7;
    this.loopMode = 'single';
    this.isPlaying = false;
    this.onEndedCallback = null;
    this.onTimeUpdateCallback = null;
    this.onErrorCallback = null;
  }

  async init() {
    for (const track of this.tracks) {
      track.audio = new Audio(track.file);
      track.audio.volume = this.volume;
      track.audio.loop = this.loopMode === 'single';
      track.audio.preload = 'metadata';

      track.audio.addEventListener('ended', () => {
        if (this.loopMode === 'list') {
          this.next();
        } else if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      });

      track.audio.addEventListener('timeupdate', () => {
        if (this.onTimeUpdateCallback && track.audio === this.currentAudio) {
          this.onTimeUpdateCallback({
            currentTime: track.audio.currentTime,
            duration: track.audio.duration || 0,
            progress: track.audio.duration ? track.audio.currentTime / track.audio.duration : 0
          });
        }
      });

      track.audio.addEventListener('error', () => {
        if (this.onErrorCallback) {
          this.onErrorCallback(track.name);
        }
      });
    }
  }

  play(type) {
    const track = this.tracks.find(t => t.type === type);
    if (!track || !track.audio) return false;

    this.stop();
    this.currentTrack = track;
    this.currentAudio = track.audio;
    this.currentAudio.volume = this.volume;
    this.currentAudio.loop = this.loopMode === 'single';

    const playPromise = this.currentAudio.play();
    if (playPromise) {
      playPromise.then(() => {
        this.isPlaying = true;
      }).catch(() => {
        this.isPlaying = false;
        if (this.onErrorCallback) {
          this.onErrorCallback(track.name);
        }
      });
    }
    return true;
  }

  pause() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.isPlaying = false;
    }
  }

  resume() {
    if (this.currentAudio) {
      this.currentAudio.play().then(() => {
        this.isPlaying = true;
      }).catch(() => {
        this.isPlaying = false;
      });
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.isPlaying = false;
    }
  }

  next() {
    if (!this.currentTrack) {
      this.play(this.tracks[0].type);
      return;
    }
    const index = this.tracks.findIndex(t => t.type === this.currentTrack.type);
    const nextIndex = (index + 1) % this.tracks.length;
    this.play(this.tracks[nextIndex].type);
  }

  prev() {
    if (!this.currentTrack) {
      this.play(this.tracks[0].type);
      return;
    }
    const index = this.tracks.findIndex(t => t.type === this.currentTrack.type);
    const prevIndex = (index - 1 + this.tracks.length) % this.tracks.length;
    this.play(this.tracks[prevIndex].type);
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      if (this.currentAudio && this.currentAudio.currentTime > 0) {
        this.resume();
      } else if (this.currentTrack) {
        this.play(this.currentTrack.type);
      } else {
        this.play(this.tracks[0].type);
      }
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.currentAudio) {
      this.currentAudio.volume = this.volume;
    }
    this.tracks.forEach(track => {
      if (track.audio) track.audio.volume = this.volume;
    });
  }

  setLoop(mode) {
    this.loopMode = mode;
    this.tracks.forEach(track => {
      if (track.audio) track.audio.loop = mode === 'single';
    });
  }

  getCurrentTrack() {
    return this.currentTrack;
  }

  getTracks() {
    return this.tracks;
  }

  onEnded(callback) {
    this.onEndedCallback = callback;
  }

  onTimeUpdate(callback) {
    this.onTimeUpdateCallback = callback;
  }

  onError(callback) {
    this.onErrorCallback = callback;
  }
}
