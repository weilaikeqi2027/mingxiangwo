class HealthCharts {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;
  }

  setupCanvas(width, height) {
    if (!this.canvas) return;
    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    this.ctx.scale(this.dpr, this.dpr);
  }

  drawLineChart(data, labels, options = {}) {
    if (!this.ctx) return;
    const { width = 320, height = 180, color = '#4A6FA5', fillColor = 'rgba(74, 111, 165, 0.15)', title = '' } = options;
    this.setupCanvas(width, height);

    const ctx = this.ctx;
    const padding = { top: 30, right: 16, bottom: 30, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    if (title) {
      ctx.fillStyle = '#e0e0e0';
      ctx.font = '12px "Noto Sans SC", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(title, padding.left, 18);
    }

    const maxVal = Math.max(...data, 1) * 1.1;
    const minVal = 0;

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#888';
    ctx.font = '10px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = Math.round(maxVal - (maxVal / 4) * i);
      const y = padding.top + (chartH / 4) * i + 3;
      ctx.fillText(val.toString(), padding.left - 6, y);
    }

    if (data.length > 1) {
      const points = data.map((val, i) => ({
        x: padding.left + (chartW / (data.length - 1)) * i,
        y: padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH
      }));

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const cp1x = (points[i - 1].x + points[i].x) / 2;
        const cp1y = points[i - 1].y;
        const cp2x = (points[i - 1].x + points[i].x) / 2;
        const cp2y = points[i].y;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i].x, points[i].y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
      ctx.lineTo(points[0].x, padding.top + chartH);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();

      points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    ctx.fillStyle = '#888';
    ctx.font = '10px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      const x = padding.left + (chartW / Math.max(labels.length - 1, 1)) * i;
      ctx.fillText(label, x, padding.top + chartH + 16);
    });
  }

  drawBarChart(data, labels, options = {}) {
    if (!this.ctx) return;
    const { width = 320, height = 180, color = '#5B8C85', title = '' } = options;
    this.setupCanvas(width, height);

    const ctx = this.ctx;
    const padding = { top: 30, right: 16, bottom: 30, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    if (title) {
      ctx.fillStyle = '#e0e0e0';
      ctx.font = '12px "Noto Sans SC", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(title, padding.left, 18);
    }

    const maxVal = Math.max(...data, 1) * 1.1;

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#888';
    ctx.font = '10px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = Math.round(maxVal - (maxVal / 4) * i);
      const y = padding.top + (chartH / 4) * i + 3;
      ctx.fillText(val.toString(), padding.left - 6, y);
    }

    const barWidth = Math.min((chartW / data.length) * 0.6, 28);
    const gap = (chartW - barWidth * data.length) / (data.length + 1);

    data.forEach((val, i) => {
      const barH = (val / maxVal) * chartH;
      const x = padding.left + gap + i * (barWidth + gap);
      const y = padding.top + chartH - barH;

      const gradient = ctx.createLinearGradient(0, y, 0, y + barH);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color + '66');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, 4);
      ctx.fill();

      ctx.fillStyle = '#e0e0e0';
      ctx.font = '10px "Noto Sans SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(val.toString(), x + barWidth / 2, y - 4);
    });

    ctx.fillStyle = '#888';
    ctx.font = '10px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      const x = padding.left + gap + i * (barWidth + gap) + barWidth / 2;
      ctx.fillText(label, x, padding.top + chartH + 16);
    });
  }

  drawComparisonChart(healthData, meditationData, labels, options = {}) {
    if (!this.ctx) return;
    const { width = 320, height = 200, title = '' } = options;
    this.setupCanvas(width, height);

    const ctx = this.ctx;
    const padding = { top: 30, right: 16, bottom: 30, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    if (title) {
      ctx.fillStyle = '#e0e0e0';
      ctx.font = '12px "Noto Sans SC", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(title, padding.left, 18);
    }

    const maxVal = Math.max(...healthData, ...meditationData, 1) * 1.1;

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#888';
    ctx.font = '10px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = Math.round(maxVal - (maxVal / 4) * i);
      const y = padding.top + (chartH / 4) * i + 3;
      ctx.fillText(val.toString(), padding.left - 6, y);
    }

    const groupWidth = chartW / healthData.length;
    const barWidth = Math.min(groupWidth * 0.35, 20);

    healthData.forEach((val, i) => {
      const groupX = padding.left + i * groupWidth + groupWidth / 2;

      const h1 = (val / maxVal) * chartH;
      const y1 = padding.top + chartH - h1;
      ctx.fillStyle = '#4A6FA5';
      ctx.beginPath();
      ctx.roundRect(groupX - barWidth - 2, y1, barWidth, h1, 3);
      ctx.fill();

      const mVal = meditationData[i] || 0;
      const h2 = (mVal / maxVal) * chartH;
      const y2 = padding.top + chartH - h2;
      ctx.fillStyle = '#8B7DA8';
      ctx.beginPath();
      ctx.roundRect(groupX + 2, y2, barWidth, h2, 3);
      ctx.fill();
    });

    ctx.fillStyle = '#888';
    ctx.font = '10px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      const x = padding.left + i * groupWidth + groupWidth / 2;
      ctx.fillText(label, x, padding.top + chartH + 16);
    });

    ctx.fillStyle = '#4A6FA5';
    ctx.beginPath();
    ctx.arc(width - 80, 14, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e0e0e0';
    ctx.font = '10px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('步数', width - 72, 18);

    ctx.fillStyle = '#8B7DA8';
    ctx.beginPath();
    ctx.arc(width - 30, 14, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e0e0e0';
    ctx.fillText('冥想', width - 22, 18);
  }
}
