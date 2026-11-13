# CONSTRUTECH — G1 video/prefers-reduced-motion correction

Data: 2026-11-13
Gate: SOURCE_CANDIDATE / AO01_REVIEW_REQUIRED
Base full frontend ZIP SHA256: 80e729cb54cd67a2edacd1608d2e2b616fddc63f83ed8eba401a4efd25fd706f
Original MP4 SHA256: 694abd2b9013996d6785f64ee682b7ceb74fbbbea6c3677f1a48627091fd0f0e
Root cause demonstrated in Edge: reduced motion true, video element present, display:none, video paused, readyState 4.

## Change
- REPLACE src/routes/Landing.tsx — retain autoplay only for normal motion, add explicit click to play when motion reduction is preferred, use poster
- REPLACE src/construtech.css — preserve reduced-motion hiding of moving video by default, show still image and accessible manual-play button
- CREATE public/construtech-hero-poster.webp — still frame at 8 seconds from original MP4
- CREATE tests/construtech-reduced-motion.test.mjs — regression contracts for image fallback and optional manual playback

## Before → After SHA256
- src/routes/Landing.tsx: 3fc1d8ef2503df26605d8a5e932e4210763dff45fdd774b12ee245b7c7f11e83 → d7b901f620bdb6521a8b5f051b4942b85cdebd80bfe36660d7ea9cdb2f96bbc9
- src/construtech.css: 8b1d9c24d8fb9d52e4979b884331a073c81915c655d5a07709acb230119cc03f → 6ddb4e0b4df1df120ed4678684cd9a5328a48da963cc897af644b9734318dd2b
- public/construtech-hero-poster.webp: NEW → 9497e5bd72392543cd510da6e45e48650f1d8e63f3a8ac903279a0e2ea72c648
- tests/construtech-reduced-motion.test.mjs: NEW → a0761054bcbe483bbb3f7b47ea898c33b8ebccaea9f86549bdbf2a130f28dc3e

## Tests
- node scripts/run-tests.mjs: 86/86 PASS_LOCAL (Node 22.16.0)
- node scripts/verify-release-contract.mjs: PASS_LOCAL
- node --check server.mjs: PASS_LOCAL
- Node 20.20.2 npm 10.8.2 build: NOT_EXECUTED_FOR_THIS_PATCH
- Edge real reduced-motion scenario: NOT_YET_RETESTED

## Risks and rollback
The video is still embedded from the same original MP4. The poster is new media. No backend, auth, data, migration, CRM, GitHub or Railway changes.
To roll back, restore the unchanged baseline ZIP; or restore the two prior source files and remove the poster and test.
Do not deploy before AO-01 review and reproduced build/browser acceptance.
