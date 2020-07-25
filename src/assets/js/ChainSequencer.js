import Tone from "tone";

// 自動で次のシーケンサを起動するシーケンサ

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

    // countは16*ループの長さ
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
          // 次のシーケンスが自分自身でなければ，再生を停止して，次のシーケンスを呼び出す
          this.next.start(time);
          console.log(time);
          this.stop(time);
        } else {
          // 次のシーケンスが自分自身ならリセットして，自分自身を呼び出す
          this.cancel(0);
          this.next.start(time);
        }

        this.count = 0;
      }
    }
  }
}
