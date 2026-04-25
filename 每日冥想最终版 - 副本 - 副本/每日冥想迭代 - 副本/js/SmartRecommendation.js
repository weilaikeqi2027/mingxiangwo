class SmartRecommendation {
  constructor(healthData) {
    this.healthData = healthData;
  }

  getRecommendations() {
    const status = this.healthData.getExerciseStatus();
    const today = this.healthData.getTodayRecord();
    const heartRate = today ? today.heartRate : 0;

    const recommendations = [];

    if (status.insufficient) {
      recommendations.push({
        type: 'yushan',
        name: '放松冥想',
        icon: '🌸',
        desc: '雨声 · 释放压力',
        reason: '久坐/运动量不足',
        duration: 10,
        priority: 1
      });
      recommendations.push({
        type: 'yinchang',
        name: '感恩冥想',
        icon: '🙏',
        desc: '吟唱 · 心怀感恩',
        reason: '久坐/运动量不足',
        duration: 10,
        priority: 2
      });
    } else if (heartRate > 110) {
      recommendations.push({
        type: 'guqin',
        name: '专注冥想',
        icon: '🧘',
        desc: '古琴 · 提升专注',
        reason: '运动后心率偏高',
        duration: 15,
        priority: 1
      });
      recommendations.push({
        type: 'shuinian',
        name: '睡眠冥想',
        icon: '🌙',
        desc: '禅音 · 安然入眠',
        reason: '运动后心率偏高',
        duration: 15,
        priority: 2
      });
    } else {
      const allTypes = [
        { type: 'guqin', name: '专注冥想', icon: '🧘', desc: '古琴 · 提升专注', reason: '日常推荐', duration: 10 },
        { type: 'yushan', name: '放松冥想', icon: '🌸', desc: '雨声 · 释放压力', reason: '日常推荐', duration: 10 },
        { type: 'shuinian', name: '睡眠冥想', icon: '🌙', desc: '禅音 · 安然入眠', reason: '日常推荐', duration: 10 },
        { type: 'yinchang', name: '感恩冥想', icon: '🙏', desc: '吟唱 · 心怀感恩', reason: '日常推荐', duration: 10 }
      ];
      const shuffled = allTypes.sort(() => Math.random() - 0.5);
      recommendations.push({ ...shuffled[0], priority: 1 });
      recommendations.push({ ...shuffled[1], priority: 2 });
    }

    return recommendations;
  }

  getMainRecommendation() {
    const recs = this.getRecommendations();
    return recs.find(r => r.priority === 1) || recs[0];
  }

  getAlertMessage() {
    const status = this.healthData.getExerciseStatus();
    if (status.insufficient) {
      return {
        show: true,
        title: '今日运动量不足',
        message: '推荐 10 分钟放松冥想',
        action: '立即开始',
        type: 'yushan',
        duration: 10
      };
    }
    return { show: false };
  }
}
