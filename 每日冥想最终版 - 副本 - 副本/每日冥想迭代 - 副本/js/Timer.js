class Timer {
  constructor() {
    this.duration = 0;
    this.remaining = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.interval = null;
    this.onTickCallback = null;
    this.onCompleteCallback = null;
  }

  start(minutes) {
    this.duration = minutes * 60;
    this.remaining = this.duration;
    this.isRunning = true;
    this.isPaused = false;

    if (this.onTickCallback) {
      this.onTickCallback(this.remaining, this.duration);
    }

    this.interval = setInterval(() => {
      if (this.isPaused) return;

      this.remaining--;

      if (this.onTickCallback) {
        this.onTickCallback(this.remaining, this.duration);
      }

      if (this.remaining <= 0) {
        this.stop();
        if (this.onCompleteCallback) {
          this.onCompleteCallback();
        }
      }
    }, 1000);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  getRemaining() {
    return this.remaining;
  }

  getProgress() {
    if (this.duration === 0) return 0;
    return (this.duration - this.remaining) / this.duration;
  }

  static formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  onTick(callback) {
    this.onTickCallback = callback;
  }

  onComplete(callback) {
    this.onCompleteCallback = callback;
  }
}
