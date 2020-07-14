import Tone from "tone";

export default class FakeTriangleSynth {
  constructor() {
    this.oscillator = this.ctx.createOscillator();
    this.oscillator.type = "triangle";
    this.oscillator.frequency.value = 200;

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

    this.oscillator.connect(this.scrproc);
    this.envelope = new Tone.AmplitudeEnvelope({
      attack: 0.1,
      decay: 0.2,
      sustain: 0.1,
      release: 0.1
    }).toMaster();

    Tone.connect(this.oscillator, this.envelope);
  }

  triggerAttackRelease(note, time) {
    this.oscillator.frequency.value = new Tone.Frequency(note).toFrequency();

    this.envelope.triggerAttackRelease(time);
  }
}
