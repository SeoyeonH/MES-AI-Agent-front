<template>
  <div v-if="visible" class="vk-container" @click.stop>
    <div class="vk-panel" :class="{ 'vk-active': visible }">
      <!-- 헤더 -->
      <div class="vk-header">
        <div class="vk-monitor">
          <span class="vk-text">{{ displayValue || '명령을 입력하세요...' }}</span>
          <span class="vk-cursor">|</span>
        </div>
        <button class="vk-close" @click="$emit('close')">
          <span class="material-icons">expand_more</span>
        </button>
      </div>

      <!-- 키보드 몸체 -->
      <div class="vk-body">
        <div v-for="(row, rowIndex) in currentLayout" :key="rowIndex" class="vk-row">
          <button
            v-for="key in row"
            :key="key.code"
            class="vk-key"
            :class="[key.cls, { 'vk-pressed': pressedKey === key.code || (key.code === 'shift' && isShift) }]"
            @mousedown.prevent="onKeyClick(key)"
          >
            <span v-if="key.icon" class="material-icons">{{ key.icon }}</span>
            <span v-else>{{ isShift && key.shift ? key.shift : key.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VirtualKeyboard',
  props: {
    value: { type: String, default: '' },
    visible: { type: Boolean, default: false }
  },
  emits: ['input', 'send', 'close'],
  data() {
    return {
      mode: 'ko',
      isShift: false,
      pressedKey: null,
      jasos: [] // 모든 입력된 자소/문자들을 순서대로 저장
    }
  },
  watch: {
    // 키보드가 새로 열릴 때, 기존 입력값이 있으면jasos에 초기화
    visible(newVal) {
      if (newVal && this.value && this.jasos.length === 0) {
        // 기존 텍스트를 글자 단위로 분해하여 jasos에 채움
        this.jasos = this.value.split('');
      } else if (!newVal) {
        this.jasos = []; // 닫히면 초기화
      }
    },
    // 외부에서 값이 비워지면 jasos도 비움 (전송 등)
    value(newVal) {
      if (newVal === '') this.jasos = [];
    }
  },
  computed: {
    displayValue() { return this.value; },
    currentLayout() {
      if (this.mode === 'num') return this.layouts.num;
      if (this.mode === 'en') return this.layouts.en;
      return this.layouts.ko;
    },
    layouts() {
      return {
        ko: [
          [{label:'ㅂ',shift:'ㅃ',code:'q'},{label:'ㅈ',shift:'ㅉ',code:'w'},{label:'ㄷ',shift:'ㄸ',code:'e'},{label:'ㄱ',shift:'ㄲ',code:'r'},{label:'ㅅ',shift:'ㅆ',code:'t'},{label:'ㅛ',code:'y'},{label:'ㅕ',code:'u'},{label:'ㅑ',code:'i'},{label:'ㅐ',shift:'ㅒ',code:'o'},{label:'ㅔ',shift:'ㅖ',code:'p'}],
          [{label:'ㅁ',code:'a'},{label:'ㄴ',code:'s'},{label:'ㅇ',code:'d'},{label:'ㄹ',code:'f'},{label:'ㅎ',code:'g'},{label:'ㅗ',code:'h'},{label:'ㅓ',code:'j'},{label:'ㅏ',code:'k'},{label:'ㅣ',code:'l'}],
          [{label:'↑',icon:'shift',code:'shift',cls:'vk-special vk-shift'},{label:'ㅋ',code:'z'},{label:'ㅌ',code:'x'},{label:'ㅊ',code:'c'},{label:'ㅍ',code:'v'},{label:'ㅠ',code:'b'},{label:'ㅜ',code:'n'},{label:'ㅡ',code:'m'},{label:'BS',icon:'backspace',code:'backspace',cls:'vk-special vk-bs'}],
          [{label:'123',code:'to_num',cls:'vk-special'},{label:'한/영',code:'to_en',cls:'vk-special'},{label:'Space',icon:'space_bar',code:'space',cls:'vk-space'},{label:'전송',icon:'send',code:'send',cls:'vk-send'}]
        ],
        en: [
          [{label:'q',shift:'Q',code:'q'},{label:'w',shift:'W',code:'w'},{label:'e',shift:'E',code:'e'},{label:'r',shift:'R',code:'r'},{label:'t',shift:'T',code:'t'},{label:'y',shift:'Y',code:'y'},{label:'u',shift:'U',code:'u'},{label:'i',shift:'I',code:'i'},{label:'o',shift:'O',code:'o'},{label:'p',shift:'P',code:'p'}],
          [{label:'a',shift:'A',code:'a'},{label:'s',shift:'S',code:'s'},{label:'d',shift:'D',code:'d'},{label:'f',shift:'F',code:'f'},{label:'g',shift:'G',code:'g'},{label:'h',shift:'H',code:'h'},{label:'j',shift:'J',code:'j'},{label:'k',shift:'K',code:'k'},{label:'l',shift:'L',code:'l'}],
          [{label:'↑',icon:'shift',code:'shift',cls:'vk-special vk-shift'},{label:'z',shift:'Z',code:'z'},{label:'x',shift:'X',code:'x'},{label:'c',shift:'C',code:'c'},{label:'v',shift:'V',code:'v'},{label:'b',shift:'B',code:'b'},{label:'n',shift:'N',code:'n'},{label:'m',shift:'M',code:'m'},{label:'BS',icon:'backspace',code:'backspace',cls:'vk-special vk-bs'}],
          [{label:'123',code:'to_num',cls:'vk-special'},{label:'한/영',code:'to_ko',cls:'vk-special'},{label:'Space',icon:'space_bar',code:'space',cls:'vk-space'},{label:'전송',icon:'send',code:'send',cls:'vk-send'}]
        ],
        num: [
          [{label:'1',code:'1'},{label:'2',code:'2'},{label:'3',code:'3'},{label:'4',code:'4'},{label:'5',code:'5'},{label:'6',code:'6'},{label:'7',code:'7'},{label:'8',code:'8'},{label:'9',code:'9'},{label:'0',code:'0'}],
          [{label:'-',code:'-'},{label:'/',code:'/'},{label:':',code:':'},{label:';',code:';'},{label:'(',code:'('},{label:')',code:')'},{label:'$',code:'$'},{label:'&',code:'&'},{label:'@',code:'@'},{label:'"',code:'"'}],
          [{label:'#+*',code:'to_sym',cls:'vk-special'},{label:'.',code:'.'},{label:',',code:','},{label:'?',code:'?'},{label:'!',code:'!'},{label:"'",code:"'"},{label:'BS',icon:'backspace',code:'backspace',cls:'vk-special vk-bs'}],
          [{label:'ABC',code:'to_ko',cls:'vk-special'},{label:'Space',icon:'space_bar',code:'space',cls:'vk-space'},{label:'전송',icon:'send',code:'send',cls:'vk-send'}]
        ]
      }
    }
  },
  methods: {
    onKeyClick(key) {
      this.pressedKey = key.code;
      setTimeout(() => { if (this.pressedKey === key.code) this.pressedKey = null; }, 80);

      const code = key.code;
      if (code === 'to_num') { this.mode = 'num'; return; }
      if (code === 'to_en' || code === 'to_ko') { this.mode = (code === 'to_en' ? 'en' : 'ko'); return; }
      if (code === 'shift') { this.isShift = !this.isShift; return; }
      if (code === 'send') { this.$emit('send'); return; }

      if (code === 'backspace') {
        if (this.jasos.length > 0) {
          this.jasos.pop();
          this.recombine();
        } else {
          this.$emit('input', this.value.slice(0, -1));
        }
        return;
      }

      if (code === 'space') {
        this.jasos.push(' ');
        this.recombine();
        return;
      }

      const char = this.isShift && key.shift ? key.shift : key.label;
      
      // 어떤 모드이든 상관없이 jasos 리스트에 추가 (동기화 핵심)
      this.jasos.push(char);
      this.recombine();

      if (this.isShift && code !== 'shift') this.isShift = false;
    },

    recombine() {
      const result = this.assemble(this.jasos);
      this.$emit('input', result);
    },

    assemble(jasos) {
      if (jasos.length === 0) return "";
      
      const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
      const JUNG = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ";
      const JONG = " ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ";

      let result = "";
      let i = 0;
      
      while (i < jasos.length) {
        let char = jasos[i];
        let cho = CHO.indexOf(char);
        
        // 초성이 아니거나 한글이 아니면 그냥 출력
        if (cho === -1 || JUNG.indexOf(char) !== -1) {
          result += char;
          i++;
          continue;
        }

        // 초성 발견
        i++;
        let jung = -1;
        if (i < jasos.length) {
          jung = JUNG.indexOf(jasos[i]);
          if (jung !== -1) {
            i++;
            // 복합 중성
            if (i < jasos.length) {
              let nextJung = JUNG.indexOf(jasos[i]);
              let combinedJung = this.combineJung(jung, nextJung);
              if (combinedJung !== -1) {
                jung = combinedJung;
                i++;
              }
            }

            // 종성 체크
            let jong = 0;
            if (i < jasos.length) {
              // 다음 글자가 모음인지 체크 (연음 적용)
              if (JUNG.indexOf(jasos[i+1]) === -1) {
                let tempJong = JONG.indexOf(jasos[i]);
                if (tempJong !== -1) {
                  jong = tempJong;
                  i++;
                  // 복합 종성
                  if (i < jasos.length && JUNG.indexOf(jasos[i]) === -1) {
                    let combinedJong = this.combineJong(jong, JONG.indexOf(jasos[i]));
                    if (combinedJong !== -1) {
                      jong = combinedJong;
                      i++;
                    }
                  }
                }
              }
            }
            result += String.fromCharCode(44032 + (cho * 588) + (jung * 28) + jong);
          } else {
            result += CHO[cho];
          }
        } else {
          result += CHO[cho];
        }
      }
      return result;
    },

    combineJung(j1, j2) {
      if (j1 === 8) { // ㅗ
        if (j2 === 0) return 9; if (j2 === 1) return 10; if (j2 === 20) return 11;
      }
      if (j1 === 13) { // ㅜ
        if (j2 === 4) return 14; if (j2 === 5) return 15; if (j2 === 20) return 16;
      }
      if (j1 === 18 && j2 === 20) return 19;
      return -1;
    },

    combineJong(j1, j2) {
      if (j1 === 4) { // ㄴ
        if (j2 === 22) return 5; if (j2 === 27) return 6;
      }
      if (j1 === 8) { // ㄹ
        if (j2 === 1) return 9; if (j2 === 16) return 10; if (j2 === 17) return 11;
        if (j2 === 19) return 12; if (j2 === 25) return 13; if (j2 === 26) return 14;
        if (j2 === 27) return 15;
      }
      if (j1 === 17 && j2 === 19) return 18;
      return -1;
    }
  }
}
</script>

<style scoped>
.vk-container { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; pointer-events: none; }
.vk-panel { width: 100%; height: auto; background: #1c2333; border-top: 1px solid #00e5ff44; border-radius: 24px 24px 0 0; padding: 20px 15px 35px; box-shadow: 0 -10px 50px rgba(0,0,0,0.6); pointer-events: auto; transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.1); }
.vk-active { transform: translateY(0); }
.vk-header { display: flex; gap: 12px; margin-bottom: 20px; align-items: center; }
.vk-monitor { flex: 1; background: #0d1117; border: 1px solid #30363d; border-radius: 12px; padding: 0 18px; height: 50px; display: flex; align-items: center; color: #00e5ff; font-family: 'Noto Sans KR', sans-serif; font-size: 16px; font-weight: 500; overflow: hidden; }
.vk-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vk-cursor { animation: blink 1s infinite; margin-left: 2px; color: #00e5ff; font-weight: bold; }
@keyframes blink { 50% { opacity: 0; } }
.vk-close { background: #30363d; border: none; color: #c9d1d9; cursor: pointer; border-radius: 12px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
.vk-body { display: flex; flex-direction: column; gap: 10px; }
.vk-row { display: flex; justify-content: center; gap: 8px; }
.vk-key { flex: 1; height: 54px; max-width: 72px; background: #2d333b; border: none; border-radius: 8px; color: #adbac7; font-size: 20px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.05s; box-shadow: 0 4px 0 #161b22; user-select: none; touch-action: manipulation; }
.vk-key:active, .vk-pressed { transform: translateY(3px); box-shadow: 0 1px 0 #161b22; background: #00e5ff; color: #0d1117; }
.vk-special { background: #444c56; max-width: 95px; font-size: 15px; }
.vk-bs { color: #ff6b6b; }
.vk-space { max-width: 340px; flex: 4; font-size: 15px; }
.vk-send { background: linear-gradient(135deg, #00b4cc, #00e5ff); color: #0d1117; max-width: 110px; font-weight: 800; border: none; }
@media (max-width: 600px) { .vk-key { height: 50px; font-size: 18px; gap: 4px; } .vk-panel { padding-bottom: 25px; } }
</style>
