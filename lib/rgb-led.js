import PWM from "pins/pwm";

const ON = 0;
const OFF = 1023;

export class RGB {
  #state;

  /** pins: [red: number, green: number, blue: number] **/
  constructor([red, green, blue], { defaultColor = [ON, ON, ON] } = {}) {
    this.redPin = new PWM({ pin: red });
    this.greenPin = new PWM({ pin: green });
    this.bluePin = new PWM({ pin: blue });

    this.currentColor = defaultColor;
    this.off();
  }

  /** values: [red: number, green: number, blue: number] **/
  setColor([red, green, blue]) {
    this.redPin.write(red);
    this.greenPin.write(green);
    this.bluePin.write(blue);

    if (![red, green, blue].every((color) => color === OFF)) {
      this.#state = "on";
      this.currentColor = [red, green, blue];
    } else {
      this.#state = "off";
    }
  }

  off() {
    this.setColor([OFF, OFF, OFF]);
  }

  on() {
    this.setColor(this.currentColor);
  }

  toggle() {
    if (this.#state === "off") {
      this.on();
    } else {
      this.off();
    }
  }

  red() {
    trace(`setting red\n`);
    this.setColor([ON, OFF, OFF]);
  }

  green() {
    trace(`setting green\n`);
    this.setColor([OFF, ON, OFF]);
  }

  blue() {
    trace(`setting blue\n`);
    this.setColor([OFF, OFF, ON]);
  }
}
