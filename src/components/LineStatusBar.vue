<template>
  <div class="line-status-bar">
    <div v-for="line in lines" :key="line.name" class="line-row">
      <div class="line-info">
        <span class="line-name">{{ line.name }}</span>
        <span class="line-pct" :style="{ color: statusColor(line.status) }">{{ line.progress }}%</span>
        <span class="line-badge" :class="statusClass(line.status)">{{ line.status }}</span>
      </div>
      <div class="line-track">
        <div
          class="line-fill"
          :style="{ width: line.progress + '%', background: statusColor(line.status) }"
        ></div>
        <div class="line-glow" :style="{ width: line.progress + '%', background: statusColor(line.status) }"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LineStatusBar',
  props: {
    lines: { type: Array, required: true }
  },
  methods: {
    statusColor(status) {
      if (status === '가동중') return '#00ff88'
      if (status === '준비중') return '#ffa502'
      return '#ff4757'
    },
    statusClass(status) {
      if (status === '가동중') return 'badge-green'
      if (status === '준비중') return 'badge-yellow'
      return 'badge-red'
    }
  }
}
</script>

<style scoped>
.line-status-bar {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 6px 16px;
  background: #0d1117;
  border-bottom: 1px solid #21262d;
  flex-shrink: 0;
}

.line-row {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border-right: 1px solid #21262d;
}
.line-row:last-child {
  border-right: none;
}

.line-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  min-width: 140px;
}

.line-name {
  font-size: 13px;
  font-weight: 700;
  color: #c9d1d9;
  letter-spacing: 0.5px;
}

.line-pct {
  font-family: 'Roboto Mono', monospace;
  font-size: 13px;
  font-weight: 700;
}

.line-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 3px;
  letter-spacing: 0.5px;
}
.badge-green  { background: #00ff8822; color: #00ff88; border: 1px solid #00ff88; }
.badge-yellow { background: #ffa50222; color: #ffa502; border: 1px solid #ffa502; }
.badge-red    { background: #ff475722; color: #ff4757; border: 1px solid #ff4757; }

.line-track {
  flex: 1;
  height: 8px;
  background: #21262d;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.line-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.line-glow {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 4px;
  opacity: 0.3;
  filter: blur(4px);
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}
</style>
