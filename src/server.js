import { Elysia } from "elysia";

import lek from "./lek/app.js";
import ord from "./ord/app.js";
import reinli from "./reinli/app.js";
import elektron from "./elektron/app.js";
import dilettant from "./dilettant/app.js";
import snublejuice from "./snublejuice/app.js";

const _PRODUCTION = process.env.ENVIRONMENT.trim() === "production";
const _PORT = process.env.PORT;

const apps = {};
if (_PRODUCTION) {
  apps["lek.snublejuice.no"] = lek;

  apps["dagsord.no"] = ord;
  apps["www.dagsord.no"] = ord;

  apps["elektron.dagsord.no"] = elektron;

  apps["dilettant.no"] = dilettant;
  apps["www.dilettant.no"] = dilettant;

  apps["reinli.dilettant.no"] = reinli;

  apps["snublejuice.no"] = snublejuice;
  apps["www.snublejuice.no"] = snublejuice;
  apps["vinmonopolet.snublejuice.no"] = snublejuice;
  apps["taxfree.snublejuice.no"] = snublejuice;
  apps["snake.snublejuice.no"] = snublejuice;
} else {
  apps["lek.localhost"] = lek;
  apps["dagsord.localhost"] = ord;
  apps["elektron.localhost"] = elektron;
  apps["dilettant.localhost"] = dilettant;
  apps["reinli.localhost"] = reinli;

  apps["localhost"] = snublejuice;
  apps["vinmonopolet.localhost"] = snublejuice;
  apps["taxfree.localhost"] = snublejuice;
  apps["snake.localhost"] = snublejuice;
}

new Elysia()
  .all("*", async ({ request }) => {
    let hostname = request.headers.get("host") || "";
    hostname = hostname.split(":")[0];

    // Redirect snublejus to snublejuice.
    if (hostname.includes("snublejus.no")) {
      const url = new URL(request.url);
      url.hostname = hostname.replace("snublejus.no", "snublejuice.no");
      return new Response(null, {
        status: 308,
        headers: {
          Location: url.toString(),
        },
      });
    }

    const app = apps[hostname];

    if (app) {
      return await app.handle(request);
    }

    return new Response("No vhost match", { status: 404 });
  })
  .listen(_PORT);

console.log(`Server running at http://localhost:${_PORT}`);
if (!_PRODUCTION) {
  console.log(`http://localhost:${_PORT}`);
  console.log(`http://vinmonopolet.localhost:${_PORT}`);
  console.log(`http://taxfree.localhost:${_PORT}`);
  console.log(`http://lek.localhost:${_PORT}`);
  console.log(`http://dagsord.localhost:${_PORT}`);
  console.log(`http://elektron.localhost:${_PORT}`);
  console.log(`http://dilettant.localhost:${_PORT}`);
  console.log(`http://reinli.localhost:${_PORT}`);
  console.log(`http://snake.localhost:${_PORT}`);
}
