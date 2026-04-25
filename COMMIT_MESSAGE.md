# Git 提交信息

## 提交命令

```bash
# 1. 初始化Git仓库（如果还没有）
git init

# 2. 添加所有文件到暂存区
git add .

# 3. 提交代码（使用以下提交信息）
git commit -m "feat: 新增运动手表连接与智能冥想提醒模块

- 实现 Web Bluetooth API 连接主流运动手表（华为、小米、Garmin等）
- 读取实时心率、步数、卡路里数据，每30秒更新
- 新增健康仪表盘页面，卡片式数据展示
- 运动量不足检测（步数<6000 或 卡路里<150）自动提醒
- 智能冥想推荐算法：根据运动状态推荐不同冥想类型
- Canvas 数据可视化：步数折线图、卡路里柱状图、冥想对比图
- 与打卡系统整合：健康提醒打卡、健康报告生成与分享
- 响应式UI设计，支持移动端适配
- 添加底部导航栏，优化页面切换体验"

# 4. 关联远程仓库
git remote add origin https://github.com/weilaikeqi2027/anniu.git

# 5. 推送到GitHub
git push -u origin main

# 如果主分支是 master，使用：
# git push -u origin master
```

## 提交说明

### 新增文件
- `js/SmartWatch.js` - 运动手表蓝牙连接模块
- `js/HealthData.js` - 健康数据管理与存储
- `js/SmartRecommendation.js` - 智能冥想推荐算法
- `js/HealthCharts.js` - Canvas 健康数据图表

### 修改文件
- `index.html` - 新增手表连接区、健康仪表盘、今日推荐、底部导航
- `css/main.css` - 新增健康模块样式、响应式适配
- `js/app.js` - 整合健康模块、事件绑定
- `js/Stats.js` - 新增健康打卡统计
- `js/UI.js` - 新增健康模块UI方法
