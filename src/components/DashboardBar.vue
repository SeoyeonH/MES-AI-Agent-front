<template>
  <div class="dashboard-bar">
    <!-- 오늘 생산량 -->
    <div class="kpi-card">
      <div class="kpi-label">오늘 생산량</div>
      <div class="kpi-value" style="color:#00e5ff">
        {{ kpi.production.value.toLocaleString() }}
        <span class="kpi-unit">{{ kpi.production.unit }}</span>
      </div>
      <div class="kpi-sub">
        목표 {{ kpi.production.target.toLocaleString() }} /
        달성률 <span :class="productionRateColor">{{ productionRate }}%</span>
      </div>
      <div class="kpi-bar-track">
        <div class="kpi-bar-fill" :style="{ width: productionRate + '%', background: productionBarColor }"></div>
      </div>
    </div>

    <!-- 불량률 -->
    <div class="kpi-card" :class="{ 'kpi-warn': kpi.defectRate.value > kpi.defectRate.threshold }">
      <div class="kpi-label">불량률</div>
      <div class="kpi-value" :class="defectColor">
        {{ kpi.defectRate.value }}
        <span class="kpi-unit">{{ kpi.defectRate.unit }}</span>
      </div>
      <div class="kpi-sub">
        기준 {{ kpi.defectRate.threshold }}%
        <span v-if="kpi.defectRate.value > kpi.defectRate.threshold" class="warn-badge">⚠ 초과</span>
      </div>
      <div class="kpi-bar-track">
        <div class="kpi-bar-fill" :style="{ width: Math.min(kpi.defectRate.value / 5 * 100, 100) + '%', background: defectBarColor }"></div>
      </div>
    </div>

    <!-- 진행중 작업지시 -->
    <div class="kpi-card">
      <div class="kpi-label">진행중 작업지시</div>
      <div class="kpi-value" style="color:#00e5ff">
        {{ kpi.workOrders.active }}
        <span class="kpi-unit">건</span>
      </div>
      <div class="kpi-sub">
        대기 {{ kpi.workOrders.waiting }} / 완료 {{ kpi.workOrders.done }}
      </div>
      <div class="kpi-progress-dots">
        <span v-for="i in kpi.workOrders.active" :key="'a'+i" class="dot dot-active"></span>
        <span v-for="i in kpi.workOrders.waiting" :key="'w'+i" class="dot dot-wait"></span>
        <span v-for="i in kpi.workOrders.done" :key="'d'+i" class="dot dot-done"></span>
      </div>
    </div>

    <!-- 가동 라인 수 -->
    <div class="kpi-card">
      <div class="kpi-label">가동 라인 수</div>
      <div class="kpi-value" style="color:#00ff88">
        {{ kpi.activeLines.current }}
        <span class="kpi-unit" style="color:#8b949e">/ {{ kpi.activeLines.total }}</span>
      </div>
      <div class="kpi-sub">
        전 라인 정상 가동
      </div>
      <div class="kpi-progress-dots">
        <span v-for="i in kpi.activeLines.total" :key="i"
          class="dot-line" :class="{ 'dot-line-on': isLineOn(i), 'dot-line-warm': isLineWarm(i), 'dot-line-off': !isLineOn(i) && !isLineWarm(i) }">
          {{ i }}라인
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardBar',
  props: { 
    kpi: { type: Object, required: true },
    lines: { type: Array, default: () => [] }
  },
  computed: {
    productionRate() {
      return this.kpi.production.target > 0 
        ? Math.round(this.kpi.production.value / this.kpi.production.target * 100) 
        : 0
    },
    productionRateColor() {
      return this.productionRate >= 90 ? 'color-green' : this.productionRate >= 70 ? 'color-yellow' : 'color-red'
    },
    productionBarColor() {
      return this.productionRate >= 90 ? '#00ff88' : this.productionRate >= 70 ? '#ffa502' : '#ff4757'
    },
    defectColor() {
      return this.kpi.defectRate.value > this.kpi.defectRate.threshold ? 'color-red' : 'color-green'
    },
    defectBarColor() {
      return this.kpi.defectRate.value > this.kpi.defectRate.threshold ? '#ff4757' : '#00ff88'
    }
  },
  methods: {
    isLineOn(index) {
      if (!this.lines || this.lines.length < index) return false
      return this.lines[index - 1].status === '가동중'
    },
    isLineWarm(index) {
      if (!this.lines || this.lines.length < index) return false
      return this.lines[index - 1].status === '준비중'
    }
  }
}
</script>

<style scoped>
.dashboard-bar {
  display: flex;
  gap: 8px;
  padding: 8px 16px;
  background: #0d1117;
  border-bottom: 1px solid #21262d;
  flex-shrink: 0;
}

.kpi-card {
  flex: 1;
  background: #161b22;
  border: 1px solid #21262d;
  border-radius: 8px;
  padding: 10px 14px;
  min-width: 0;
  transition: border-color 0.3s;
}
.kpi-card:hover {
  border-color: #00e5ff44;
}
.kpi-card.kpi-warn {
  border-color: #ffa502;
  background: #1e1a10;
}

.kpi-label {
  font-size: 10px;
  font-weight: 600;
  color: #8b949e;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.kpi-value {
  font-size: 26px;
  font-weight: 900;
  line-height: 1.1;
  font-family: 'Roboto Mono', monospace;
}

.kpi-unit {
  font-size: 13px;
  font-weight: 400;
  color: #8b949e;
  margin-left: 2px;
}

.kpi-sub {
  font-size: 11px;
  color: #8b949e;
  margin-top: 3px;
  margin-bottom: 6px;
}

.warn-badge {
  background: #ffa502;
  color: #0d1117;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 3px;
  margin-left: 4px;
}

.kpi-bar-track {
  height: 4px;
  background: #30363d;
  border-radius: 2px;
  overflow: hidden;
}
.kpi-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 1s ease;
}

.kpi-progress-dots {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot-active { background: #00e5ff; box-shadow: 0 0 4px #00e5ff; }
.dot-wait   { background: #ffa502; }
.dot-done   { background: #30363d; }

.dot-line {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  letter-spacing: 0.5px;
}
.dot-line-on  { background: #00ff8822; color: #00ff88; border: 1px solid #00ff88; }
.dot-line-warm { background: #ffa50222; color: #ffa502; border: 1px solid #ffa502; }
.dot-line-off { background: #30363d22; color: #8b949e; border: 1px solid #30363d; }

.color-green { color: #00ff88 !important; }
.color-yellow { color: #ffa502 !important; }
.color-red { color: #ff4757 !important; }
</style>
