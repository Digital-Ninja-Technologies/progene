import { handle } from "hono/netlify";
import app from "../../api/index";

export default handle(app);

export const config = {
  path: "/api/*",
};
