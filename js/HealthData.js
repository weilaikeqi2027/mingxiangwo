class HealthData {
  constructor() {
    this.key = 'meditation_health_data';
    this.data = this.load();
    this.listeners = [];
  }

  load() {
    try {
      const stored = localStorage.getItem(this.key);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('无法读取健康数据');
    }
    return {
      dailyRecords: [],
      healthCheckins: 0,
      lastSync: null
    };
  }

  save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.data));
    } catch (e) {
      console.warn('无法保存健康数据');
    }
  }

  onUpdate(callback) {
    this.listeners.push(callback);
  }

  emitUpdate() {
    this.listeners.forEach(cb => cb(this.data));
  }

  recordDaily(steps, calories, heartRate) {
    const today = new Date().toISOString().split('T')[0];
    const existing = this.data.dailyRecords.find(r => r.date === today);

    if (existing) {
      existing.steps = steps;
      existing.calories = calories;
      existing.heartRate = heartRate;
      existing.updatedAt = Date.now();
    } else {
      this.data.dailyRecords.push({
        date: today,
        steps,
        calories,
        heartRate,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }

    if (this.data.dailyRecords.length > 30) {
      this.data.dailyRecords = this.data.dailyRecords.slice(-30);
    }

    this.data.lastSync = Date.now();
    this.save();
    this.emitUpdate();
  }

  addHealthCheckin() {
    this.data.healthCheckins += 1;
    this.save();
    this.emitUpdate();
  }

  getTodayRecord() {
    const today = new Date().toISOString().split('T')[0];
    return this.data.dailyRecords.find(r => r.date === today) || null;
  }

  getRecentDays(days = 7) {
    return this.data.dailyRecords.slice(-days);
  }

  getHealthCheckins() {
    return this.data.healthCheckins;
  }

  isExerciseInsufficient() {
    const today = this.getTodayRecord();
    if (!today) return true;
    return today.steps < 6000 || today.calories < 150;
  }

  getExerciseStatus() {
    const today = this.getTodayRecord();
    if (!today) return { insufficient: true, steps: 0, calories: 0 };
    return {
      insufficient: today.steps < 6000 || today.calories < 150,
      steps: today.steps,
      calories: today.calories
    };
  }

  generateReport() {
    const recent = this.getRecentDays(7);
    const totalSteps = recent.reduce((sum, r) => sum + r.steps, 0);
    const totalCalories = recent.reduce((sum, r) => sum + r.calories, 0);
    const avgSteps = recent.length ? Math.round(totalSteps / recent.length) : 0;
    const avgCalories = recent.length ? Math.round(totalCalories / recent.length) : 0;
    const checkins = this.data.healthCheckins;

    return {
      days: recent.length,
      totalSteps,
      totalCalories,
      avgSteps,
      avgCalories,
      checkins,
      generatedAt: Date.now()
    };
  }
}
