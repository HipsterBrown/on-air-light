import { Server } from "http";

/**
  // mimic fastify route setters and aliases (but simpler)
  const service = new HTTPService()
  service.get('/', request => ({ status: 200 }))
**/

export class HTTPService extends Server {
  #routeHandlers;
  #onError;

  constructor(options = {}) {
    super(options);

    this.#routeHandlers = new Map();
  }

  route({ method, path, handler }) {
    trace(`Setting ${method} route for ${path}\n`);
    this.#routeHandlers.set(`${method.toUpperCase()} ${path}`, handler);
  }

  get(path, handler) {
    this.route({ method: "GET", path, handler });
  }

  post(path, handler) {
    this.route({ method: "POST", path, handler });
  }

  delete(path, handler) {
    this.route({ method: "DELETE", path, handler });
  }

  head(path, handler) {
    this.route({ method: "HEAD", path, handler });
  }

  onError(handler) {
    this.#onError = handler;
  }

  callback(status, val1, val2) {
    switch (status) {
      case Server.error:
        trace(`Server disconnected\n`);
        this.server.#onError?.();
        break;
      case Server.connection:
        trace(`New server connection: ${val1}\n`);
        break;
      case Server.status:
        this.path = val1;
        this.method = val2;
        trace(`Request status: ${val1} + ${val2}\n`);
        break;
      case Server.header:
        trace(`Request header: ${val1} : ${val2}\n`);
      case Server.headersComplete:
        return String;
      case Server.requestComplete:
        trace(`Request complete! ${val1} ${val2}\n`);
        this.body = val1;
      case Server.prepareResponse:
        trace(`Responding to request\n`);
        const key = `${this.method.toUpperCase()} ${this.path}`;
        if (this.server.#routeHandlers.has(key)) {
          const response = this.server.#routeHandlers.get(key)(this) ?? {};
          return Object.assign(
            {
              status: 200,
              headers: ["Content-type", "text/plain"],
              body: "OK",
            },
            response
          );
        }
        return { status: 404 };
    }
  }
}
