<template>
  <div class="result-card">

    <!-- ===== TABLE CARD ===== -->
    <div v-if="message.type === 'table'" class="card-inner">
      <div class="card-header">
        <span class="card-title">{{ message.tableTitle }}</span>
        <span class="card-count">{{ message.rows.length }}건</span>
      </div>
      <div class="table-wrap">
        <table class="mes-table">
          <thead>
            <tr>
              <th v-for="h in message.headers" :key="h">{{ h }}</th>
            </tr>
          </thead>
          <tbody>
            <!-- Work Order rows -->
            <tr v-if="message.tableType === 'workorder'" v-for="row in message.rows" :key="row.id">
              <td class="mono" style="color:#00e5ff">{{ row.id }}</td>
              <td>{{ row.product }}</td>
              <td>{{ row.line }}</td>
              <td class="mono">{{ row.planned }}</td>
              <td class="mono" :class="row.actual >= row.planned ? 'text-green' : 'text-cyan'">{{ row.actual }}</td>
              <td>
                <span class="status-chip" :class="statusClass(row.status)">{{ row.status }}</span>
              </td>
            </tr>
            <!-- Production rows -->
            <tr v-if="message.tableType === 'production'" v-for="(row, i) in message.rows" :key="i">
              <td class="mono text-dim">{{ row.id || row.resultId }}</td>
              <td class="mono" style="color:#00e5ff">{{ row.wo }}</td>
              <td class="mono text-green">{{ row.good }}</td>
              <td class="mono text-red">{{ row.defect }}</td>
              <td>{{ row.worker }}</td>
            </tr>
            <!-- Defect rows -->
            <tr v-if="message.tableType === 'defect'" v-for="(row, i) in message.rows" :key="i">
              <td class="mono" style="color:#8b949e">{{ row.id }}</td>
              <td class="mono" style="color:#00e5ff">{{ row.result_id }}</td>
              <td>{{ row.type }}</td>
              <td class="mono text-red">{{ row.qty }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===== CONFIRM CARD ===== -->
    <div v-else-if="message.type === 'confirm'" class="card-inner confirm-card">
      <!-- 작업지시 추가 -->
      <template v-if="!message.confirmType || message.confirmType === 'add'">
        <div class="card-header">
          <span class="material-icons confirm-icon">add_task</span>
          <span class="card-title">작업지시 추가 확인</span>
        </div>
        <div class="confirm-body" v-if="message.confirmData">
          <div class="confirm-row"><span class="confirm-label">라인</span><span class="confirm-value">{{ message.confirmData.line }}</span></div>
          <div class="confirm-row"><span class="confirm-label">제품</span><span class="confirm-value">{{ message.confirmData.product }}</span></div>
          <div class="confirm-row"><span class="confirm-label">수량</span><span class="confirm-value mono">{{ message.confirmData.qty }}</span></div>
        </div>
      </template>

      <!-- 작업지시 수정 -->
      <template v-else-if="message.confirmType === 'edit'">
        <div class="card-header">
          <span class="material-icons confirm-icon" style="color:#ffa502">edit</span>
          <span class="card-title" style="color:#ffa502">작업지시 수정 확인</span>
        </div>
        <div class="confirm-body" v-if="message.confirmData">
          <div class="confirm-row"><span class="confirm-label">작업번호</span><span class="confirm-value mono" style="color:#00e5ff">{{ message.confirmData.woId }}</span></div>
          <div class="confirm-row" v-if="message.confirmData.productName"><span class="confirm-label">제품</span><span class="confirm-value">{{ message.confirmData.productName }}</span></div>
          <div class="confirm-row"><span class="confirm-label">수정 항목</span><span class="confirm-value">{{ message.confirmData.field }}</span></div>
          <div class="confirm-row"><span class="confirm-label">변경 값</span><span class="confirm-value mono" style="color:#00ff88">{{ message.confirmData.newValue }}</span></div>
          <div class="confirm-row"><span class="confirm-label">요청</span><span class="confirm-value text-dim">{{ message.confirmData.summary }}</span></div>
        </div>
      </template>

      <!-- 생산실적 입력 -->
      <template v-else-if="message.confirmType === 'input-result'">
        <div class="card-header">
          <span class="material-icons confirm-icon" style="color:#00ff88">assignment_turned_in</span>
          <span class="card-title" style="color:#00ff88">생산실적 입력 확인</span>
        </div>
        <div class="confirm-body" v-if="message.confirmData">
          <div class="confirm-row"><span class="confirm-label">작업번호</span><span class="confirm-value mono" style="color:#00e5ff">{{ message.confirmData.woId || message.confirmData.wo_id }}</span></div>
          <div class="confirm-row"><span class="confirm-label">양품</span><span class="confirm-value mono" style="color:#00ff88">{{ message.confirmData.goodQty || message.confirmData.good_qty }}</span></div>
          <div class="confirm-row"><span class="confirm-label">불량</span><span class="confirm-value mono" style="color:#ff4757">{{ message.confirmData.defectQty || message.confirmData.defect_qty }}</span></div>
          <div class="confirm-row"><span class="confirm-label">요청</span><span class="confirm-value text-dim">{{ message.confirmData.summary || `작업자: ${message.confirmData.worker || '-'}` }}</span></div>
        </div>
      </template>
      
      <!-- 생산실적 수정 -->
      <template v-else-if="message.confirmType === 'edit-result'">
        <div class="card-header">
          <span class="material-icons confirm-icon" style="color:#00e5ff">edit_note</span>
          <span class="card-title" style="color:#00e5ff">생산실적 수정 확인</span>
        </div>
        <div class="confirm-body" v-if="message.confirmData">
          <div class="confirm-row"><span class="confirm-label">실적ID</span><span class="confirm-value mono" style="color:#00e5ff">{{ message.confirmData.resultId || message.confirmData.id }}</span></div>
          <div class="confirm-row"><span class="confirm-label">작업번호</span><span class="confirm-value mono">{{ message.confirmData.woId || message.confirmData.wo_id }}</span></div>
          <div class="confirm-row"><span class="confirm-label">수정 항목</span><span class="confirm-value">{{ message.confirmData.field }}</span></div>
          <div class="confirm-row"><span class="confirm-label">변경 값</span><span class="confirm-value mono" style="color:#00ff88">{{ message.confirmData.newValue }}</span></div>
          <div class="confirm-row"><span class="confirm-label">요청</span><span class="confirm-value text-dim">{{ message.confirmData.summary }}</span></div>
        </div>
      </template>

      <!-- 생산실적 삭제 -->
      <template v-else-if="message.confirmType === 'delete-result'">
        <div class="card-header">
          <span class="material-icons confirm-icon" style="color:#ff4757">delete_sweep</span>
          <span class="card-title" style="color:#ff4757">생산실적 삭제 확인</span>
        </div>
        <div class="confirm-body" v-if="message.confirmData">
          <div class="confirm-row"><span class="confirm-label">실적ID</span><span class="confirm-value mono" style="color:#00e5ff">{{ message.confirmData.resultId || message.confirmData.id }}</span></div>
          <div class="confirm-row"><span class="confirm-label">작업번호</span><span class="confirm-value mono">{{ message.confirmData.woId || message.confirmData.wo_id }}</span></div>
          <div class="confirm-row"><span class="confirm-label">양품</span><span class="confirm-value">{{ message.confirmData.goodQty || message.confirmData.good_qty }}</span></div>
          <div class="confirm-row"><span class="confirm-label">불량</span><span class="confirm-value">{{ message.confirmData.defectQty || message.confirmData.defect_qty }}</span></div>
        </div>
      </template>
      
      <!-- 작업지시 삭제 -->
      <template v-else-if="message.confirmType === 'delete'">
        <div class="card-header">
          <span class="material-icons confirm-icon" style="color:#ff4757">delete_forever</span>
          <span class="card-title" style="color:#ff4757">작업지시 삭제 확인</span>
        </div>
        <div class="confirm-body" v-if="message.confirmData">
          <div class="confirm-row"><span class="confirm-label">작업번호</span><span class="confirm-value mono" style="color:#00e5ff">{{ message.confirmData.woId }}</span></div>
          <div class="confirm-row"><span class="confirm-label">제품</span><span class="confirm-value">{{ message.confirmData.product }}</span></div>
          <div class="confirm-row"><span class="confirm-label">라인</span><span class="confirm-value">{{ message.confirmData.line }}</span></div>
          <div class="confirm-row"><span class="confirm-label">상태</span><span class="confirm-value">{{ message.confirmData.status }}</span></div>
        </div>
      </template>

      <div class="confirm-actions" v-if="message.confirmed === undefined">
        <button 
          class="btn-confirm" 
          :class="{ 'btn-delete': message.confirmType === 'delete' || message.confirmType === 'delete-result' }" 
          @click="$emit('confirm')"
        >
          <span class="material-icons" style="font-size:16px">{{ (message.confirmType === 'delete' || message.confirmType === 'delete-result') ? 'delete' : 'check' }}</span>
          {{ (message.confirmType === 'delete' || message.confirmType === 'delete-result') ? '삭제' : '확인' }}
        </button>
        <button class="btn-cancel" @click="$emit('cancel')">
          <span class="material-icons" style="font-size:16px">close</span>
          취소
        </button>
      </div>
      <div v-else-if="message.confirmed" class="confirmed-badge">
        <span class="material-icons">check_circle</span> 완료
      </div>
      <div v-else class="cancelled-badge">
        <span class="material-icons">cancel</span> 취소됨
      </div>
    </div>

    <!-- ===== RECOMMENDATION CARD (Scheduling) ===== -->
    <div v-else-if="message.type === 'recommend'" class="card-inner recommend-card">
      <div class="card-header highlight-green">
        <span class="material-icons info-icon">auto_awesome</span>
        <span class="card-title">AI OPTIMIZATION</span>
      </div>
      <div class="recommend-body">
        <div class="recommend-title">{{ message.title }}</div>
        <div class="recommend-content">
          <div class="recommend-plan">
            <div class="plan-label">추천 작업 계획</div>
            <div class="plan-text">{{ message.plan }}</div>
          </div>
          <div class="expected-effect">
            <div class="effect-item">
              <span class="effect-label">기대 생산량:</span>
              <span class="effect-value text-green">{{ message.expectedQty || '+15%' }}</span>
            </div>
            <div class="effect-item">
              <span class="effect-label">리드타임 절감:</span>
              <span class="effect-value text-cyan">{{ message.timeSaving || '20min' }}</span>
            </div>
          </div>
        </div>
        <div class="recommend-actions">
          <button class="btn-apply" @click="$emit('confirm')">
            <span class="material-icons">task_alt</span>
            이 계획으로 즉시 적용
          </button>
        </div>
      </div>
    </div>

    <!-- ===== PROGRESS CARD ===== -->
    <div v-else-if="message.type === 'progress'" class="card-inner">
      <div class="card-header">
        <span class="card-title">라인 현황</span>
      </div>
      <div class="progress-list">
        <div v-for="line in message.lines" :key="line.name" class="progress-item">
          <div class="progress-info">
            <span class="progress-name">{{ line.name }}</span>
            <span class="progress-badge" :class="lineStatusClass(line.status)">{{ line.status }}</span>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" :style="{ width: line.percent + '%', background: lineColor(line.status) }"></div>
            </div>
            <span class="progress-pct">{{ line.percent }}%</span>
          </div>
          <div class="progress-detail">
            <span>{{ line.current }}/{{ line.capacity }}</span>
            <span>가동률</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== KNOWLEDGE CARD (RAG) ===== -->
    <div v-else-if="message.type === 'knowledge'" class="card-inner knowledge-card">
      <div class="card-header highlight-amber">
        <span class="material-icons info-icon">menu_book</span>
        <span class="card-title">MAINTENANCE GUIDE (RAG)</span>
        <span class="card-count" v-if="message.confidence">{{ message.confidence }}% match</span>
      </div>
      <div class="knowledge-body">
        <div class="knowledge-source">
          <span class="material-icons" style="font-size:14px; color:#ffa502">picture_as_pdf</span>
          <span class="source-text">{{ message.source || '설비 유지보수 매뉴얼' }}</span>
        </div>
        <div class="solution-section">
          <div class="section-header">
            <span class="material-icons" style="color:#00e5ff">build</span>
            <span class="section-title">조치 방법</span>
          </div>
          <div class="solution-steps">
            <div v-if="message.steps && message.steps.length" class="steps-list">
              <div v-for="(step, idx) in message.steps" :key="idx" class="step-item">
                <span class="step-number">{{ idx + 1 }}</span>
                <span class="step-text">{{ step }}</span>
              </div>
            </div>
            <div v-else class="solution-text">{{ message.content }}</div>
          </div>
        </div>
        <div class="caution-box" v-if="message.caution">
          <span class="material-icons" style="font-size:16px">warning</span>
          <span>{{ message.caution }}</span>
        </div>
        <div class="knowledge-tags" v-if="message.tags && message.tags.length">
          <span v-for="tag in message.tags" :key="tag" class="knowledge-tag">#{{ tag }}</span>
        </div>
      </div>
    </div>

    <!-- ===== INSIGHT CARD (Data Mining) ===== -->
    <div v-else-if="message.type === 'insight'" class="card-inner insight-card">
      <div class="card-header highlight-purple">
        <span class="material-icons" style="color:#a855f7">psychology</span>
        <span class="card-title">AI DATA MINING</span>
        <span class="card-count">INSIGHT</span>
      </div>
      <div class="insight-body">
        <div class="insight-summary">
          <span class="material-icons" style="font-size:15px; color:#a855f7; flex-shrink:0">summarize</span>
          <span>{{ message.summary }}</span>
        </div>
        <div class="insight-chips" v-if="message.insights && message.insights.length">
          <div v-for="(item, idx) in message.insights" :key="idx" class="insight-chip" :class="'chip-' + item.type">
            <div class="chip-header">
              <span class="material-icons chip-icon">{{ item.type === 'warning' ? 'warning' : item.type === 'success' ? 'check_circle' : 'info' }}</span>
              <span class="chip-title">{{ item.title }}</span>
            </div>
            <p class="chip-content">{{ item.content }}</p>
          </div>
        </div>
        <div class="rca-box" v-if="message.rootCause">
          <div class="rca-label">
            <span class="material-icons" style="font-size:15px">search</span>
            ROOT CAUSE ANALYSIS
          </div>
          <p class="rca-content">{{ message.rootCause }}</p>
        </div>
        <div class="rec-section" v-if="message.recommendations && message.recommendations.length">
          <div class="section-header">
            <span class="material-icons" style="color:#00ff88; font-size:16px">lightbulb</span>
            <span class="section-title" style="color:#00ff88">AI 개선 권고</span>
          </div>
          <div class="rec-list">
            <div v-for="(rec, idx) in message.recommendations" :key="idx" class="rec-item">
              <span class="rec-number">{{ idx + 1 }}</span>
              <span class="rec-text">{{ rec }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
<script>
export default {
  name: 'ResultCard',
  props: {
    message: { type: Object, required: true }
  },
  emits: ['confirm', 'cancel'],
  methods: {
    statusClass(status) {
      if (status === '진행중') return 'chip-cyan'
      if (status === '완료')   return 'chip-green'
      if (status === '대기')   return 'chip-yellow'
      return 'chip-gray'
    },
    lineColor(status) {
      if (status === '가동중') return '#00ff88'
      if (status === '준비중') return '#ffa502'
      return '#ff4757'
    },
    lineStatusClass(status) {
      if (status === '가동중') return 'badge-green'
      if (status === '준비중') return 'badge-yellow'
      return 'badge-red'
    }
  }
}
</script>

<style scoped>
.result-card { width: 100%; }

.card-inner {
  background: #1c2333;
  border: 1px solid #2d3748;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #161b22;
  border-bottom: 1px solid #2d3748;
}

.card-title {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #00e5ff;
}

.card-count {
  margin-left: auto;
  font-size: 11px;
  color: #00e5ff;
  border: 1px solid #00e5ff44;
  background: #00e5ff11;
  padding: 2px 8px;
  border-radius: 10px;
  font-family: 'Roboto Mono', monospace;
}

.info-icon { font-size: 16px !important; color: #00e5ff; }

/* ===== TABLE ===== */
.table-wrap { overflow-x: auto; }
.mes-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.mes-table th { padding: 8px 12px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; color: #8b949e; background: #0d1117; border-bottom: 1px solid #21262d; }
.mes-table td { padding: 9px 12px; border-bottom: 1px solid #21262d; color: #c9d1d9; }
.mes-table tbody tr:last-child td { border-bottom: none; }
.mes-table tbody tr:hover td { background: #21262d; }

.mono { font-family: 'Roboto Mono', monospace; }
.text-green { color: #00ff88; }
.text-cyan  { color: #00e5ff; }
.text-red   { color: #ff4757; }
.text-dim   { color: #8b949e; }

.status-chip {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
}
.chip-cyan   { background: #00e5ff22; color: #00e5ff; border: 1px solid #00e5ff44; }
.chip-green  { background: #00ff8822; color: #00ff88; border: 1px solid #00ff8844; }
.chip-yellow { background: #ffa50222; color: #ffa502; border: 1px solid #ffa50244; }
.chip-gray   { background: #8b949e22; color: #8b949e; border: 1px solid #8b949e44; }

/* ===== CONFIRM ===== */
.confirm-card .card-header { border-bottom: 2px solid #00e5ff; }
.confirm-icon { font-size: 18px !important; color: #00e5ff; }
.confirm-body { padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
.confirm-row { display: flex; align-items: center; gap: 12px; }
.confirm-label { font-size: 11px; font-weight: 700; color: #8b949e; min-width: 70px; letter-spacing: 0.5px; }
.confirm-value { font-size: 14px; color: #c9d1d9; }

.confirm-actions {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid #21262d;
}

.btn-confirm {
  display: flex; align-items: center; gap: 6px;
  background: linear-gradient(135deg, #00e5ff22, #00e5ff44);
  border: 1px solid #00e5ff;
  color: #00e5ff;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 13px; font-weight: 700; cursor: pointer;
  transition: all 0.2s;
}
.btn-confirm:hover { background: #00e5ff33; }
.btn-delete { background: linear-gradient(135deg, #ff475722, #ff475744) !important; border-color: #ff4757 !important; color: #ff4757 !important; }
.btn-delete:hover { background: #ff475733 !important; }

.btn-cancel {
  display: flex; align-items: center; gap: 6px;
  background: transparent;
  border: 1px solid #484f58;
  color: #8b949e;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 13px; font-weight: 700; cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel:hover { border-color: #8b949e; color: #c9d1d9; }

.confirmed-badge { display: flex; align-items: center; gap: 6px; padding: 12px 16px; color: #00ff88; font-size: 13px; font-weight: 700; }
.cancelled-badge { display: flex; align-items: center; gap: 6px; padding: 12px 16px; color: #8b949e; font-size: 13px; }

/* ===== RECOMMEND ===== */
.highlight-green { background: #0d2d1a; border-bottom: 2px solid #00ff88 !important; }
.highlight-green .card-title { color: #00ff88 !important; }

.recommend-body { padding: 16px; }
.recommend-title { font-size: 15px; font-weight: 700; color: #c9d1d9; margin-bottom: 12px; }
.recommend-plan { background: #161b22; border-left: 3px solid #00ff88; padding: 10px 14px; border-radius: 0 6px 6px 0; margin-bottom: 12px; }
.plan-label { font-size: 10px; font-weight: 800; color: #00ff88; letter-spacing: 1px; margin-bottom: 4px; }
.plan-text { font-size: 13px; color: #c9d1d9; line-height: 1.5; }

.expected-effect { display: flex; gap: 24px; margin-bottom: 16px; }
.effect-item { display: flex; flex-direction: column; gap: 4px; }
.effect-label { font-size: 11px; color: #8b949e; }
.effect-value { font-size: 20px; font-weight: 700; font-family: 'Roboto Mono', monospace; }

.recommend-actions { margin-top: 4px; }
.btn-apply {
  display: flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #00ff8822, #00ff8844);
  border: 1px solid #00ff88;
  color: #00ff88;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 13px; font-weight: 700; cursor: pointer;
  transition: all 0.2s;
}
.btn-apply:hover { background: #00ff8833; transform: translateY(-1px); }

/* ===== PROGRESS ===== */
.progress-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 12px; }
.progress-item { display: flex; flex-direction: column; gap: 4px; }
.progress-info { display: flex; align-items: center; justify-content: space-between; }
.progress-name { font-size: 13px; font-weight: 600; color: #c9d1d9; }
.progress-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; }
.badge-green  { background: #00ff8822; color: #00ff88; border: 1px solid #00ff8844; }
.badge-yellow { background: #ffa50222; color: #ffa502; border: 1px solid #ffa50244; }
.badge-red    { background: #ff475722; color: #ff4757; border: 1px solid #ff475744; }

.progress-bar-wrap { display: flex; align-items: center; gap: 8px; }
.progress-bar-bg { flex: 1; height: 6px; background: #21262d; border-radius: 3px; overflow: hidden; }
.progress-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }
.progress-pct { font-size: 11px; color: #8b949e; font-family: 'Roboto Mono', monospace; min-width: 36px; text-align: right; }
.progress-detail { display: flex; justify-content: space-between; font-size: 11px; color: #484f58; }

/* ===== KNOWLEDGE (RAG) ===== */
.highlight-amber { background: #1a1400; border-bottom: 2px solid #ffa502 !important; }
.highlight-amber .card-title { color: #ffa502 !important; }
.highlight-amber .card-count { color: #ffa502; border-color: #ffa50244; background: #ffa50222; }

.knowledge-body { padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; }
.knowledge-source { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #8b949e; }
.source-text { font-style: italic; }

.solution-section {}
.section-header { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
.section-title { font-size: 12px; font-weight: 700; color: #c9d1d9; letter-spacing: 0.3px; }

.steps-list { display: flex; flex-direction: column; gap: 8px; }
.step-item { display: flex; align-items: flex-start; gap: 10px; }
.step-number {
  flex-shrink: 0; width: 22px; height: 22px;
  background: #00e5ff22; color: #00e5ff; border: 1px solid #00e5ff44;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 800;
}
.step-text { font-size: 13px; color: #c9d1d9; line-height: 1.5; }
.solution-text { font-size: 13px; color: #c9d1d9; line-height: 1.6; }

.caution-box {
  display: flex; align-items: flex-start; gap: 8px;
  background: #2d1a0d; border: 1px solid #ff6b3544;
  border-radius: 6px; padding: 10px 12px;
  font-size: 12px; color: #ff6b35; line-height: 1.5;
}

.knowledge-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.knowledge-tag {
  font-size: 11px; color: #ffa502;
  background: #ffa50215; border: 1px solid #ffa50233;
  padding: 3px 10px; border-radius: 12px; font-weight: 600;
}

/* ===== INSIGHT / DATA MINING ===== */
.highlight-purple { background: #1a0d2e; border-bottom: 2px solid #a855f7 !important; }
.highlight-purple .card-title { color: #a855f7 !important; }
.highlight-purple .card-count { color: #a855f7; border-color: #a855f744; background: #a855f722; }

.insight-body { padding: 16px; display: flex; flex-direction: column; gap: 16px; }

.insight-summary {
  display: flex; align-items: flex-start; gap: 8px;
  background: #161b22; border-left: 3px solid #a855f7;
  padding: 10px 14px; border-radius: 0 6px 6px 0;
  font-size: 13px; color: #c9d1d9; line-height: 1.5;
}

.insight-chips { display: flex; flex-direction: column; gap: 10px; }
.insight-chip { border-radius: 8px; padding: 12px 14px; border: 1px solid; }

.chip-warning { background: #2d1a0d; border-color: #ff6b3544; }
.chip-warning .chip-icon, .chip-warning .chip-title { color: #ff6b35; }
.chip-info { background: #0d1a2d; border-color: #00e5ff44; }
.chip-info .chip-icon, .chip-info .chip-title { color: #00e5ff; }
.chip-success { background: #0d2d1a; border-color: #00ff8844; }
.chip-success .chip-icon, .chip-success .chip-title { color: #00ff88; }

.chip-header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.chip-icon { font-size: 15px !important; }
.chip-title { font-size: 12px; font-weight: 800; letter-spacing: 0.5px; }
.chip-content { font-size: 12px; color: #c9d1d9; line-height: 1.5; margin: 0; padding-left: 21px; }

.rca-box { background: #0d1117; border: 1px solid #a855f744; border-radius: 8px; padding: 12px 14px; }
.rca-label { display: flex; align-items: center; gap: 6px; font-size: 9px; font-weight: 800; color: #a855f7; letter-spacing: 1px; margin-bottom: 8px; }
.rca-content { font-size: 13px; color: #c9d1d9; line-height: 1.6; margin: 0; }

.rec-list { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
.rec-item { display: flex; align-items: flex-start; gap: 10px; }
.rec-number {
  flex-shrink: 0; width: 20px; height: 20px;
  background: #00ff8822; color: #00ff88; border: 1px solid #00ff8844;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 800;
}
.rec-text { font-size: 12px; color: #c9d1d9; line-height: 1.5; }
</style>