# GLIP case assets

The V5 design preview defaults to remote references from the current official GLIP website.
Before staging/production, run:

```bash
node scripts/fetch-glip-case-assets.mjs
```

Review the downloaded assets, commit the approved optimized copies, then set:

```text
VITE_GLIP_CASE_ASSET_MODE=local
```

Production should not depend on Wix hotlinks.
