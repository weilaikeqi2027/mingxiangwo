class MeditationApp {
  constructor() {
    this.audioEngine = new AudioEngine();
    this.visualTheme = new VisualTheme();
    this.particleSystem = new ParticleSystem('particle-canvas');
    this.breathingGuide = new BreathingGuide();
    this.timer = new Timer();
    this.gestureController = new GestureController(document.body);
    this.stats = new Stats();
    this.ui = new UI();

    this.smartWatch = new SmartWatch();
    this.healthData = new HealthData();
    this.smartRec = new SmartRecommendation(this.healthData);

    this.currentType = null;
    this.currentDuration = 5;
    this.isSessionActive = false;
    this.beforeEmotion = null;
    this.afterEmotion = null;
    this.isHealthCheckin = false;
  }

  async init() {
    await this.audioEngine.init();
    this.bindEvents();
    this.bindHealthEvents();
    this.updateHomeStats();
    this.particleSystem.setMode('light');
    this.particleSystem.start();

    this.audioEngine.onError((name) => {
      this.ui.showToast(`音频加载失败: ${name}`);
    });

    this.audioEngine.onTimeUpdate((data) => {
      this.ui.updateMiniProgress(data.progress);
    });

    this.timer.onTick((remaining, duration) => {
      this.ui.updateSessionTimer(remaining);
    });

    this.timer.onComplete(() => {
      this.completeSession();
    });

    this.updateRecommendations();
    this.initHealthAlert();

    console.log('冥想应用已初始化');
  }

  bindEvents() {
    document.querySelectorAll('.audio-card').forEach(card => {
      card.addEventListener('click', () => {
        const type = card.dataset.type;
        this.selectAudio(type);
      });
    });

    document.querySelectorAll('.duration-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const duration = parseInt(dot.dataset.duration);
        this.selectDuration(duration);
      });
    });

    document.getElementById('startBtn').addEventListener('click', () => {
      this.isHealthCheckin = false;
      this.startEmotionBefore();
    });

    document.getElementById('backBtn').addEventListener('click', () => {
      this.endSession();
    });

    document.getElementById('pauseBtn').addEventListener('click', () => {
      this.togglePause();
    });

    document.getElementById('miniPlay').addEventListener('click', () => {
      this.audioEngine.togglePlayPause();
      this.ui.updateMiniPlayButton(this.audioEngine.isPlaying);
    });

    document.getElementById('miniPrev').addEventListener('click', () => {
      this.audioEngine.prev();
      this.updateTrackUI();
    });

    document.getElementById('miniNext').addEventListener('click', () => {
      this.audioEngine.next();
      this.updateTrackUI();
    });

    document.getElementById('skipBeforeEmotion').addEventListener('click', () => {
      this.beforeEmotion = null;
      this.startSession();
    });

    document.getElementById('resultHomeBtn').addEventListener('click', () => {
      this.ui.showHome();
      this.ui.showMiniPlayer();
      this.updateHomeStats();
    });

    document.querySelectorAll('#emotionBeforePage .emotion-card').forEach(card => {
      card.addEventListener('click', () => {
        const emotion = card.dataset.emotion;
        const score = parseInt(card.dataset.score);
        this.beforeEmotion = { emotion, score };
        this.ui.setEmotionCardActive('emotionBeforePage', emotion);
        setTimeout(() => this.startSession(), 300);
      });
    });

    document.querySelectorAll('#emotionAfterPage .emotion-card').forEach(card => {
      card.addEventListener('click', () => {
        const emotion = card.dataset.emotion;
        const score = parseInt(card.dataset.score);
        this.afterEmotion = { emotion, score };
        this.ui.setEmotionCardActive('emotionAfterPage', emotion);
        setTimeout(() => this.showResult(), 300);
      });
    });

    this.gestureController.onSwipeLeft(() => {
      if (!this.isSessionActive && !this.ui.emotionBeforePage.classList.contains('active') && !this.ui.emotionAfterPage.classList.contains('active')) {
        this.audioEngine.next();
        this.updateTrackUI();
      }
    });

    this.gestureController.onSwipeRight(() => {
      if (!this.isSessionActive && !this.ui.emotionBeforePage.classList.contains('active') && !this.ui.emotionAfterPage.classList.contains('active')) {
        this.audioEngine.prev();
        this.updateTrackUI();
      }
    });

    this.gestureController.onDoubleTap(() => {
      if (this.isSessionActive) {
        this.togglePause();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (this.isSessionActive) {
        if (e.code === 'Space') {
          e.preventDefault();
          this.togglePause();
        }
        if (e.code === 'Escape') {
          this.endSession();
        }
      }
    });
  }

  bindHealthEvents() {
    const connectBtn = document.getElementById('watchConnectBtn');
    if (connectBtn) {
      connectBtn.addEventListener('click', () => this.toggleWatchConnection());
    }

    const healthNav = document.getElementById('healthNav');
    if (healthNav) {
      healthNav.addEventListener('click', () => {
        this.ui.showHealthPage();
        this.renderHealthCharts();
      });
    }

    const profileNav = document.getElementById('profileNav');
    if (profileNav) {
      profileNav.addEventListener('click', () => {
        this.ui.showProfilePage();
        this.updateProfileStats();
      });
    }

    const homeNav = document.getElementById('homeNav');
    if (homeNav) {
      homeNav.addEventListener('click', () => {
        this.ui.showHome();
        this.ui.showMiniPlayer();
      });
    }

    const alertEl = document.getElementById('healthAlert');
    if (alertEl) {
      alertEl.addEventListener('click', (e) => {
        if (e.target.closest('.alert-action')) {
          const type = alertEl.dataset.type;
          const duration = parseInt(alertEl.dataset.duration) || 10;
          this.isHealthCheckin = true;
          this.selectAudio(type);
          this.selectDuration(duration);
          this.ui.hideHealthAlert();
          this.startEmotionBefore();
        }
      });
    }

    document.addEventListener('click', (e) => {
      const recCard = e.target.closest('.rec-card');
      if (recCard) {
        const type = recCard.dataset.type;
        const duration = parseInt(recCard.dataset.duration) || 10;
        this.selectAudio(type);
        this.selectDuration(duration);
        this.startEmotionBefore();
      }
    });

    this.smartWatch.onDataUpdate((data) => {
      this.ui.updateWatchStatus(data.isConnected, data.isSimulated);
      this.ui.updateHealthDashboard(data);
      this.healthData.recordDaily(data.steps, data.calories, data.heartRate);
      this.updateRecommendations();
    });

    const shareBtn = document.getElementById('shareReportBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareHealthReport());
    }
  }

  async toggleWatchConnection() {
    if (this.smartWatch.isConnected) {
      this.smartWatch.disconnect();
      this.ui.updateWatchStatus(false, false);
      this.ui.showToast('手表已断开');
    } else {
      this.ui.showToast('正在搜索手表...', 3000);
      try {
        const result = await this.smartWatch.connect();
        if (result.success) {
          if (result.simulated) {
            this.ui.showToast('已切换到模拟模式（数据演示）');
          } else {
            this.ui.showToast('手表连接成功');
          }
        }
      } catch (error) {
        this.ui.showToast('连接失败: ' + error.message);
      }
    }
  }

  updateRecommendations() {
    const recs = this.smartRec.getRecommendations();
    this.ui.updateRecommendations(recs);
  }

  initHealthAlert() {
    setTimeout(() => {
      const alert = this.smartRec.getAlertMessage();
      if (alert.show) {
        this.ui.showHealthAlert(alert);
      }
    }, 3000);
  }

  renderHealthCharts() {
    const recent = this.healthData.getRecentDays(7);
    const labels = recent.map(r => {
      const d = new Date(r.date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });

    if (labels.length === 0) {
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
      }
    }

    const stepsData = recent.length ? recent.map(r => r.steps) : [0, 0, 0, 0, 0, 0, 0];
    const calsData = recent.length ? recent.map(r => r.calories) : [0, 0, 0, 0, 0, 0, 0];

    const stepsChart = new HealthCharts('stepsChart');
    stepsChart.drawLineChart(stepsData, labels, {
      color: '#4A6FA5',
      fillColor: 'rgba(74, 111, 165, 0.15)',
      title: '近7天步数'
    });

    const calsChart = new HealthCharts('caloriesChart');
    calsChart.drawBarChart(calsData, labels, {
      color: '#5B8C85',
      title: '近7天卡路里'
    });

    const history = this.stats.getHistory();
    const meditationData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayMins = history
        .filter(h => h.date.startsWith(dateStr))
        .reduce((sum, h) => sum + h.duration, 0);
      meditationData.push(dayMins);
    }

    const compareChart = new HealthCharts('compareChart');
    compareChart.drawComparisonChart(stepsData, meditationData, labels, {
      title: '步数与冥想对比'
    });
  }

  updateProfileStats() {
    const checkins = this.stats.getHealthCheckinCount();
    const sessions = this.stats.getTotalSessions();
    this.ui.updateProfileStats(checkins, sessions);

    const report = this.healthData.generateReport();
    const reportEl = document.getElementById('healthReport');
    if (reportEl) {
      reportEl.innerHTML = `
        <div class="report-item">
          <span class="report-label">统计天数</span>
          <span class="report-value">${report.days} 天</span>
        </div>
        <div class="report-item">
          <span class="report-label">平均步数</span>
          <span class="report-value">${report.avgSteps.toLocaleString()}</span>
        </div>
        <div class="report-item">
          <span class="report-label">平均卡路里</span>
          <span class="report-value">${report.avgCalories}</span>
        </div>
        <div class="report-item">
          <span class="report-label">健康打卡</span>
          <span class="report-value">${report.checkins} 次</span>
        </div>
      `;
    }
  }

  shareHealthReport() {
    const report = this.healthData.generateReport();
    const text = `🧘 每日冥想健康报告\n` +
      `📅 近${report.days}天统计\n` +
      `👣 平均步数: ${report.avgSteps.toLocaleString()}\n` +
      `🔥 平均卡路里: ${report.avgCalories}\n` +
      `✅ 健康打卡: ${report.checkins}次\n` +
      `——来自每日冥想`;

    if (navigator.share) {
      navigator.share({ title: '每日冥想健康报告', text });
    } else {
      navigator.clipboard.writeText(text).then(() => {
        this.ui.showToast('报告已复制到剪贴板');
      }).catch(() => {
        this.ui.showToast('分享失败');
      });
    }
  }

  updateHomeStats() {
    const streak = this.stats.getStreak();
    const totalMinutes = Math.floor(this.stats.getTotalTime());
    const totalSessions = this.stats.getTotalSessions();
    this.ui.updateStats(streak, totalMinutes, totalSessions);
  }

  selectAudio(type) {
    this.currentType = type;
    this.ui.setAudioCardActive(type);
    this.visualTheme.setTheme(type);
    this.particleSystem.setMode(this.visualTheme.getTheme(type).particle);

    const track = this.audioEngine.getTracks().find(t => t.type === type);
    if (track) {
      this.ui.updateMiniTrack(`${track.icon} ${track.name}`);
    }

    this.audioEngine.play(type);
    this.ui.updateMiniPlayButton(true);
    this.ui.showMiniPlayer();
  }

  selectDuration(minutes) {
    this.currentDuration = minutes;
    this.ui.setDurationActive(minutes);
  }

  updateTrackUI() {
    const track = this.audioEngine.getCurrentTrack();
    if (track) {
      this.currentType = track.type;
      this.ui.setAudioCardActive(track.type);
      this.visualTheme.setTheme(track.type);
      this.particleSystem.setMode(this.visualTheme.getTheme(track.type).particle);
      this.ui.updateMiniTrack(`${track.icon} ${track.name}`);
      this.ui.updateMiniPlayButton(this.audioEngine.isPlaying);
    }
  }

  startEmotionBefore() {
    if (!this.currentType) {
      this.ui.showToast('请先选择冥想类型');
      return;
    }
    this.ui.showEmotionBefore();
  }

  startSession() {
    this.isSessionActive = true;
    this.ui.showSession();
    this.ui.updateSessionGuidance(this.currentType);
    this.ui.updateSessionTimer(this.currentDuration * 60);
    this.ui.hideMiniPlayer();

    if (!this.audioEngine.isPlaying) {
      this.audioEngine.play(this.currentType);
    }

    this.breathingGuide.start();
    this.timer.start(this.currentDuration);
  }

  togglePause() {
    const isPaused = this.timer.togglePause();
    this.ui.updatePauseButton(isPaused);

    if (isPaused) {
      this.audioEngine.pause();
      this.breathingGuide.stop();
    } else {
      this.audioEngine.resume();
      this.breathingGuide.start();
    }

    this.ui.updateMiniPlayButton(!isPaused && this.audioEngine.isPlaying);
  }

  endSession() {
    this.isSessionActive = false;
    this.timer.stop();
    this.breathingGuide.stop();
    this.audioEngine.stop();
    this.ui.showHome();
    this.ui.showMiniPlayer();
    this.ui.updateMiniPlayButton(false);
    this.beforeEmotion = null;
    this.afterEmotion = null;
    this.isHealthCheckin = false;
  }

  completeSession() {
    this.isSessionActive = false;
    this.breathingGuide.stop();
    this.audioEngine.stop();

    if (this.beforeEmotion) {
      this.ui.showEmotionAfter();
    } else {
      this.showResult();
    }
  }

  showResult() {
    if (this.isHealthCheckin) {
      this.healthData.addHealthCheckin();
    }
    this.stats.recordSession(this.currentType, this.currentDuration, this.beforeEmotion, this.afterEmotion, this.isHealthCheckin);

    const streak = this.stats.getStreak();
    this.ui.updateResult(this.currentDuration, streak, this.beforeEmotion, this.afterEmotion);
    this.ui.showResult();

    this.beforeEmotion = null;
    this.afterEmotion = null;
    this.isHealthCheckin = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new MeditationApp();
  app.init();
});
