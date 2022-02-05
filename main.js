import Timer from "timer";
import Net from "net";
import MDNS from "mdns";
import { RGB } from "rgb-led";
import { HTTPService } from "http-service";

const led = new RGB([12, 13, 14]);

let hostName = "on-air";

trace("Setup complete!\n");
trace(Net.get("SSID") + "\n");
trace(Net.get("IP") + "\n");

const serviceReady = new Promise((resolve) => {
  new MDNS({ hostName }, function (message, value) {
    if (message === MDNS.hostName) {
      if (value) {
        hostName = value;
        this.add({ name: "onair", protocol: "tcp", port: 80, txt: {} });
        trace(`${hostName} hostname claimed!\n`);
        resolve();
      } else {
        trace(`Working on mdns claim\n`);
      }
    }
  });
});

serviceReady.then(() => {
  led.green();
  Timer.delay(3000);
  led.off();
});

const service = new HTTPService();

service.onError(() => {
  throw new Error("ServerError");
});

service.get("/api/state", () => {
  return {
    body: String(led.currentColor),
  };
});

service.post("/api/toggle", () => {
  led.toggle();
});

service.post("/api/color", (request) => {
  try {
    const { color } = JSON.parse(request.body);
    if (led[color] !== undefined) {
      led[color]();
    } else if (Array.isArray(color)) {
      led.setColor(color);
    } else {
      throw new Error("Invalid color value");
    }
    return { status: 204 };
  } catch (error) {
    trace(`Unable to parse ${request.body}\n`);
    return { status: 422, body: error.toString() };
  }
});

/**
TODO:
- basic web UI
- more refinement of color control
**/
