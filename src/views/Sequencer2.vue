<template>
  <div>
    <div>
      <span style="color: red; font-size: 30px;">最初に必ずstartをクリックしろ</span>
      <br />
      <button @click="start">start</button>
      <button @click="stop">stop</button>
      bpm: <input type="number" @input="bpmChanged" /> bfreq: <input type="number" v-model="bfreq" min="1" max="15" />
      <br />
      pattern gen: <input id="generated" type="text" size="100" />
      <button @click="generate">generate</button>
    </div>
    <editor class="editor" @change="sourceChanged"></editor>
    <p>name:synth type:pattern:next synth name;</p>
  </div>
</template>

<script>
import ER from "euclidean-rhythms";
import editor from "@/components/editor";
import ChainSequencer from "@/assets/js/ChainSequencer";
import Tone from "tone";

// ド3 -> C3
const ja2en = {
  A: "ラ",
  B: "シ",
  C: "ド",
  D: "レ",
  E: "ミ",
  F: "ファ",
  G: "ソ"
};

export default {
  name: "Sequencer2",
  components: { editor },
  data: function () {
    return {
      audioStarted: false,
      sequences: {},
      synths: {},
      bfreq: 4
    };
  },
  methods: {
    start() {
      // this.sequences = [];
      // this.synths = {};

      const triangle = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0.3,
          release: 1
        }
      }).toMaster();
      this.synths["triangle"] = triangle;

      const sine = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: {
          attack: 0.1,
          decay: 0.05,
          sustain: 0.4,
          release: 0.5
        }
      }).toMaster();
      this.synths["sine"] = sine;

      const noise = new Tone.NoiseSynth({
        noise: {
          type: "white"
        },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0
        }
      }).toMaster();
      this.synths["noise"] = noise;

      Tone.Transport.start();
      this.audioStarted = true;

      Tone.Transport.bpm.value = 80;

      // this.synth.triggerAttackRelease("C4", "8n");
    },
    stop() {
      Tone.Transport.stop();
    },
    generate() {
      const tar = document.querySelector("#generated");

      const rhythm = ER.getPattern(Math.floor(parseInt(this.bfreq) + Math.random() * 3 - 1), 16);
      console.log(rhythm);

      const pattern = rhythm.map(e => {
        if (e) {
          return Object.values(ja2en)[Math.floor(Math.random() * 7)] + Math.floor(Math.random() * 4 + 1);
        } else {
          return "";
        }
      });

      const synth = Object.keys(this.synths)[Math.floor(Math.random() * Object.keys(this.synths).length)];
      const name = synth + Math.floor(Math.random() * 10);
      tar.value = `${name}:${synth}:${pattern.join(",")}:${name};`;
    },
    bpmChanged(e) {
      // this.stop();
      Tone.Transport.bpm.value = e.target.value;
      // this.start();
    },
    sourceChanged(value) {
      // if (!this.audioStarted) return;
      for (let s of Object.values(this.sequences)) {
        s.stop();
      }

      this.sequences = {};

      const test_pattern = `tri1:noise:シ3,,,ド4,,ラ1,,ミ3,,,ド4,,ファ2,,ファ2,:tri1;`;

      let text = value.replace(/(\s|\n)/g, "");

      const sequence_sources = text.split(";");

      // 一時的に次のsynthの文字列をいれて置く用
      const tmp_nexts = {};

      const start_sequences = [];

      for (let s of sequence_sources) {
        if (s.length === 0) continue;
        // params: [name, synthType, notes]

        let name;
        let start_flag = false;

        let params = s.split(":");

        if (params[0].charAt(0) === "!") {
          name = params[0].slice(1);
          start_flag = true;
        } else {
          name = params[0];
        }

        console.log(this.synths[params[1]], params[1]);
        if (!this.synths[params[1]]) {
          console.log("synth type is wrong.");
          continue;
        }

        for (let k of Object.keys(ja2en)) {
          const r = new RegExp(ja2en[k], "g");
          params[2] = params[2].replace(r, k);
        }

        const arr = params[2].split(",");
        // sequenceの長さのチェック
        if (arr.length !== 16) {
          console.log("pattern length must be 16.");
          continue;
        }
        console.log(arr);
        // 正しいパターンC3,D4などになっているかのチェック
        // if (!arr.every((e) => /[A-G][0-9]/.test(e))) {
        if (!arr.every(e => Tone.isNote(e) || e.length === 0)) {
          console.log("pattern error.");
          continue;
        }

        this.sequences[name] = new ChainSequencer((time, note) => {
          console.log(note, time, Tone.Transport.position);
          if (note !== "") {
            if (params[1] === "noise") {
              this.synths[params[1]].triggerAttackRelease("8n", time);
            } else {
              this.synths[params[1]].triggerAttackRelease(note, "8n", time);
            }
          }
        }, arr);

        if (start_flag) start_sequences.push(name);

        tmp_nexts[name] = params[3];
      }

      // nextの部分をつなぐ処理
      for (let name of Object.keys(tmp_nexts)) {
        if (!this.sequences[tmp_nexts[name]]) {
          console.log(`${name} synth's next synth '${tmp_nexts[name]}' is wrong.`);
          continue;
        }

        this.sequences[name].next = this.sequences[tmp_nexts[name]];
      }

      // とりあえず，最初のやつをスタート
      // if (Object.keys(this.sequences).length > 0) {
      //   this.sequences[Object.keys(this.sequences)[0]].start();
      // }

      for (let name of start_sequences) {
        this.sequences[name].start();
      }

      console.log(this.sequences);
    }
  }
};
</script>

<style scoped>
.editor {
  width: 900px;
  height: 300px;
}
</style>
