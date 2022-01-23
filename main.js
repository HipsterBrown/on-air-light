import Net from "net";
import { Server } from "http";
import MDNS from "mdns";
import PWM from "pins/pwm";

let hostName = "on-air";

trace("Setup complete!\n");
trace(Net.get("SSID") + "\n");
trace(Net.get("IP") + "\n");

new MDNS({ hostName }, function (message, value) {
  if (message === MDNS.hostName) {
    if (value) {
      hostName = value;
      this.add({ name: "onair", protocol: "tcp", port: 80, txt: {} });
      trace(`${hostName} hostname claimed!\n`);
    } else {
      trace(`Working on mdns claim\n`);
    }
  }
});

const led = {
  r: new PWM({ pin: 12 }),
  g: new PWM({ pin: 13 }),
  b: new PWM({ pin: 14 }),
};

// red
led.r.write(0);
led.g.write(1023);
led.b.write(1023);

const server = new Server({});

server.callback = function (message, val1, val2) {
  switch (message) {
    case Server.connection:
      trace(`New server connection: ${val1}\n`);
      break;
    case Server.status:
      this.path = val1;
      trace(`Request status: ${val1} + ${val2}\n`);
      break;
    case Server.header:
      trace(`Request header: ${val1} : ${val2}\n`);
    case Server.headersComplete:
      return String;
    case Server.requestComplete:
      trace(`Request complete! ${val1} ${val2} ${JSON.stringify(this)}\n`);
    case Server.prepareResponse:
      trace(`Responding to request\n`);
      if (this.path.includes("state")) {
        // blue
        led.r.write(1023);
        led.g.write(1023);
        led.b.write(0);
      }
      return {
        status: 200,
        headers: ["Content-type", "text/plain"],
        body: "OK",
      };
  }
};

// TODO:
// - cleanup HTTP service abstraction, i.e. AdvertisedServer, to include MDNS setup, easier route handlers
// - pull in j5e or create smaller abstraction class around RGB leds
// - figure out status colors: (green === service ready, blue === active, none === inactive, red === error)
// - profit ?
