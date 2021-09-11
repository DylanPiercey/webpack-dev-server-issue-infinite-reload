import express from "express";
import markoMiddleware from "@marko/express";
import template from "./template.marko";

const port = parseInt(process.env.PORT || 3000, 10);

express()
  .use("/assets", express.static("dist/assets")) // Serve assets generated from webpack.
  .use(markoMiddleware()) // Enables res.marko.
  .get("/", (req, res) => res.marko(template))
  .listen(port, err => {
    if (err) {
      throw err;
    }

    if (port) {
      console.log(`Listening on port ${port}`);
    }
  });
