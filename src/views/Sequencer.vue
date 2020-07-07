<template>
  <div>
    <button @click="start">start</button>
  </div>
</template>

<script>
import Tone from "tone";

export default {
  name: "Sequencer",
  methods: {
    six2TT(sixteenths) {
      return `${Math.floor(sixteenths / 16)}:${Math.floor(
        (sixteenths % 16) / 4
      )}:${sixteenths % 4}`;
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
        release: 0.01,
      }).toMaster();

      filter.connect(ampEnv);

      // const tones = [
      //   {"time" : 0, "note" : "C3", "velocity": 0.9, "test": 0.32},
      //   {"time" : "0:2", "note" : "C4", "velocity": 0.5, "test": 0.2}
      // ];

      // const part = new Tone.Part(function(time, value) {
      //   console.log(time, value);
      // }, tones);

      const BPM = Math.floor(Math.random() * 30) + 90;
      const lenTT = "32:0:0";
      const lenSix = this.tt2Six(lenTT);
      console.log(lenTT, lenSix);

      Tone.Transport.loop = true;
      Tone.Transport.loopEnd = lenTT;
      Tone.Transport.start(0);
      // part.start(0);

      // Tone.Transport.setLoopPoints()
      // let len =

      for (let i = 0; i < 200; i++) {
        if (Math.random() > 0.3) {
          console.log(this.six2TT(Math.floor(Math.random() * lenSix)));
          Tone.Transport.schedule(function (time) {
            ampEnv.triggerAttackRelease("32t", time);
          }, this.six2TT(Math.floor(Math.random() * lenSix)));
        }
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
    },
  },
};
</script>

<style scoped></style>
