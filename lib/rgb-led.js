import PWM from "pins/pwm";

const ON = 0;
const OFF = 1023;

export class RGB {
  /** pins: [red: number, green: number, blue: number] **/
  constructor([red, green, blue], { defaultColor = [ON, ON, ON] }) {
    this.red = new PWM({ pin: red });
    this.green = new PWM({ pin: green });
    this.blue = new PWM({ pin: blue });
    this.currentColor = defaultColor;
  }

  /** values: [red: number, green: number, blue: number] **/
  setColor([red, green, blue]) {
    this.red.write(red);
    this.green.write(green);
    this.blue.write(blue);

    if (![red, green, blue].every((color) => color === OFF)) {
      this.currentColor = [red, green, blue];
    }
  }

  off() {
    this.setColor([OFF, OFF, OFF]);
  }

  on() {
    this.setColor(this.currentColor);
  }

  red() {
    this.setColor([ON, OFF, OFF]);
  }

  green() {
    this.setColor([OFF, ON, OFF]);
  }

  blue() {
    this.setColor([OFF, OFF, ON]);
  }
}
