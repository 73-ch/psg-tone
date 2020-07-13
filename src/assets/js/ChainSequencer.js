import Tone from "tone";

export default class ChainSequencer extends Tone.Sequence {
  constructor(callback, events) {
    super(
      (time, note) => {
        this.update(time, note);
      },
      events,
      "16n"
    );

    this.loop = 1;

    this.event_callback = callback;
    this.next = null;

    this.count = 0;
  }

  update(time, note) {
    this.count++;
    console.log(this.count);

    this.event_callback(time, note);

    if (this.count >= this.loop * 16) {
      console.log(this.next);
      if (this.next) {
        if (this.next !== this) {
          this.next.start(time);
          this.stop(time);
        }

        this.count = 0;
      }
    }
  }
}
