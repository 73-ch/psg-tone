import Tone from "tone";

export default class Player {
  constructor() {

  }

  start() {
    this.tone = new Tone();
  }

  createSquareOscillator() {
    if (this.square) return;
    this.square = new Tone.Oscillator(440, "square");
    this.square.start();
    this.square.toMaster();
  }
  createTriangleOscillator() {
    if (this.triangle) return;
    this.triangle = new Tone.Oscillator(440, "triangle");
    this.triangle.start();
    this.triangle.toMaster();
  }

  stop() {
    if (this.square) this.square.stop();
    if (this.triangle) this.triangle.stop();
  }
}
