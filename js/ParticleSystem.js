class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mode = 'light';
    this.isRunning = false;
    this.animationId = null;
    this.intensity = 1;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setMode(mode) {
    this.mode = mode;
    this.particles = [];
    this.initParticles();
  }

  setIntensity(level) {
    this.intensity = level;
  }

  initParticles() {
    const count = this.getParticleCount();
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  getParticleCount() {
    switch (this.mode) {
      case 'rain': return 150;
      case 'smoke': return 80;
      case 'glow': return 60;
      default: return 100;
    }
  }

  createParticle() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    switch (this.mode) {
      case 'rain':
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          length: Math.random() * 20 + 10,
          speed: Math.random() * 5 + 8,
          opacity: Math.random() * 0.3 + 0.1
        };
      case 'smoke':
        return {
          x: Math.random() * w,
          y: h + Math.random() * 100,
          radius: Math.random() * 30 + 10,
          speed: Math.random() * 0.5 + 0.2,
          opacity: Math.random() * 0.1 + 0.02,
          drift: (Math.random() - 0.5) * 0.5
        };
      case 'glow':
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          radius: Math.random() * 3 + 1,
          speed: Math.random() * 0.3 + 0.1,
          opacity: Math.random() * 0.6 + 0.2,
          angle: Math.random() * Math.PI * 2,
          distance: Math.random() * 100 + 50
        };
      default:
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          radius: Math.random() * 2 + 0.5,
          speed: Math.random() * 0.5 + 0.2,
          opacity: Math.random() * 0.4 + 0.1,
          angle: Math.random() * Math.PI * 2
        };
    }
  }

  update() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.particles.forEach(p => {
      switch (this.mode) {
        case 'rain':
          p.y += p.speed * this.intensity;
          if (p.y > h) {
            p.y = -p.length;
            p.x = Math.random() * w;
          }
          break;
        case 'smoke':
          p.y -= p.speed * this.intensity;
          p.x += p.drift;
          p.opacity -= 0.0003;
          if (p.y < -p.radius * 2 || p.opacity <= 0) {
            p.y = h + p.radius;
            p.x = Math.random() * w;
            p.opacity = Math.random() * 0.1 + 0.02;
          }
          break;
        case 'glow':
          p.angle += p.speed * 0.01 * this.intensity;
          p.x += Math.cos(p.angle) * p.speed;
          p.y += Math.sin(p.angle) * p.speed;
          if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
            p.x = Math.random() * w;
            p.y = Math.random() * h;
            p.angle = Math.random() * Math.PI * 2;
          }
          break;
        default:
          p.y -= p.speed * this.intensity;
          p.x += Math.sin(p.y * 0.01) * 0.3;
          if (p.y < -10) {
            p.y = h + 10;
            p.x = Math.random() * w;
          }
      }
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(p => {
      this.ctx.beginPath();

      switch (this.mode) {
        case 'rain':
          this.ctx.strokeStyle = `rgba(200, 220, 255, ${p.opacity})`;
          this.ctx.lineWidth = 1;
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p.x, p.y + p.length);
          this.ctx.stroke();
          break;
        case 'smoke':
          this.ctx.fillStyle = `rgba(200, 200, 220, ${p.opacity})`;
          this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          this.ctx.fill();
          break;
        case 'glow':
          this.ctx.fillStyle = `rgba(255, 220, 150, ${p.opacity})`;
          this.ctx.shadowBlur = 10;
          this.ctx.shadowColor = `rgba(255, 220, 150, ${p.opacity * 0.5})`;
          this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.shadowBlur = 0;
          break;
        default:
          this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          this.ctx.fill();
      }
    });
  }

  animate() {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    if (this.particles.length === 0) {
      this.initParticles();
    }
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
