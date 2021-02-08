import { Application, Router, Context, send } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import * as handle from './handle/mod.ts'
import { conf } from './tool/conf.ts'

const app = new Application();
const router = new Router();

//user
router
  .get("/api/user/list/:current/:size", handle.user.list)
  .post("/api/login", handle.user.login)
  .post("/api/reg", handle.user.reg)
  .get("/api/user/:username", handle.user.findByName)

//report
router  
  .get("/api/report/list/:username/:current/:size", handle.report.list)
  .get("/api/report/:id", handle.report.getById)
  .get("/api/report/:username/:year/:week", handle.report.get)
  .put("/api/report", handle.report.update)
  .post("/api/report", handle.report.insert)

app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());
app.addEventListener('listen', () => {
  console.log(`Listening on: localhost:${conf.port}`);
});

app.listen({ port: conf.port });