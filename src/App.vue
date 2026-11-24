<template>
  <v-app class="mes-app">
    <MesAgentPage />
  </v-app>
</template>

<script>
import MesAgentPage from './views/MesAgentPage.vue'

export default {
  name: 'App',
  components: { MesAgentPage }
}
</script>

<style>
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 100%;
  background-color: #0d1117;
}

.mes-app {
  background-color: #0d1117 !important;
  font-family: 'Noto Sans KR', 'Roboto', sans-serif !important;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #161b22;
}
::-webkit-scrollbar-thumb {
  background: #30363d;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #00e5ff;
}
</style>
