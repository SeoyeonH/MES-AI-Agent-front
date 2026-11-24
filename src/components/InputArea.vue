<template>
  <div class="input-area">
    <!-- Quick hint chips with horizontal scroll to save space -->
    <div class="hint-scroll-wrapper">
      <div class="hint-container">
        <div v-for="cat in hintCategories" :key="cat.label" class="hint-group">
          <div class="hint-group-header">
            <span class="material-icons group-icon" :style="{ color: cat.color }">{{ cat.icon }}</span>
            <span class="group-label">{{ cat.label }}</span>
          </div>
          <div class="hint-group-divider"></div>
          <div class="hint-chips">
            <button
              v-for="item in cat.items"
              :key="item.full"
              class="hint-chip"
              :class="{ 'danger-chip': item.isDanger }"
              @click="selectHint(item.full)"
            >
              <span class="material-icons chip-inner-icon">{{ item.icon }}</span>
              {{ item.text }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main input row -->
    <div class="input-row">
      <!-- Mic Button -->
      <button
        class="mic-btn"
        :class="{ recording: isRecording, transcribing: isTranscribing, 'mic-unavailable': !micAvailable }"
        @click="toggleRecording"
        :disabled="isTranscribing"
      >
        <span class="material-icons mic-icon">
          {{ isTranscribing ? 'autorenew' : isRecording ? 'mic' : 'mic_none' }}
        </span>
        <div v-if="isRecording" class="pulse-ring"></div>
      </button>

      <!-- Text Input -->
      <div class="input-wrapper">
        <input
          ref="textInput"
          :value="inputText"
          @input="inputText = $event.target.value"
          class="text-input"
          :placeholder="placeholderText"
          @keydown.enter="sendMessage"
          @click="showKeyboard = true"
          inputmode="none"
          :disabled="isRecording || isTranscribing"
        />
        <!-- Noise & Confidence Indicators -->
        <div class="input-status-overlay">
          <div v-if="isRecording" class="noise-meter">
            <div class="meter-bar" :style="{ height: Math.random() * 60 + 20 + '%' }"></div>
            <div class="meter-bar" :style="{ height: Math.random() * 80 + 10 + '%' }"></div>
            <div class="meter-bar" :style="{ height: Math.random() * 40 + 40 + '%' }"></div>
            <span class="noise-label">ENVIRONMENT NOISE: 45dB</span>
          </div>
          <div v-if="lastConfidence" class="confidence-badge" :class="confidenceClass">
            <span class="material-icons">verified</span>
            CONFIDENCE: {{ lastConfidence }}%
          </div>
        </div>
      </div>



      <!-- Send Button -->
      <button class="send-btn" @click="sendMessage" :disabled="!inputText.trim() && !isRecording">
        <span class="material-icons">send</span>
        <span class="send-label">SEND</span>
      </button>
    </div>

    <!-- 커스텀 가상 키보드 -->
    <VirtualKeyboard
      :visible="showKeyboard"
      v-model="inputText"
      @send="sendMessage"
      @close="showKeyboard = false"
    />
  </div>
</template>

<script>
import VirtualKeyboard from './VirtualKeyboard.vue';

export default {
  name: 'InputArea',
  components: { VirtualKeyboard },
  emits: ['send'],
  data() {
    return {
      inputText: '',
      isRecording: false,
      isTranscribing: false,
      mediaRecorder: null,
      audioChunks: [],
      lastWasVoice: false,
      showKeyboard: false,
      lastConfidence: null,
      hintCategories: [
        {
          label: '작업지시',
          icon: 'assignment',
          color: '#00e5ff',
          items: [
            { text: '조회', full: '작업지시 조회', icon: 'search' },
            { text: '추가', full: '작업지시 추가', icon: 'add' },
            { text: '수정', full: '작업지시 수정', icon: 'edit' },
            { text: '삭제', full: '작업지시 삭제', icon: 'delete', isDanger: true },
          ]
        },
        {
          label: '생산실적',
          icon: 'analytics',
          color: '#00ff88',
          items: [
            { text: '조회', full: '생산실적 조회', icon: 'list_alt' },
            { text: '입력', full: '생산실적 입력', icon: 'playlist_add_check' },
            { text: '수정', full: '생산실적 수정', icon: 'history_edu' },
            { text: '삭제', full: '생산실적 삭제', icon: 'backspace', isDanger: true },
          ]
        },
        {
          label: '생산계획',
          icon: 'event_note',
          color: '#ffa502',
          items: [
            { text: '추천', full: '최적 생산계획 추천', icon: 'auto_awesome' },
            { text: '조회', full: '생산스케줄 조회', icon: 'calendar_today' },
            { text: '분석', full: '라인 가동 효율 분석', icon: 'query_stats' },
          ]
        },
        {
          label: '설비가이드',
          icon: 'menu_book',
          color: '#ff6b81',
          items: [
            { text: '조치방법', full: '설비에 이상이 있어. 조치방법 알려줘', icon: 'build' },
          ]
        },
        {
          label: 'AI분석',
          icon: 'psychology',
          color: '#a855f7',
          items: [
            { text: '종합분석', full: '생산 데이터 전체 분석해줘', icon: 'analytics' },
            { text: '불량원인', full: '불량 원인 분석해줘', icon: 'bug_report' },
            { text: '생산성', full: '라인별 생산성 분석해줘', icon: 'trending_up' },
          ]
        }
      ]
    }
  },
  computed: {
    micAvailable() {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    },
    confidenceClass() {
      if (this.lastConfidence >= 90) return 'conf-high';
      if (this.lastConfidence >= 70) return 'conf-mid';
      return 'conf-low';
    },
    placeholderText() {
      if (this.isTranscribing) return '🤖 Whisper 변환 중...'
      if (this.isRecording) return '🎤 음성을 듣고 있습니다...'
      return '명령을 입력하거나 🎤 마이크를 누르세요...'
    }
  },
  methods: {
    toggleRecording() {
      if (this.isRecording) this.stopRecording();
      else this.startRecording();
    },

    async startRecording() {
      if (!this.micAvailable || this.isRecording || this.isTranscribing) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.audioChunks = [];
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (e) => this.audioChunks.push(e.data);
        this.mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(t => t.stop());
          await this.sendAudioToWhisper();
        };
        this.mediaRecorder.start();
        this.isRecording = true;
      } catch (e) {
        console.warn('마이크 에러:', e);
        this.isRecording = false;
      }
    },

    stopRecording() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop();
        this.isRecording = false;
      }
    },

    async sendAudioToWhisper() {
      if (this.audioChunks.length === 0) return;
      this.isTranscribing = true;
      try {
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');
        const res = await fetch('http://localhost:5000/api/transcribe', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.text) {
          this.inputText = data.text;
          this.lastWasVoice = true;
          // 가상의 신뢰도 점수 (실제로는 Whisper API의 logprob 등을 활용 가능)
          this.lastConfidence = Math.floor(Math.random() * 20) + 80; 
          this.sendMessage();
        }
      } catch (e) {
        console.error('Whisper 에러:', e);
      } finally {
        this.isTranscribing = false;
        this.audioChunks = [];
      }
    },

    sendMessage() {
      const text = this.inputText.trim();
      if (!text) return;
      this.$emit('send', { text, isVoice: this.lastWasVoice });
      this.inputText = '';
      this.lastWasVoice = false;
      if (this.showKeyboard) this.showKeyboard = false;
    },

    selectHint(hint) {
      this.inputText = hint;
      this.sendMessage();
    }
  }
}
</script>


<style scoped>
.input-area {
  background: #161b22;
  border-top: 1px solid #21262d;
  padding: 10px 16px 12px;
  flex-shrink: 0;
}

/* === HINT SYSTEM (HORIZONTAL SCROLL) === */
.hint-scroll-wrapper {
  overflow-x: auto;
  overflow-y: hidden;
  margin-bottom: 12px;
  /* Hide scrollbar for Chrome, Safari and Opera */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.hint-scroll-wrapper::-webkit-scrollbar {
  display: none;
}

.hint-container {
  display: flex;
  gap: 12px;
  padding: 2px 4px;
  width: max-content;
}

.hint-group {
  display: flex;
  align-items: center;
  background: #1c2333;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 6px 14px;
  gap: 12px;
}

.hint-group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.group-icon {
  font-size: 18px;
}

.group-label {
  font-size: 11px;
  font-weight: 800;
  color: #8b949e;
  letter-spacing: 0.5px;
}

.hint-group-divider {
  width: 1px;
  height: 14px;
  background: #30363d;
}

.hint-chips {
  display: flex;
  gap: 6px;
  white-space: nowrap;
}

.hint-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  color: #c9d1d9;
  font-size: 11px;
  font-family: 'Noto Sans KR', sans-serif;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.chip-inner-icon {
  font-size: 14px;
  color: #8b949e;
}

.hint-chip:hover {
  border-color: #00e5ff;
  color: #00e5ff;
  background: #00e5ff11;
  transform: translateY(-2px);
}

.hint-chip:hover .chip-inner-icon {
  color: #00e5ff;
}

.danger-chip:hover {
  border-color: #ff4757;
  color: #ff4757;
  background: #ff475711;
}
.danger-chip:hover .chip-inner-icon {
  color: #ff4757;
}

/* === INPUT ROW === */
.input-row {
  display: flex;
  align-items: center;
  gap: 10px;
}




/* === MIC BUTTON === */
.mic-btn {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid #30363d;
  background: #1c2333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.mic-btn:hover:not(.recording):not(.mic-unavailable) {
  border-color: #00e5ff;
  background: #00e5ff11;
}

.mic-btn.recording {
  background: #ff1a2e;
  border-color: #ff1a2e;
  box-shadow: 0 0 20px #ff1a2e66;
}

.mic-btn.mic-unavailable {
  opacity: 0.4;
  cursor: not-allowed;
}

.mic-btn.transcribing {
  background: #0d2a4a;
  border-color: #00e5ff;
  box-shadow: 0 0 20px #00e5ff44;
  cursor: wait;
}

.mic-btn.transcribing .mic-icon {
  color: #00e5ff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.mic-icon {
  font-size: 26px;
  color: #c9d1d9;
  z-index: 1;
  position: relative;
}
.recording .mic-icon { color: #fff; }

/* Pulse animation for recording */
.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px solid #ff1a2e;
  animation: mic-pulse 1.5s infinite ease-out;
  pointer-events: none;
}
.pulse-ring-2 {
  animation-delay: 0.5s;
}
@keyframes mic-pulse {
  0%   { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
}

/* === TEXT INPUT === */
.input-wrapper {
  flex: 1;
  position: relative;
}

.text-input {
  width: 100%;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  color: #c9d1d9;
  font-size: 15px;
  font-family: 'Noto Sans KR', sans-serif;
  padding: 14px 16px;
  outline: none;
  transition: border-color 0.2s;
}
.text-input::placeholder { color: #484f58; }
.text-input:focus { border-color: #00e5ff; }
.text-input:disabled { opacity: 0.6; }

.recording-indicator {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: #00e5ff;
  letter-spacing: 1px;
}

.input-status-overlay {
  position: absolute;
  right: 12px;
  top: -24px;
  display: flex;
  gap: 12px;
  pointer-events: none;
}

.noise-meter {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
  background: rgba(0,0,0,0.3);
  padding: 2px 6px;
  border-radius: 4px;
}

.meter-bar {
  width: 3px;
  background: #00ff88;
  border-radius: 1px;
  transition: height 0.1s;
}

.noise-label {
  font-size: 9px;
  color: #8b949e;
  margin-left: 4px;
  font-weight: 700;
}

.confidence-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(0,0,0,0.5);
}

.conf-high { color: #00ff88; border: 1px solid #00ff8844; }
.conf-mid { color: #ffa502; border: 1px solid #ffa50244; }
.conf-low { color: #ff4757; border: 1px solid #ff475744; }

.rec-dot {
  width: 7px;
  height: 7px;
  background: #ff4757;
  border-radius: 50%;
  animation: blink 1s infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

/* === SEND BUTTON === */
.send-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 22px;
  background: linear-gradient(135deg, #00b4cc, #00e5ff);
  border: none;
  border-radius: 8px;
  color: #0d1117;
  font-size: 13px;
  font-weight: 900;
  font-family: 'Noto Sans KR', sans-serif;
  letter-spacing: 1.5px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px #00e5ff44;
}
.send-btn:active { transform: translateY(0); }
.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.send-btn .material-icons { font-size: 18px; }

@media (max-width: 600px) {
  .send-label { display: none; }
}
</style>
