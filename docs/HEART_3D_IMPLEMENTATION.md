# CardioLens 3D heart viewer

## Model source and approach

The viewer loads `frontend/public/assets/human-heart-cutaway-light.glb`, a generic cutaway reference mesh from [Grab3D's Human Heart Cutaway](https://grab3d.com/models/anatomy/human-heart-cutaway/). The asset page marks the model CC0 1.0; the source [asset manifest](https://grab3d.com/dl/human-heart-cutaway/manifest.json) lists its origin as AI-assisted. Source and license metadata are recorded in `frontend/public/assets/NOTICE.md`. This is an educational asset, not a medically validated atlas or patient-derived mesh.

The GLB is a combined textured mesh, not separately segmented chamber geometry. LAD, LCX, and RCA plus smaller branches are separate selectable Three.js tube overlays. These paths are schematic and are not segmented from patient imaging.

## Interaction and limits

Source implements drag rotation, wheel/touch zoom, camera views, zoom/reset/auto-rotation controls, named structure selection, and LAD/LCX/RCA target highlighting. Whole-vessel model outputs are probability visualizations; the view does not locate plaque or represent patient-specific lesion geometry. Anatomy selection does not run prediction. The component includes loading/error fallback behavior and renderer/resource cleanup.

## Verification

- `npm run build`: TypeScript and Vite passed; 1,485 modules; generated JS 800.95 kB minified / 213.87 kB gzip, above Vite's 500 kB advisory.
- `python -m pytest backend/tests -q -p no:cacheprovider`: 16 passed; one upstream Starlette/AnyIO deprecation warning.
- ZIP-extracted backend suite: 16 passed; TestClient `/health`, `/metadata`, `/predict`, and static `/` returned HTTP 200; all four target explanation keys were present.
- No browser walkthrough, screen-reader/device matrix, touch/click interaction verification, WebGL/context-loss test, live loopback smoke, or video recording was performed during this audit.

Build and API tests do not establish anatomical accuracy, clinical performance, calibration, or generalization.
