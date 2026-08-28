# 2026 Formula 1 Car Design Research

**Project:** Formula-1-Legends management simulator
**Compiled:** 2026-08-28 (in-season, after Dutch GP / before Italian GP)
**Purpose:** Authoritative reference for Blender 3D car modeling. What exists in public, what does not, and the closest usable geometry.

---

## 1. Honest answer first

There are **no public team CAD files, STEP/IGES part drawings, or official FIA 3D models** of a 2026 Formula 1 car. Those stay inside the teams and the FIA homologation vault.

What we _do_ have, and it is enough to build a regulation-correct Blender car:

1. **The FIA 2026 Technical Regulations PDF** — the actual legal envelopes (bodywork volumes, wing boxes, floor, crash structures). This is the closest thing to a schematic. Download the latest issue from [documents.fia.com](https://documents.fia.com) / [fia.com/regulation/category/110](https://www.fia.com/regulation/category/110). Search “2026 Formula 1 Technical Regulations”.
2. **Published chassis dimensions** from the Mercedes W17 Wikipedia infobox (length, width, height, wheelbase).
3. **Ferrari SF-26 official technical sheet** (power unit, ERS, suspension layout, weight).
4. **McLaren’s 2026 regulations explainer** (what actually changed on the body: no Venturi tunnels, no beam wing, simpler front wing, active front + rear).
5. **Race photography** of the real 2026 grid cars (Austria 2026, Wikimedia Commons, CC-licensed). Six 1920px stills are stored locally as Blender image-plane references.
6. **This project’s existing procedural model** in `src/graphics/f1_2026/` — useful as a parts list, but several aero assumptions are still 2022–2025 ground-effect era and must be corrected before we sculpt.

Do not treat Sketchfab / GrabCAD “2026 F1” uploads as source of truth. They are fan interpretations of the 2024 FIA concept CGI, not the cars that are racing now.

---

## 2. The 2026 grid (real cars, already racing)

| Team         | Chassis                    | Power unit          | Notes for modeling                                                                          |
| ------------ | -------------------------- | ------------------- | ------------------------------------------------------------------------------------------- |
| Mercedes     | W17 (F1 W17 E Performance) | Mercedes-AMG F1 M17 | Championship leader. Push-rod F+R. Published envelope below.                                |
| Ferrari      | SF-26 (Project 678)        | Ferrari 067/6       | Push-rod F+R. Gloss red + white airbox. Unique exhaust-wing experiment in Bahrain test.     |
| McLaren      | MCL40                      | Mercedes-AMG F1 M17 | Papaya, vinyl wrap. Rob Marshall: packaging is “brutal”; only 150–300 mm of length is free. |
| Red Bull     | RB22                       | Red Bull Ford DM01  | Front multi-link **pull-rod**, rear push-rod. Gloss blue/black jacquard livery.             |
| Racing Bulls | VCARB 03                   | Red Bull Ford DM01  | Sister chassis family to RB22.                                                              |
| Aston Martin | AMR26                      | Honda RA626H        | First Honda works Aston.                                                                    |
| Alpine       | A526                       | Mercedes-AMG F1 M17 | Customer Mercedes PU + gearbox.                                                             |
| Williams     | FW48                       | Mercedes-AMG F1 M17 |                                                                                             |
| Haas         | VF-26                      | Ferrari 067/6       | Toyota Gazoo Racing title.                                                                  |
| Audi         | R26                        | Audi AFR 26 Hybrid  | First Audi works F1 car.                                                                    |
| Cadillac     | MAC-26                     | Ferrari 067/6       | 11th team. Ferrari PU/gearbox until GM unit in 2029.                                        |

**Recommended hero car for v1 Blender work:** Mercedes W17. It has the only published full envelope (length/width/height/wheelbase), it is the current championship car, and the Austria still is a clean 3/4 front-right view.

**Second reference:** Ferrari SF-26. Official zenith (top-down) studio render exists on ferrari.com, plus a published PU/ERS spec sheet.

---

## 3. Regulation envelope (the “schematic”)

These are the numbers to lock in Blender before any styling.

### 3.1 Chassis box (vs 2022–2025)

| Dimension               | 2022–2025      | 2026                                        | Source                                             |
| ----------------------- | -------------- | ------------------------------------------- | -------------------------------------------------- |
| Max overall width       | 2000 mm        | **1900 mm**                                 | FIA 2026 regs / Wikipedia championship article     |
| Max wheelbase           | 3600 mm        | **3400 mm**                                 | same                                               |
| Overall length          | ~5630 mm class | **5505 mm** (Mercedes W17 published)        | Mercedes W17 infobox                               |
| Height                  | ~950 mm class  | **950 mm** (Mercedes W17 published)         | Mercedes W17 infobox                               |
| Min mass (incl. driver) | 798 kg         | Target **768 kg**; real cars **770–772 kg** | McLaren explainer; Ferrari 770 kg; Mercedes 772 kg |
| Floor width             | previous gen   | **~150 mm narrower**                        | McLaren: “smaller floors (>150 mm)”                |
| Tyre rim                | 18 inch        | **18 inch retained**                        | Ferrari / all chassis pages                        |
| Front tyre width        | 305 mm         | **280 mm** (−25 mm)                         | Wikipedia + our `carPartsData.ts`                  |
| Rear tyre width         | 405 mm         | **375 mm** (−30 mm)                         | same                                               |
| Tyre overall diameter   | ~720 mm        | ~705–720 mm class                           | Pirelli 2026 spec; treat Ø705 mm as working number |

Mercedes W17 published box (use as the Blender origin cube):

- Length **5505 mm**
- Width **1900 mm**
- Height **950 mm**
- Wheelbase **3400 mm**
- Mass **772 kg** (driver + coolant + oil)

That implies overhangs of **2105 mm total** (front + rear) around the 3400 mm wheelbase. A workable split for a first block-in: **~900 mm front overhang, ~1205 mm rear overhang**. Refine from photos.

### 3.2 Power unit (affects rear packaging)

From Ferrari SF-26 official sheet + Wikipedia championship article:

| Item             | Spec                                              |
| ---------------- | ------------------------------------------------- |
| ICE              | 1.6 L 90° V6 turbo, 4 valves/cyl                  |
| Bore × stroke    | **80 mm × 53 mm**                                 |
| ICE power        | ~400 kW / 540 bhp (down from ~630 kW)             |
| Max turbo speed  | 150,000 rpm                                       |
| Fuel energy flow | 3000 MJ/h                                         |
| Injection        | Direct, max 350 bar                               |
| MGU-H            | **Deleted**                                       |
| MGU-K            | **350 kW**, max 60,000 rpm                        |
| Battery          | Li-ion, min pack mass **35 kg** incl. electronics |
| Battery energy   | 4 MJ max SOC delta; 9 MJ max charge energy        |
| Max voltage      | 1000 V                                            |
| Fuel             | 100% advanced sustainable                         |
| Gearbox          | 8 forward + reverse, sequential seamless          |

Rob Marshall (McLaren): engine length, gearbox cluster, driveshaft position, fuel volume, and the larger energy store **fix almost the entire car length**. Only 150–300 mm is designer-controlled. Model the PU as a dense, short rear package, not a long 2022 engine cover.

### 3.3 Active aero (must animate)

Official 2026 terminology (FOM, 17 Dec 2025):

| Term                           | Meaning                                                                                                                |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **Corner Mode** (was Z-mode)   | High downforce. Wings closed.                                                                                          |
| **Straight Mode** (was X-mode) | Low drag. Front + rear flaps open on every straight.                                                                   |
| **Overtake Mode**              | Extra ERS deploy if within 1.0 s of the car ahead. Replaces DRS. 350 kW available to 337 km/h, then taper to 350 km/h. |
| **Boost**                      | Manual ERS deploy.                                                                                                     |
| **Recharge**                   | Harvest.                                                                                                               |

DRS is gone. The rear wing opens on **all straights**, not only DRS zones. The front wing moves with it so the car stays balanced. Monaco 2026 was the only race where active aero was disabled.

McLaren: front wing is **simpler, fewer elements**; endplates have more freedom. Front-wheel “eyebrow” winglets deleted. New bargeboards return. **Beam wing deleted.** Venturi tunnels **removed**. Flatter floor + **larger diffuser**.

Downforce: originally drafted −40%, later eased to about **−15%** vs 2022–2025. Drag cut up to **~40%**. Cars ~2 s/lap slower than the previous generation, not 4 s.

### 3.4 Safety geometry (visible on the mesh)

- Two-stage **front impact structure** (nose does not shear off after the first hit).
- Stronger roll hoop: 16 g → **20 g**, test load 141 kN → **167 kN**.
- Improved side intrusion around cockpit and fuel cell.
- **Lateral ERS status lights** mandatory (show HV state when the car is stopped).
- Livery rule: **≥ 55%** of side and top surface must be painted/stickered (no all-carbon weight cheat).

---

## 4. What the real 2026 cars look like (visual brief)

Common across the grid (from Austria 2026 stills + launch coverage):

- **Shorter, narrower, more upright** than 2022–2025 ground-effect cars. Less “barge” in the sidepods.
- **Simpler front wing**: fewer cascade elements, inboard-biased endplates, no wheel-eyebrow winglets.
- **Active rear wing** is the visual signature: a tall, multi-element upper wing with a large opening gap in Straight Mode. No lower beam wing.
- **Floor**: mostly flat between the axles, then a **big rear diffuser** rather than deep Venturi tunnels.
- **18-inch wheels** with carbon aero covers still present.
- **Narrower tyres** are obvious in photos — more sidewall, less “paddle” width than 2025.
- **Halo** unchanged in role; aero fairing still team-specific.
- **Airbox** still sits behind the driver’s head; engine covers are slimmer because the MGU-H and some cooling are gone, but the **battery is bigger**, so the coke-bottle is not as extreme as 2014–2021.

Team-specific cues worth capturing if we do liveries later:

- **Mercedes W17** — silver/black AMG zebra sidepod stripes; Microsoft on the airbox; push-rod both ends.
- **Ferrari SF-26** — gloss rosso (first gloss since 2018 SF71H), white around airbox/engine cover; push-rod both ends.
- **McLaren MCL40** — papaya with extra orange on engine cover and front wing (55% livery rule); dark green Allwyn airbox/mirrors.
- **Red Bull RB22** — glossy blue/black jacquard; **pull-rod front** (wishbones sit low — this changes the nose/vanes).
- **Audi R26 / Cadillac MAC-26** — new shapes on the grid; useful as “how different can a 2026 car look inside the same box”.

---

## 5. Local photo references (for Blender image planes)

All six are Wikimedia Commons race stills from the **2026 Austrian Grand**, resized to 1920×960 for the repo. Originals were 13–35 MB; working copies are ~270–320 KB.

| File                                                                                                                                                                | Car                           | View                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------- |
| [w17_antonelli_austria.jpg](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/documents/references/f1_2026_car/w17_antonelli_austria.jpg)     | Mercedes W17 (#12 Antonelli)  | 3/4 front-right, on throttle |
| [sf26_hamilton_austria.jpg](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/documents/references/f1_2026_car/sf26_hamilton_austria.jpg)     | Ferrari SF-26 (#44 Hamilton)  | 3/4 front-right              |
| [rb22_verstappen_austria.jpg](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/documents/references/f1_2026_car/rb22_verstappen_austria.jpg) | Red Bull RB22 (#3 Verstappen) | 3/4 front-right              |
| [mcl40_norris_austria.jpg](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/documents/references/f1_2026_car/mcl40_norris_austria.jpg)       | McLaren MCL40 (#1 Norris)     | 3/4 front-right              |
| [r26_bortoleto_austria.jpg](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/documents/references/f1_2026_car/r26_bortoleto_austria.jpg)     | Audi R26 (#5 Bortoleto)       | 3/4 front-right              |
| [mac26_perez_austria.jpg](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/documents/references/f1_2026_car/mac26_perez_austria.jpg)         | Cadillac MAC-26 (#11 Pérez)   | 3/4 front-right              |

**Commons sources (attribution):**

- <https://commons.wikimedia.org/wiki/File:FIA_F1_Austria_2026_Nr._12_Antonelli_(3).jpg>
- <https://commons.wikimedia.org/wiki/File:FIA_F1_Austria_2026_Nr._44_Hamilton_(1).jpg>
- <https://commons.wikimedia.org/wiki/File:FIA_F1_Austria_2026_Nr._3_Verstappen_(3).jpg>
- <https://commons.wikimedia.org/wiki/File:FIA_F1_Austria_2026_Nr._1_Norris_(3).jpg>
- <https://commons.wikimedia.org/wiki/File:FIA_F1_Austria_2026_Nr._5_Bortoleto_(3).jpg>
- <https://commons.wikimedia.org/wiki/File:FIA_F1_Austria_2026_Nr._11_Perez_(3).jpg>

**Additional online refs (do not hotlink into the game; use as modeling boards):**

- Ferrari SF-26 official page (zenith + spec): <https://www.ferrari.com/en-EN/formula1/sf-26>
- McLaren MCL40 design: <https://www.mclaren.com/racing/formula-1/2026/behind-the-design-of-the-mcl40/>
- McLaren 2026 regs explainer (annotated diagrams): <https://www.mclaren.com/racing/formula-1/2026/> plaining-f1s-new-2026-regulations/>
- Mercedes W17 launch: <https://www.mercedesamgf1.com/news/> <mercedes-amg-f1-2026-challenger-w17-revealed>
- Wikipedia chassis pages: W17, SF-26, RB22, MCL40

We still lack a clean **side elevation, rear, and underside** still. Next photo pass should pull those from Commons (search `FIA_F1_Austria_2026` and launch galleries) before hard-surface detailing.

---

## 6. Part breakdown for Blender (game-ready, not film-ready)

Build as **separate objects** so we can explode, swap liveries, and animate aero — matching the existing `F1_2026_CAR_PARTS` IDs where they still make sense.

### Must-have meshes (v1)

1. **Tyres + rims + aero covers** — 18", 280/375 mm, Ø ~705 mm. Get these right first; they set scale.
2. **Monocoque + halo + cockpit opening**
3. **Nose + two-stage FIS**
4. **Front wing** — mainplane + 2 movable flaps + endplates. Animate flap rotation for Corner/Straight.
5. **Front suspension** — default **push-rod** (Mercedes/Ferrari/McLaren). Optional pull-rod variant for Red Bull.
6. **Floor plank + rear diffuser** — **flat floor, no Venturi tunnels**. This is the biggest correction vs our current Three.js car.
7. **Sidepods + radiator inlets** — tight packaging, bargeboards back.
8. **Engine cover + airbox** — no mandatory shark fin; keep a small dorsal if the photo shows one.
9. **Rear wing** — 2–3 elements, **no beam wing**, large DRS-like slot. Animate.
10. **Gearbox case + rear impact structure + rain light + ERS side lights**
11. **Rear suspension** — push-rod
12. **Carbon-carbon discs + calipers + ducts**
13. **Steering wheel** — we already have a dedicated high-detail wheel; reuse or proxy.

### Internal (v2, Car Lab explode)

- 1.6 V6 + single turbo (no MGU-H)
- 350 kW MGU-K on the crank
- 35 kg battery under the fuel cell
- SiC inverters
- 8-speed carbon case

### Do **not** model (2022–2025 leftovers)

- Deep underfloor Venturi tunnels
- Beam wing
- Front-wheel eyebrow winglets
- 2000 mm wide body / 3600 mm wheelbase
- 305/405 mm tyres
- MGU-H / complex exhaust-heat recovery plumbing

---

## 7. Gaps in our current Three.js car

`src/graphics/f1_2026/carPartsData.ts` and `F1Car2026Model.ts` are a good **parts catalogue**, but they still describe a 2022-style ground-effect car wearing 2026 labels.

| Current project assumption                                           | 2026 reality                                                           |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| “Reduced ground-effect Venturi tunnels”, 45% floor downforce         | Venturi tunnels **removed**. Flat(ter) floor + larger diffuser.        |
| 3-element rear wing **and** “no lower beam wings” (mixed)            | Beam wing is **deleted**. Rear wing is the active upper assembly only. |
| Front wing 1900 × 520 × 180 with inwash cascades / vortex generators | Simpler, fewer elements; eyebrows gone; endplates freer.               |
| Sidepods “extreme undercut” 2024-style                               | Packaging is tighter and more conventional; bargeboards returned.      |
| Min mass language around 768 kg                                      | Real cars 770–772 kg.                                                  |
| Floor width 1450 mm                                                  | Directionally right (narrower); confirm against FIA PDF article 3.     |
| Shark fin as a named 2026 part                                       | Not a 2026 signature; keep optional.                                   |

Fix the catalogue when we import the Blender GLB, not before. The Blender mesh is the new source of truth.

---

## 8. Proposed Blender build order

1. **Block-in** a 5505 × 1900 × 950 mm bounding box, 3400 mm wheelbase, 18" wheels at 280/375 mm.
2. Load the six Austria stills as **image planes** (camera-matched 3/4). Add Ferrari zenith from ferrari.com as a top view if we can save a local copy later.
3. Hard-surface the **floor + diffuser + sidepods + engine cover** as one bodywork shell, then split.
4. Build **front wing** and **rear wing** as rigged flaps (two shape keys or bone rotations: Corner / Straight).
5. Suspension, brakes, halo, mirrors, lights.
6. UV, carbon PBR, one generic FIA-style livery first (not a team clone).
7. Export **glTF 2.0**, Y-up, applied scale 1.0, named objects matching `meshName` in `carPartsData.ts`.
8. Drop into `public/models/f1_2026/` and swap `createF1Car2026` from procedural primitives to the GLB.

Target poly budget for the web showroom: **40–80k tris** high, **15–25k** race-scene LOD. Quads in Blender, triangulate on export.

---

## 9. Sources

- Wikipedia: [2026 Formula One World Championship](https://en.wikipedia.org/wiki/2026_Formula_One_World_Championship) (regulation changes, grid, safety)
- Wikipedia: [Mercedes W17](https://en.wikipedia.org/wiki/Mercedes_W17) (5505 / 1900 / 950 / 3400 mm, 772 kg)
- Wikipedia: [Ferrari SF-26](https://en.wikipedia.org/wiki/Ferrari_SF-26), [Red Bull RB22](https://en.wikipedia.org/wiki/Red_Bull_Racing_RB22), [McLaren MCL40](https://en.wikipedia.org/wiki/McLaren_MCL40)
- Ferrari official SF-26 page: PU 067/6, MGU-K 350 kW / 60k rpm, 35 kg battery, 770 kg, push-rod F+R
- McLaren: “Explaining F1’s new 2026 regulations” (16 Jan 2026) and “Behind the design of the MCL40” (28 Jan 2026)
- FIA: 2026 Formula 1 Technical Regulations PDF (latest issue on documents.fia.com) — **not archived locally; download before we lock bodywork volumes**

---

## 10. Next action

When you say go, v1 in Blender is a **generic 2026-regulation car** in the Mercedes W17 envelope, with animated Corner/Straight wings, flat floor, no beam wing, 18" 280/375 tyres — not a copyrighted team clone. Team liveries can be decals on that same mesh later.
