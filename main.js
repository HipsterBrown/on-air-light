import Net from "net";
import { Server } from "http";
import MDNS from "mdns";
import PWM from "pins/pwm";
import { RGB } from "./lib/rgb-led";

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

const led = new RGB([12, 13, 14]);
led.red();

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
      trace(`Request complete! ${val1} ${val2}\n`);
    case Server.prepareResponse:
      trace(`Responding to request\n`);
      if (this.path.includes("state")) {
        led.blue();
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
// - figure out status colors: (green === service ready, blue === active, none === inactive, red === error)
// - profit ?
