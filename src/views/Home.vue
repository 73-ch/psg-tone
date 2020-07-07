<template>
  <div class="home">
    <button @click="start">start</button>
    <button @click="stop">stop</button>
    <button @click="square">square</button>
    <button @click="square25">square25</button>
    <button @click="square125">square125</button>
    <button @click="triangle">triangle</button>
    <button @click="noise">noise</button>
    <div>
      <input type="number" v-model="frequency">
    </div>
  </div>
</template>

<script>
import Tone from "tone";

export default {
  name: "Home",
  data() {
    return {frequency: 440};
  },
  mounted() {
    this.player = null;
  },
  methods: {
    start() {
      Tone.context = this.ctx = new AudioContext();
    },
    square() {
      this.squ = this.ctx.createOscillator();
      this.squ.type = "square";
      this.squ.frequency.value = this.frequency;
      this.squ.connect(this.ctx.destination);
      this.squ.start();
    },
    square25() {
      this.squ25 = new Tone.PulseOscillator(this.frequency, 0.25);
      this.squ25.toMaster();
      this.squ25.start();
    },
    square125() {
      this.squ125 = new Tone.PulseOscillator(this.frequency, 0.125);
      this.squ125.toMaster();
      this.squ125.start();
    },
    triangle() {
      this.tri = this.ctx.createOscillator();
      this.tri.type = "triangle";
      this.tri.frequency.value = this.frequency;

      this.bufSize = 1024;
      this.scrproc = this.ctx.createScriptProcessor(this.bufSize);

      this.scrproc.addEventListener("audioprocess", e => {
        const in0 = e.inputBuffer.getChannelData(1);
        const buf0 = e.outputBuffer.getChannelData(0);
        const buf1 = e.outputBuffer.getChannelData(1);
        // console.log(in0[10]);
        for (let i = 0; i < this.bufSize; ++i) {
          buf0[i] = buf1[i] = Math.floor((in0[i] + 1.0) * 8.0) / 8.0 - 1.0;
        }
      });

      this.tri.connect(this.scrproc);
      this.scrproc.connect(this.ctx.destination);
      this.tri.start();
    },
    noise() {
      this.noise_buffer = this.ctx.createBuffer(1, 44100, 44100);
      for (let i = 0; i < 44100; ++i) {
        this.noise_buffer[i] = Math.random() - 0.5;
      }

      this.noise_osc = this.ctx.createScriptProcessor(1024);

      let ni = 0;
      this.noise_osc.addEventListener("audioprocess", e => {
        const out0 = e.outputBuffer.getChannelData(0);
        const out1 = e.outputBuffer.getChannelData(1);
        for (let i = 0; i < 1024; ++i, ni = (ni + 1) % 44100) {
          out0[i] = out1[i] = this.noise_buffer[ni];
        }
      });

      this.bandpass = this.ctx.createBiquadFilter();
      this.bandpass.type = "bandpass";
      this.bandpass.frequency.value = this.frequency;

      this.noise_osc.connect(this.bandpass);
      this.bandpass.connect(this.ctx.destination);
    },
    stop() {
      if (this.tri) this.tri.stop();
      if (this.squ) this.squ.stop();
      if (this.squ25) this.squ25.stop();
      if (this.squ125) this.squ125.stop();
      if (this.scrproc) this.scrproc.disconnect();
      if (this.noise_osc) delete this.noise_osc.disconnect();
      // this.player.stop();
    }
  }
};
</script>
