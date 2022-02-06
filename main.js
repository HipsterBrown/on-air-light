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
    const { color } = request.body;
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

function isSelected(color, currentColor) {
  switch (color) {
    case "red":
      if (currentColor[0] === 0) return "selected";
    case "green":
      if (currentColor[1] === 0) return "selected";
    case "blue":
      if (currentColor[2] === 0) return "selected";
    default:
      return "";
  }
}

const indexHandler = (_request) => {
  const body = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>On-air light control</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body {
        font-family: sans-serif;
        padding: 2rem;
      }
      label, input {
        display: block;
      }
      input, form { margin-bottom: 1rem; }
    </style>
  </head>
  <body>
    <h1>On-air light control</h1>
    <form action="toggle" method="post">
      <button type="submit">Toggle light</button>
    </form>
    <form action="color" method="post">
      <label id="color-select-label" htmlFor="color">Select a color</label>
      <select id="color" name="color" onchange="this.form.submit()">
        <option ${isSelected("red", led.currentColor)}>red</option>
        <option ${isSelected("green", led.currentColor)}>green</option>
        <option ${isSelected("blue", led.currentColor)}>blue</option>
      </select>
    </form>
  </body>
</html>
  `;
  return { headers: ["Content-type", "text/html"], body };
};

service.get("/", indexHandler);

service.post("/toggle", () => {
  led.toggle();
  return {
    status: 303,
    headers: ["Location", "/"],
  };
});

service.post("/color", (request) => {
  trace(`Setting color: ${request.body}\n`);
  try {
    const { color } = request.body;
    if (led[color] !== undefined) {
      led[color]();
    } else if (Array.isArray(color)) {
      led.setColor(color);
    } else {
      throw new Error("Invalid color value");
    }
    return {
      status: 303,
      headers: ["Location", "/"],
    };
  } catch (error) {
    trace(`Unable to parse ${request.body}\n`);
    return { status: 422, body: error.toString() };
  }
});

/**
TODO:
- more refinement of color control
**/
