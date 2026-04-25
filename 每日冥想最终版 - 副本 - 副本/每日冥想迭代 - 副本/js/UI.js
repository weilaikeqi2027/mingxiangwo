class UI {
  constructor() {
    this.homePage = document.getElementById('homePage');
    this.sessionPage = document.getElementById('sessionPage');
    this.emotionBeforePage = document.getElementById('emotionBeforePage');
    this.emotionAfterPage = document.getElementById('emotionAfterPage');
    this.resultPage = document.getElementById('resultPage');
    this.miniPlayer = document.getElementById('miniPlayer');
    this.toast = document.getElementById('toast');
    this.poemText = document.getElementById('poemText');
    this.poemAuthor = document.getElementById('poemAuthor');

    this.poems = [
      { text: '静坐无所为，春来草自青。', author: '仓央嘉措' },
      { text: '行到水穷处，坐看云起时。', author: '王维' },
      { text: '心外无物，闲看庭前花开花落。', author: '洪应明' },
      { text: '本来无一物，何处惹尘埃。', author: '六祖慧能' },
      { text: '万物静观皆自得，四时佳兴与人同。', author: '程颢' },
      { text: '非淡泊无以明志，非宁静无以致远。', author: '诸葛亮' },
      { text: '采菊东篱下，悠然见南山。', author: '陶渊明' },
      { text: '一花一世界，一叶一菩提。', author: '佛经' }
    ];

    this.emotionMap = {
      stress: { emoji: '😫', name: '焦虑', score: 1 },
      tired: { emoji: '😴', name: '疲惫', score: 2 },
      neutral: { emoji: '😐', name: '平静', score: 3 },
      calm: { emoji: '😌', name: '放松', score: 4 },
      happy: { emoji: '😊', name: '愉悦', score: 5 }
    };

    this.showRandomPoem();
  }

  showRandomPoem() {
    const poem = this.poems[Math.floor(Math.random() * this.poems.length)];
    if (this.poemText) this.poemText.textContent = poem.text;
    if (this.poemAuthor) this.poemAuthor.textContent = `——${poem.author}`;
  }

  hideAllPages() {
    [this.homePage, this.sessionPage, this.emotionBeforePage, this.emotionAfterPage, this.resultPage].forEach(page => {
      if (page) page.classList.remove('active');
    });
  }

  showHome() {
    this.hideAllPages();
    this.homePage.classList.add('active');
  }

  showSession() {
    this.hideAllPages();
    this.sessionPage.classList.add('active');
  }

  showEmotionBefore() {
    this.hideAllPages();
    this.emotionBeforePage.classList.add('active');
  }

  showEmotionAfter() {
    this.hideAllPages();
    this.emotionAfterPage.classList.add('active');
  }

  showResult() {
    this.hideAllPages();
    this.resultPage.classList.add('active');
  }

  showMiniPlayer() {
    this.miniPlayer.classList.add('visible');
  }

  hideMiniPlayer() {
    this.miniPlayer.classList.remove('visible');
  }

  updateStats(streak, totalMinutes, totalSessions) {
    const streakEl = document.getElementById('streakDays');
    const minutesEl = document.getElementById('totalMinutes');
    const sessionsEl = document.getElementById('totalSessions');

    if (streakEl) streakEl.textContent = streak;
    if (minutesEl) minutesEl.textContent = totalMinutes;
    if (sessionsEl) sessionsEl.textContent = totalSessions;
  }

  updateMiniTrack(name) {
    const track = document.getElementById('miniTrack');
    if (track) track.textContent = name || '请选择冥想类型';
  }

  updateMiniProgress(progress) {
    const bar = document.getElementById('miniProgress');
    if (bar) bar.style.width = `${(progress || 0) * 100}%`;
  }

  updateMiniPlayButton(isPlaying) {
    const btn = document.getElementById('miniPlay');
    if (btn) btn.textContent = isPlaying ? '⏸' : '▶';
  }

  updateSessionTimer(time) {
    const timer = document.getElementById('sessionTimer');
    if (timer) timer.textContent = Timer.formatTime(time);
  }

  updateSessionGuidance(type) {
    const guidance = document.getElementById('sessionGuidance');
    const texts = {
      guqin: '专注于呼吸，让心灵回归平静',
      yushan: '聆听雨声，释放一天的疲惫',
      shuinian: '放松身心，安然进入梦乡',
      yinchang: '心怀感恩，感受内心的温暖'
    };
    if (guidance) guidance.textContent = texts[type] || texts.guqin;
  }

  updatePauseButton(isPaused) {
    const btn = document.getElementById('pauseBtn');
    if (btn) btn.textContent = isPaused ? '▶' : '⏸';
  }

  updateResult(duration, streak, beforeEmotion, afterEmotion) {
    const durationEl = document.getElementById('resultDuration');
    const streakEl = document.getElementById('resultStreak');
    const beforeEl = document.getElementById('beforeEmotionDisplay');
    const afterEl = document.getElementById('afterEmotionDisplay');
    const changeEl = document.getElementById('emotionChange');

    if (durationEl) durationEl.textContent = duration;
    if (streakEl) streakEl.textContent = streak;

    if (beforeEmotion && afterEmotion) {
      const before = this.emotionMap[beforeEmotion.emotion];
      const after = this.emotionMap[afterEmotion.emotion];

      if (beforeEl) beforeEl.textContent = `${before.emoji} ${before.name}`;
      if (afterEl) afterEl.textContent = `${after.emoji} ${after.name}`;

      const improvement = after.score - before.score;
      if (changeEl) {
        if (improvement > 0) {
          changeEl.innerHTML = `<span class="change-icon">📈</span><span class="change-text">情绪提升了 ${improvement} 级！</span>`;
          changeEl.style.background = 'rgba(74, 111, 165, 0.2)';
          changeEl.style.borderColor = 'rgba(74, 111, 165, 0.3)';
        } else if (improvement < 0) {
          changeEl.innerHTML = `<span class="change-icon">📉</span><span class="change-text">情绪变化了 ${improvement} 级</span>`;
          changeEl.style.background = 'rgba(200, 100, 100, 0.2)';
          changeEl.style.borderColor = 'rgba(200, 100, 100, 0.3)';
        } else {
          changeEl.innerHTML = `<span class="change-icon">➡️</span><span class="change-text">情绪保持稳定</span>`;
          changeEl.style.background = 'rgba(255, 255, 255, 0.1)';
          changeEl.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }
      }
    } else {
      if (beforeEl) beforeEl.textContent = '未记录';
      if (afterEl) afterEl.textContent = '未记录';
      if (changeEl) {
        changeEl.innerHTML = `<span class="change-icon">📝</span><span class="change-text">下次记得记录情绪哦</span>`;
        changeEl.style.background = 'rgba(255, 255, 255, 0.1)';
        changeEl.style.borderColor = 'rgba(255, 255, 255, 0.2)';
      }
    }
  }

  showToast(message, duration = 2000) {
    if (this.toast) {
      this.toast.textContent = message;
      this.toast.classList.add('visible');
      setTimeout(() => {
        this.toast.classList.remove('visible');
      }, duration);
    }
  }

  setAudioCardActive(type) {
    document.querySelectorAll('.audio-card').forEach(card => {
      card.classList.toggle('active', card.dataset.type === type);
    });
  }

  setDurationActive(minutes) {
    document.querySelectorAll('.duration-dot').forEach(dot => {
      dot.classList.toggle('active', parseInt(dot.dataset.duration) === minutes);
    });
  }

  setEmotionCardActive(pageId, emotion) {
    const page = document.getElementById(pageId);
    if (!page) return;
    page.querySelectorAll('.emotion-card').forEach(card => {
      card.classList.toggle('active', card.dataset.emotion === emotion);
    });
  }

  getSelectedDuration() {
    const active = document.querySelector('.duration-dot.active');
    return active ? parseInt(active.dataset.duration) : 5;
  }

  updateWatchStatus(isConnected, isSimulated) {
    const statusEl = document.getElementById('watchStatus');
    const btnText = document.getElementById('watchBtnText');
    if (!statusEl) return;

    if (isConnected) {
      statusEl.textContent = isSimulated ? '已连接（模拟）🟢' : '已连接 🟢';
      statusEl.classList.add('connected');
      if (btnText) btnText.textContent = '断开手表';
    } else {
      statusEl.textContent = '断开 🔴';
      statusEl.classList.remove('connected');
      if (btnText) btnText.textContent = '连接手表';
    }
  }

  updateHealthDashboard(data) {
    const stepsEl = document.getElementById('dashSteps');
    const calsEl = document.getElementById('dashCalories');
    const hrEl = document.getElementById('dashHeartRate');

    if (stepsEl) stepsEl.textContent = data.steps.toLocaleString();
    if (calsEl) calsEl.textContent = data.calories.toLocaleString();
    if (hrEl) hrEl.textContent = data.heartRate;
  }

  updateRecommendations(recommendations) {
    const container = document.getElementById('recommendationList');
    if (!container) return;

    container.innerHTML = recommendations.map(rec => `
      <div class="rec-card" data-type="${rec.type}" data-duration="${rec.duration}">
        <span class="rec-icon">${rec.icon}</span>
        <div class="rec-info">
          <div class="rec-name">${rec.name}</div>
          <div class="rec-desc">${rec.desc}</div>
          <div class="rec-reason">${rec.reason}</div>
        </div>
        <span class="rec-duration">${rec.duration}分钟</span>
      </div>
    `).join('');
  }

  showHealthAlert(alert) {
    const el = document.getElementById('healthAlert');
    if (!el || !alert.show) {
      if (el) el.classList.remove('visible');
      return;
    }

    const title = el.querySelector('.alert-title');
    const msg = el.querySelector('.alert-message');
    const action = el.querySelector('.alert-action');

    if (title) title.textContent = alert.title;
    if (msg) msg.textContent = alert.message;
    if (action) action.textContent = alert.action;

    el.dataset.type = alert.type;
    el.dataset.duration = alert.duration;
    el.classList.add('visible');

    setTimeout(() => {
      el.classList.remove('visible');
    }, 6000);
  }

  hideHealthAlert() {
    const el = document.getElementById('healthAlert');
    if (el) el.classList.remove('visible');
  }

  showHealthPage() {
    this.hideAllPages();
    const page = document.getElementById('healthPage');
    if (page) page.classList.add('active');
  }

  showProfilePage() {
    this.hideAllPages();
    const page = document.getElementById('profilePage');
    if (page) page.classList.add('active');
  }

  updateProfileStats(healthCheckins, totalSessions) {
    const checkinEl = document.getElementById('profileCheckins');
    const sessionEl = document.getElementById('profileTotalSessions');
    if (checkinEl) checkinEl.textContent = healthCheckins;
    if (sessionEl) sessionEl.textContent = totalSessions;
  }
}
