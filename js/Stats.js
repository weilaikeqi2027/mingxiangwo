class Stats {
  constructor() {
    this.key = 'meditation_stats';
    this.data = this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(this.key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('无法读取统计数据');
    }
    return {
      totalTime: 0,
      totalSessions: 0,
      history: [],
      lastDate: null,
      emotions: []
    };
  }

  save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.data));
    } catch (e) {
      console.warn('无法保存统计数据');
    }
  }

  recordSession(type, duration, beforeEmotion, afterEmotion, isHealthCheckin = false) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    this.data.totalTime += duration;
    this.data.totalSessions += 1;

    const session = {
      type,
      duration,
      date: now.toISOString(),
      beforeEmotion,
      afterEmotion,
      isHealthCheckin
    };

    this.data.history.push(session);

    if (beforeEmotion && afterEmotion) {
      this.data.emotions.push({
        before: beforeEmotion,
        after: afterEmotion,
        date: now.toISOString()
      });
    }

    if (this.data.history.length > 100) {
      this.data.history = this.data.history.slice(-100);
    }
    if (this.data.emotions.length > 100) {
      this.data.emotions = this.data.emotions.slice(-100);
    }

    this.data.lastDate = today;
    this.save();
  }

  getTotalTime() {
    return this.data.totalTime;
  }

  getTotalSessions() {
    return this.data.totalSessions;
  }

  getStreak() {
    if (!this.data.history.length) return 0;

    const dates = [...new Set(this.data.history.map(h => h.date.split('T')[0]))].sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dates[0] !== today && dates[0] !== yesterday) {
      return 0;
    }

    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        streak = 1;
        continue;
      }
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (prev - curr) / 86400000;
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  getHistory() {
    return this.data.history;
  }

  getTodayTime() {
    const today = new Date().toISOString().split('T')[0];
    return this.data.history
      .filter(h => h.date.startsWith(today))
      .reduce((sum, h) => sum + h.duration, 0);
  }

  getEmotionStats() {
    if (!this.data.emotions.length) return null;

    const recent = this.data.emotions.slice(-10);
    const avgBefore = recent.reduce((sum, e) => sum + e.before.score, 0) / recent.length;
    const avgAfter = recent.reduce((sum, e) => sum + e.after.score, 0) / recent.length;

    return {
      avgBefore: Math.round(avgBefore * 10) / 10,
      avgAfter: Math.round(avgAfter * 10) / 10,
      improvement: Math.round((avgAfter - avgBefore) * 10) / 10,
      count: this.data.emotions.length
    };
  }

  getLastEmotion() {
    if (!this.data.emotions.length) return null;
    return this.data.emotions[this.data.emotions.length - 1];
  }

  getHealthCheckinCount() {
    return this.data.history.filter(h => h.isHealthCheckin).length;
  }

  getTodayHealthCheckin() {
    const today = new Date().toISOString().split('T')[0];
    return this.data.history.filter(h => h.date.startsWith(today) && h.isHealthCheckin).length;
  }
}
