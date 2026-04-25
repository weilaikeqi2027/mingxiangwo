class BreathingGuide {
  constructor() {
    this.rings = document.querySelectorAll('.breathing-ring');
    this.core = document.querySelector('.breathing-core');
    this.text = document.getElementById('breathingText');
    this.isRunning = false;
    this.phase = 0;
    this.timer = null;
    this.startTime = 0;
    this.cycleDuration = 12000;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = Date.now();
    this.update();
  }

  stop() {
    this.isRunning = false;
    if (this.timer) {
      cancelAnimationFrame(this.timer);
      this.timer = null;
    }
    this.reset();
  }

  reset() {
    this.rings.forEach(ring => {
      ring.style.transform = 'translate(-50%, -50%) scale(1)';
      ring.style.opacity = '1';
    });
    if (this.core) {
      this.core.style.transform = 'translate(-50%, -50%) scale(1)';
    }
    if (this.text) {
      this.text.textContent = '吸气';
    }
  }

  update() {
    if (!this.isRunning) return;

    const elapsed = (Date.now() - this.startTime) % this.cycleDuration;
    const progress = elapsed / this.cycleDuration;

    let scale, opacity, text;

    if (progress < 0.333) {
      const p = progress / 0.333;
      scale = 0.7 + p * 0.5;
      opacity = 0.5 + p * 0.5;
      text = '吸气';
    } else if (progress < 0.5) {
      scale = 1.2;
      opacity = 1;
      text = '屏息';
    } else if (progress < 0.833) {
      const p = (progress - 0.5) / 0.333;
      scale = 1.2 - p * 0.5;
      opacity = 1 - p * 0.5;
      text = '呼气';
    } else {
      scale = 0.7;
      opacity = 0.5;
      text = '屏息';
    }

    this.rings.forEach((ring, i) => {
      const delay = i * 0.15;
      const ringScale = scale * (1 - delay);
      const ringOpacity = Math.max(0, opacity - delay);
      ring.style.transform = `translate(-50%, -50%) scale(${ringScale})`;
      ring.style.opacity = ringOpacity;
    });

    if (this.core) {
      this.core.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }

    if (this.text && this.text.textContent !== text) {
      this.text.textContent = text;
    }

    this.timer = requestAnimationFrame(() => this.update());
  }
}
