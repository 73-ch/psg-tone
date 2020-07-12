<template>
  <div>
    <p class="tone-transport"></p>
    <button @click="start">start</button>
  </div>
</template>

<script>
import Tone from "tone";
import ER from "euclidean-rhythms";

export default {
  name: "Sequencer",
  methods: {
    six2TT(sixteenths) {
      return `${Math.floor(sixteenths / 16)}:${Math.floor((sixteenths % 16) / 4)}:${sixteenths % 4}`;
    },
    tt2Six(tt) {
      return tt.split(":").reduce((s, e) => s * 4 + parseInt(e));
    },
    start() {
      this.ctx = Tone.context;

      this.noise_buffer = this.ctx.createBuffer(1, 44100, 44100);
      for (let i = 0; i < 44100; ++i) {
        this.noise_buffer[i] = Math.floor(Math.random() * 8.0) / 8.0 - 0.5;
      }

      this.noise_osc = this.ctx.createScriptProcessor(1024);

      let ni = 0;
      this.noise_osc.addEventListener("audioprocess", (e) => {
        const out0 = e.outputBuffer.getChannelData(0);
        const out1 = e.outputBuffer.getChannelData(1);
        for (let i = 0; i < 1024; ++i, ni = (ni + 1) % 44100) {
          out0[i] = out1[i] = this.noise_buffer[ni];
        }
      });

      //make an autofilter to shape the noise
      const filter = new Tone.Filter(800, "bandpass");

      //connect the noise
      Tone.connect(this.noise_osc, filter);
      const ampEnv = new Tone.AmplitudeEnvelope({
        attack: 0.01,
        decay: 0.1,
        sustain: 0.1,
        release: 0.01
      }).toMaster();

      filter.connect(ampEnv);

      // const tones = [
      //   {"time" : 0, "note" : "C3", "velocity": 0.9, "test": 0.32},
      //   {"time" : "0:2", "note" : "C4", "velocity": 0.5, "test": 0.2}
      // ];

      // const part = new Tone.Part(function(time, value) {
      //   console.log(time, value);
      // }, tones);

      // part.start(0);

      const BPM = Math.floor(Math.random() * 30) + 90;
      const lenTT = "32:0:0";
      const lenSix = this.tt2Six(lenTT);

      Tone.Transport.BPM = BPM;
      Tone.Transport.loop = true;
      Tone.Transport.loopEnd = lenTT;
      Tone.Transport.start(0);

      // random snare

      // for (let i = 0; i < 200; i++) {
      //   if (Math.random() > 0.3) {
      //     console.log(this.six2TT(Math.floor(Math.random() * lenSix)));
      //     Tone.Transport.schedule(function (time) {
      //       ampEnv.triggerAttackRelease("32t", time);
      //     }, this.six2TT(Math.floor(Math.random() * lenSix)));
      //   }
      // }

      const b = 4 * Math.pow(2, Math.floor(Math.random() * 3));
      const a = Math.floor(Math.random() * b);
      const pattern = ER.getPattern(a, b).map((e) => [e, Math.random()]);

      console.log(pattern);

      const lowFrequency = 200 + (Math.random() * 50) ** 2;
      const highFrequency = lowFrequency + 5000 + 2500 * Math.random();

      for (let i = 0; i < lenSix / 128; i++) {
        if (Math.random() < 0.3) continue;
        const freqThreshold = Math.floor(Math.random() * 3) * 0.5;
        for (let j = 0; j < 8; j++) {
          for (let k = 0; k < pattern.length; k++) {
            if (pattern[k][0]) {
              Tone.Transport.schedule(function (time) {
                ampEnv.triggerAttackRelease("16t", time);
                filter.frequency.value = pattern[k][1] > freqThreshold ? highFrequency : lowFrequency;
              }, this.six2TT(i * 128 + j * 16 + k * (16 / pattern.length)));
            }
          }
        }
      }

      // melody
      const C = ["C3", "E3", "G3"];
      const Dm = ["D3", "F3", "A4"];
      const G = ["G3", "B4", "D4"];
      const Em = ["E3", "G3", "B3"];
      const cords = [C, Em, G];

      let squ125 = new Tone.PulseOscillator("C3", 0.25).start();
      squ125.volume.value = -25;
      const squ125Env = new Tone.AmplitudeEnvelope({
        attack: Math.random() * 0.4 + 0.01,
        decay: Math.random() * 0.4 + 0.01,
        sustain: Math.random() * 0.4 + 0.01,
        release: Math.random() * 0.4 + 0.01
      }).toMaster();

      squ125.connect(squ125Env);
      const tar = Math.floor(Math.random() * cords.length);

      for (let i = 0; i < lenSix / 4; i++) {
        // for (let j = 0; j < 3; j++) {
        Tone.Transport.schedule(function (time) {
          let pattern = new Tone.Pattern(
            function (t, note) {
              console.log(note, time);
              console.log(note);
              squ125.frequency.value = note;
              squ125Env.triggerAttackRelease(t);
            },
            cords[tar],
            "up"
          );
          pattern.start(time);
        }, this.six2TT(i * 4));
        // }
        //
        // Tone.Transport.schedule(function (time) {
        //   let pattern = new Tone.Pattern(function (time, note) {
        //     squ125Env.triggerAttackRelease(C[Math.floor(Math.random()*3)], "+"+);
        //   }, cords[tar]);
        // }, this.six2TT(i * 4));
      }

      // bass

      const bC = ["C1", "E1", "G1"];
      const bDm = ["D1", "F1", "A2"];
      const bG = ["G1", "B2", "D2"];
      const bEm = ["E1", "G1", "B1"];
      const basscords = [bC, bEm, bG];

      let tri = this.ctx.createOscillator();
      tri.type = "triangle";
      tri.frequency.value = 200;

      this.bufSize = 1024;
      this.scrproc = this.ctx.createScriptProcessor(this.bufSize);

      this.scrproc.addEventListener("audioprocess", (e) => {
        const in0 = e.inputBuffer.getChannelData(1);
        const buf0 = e.outputBuffer.getChannelData(0);
        const buf1 = e.outputBuffer.getChannelData(1);
        for (let i = 0; i < this.bufSize; ++i) {
          buf0[i] = buf1[i] = Math.floor((in0[i] + 1.0) * 8.0) / 8.0 - 1.0;
        }
      });

      tri.connect(this.scrproc);
      const triEnv = new Tone.AmplitudeEnvelope({
        attack: Math.random() * 0.1 + 0.01,
        decay: Math.random() * 0.05 + 0.01,
        sustain: 0.01,
        release: Math.random() * 0.1 + 0.01
      }).toMaster();

      Tone.connect(tri, triEnv);

      tri.start();

      for (let i = 0; i < lenSix / 4; i++) {
        for (let j = 0; j < 3; j++) {
          Tone.Transport.schedule(function (time) {
            let pattern = new Tone.Pattern(function (t, note) {
              console.log(note, time);
              console.log(note);
              tri.frequency.value = Tone.Frequency(note);
              triEnv.triggerAttackRelease(t);
            }, cords[tar]);
            pattern.start(time);
          }, this.six2TT(i * 4));
        }
        //
        // Tone.Transport.schedule(function (time) {
        //   let pattern = new Tone.Pattern(function (time, note) {
        //     squ125Env.triggerAttackRelease(C[Math.floor(Math.random()*3)], "+"+);
        //   }, cords[tar]);
        // }, this.six2TT(i * 4));
      }

      setInterval(() => {
        console.log(Tone.Transport.position);
      }, 500);
      //
      // const sequence = new Tone.Sequence(
      //   function(time, value) {
      //     console.log(time, value);
      //   },[
      //     {"time" : 0, "note" : "C3", "velocity": 0.9, "test": 0.32},
      //     {"time" : "0:2", "note" : "C4", "velocity": 0.5, "test": 0.2}
      //   ],
      //     10
      // );
      //
      // sequence.start(0);
    }
  }
};
</script>

<style scoped></style>
