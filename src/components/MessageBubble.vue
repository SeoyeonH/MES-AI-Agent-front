<template>
  <div class="bubble-wrapper" :class="message.role === 'user' ? 'user-wrapper' : 'ai-wrapper'">

    <!-- AI Avatar -->
    <div v-if="message.role === 'ai'" class="ai-avatar">AI</div>

    <div class="bubble-col" :class="message.role === 'user' ? 'col-user' : 'col-ai'">

      <!-- User Bubble -->
      <div v-if="message.role === 'user'" class="user-bubble">
        <span v-if="message.isVoice" class="voice-icon">🎤</span>
        {{ message.text }}
      </div>

      <!-- AI Bubble -->
      <div v-else class="ai-bubble">
        <div v-if="message.type === 'text'" class="ai-text" v-html="formatText(message.text)"></div>
        <ResultCard
          v-else
          :message="message"
          @confirm="$emit('confirm')"
          @cancel="$emit('cancel')"
        />
      </div>

      <div class="msg-time" :class="message.role === 'user' ? 'time-right' : 'time-left'">
        {{ message.time }}
      </div>
    </div>

    <!-- User Avatar -->
    <div v-if="message.role === 'user'" class="user-avatar">나</div>
  </div>
</template>

<script>
import ResultCard from './ResultCard.vue'

export default {
  name: 'MessageBubble',
  components: { ResultCard },
  props: {
    message: { type: Object, required: true }
  },
  emits: ['confirm', 'cancel'],
  methods: {
    formatText(text) {
      return text.replace(/\n/g, '<br>').replace(/•/g, '<br>•')
    }
  }
}
</script>

<style scoped>
.bubble-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
}
.user-wrapper { flex-direction: row-reverse; }
.ai-wrapper   { flex-direction: row; }

.bubble-col { display: flex; flex-direction: column; max-width: 72%; }
.col-user { align-items: flex-end; }
.col-ai   { align-items: flex-start; }

/* AI Avatar */
.ai-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #00e5ff22, #00e5ff44);
  border: 1px solid #00e5ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  color: #00e5ff;
  flex-shrink: 0;
  letter-spacing: 0.5px;
}

/* User Avatar */
.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #1c2a4a, #1a3a5c);
  border: 1px solid #2d6a9f;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #58a6ff;
  flex-shrink: 0;
}

/* User Bubble */
.user-bubble {
  background: linear-gradient(135deg, #1c2a4a, #1a3a5c);
  border: 1px solid #2d4a7a;
  border-radius: 16px 4px 16px 16px;
  color: #c9d1d9;
  font-size: 15px;
  font-weight: 400;
  padding: 12px 16px;
  line-height: 1.5;
  word-break: break-word;
}

.voice-icon {
  margin-right: 6px;
  font-size: 13px;
}

/* AI Bubble */
.ai-bubble {
  background: #161b22;
  border: 1px solid #21262d;
  border-radius: 4px 16px 16px 16px;
  padding: 14px 16px;
  color: #c9d1d9;
  font-size: 15px;
  line-height: 1.6;
}

.ai-text { white-space: pre-line; }

/* Time */
.msg-time {
  font-size: 11px;
  color: #484f58;
  margin-top: 4px;
  font-family: 'Roboto Mono', monospace;
}
.time-left  { text-align: left;  margin-left: 4px; }
.time-right { text-align: right; margin-right: 4px; }
</style>
