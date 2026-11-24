<template>
  <div class="mes-page">
    <!-- ===== HEADER ===== -->
    <div class="mes-header">
      <div class="header-left">
        <span class="system-logo">MES</span>
        <span class="system-subtitle">AI AGENT CONTROL</span>
      </div>
      <div class="header-right">
        <div class="status-dot" :class="systemOnline ? 'online' : 'offline'"></div>
        <span class="status-text">{{ systemOnline ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE' }}</span>
        <span class="header-divider">|</span>
        <span class="header-time">{{ currentDateTime }}</span>
      </div>
    </div>

    <!-- ===== KPI DASHBOARD ===== -->
    <DashboardBar :kpi="kpi" :lines="lines" />

    <!-- ===== LINE STATUS ===== -->
    <LineStatusBar :lines="lines" />

    <!-- ===== CHAT AREA ===== -->
    <ChatArea ref="chatArea" :messages="messages" @confirm="handleConfirm" @cancel="handleCancel" />

    <!-- ===== INPUT AREA ===== -->
    <InputArea @send="sendMessage" />
  </div>
</template>

<script>
import axios from 'axios'
import DashboardBar from '../components/DashboardBar.vue'
import LineStatusBar from '../components/LineStatusBar.vue'
import ChatArea from '../components/ChatArea.vue'
import InputArea from '../components/InputArea.vue'

// API 설정
const API_BASE = 'http://localhost:5000/api'

export default {
  name: 'MesAgentPage',
  components: { DashboardBar, LineStatusBar, ChatArea, InputArea },

  data() {
    return {
      systemOnline: true,
      currentDateTime: '',
      clockTimer: null,
      dashboardTimer: null,
      messages: [],

      kpi: {
        production: { value: 0, target: 0, unit: '개' },
        defectRate: { value: 0, threshold: 2.0, unit: '%' },
        workOrders: { active: 0, waiting: 0, done: 0 },
        activeLines: { current: 0, total: 3 },
        utilization: { value: 0, target: 90, unit: '%' }
      },

      lines: []
    }
  },

  mounted() {
    this.updateClock()
    this.clockTimer = setInterval(this.updateClock, 1000)
    
    // 초기 데이터 로드 및 주기적 업데이트
    this.fetchDashboardData()
    this.dashboardTimer = setInterval(this.fetchDashboardData, 10000) // 10초마다 갱신

    // 초기 환영 메시지
    setTimeout(() => {
      this.addAiMessage({
        type: 'text',
        text: '안녕하세요! MES AI Agent입니다. 무엇을 도와드릴까요?\n"현황 보여줘" 또는 "작업지시 조회"라고 말씀해 보세요.'
      })
    }, 400)
  },

  beforeDestroy() {
    if (this.clockTimer) clearInterval(this.clockTimer)
    if (this.dashboardTimer) clearInterval(this.dashboardTimer)
  },

  methods: {
    updateClock() {
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const hh = String(now.getHours()).padStart(2, '0')
      const mi = String(now.getMinutes()).padStart(2, '0')
      const ss = String(now.getSeconds()).padStart(2, '0')
      this.currentDateTime = `${yyyy}.${mm}.${dd}  ${hh}:${mi}:${ss}`
    },

    async fetchDashboardData() {
      try {
        const res = await axios.get(`${API_BASE}/dashboard`)
        const data = res.data
        
        // KPI 데이터 매핑
        this.kpi.production.value = data.kpis.today_production
        this.kpi.production.target = data.kpis.today_target
        this.kpi.defectRate.value = data.kpis.defect_rate
        this.kpi.activeLines.current = data.kpis.active_lines
        this.kpi.workOrders.active = data.kpis.active_work_orders
        this.kpi.workOrders.waiting = data.kpis.waiting_work_orders
        this.kpi.workOrders.done = data.kpis.done_work_orders
        this.kpi.utilization.value = data.kpis.utilization_rate
        
        // 라인 데이터 매핑
        this.lines = data.lines
        this.systemOnline = true
      } catch (err) {
        console.error('대시보드 데이터를 가져오는데 실패했습니다:', err)
        this.systemOnline = false
      }
    },

    async sendMessage({ text, isVoice }) {
      if (!text.trim()) return

      // OpenAI 형식의 히스토리 구성 (최근 10개 추출)
      const history = this.messages
        .filter(m => m.type === 'text' || !m.type) // 텍스트 기반 대화만 히스토리에 포함
        .slice(-10)
        .map(m => ({
          role: m.role === 'ai' ? 'assistant' : 'user',
          content: m.text || ''
        }))

      // 사용자 메시지 추가
      this.messages.push({
        id: Date.now(),
        role: 'user',
        text,
        isVoice,
        time: this.getTimeStr()
      })

      this.$nextTick(() => {
        if (this.$refs.chatArea) this.$refs.chatArea.scrollToBottom()
      })

      // AI API 호출 (백엔드 LLM 연동, history 포함)
      try {
        const res = await axios.post(`${API_BASE}/chat`, { 
          message: text,
          history: history
        })
        this.addAiMessage(res.data)
      } catch (err) {
        this.addAiMessage({
          type: 'text',
          text: '죄송합니다. 서버와 통신하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
        })
      }
    },

    addAiMessage(response) {
      this.messages.push({
        id: Date.now(),
        role: 'ai',
        ...response,
        time: this.getTimeStr()
      })
      this.$nextTick(() => {
        if (this.$refs.chatArea) this.$refs.chatArea.scrollToBottom()
      })
    },

    getTimeStr() {
      const now = new Date()
      return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    },

    async handleConfirm(messageId) {
      const msg = this.messages.find(m => m.id === messageId)
      if (!msg) return

      try {
        // 백엔드 실행 API 호출
        // confirmType 매핑: 'add' -> 'add-workorder', 'edit' -> 'edit-workorder', 'input-result' -> 'input-result'
        const actionMap = {
          'add': 'add-workorder',
          'edit': 'edit-workorder',
          'input-result': 'input-result',
          'delete': 'delete-workorder',
          'edit-result': 'edit-result',
          'delete-result': 'delete-result',
          'scheduling': 'apply-scheduling'
        }
        const action = actionMap[msg.confirmType] || 'add-workorder'
        
        const res = await axios.post(`${API_BASE}/execute`, {
          action: action,
          data: msg.confirmData
        })

        if (res.data.success) {
          msg.confirmed = true
          this.addAiMessage({ type: 'text', text: `✅ ${res.data.message}` })
          // 데이터 즉시 갱신
          this.fetchDashboardData()
        } else {
          this.addAiMessage({ type: 'text', text: `❌ 오류: ${res.data.message}` })
        }
      } catch (err) {
        this.addAiMessage({ type: 'text', text: '❌ 작업을 처리하는 중 서버 오류가 발생했습니다.' })
      }
    },

    handleCancel(messageId) {
      const msg = this.messages.find(m => m.id === messageId)
      if (msg) msg.confirmed = false
      
      const labelMap = {
        'input-result': '실적 입력',
        'edit': '작업 수정',
        'add': '작업 등록',
        'delete': '작업 삭제',
        'edit-result': '실적 수정',
        'delete-result': '실적 삭제',
        'scheduling': '스케줄링 적용'
      }
      const label = labelMap[msg?.confirmType] || '요청'
      this.addAiMessage({ type: 'text', text: `❌ ${label}이 취소되었습니다.` })
    }
  }
}
</script>

<style scoped>
.mes-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #0d1117;
  overflow: hidden;
}

/* ===== HEADER ===== */
.mes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 52px;
  background: linear-gradient(90deg, #0d1117 0%, #161b22 50%, #0d1117 100%);
  border-bottom: 1px solid #21262d;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.system-logo {
  font-family: 'Roboto Mono', monospace;
  font-size: 22px;
  font-weight: 900;
  color: #00e5ff;
  letter-spacing: 4px;
  text-shadow: 0 0 20px rgba(0, 229, 255, 0.5);
}

.system-subtitle {
  font-size: 11px;
  font-weight: 500;
  color: #8b949e;
  letter-spacing: 3px;
  text-transform: uppercase;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}
.status-dot.online {
  background: #00ff88;
  box-shadow: 0 0 8px #00ff88;
}
.status-dot.offline {
  background: #ff4757;
  box-shadow: 0 0 8px #ff4757;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  color: #00ff88;
}

.header-divider {
  color: #30363d;
  font-size: 14px;
}

.header-time {
  font-family: 'Roboto Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  color: #c9d1d9;
  letter-spacing: 1px;
}
</style>
