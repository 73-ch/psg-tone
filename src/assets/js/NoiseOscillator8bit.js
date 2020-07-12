import Tone from "tone";

export default class NoiseOscillator8bit {
  constructor(ctx) {
    this.ctx = ctx;

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
  }
}
