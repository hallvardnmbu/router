import ord from "./ord/app.js";
import reinli from "./reinli/app.js";
import dilettant from "./dilettant/app.js";

const _PRODUCTION = (process.env.ENVIRONMENT ?? "").trim() === "production";
const _PORT = process.env.PORT;

const apps = {};
if (_PRODUCTION) {
  apps["dagsord.no"] = ord;
  apps["www.dagsord.no"] = ord;
  apps["dilettant.no"] = dilettant;
  apps["www.dilettant.no"] = dilettant;
  apps["reinli.dilettant.no"] = reinli;
  apps["reinlidigital.no"] = reinli;
  apps["www.reinlidigital.no"] = reinli;
} else {
  apps["dagsord.localhost"] = ord;
  apps["dilettant.localhost"] = dilettant;
  apps["reinli.localhost"] = reinli;
}

Bun.serve({
  port: _PORT,
  async fetch(request) {
    let hostname = request.headers.get("host") || "";
    hostname = hostname.split(":")[0];

    if (hostname.includes("snublejus.no")) {
      const url = new URL(request.url);
      url.hostname = hostname.replace("snublejus.no", "snublejuice.no");
      return new Response(null, {
        status: 308,
        headers: { Location: url.toString() },
      });
    }

    const app = apps[hostname];
    if (!app) return new Response("No vhost match", { status: 404 });

    return app(request);
  },
});

console.log(`Server running at http://localhost:${_PORT}`);
if (!_PRODUCTION) {
  console.log(`http://dagsord.localhost:${_PORT}`);
  console.log(`http://dilettant.localhost:${_PORT}`);
  console.log(`http://reinli.localhost:${_PORT}`);
}
