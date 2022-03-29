import { spawn } from "child_process";
import { request } from "http";

function toggleLight() {
  let toggleLightRequest = request({
    hostname: "on-air.local",
    path: "/api/toggle",
    method: "POST",
  });
  toggleLightRequest.on("error", (error) => {
    console.error("Issue toggling on-air light");
  });
  toggleLightRequest.end();
}

try {
  var listener = spawn("log stream", { process, shell: true });
} catch (error) {
  console.error("Issue spawning log steam", error);
  process.exit(1);
}

listener.on("error", (error) => {
  console.error("Issue listening to log steam", error);
  process.exit(1);
});

for await (const log of listener.stdout) {
  if (log.includes("Camera") && log.includes("None")) {
    if (log.includes("turn on")) {
      console.log("The camera turned on!", log.toString());
      toggleLight();
    }

    if (log.includes("turn off")) {
      console.log("The camera turned off!", log.toString());
      toggleLight();
    }
  }
}
