<template>
  <div class="chat-area" ref="scrollContainer">
    <div class="chat-inner">
      <transition-group name="msg" tag="div">
        <MessageBubble
          v-for="msg in messages"
          :key="msg.id"
          :message="msg"
          @confirm="$emit('confirm', msg.id)"
          @cancel="$emit('cancel', msg.id)"
        />
      </transition-group>
      <div ref="anchor"></div>
    </div>
  </div>
</template>

<script>
import MessageBubble from './MessageBubble.vue'

export default {
  name: 'ChatArea',
  components: { MessageBubble },
  props: {
    messages: { type: Array, default: () => [] }
  },
  emits: ['confirm', 'cancel'],
  methods: {
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.scrollContainer
        if (el) el.scrollTop = el.scrollHeight
      })
    }
  }
}
</script>

<style scoped>
.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #0d1117;
}

.chat-inner {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Transition animations */
.msg-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.msg-enter {
  opacity: 0;
  transform: translateY(16px);
}
</style>
