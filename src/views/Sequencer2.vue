<template>
  <div>
    <div>
      <button @click="start">start</button>
    </div>
    <editor class="editor" @change="sourceChanged"></editor>
  </div>
</template>

<script>
import editor from "@/components/editor";
import ChainSequencer from "@/assets/js/ChainSequencer";
import Tone from "tone";

export default {
  name: "Sequencer2",
  components: { editor },
  data: function () {
    return {
      audioStarted: false,
      sequences: []
    };
  },
  methods: {
    start() {
      this.sequences = [];

      this.synth = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0.3,
          release: 1
        }
      }).toMaster();

      Tone.Transport.start();
      this.audioStarted = true;

      this.synth.triggerAttackRelease("C4", "8n");
    },
    sourceChanged(value) {
      // if (!this.audioStarted) return;
      for (let s of this.sequences) {
        s.stop();
      }

      this.sequences = [];

      const test_pattern = `d3,,,,d3,,,,d3,,,,d3,,,;\nc3,,,,c3,,,,c3,,,,c3,,,;`;

      let text = test_pattern.replace(" ", "").replace("\n", "");

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

      for (let k of Object.keys(ja2en)) {
        text.replace(ja2en[k], k);
      }

      const sequences = text.split(";");

      for (let s of sequences) {
        const arr = s.split(",");
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

        this.sequences.push(
          new ChainSequencer((time, note) => {
            console.log(note, time, Tone.Transport.position);
            if (note !== "") {
              this.synth.triggerAttackRelease(note, "8n", time);
            }
          }, arr)
        );

        // とりあえず，次のやつに繋いでる
        if (this.sequences.length >= 2) {
          this.sequences[this.sequences.length - 2].next = this.sequences[this.sequences.length - 1];
        }
      }

      // とりあえず，最後のやつを最初のやつに繋いでループ
      if (this.sequences.length > 0) {
        this.sequences[this.sequences.length - 1].next = this.sequences[0];
        this.sequences[0].start();
      }

      console.log(this.sequences);
    }
  }
};
</script>

<style scoped>
.editor {
  width: 500px;
  height: 600px;
}
</style>
