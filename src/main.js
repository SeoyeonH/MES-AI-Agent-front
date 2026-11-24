import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)

const vuetify = new Vuetify({
    theme: {
        dark: true,
        themes: {
            dark: {
                primary: '#00e5ff',
                secondary: '#00ff88',
                accent: '#ff6b35',
                error: '#ff4757',
                warning: '#ffa502',
                info: '#00e5ff',
                success: '#00ff88',
                background: '#0d1117',
                surface: '#161b22',
                panel: '#1c2333',
            }
        }
    },
    icons: {
        iconfont: 'md'
    }
})

Vue.config.productionTip = false

new Vue({
    vuetify,
    render: h => h(App)
}).$mount('#app')
