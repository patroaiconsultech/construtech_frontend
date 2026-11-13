# GLIP Landing V5 — Performance Budget

Required before staging:
- production case assets must be local, optimized and responsive;
- hero case image should target <= 350 KB at desktop viewport and <= 180 KB mobile;
- Canvas node budget: 26 desktop, 12 coarse pointer/mobile;
- devicePixelRatio capped at 1.5 for Canvas;
- Canvas animation pauses while document is hidden;
- animation disabled for reduced-motion and coarse-pointer low-power path;
- below-fold V5 sections use `content-visibility:auto`;
- non-hero case images use `loading=lazy` and `decoding=async`;
- no autoplay audio/video;
- no WebGL required for first meaningful render.

Release smoke target:
- zero horizontal body overflow at 360px;
- no layout shift caused by project media containers;
- usable navigation with reduced motion;
- no cognition animation required for product functionality.
