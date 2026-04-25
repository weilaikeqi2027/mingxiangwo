class VisualTheme {
  constructor() {
    this.themes = {
      guqin: {
        primary: '#4A6FA5',
        secondary: '#6B8CBB',
        bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        particle: 'light'
      },
      yushan: {
        primary: '#5B8C85',
        secondary: '#7DA89E',
        bg: 'linear-gradient(135deg, #1a2e2a 0%, #162e25 50%, #0f2e20 100%)',
        particle: 'rain'
      },
      shuinian: {
        primary: '#8B7DA8',
        secondary: '#A89BC4',
        bg: 'linear-gradient(135deg, #1a1a2e 0%, #1e1630 50%, #0f0f2e 100%)',
        particle: 'smoke'
      },
      yinchang: {
        primary: '#C9A227',
        secondary: '#D4B84A',
        bg: 'linear-gradient(135deg, #2e2515 0%, #2e2010 50%, #2e1a0f 100%)',
        particle: 'glow'
      }
    };
    this.currentTheme = 'guqin';
  }

  setTheme(type) {
    const theme = this.themes[type];
    if (!theme) return;

    this.currentTheme = type;
    document.body.style.background = theme.bg;

    const miniProgress = document.getElementById('miniProgress');
    if (miniProgress) {
      miniProgress.style.background = `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`;
    }

    const cards = document.querySelectorAll('.audio-card');
    cards.forEach(card => {
      card.classList.remove('active');
      if (card.dataset.type === type) {
        card.classList.add('active');
      }
    });
  }

  getTheme(type) {
    return this.themes[type] || this.themes.guqin;
  }

  getCurrentTheme() {
    return this.getTheme(this.currentTheme);
  }
}
