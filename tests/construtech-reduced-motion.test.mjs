import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, statSync} from "node:fs";

const landing=readFileSync("src/routes/Landing.tsx","utf8");
const css=readFileSync("src/construtech.css","utf8");

test("reduced motion shows a real static poster rather than an empty hero",()=>{
  assert.match(landing,/className="ct-hero-poster"/);
  assert.match(landing,/src="\/construtech-hero-poster\.webp"/);
  assert.match(landing,/poster="\/construtech-hero-poster\.webp"/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/\.ct-hero-art \.ct-hero-poster\{display:block\}/);
  assert.ok(statSync("public/construtech-hero-poster.webp").size>10_000);
});
test("reduced motion does not autoplay and allows explicit accessible video playback",()=>{
  assert.match(landing,/autoPlay=\{!reducedMotion\}/);
  assert.match(landing,/muted loop controls=\{videoPlayingByChoice\}/);
  assert.match(landing,/media\.matches\)heroVideo\.current\?\.pause\(\)/);
  assert.match(landing,/reducedMotion&&!videoPlayingByChoice&&<button type="button"/);
  assert.match(landing,/onClick=\{playHeroVideo\}/);
  assert.match(landing,/controls=\{videoPlayingByChoice\}/);
  assert.match(css,/\.ct-hero-art--playing video\{display:block\}/);
  assert.match(css,/\.ct-hero-art--playing \.ct-hero-poster\{display:none\}/);
});
