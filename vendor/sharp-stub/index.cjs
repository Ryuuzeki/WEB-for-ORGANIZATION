"use strict";

function sharpUnavailable() {
  throw new Error("Next.js image optimization is disabled for this site.");
}

sharpUnavailable.versions = { sharp: "0.35.3" };

module.exports = sharpUnavailable;
