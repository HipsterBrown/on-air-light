# On-Air Light

An offline-first IoT project on-air light for video meetings, using [ESP32](https://www.espressif.com/en/products/devkits/esp32-devkitc) & JavaScript with [Moddable XS](https://www.moddable.com/).

_While the materials demonstrate using an ESP32 development board, it is possible using an [ESP8266](https://www.adafruit.com/product/3046) with the same code (updated pins probably required) since Moddable runs on both platforms._

## Materials

- [ESP32](https://www.espressif.com/en/products/devkits/esp32-devkitc)
- [Breadboard](https://www.adafruit.com/product/64)
- [2 tri-color LEDs](https://www.adafruit.com/product/159)
- [male/male jumper wires](https://www.adafruit.com/product/759)
- slim USB battery pack
- Box (I used an [Adabox](https://www.adafruit.com/adabox/) container) 

## Wiring Diagram

![breadboard wiring](./docs/images/On-Air-LIght.png)

## Setup

The dev environment was bootstrapped and managed using [`xs-dev`](https://github.com/HipsterBrown/xs-dev); however, that is not required if you want to go through the [Moddable set up instructions](https://github.com/Moddable-OpenSource/moddable/blob/public/documentation/Moddable%20SDK%20-%20Getting%20Started.md) manually or has been done previously.

After cloning this project repo, the `ssid` and `password` config fields in the `manifest.json` to match your WiFi details. The project does not require any Internet access (i.e. "offline-first"), just a shared network for local Web UI and HTTP API control.

After wiring the hardware materials together to match the documented diagram, the code can be uploaded to the board.

Using `xs-dev`:

```
xs-dev run --device esp32
```

Using [`mcconfig`](https://github.com/Moddable-OpenSource/moddable/blob/public/documentation/tools/tools.md#mcconfig):

```
mcconfig -d -m -p esp32
```

Once the LEDs are green for 3 seconds, the web UI should be available at `http://on-air.local/`.

![web interface](./docs/images/web-ui.png)

There are some HTTP API endpoints for checking and controlling the light outside of the web UI:

- `GET /api/state`: returns the current color if the light is on, otherwise returns `[1023, 1023, 1023]` as "off"
- `POST /api/toggle`: toggles the state of the light, using the last used color if the light is off
- `POST /api/color`: expects a `color` field in the body to set the color of the light, returns 204 status code if successful


## Deployed Project

External box:
![external box](./docs/images/external-box.jpg)

Internal layout:
![internal box](./docs/images/internal-box.jpg)

Breadboard wiring:
![close up of breadboard wiring](./docs/images/internal-zoom.jpg)

## Computer Camera event daemon

Run using [`pm2`](https://pm2.keymetrics.io/docs/usage/quick-start/) to control long running process:

```
pm2 start daemon/index.mjs --name on-air
```

The script (`daemon/index.mjs`) watches the standard output stream from [`log stream`](https://developer.apple.com/documentation/os/logging) on MacOS for Camera events that include "turn off" and "turn off" messages. When it sees one of those messages, it will make a POST request to the `/api/toggle` endpoint at the `http://on-air.local` host. If it cannot reach `on-air.local`, it will log the error and continue watching the log output.
