# Snowman Sentinel - Game Design Document

## 1. Summary
A top-down 3D arcade arena shooter where you control a snowman and fire snowballs in exactly 4 directions (Up/Down/Left/Right) to survive increasingly difficult waves of snow-themed enemies; you lose when your health reaches 0, and you “win” a run by reaching the highest wave/score possible.

---

## 2. Technical Requirements
- Rendering: **Three.js**
- CDN URL (exact): `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`
- Single HTML file: **index.html only**, with inline CSS + JS, no build tools, no additional external dependencies beyond the Three.js CDN.
- Three.js materials (valid list only):
  - `THREE.MeshStandardMaterial` for player/enemies/ground (for readable lighting)
  - `THREE.MeshBasicMaterial` for UI-world billboards/flat effects if needed
- Three.js lights (valid list only):
  - `THREE.AmbientLight` (soft base)
  - `THREE.DirectionalLight` (main key light)
- Camera: fixed top-down/angled (specified in Section 3), no user camera control.

---

## 3. Canvas & Layout
- Canvas: **960×540 pixels** (16:9), centered on page.
- Background clear color: **#0B1B2B** (deep winter night).
- In-game UI overlay (HTML, positioned over canvas):
  - Top-left: **Score** and **Wave**
  - Top-right: **HP bar** (0–100)
  - Bottom-center: **Controls hint** (always visible during gameplay)
  - Center overlays for: Menu, Paused, Game Over (semi-transparent panel)
- World arena (3D scene) is framed so the full arena fits on screen without scrolling.

---

## 4. Player Specifications
- Appearance: stylized 3-part snowman made from spheres (simple primitives), with a small “carrot nose” cone indicating facing direction.
- Size (rendered footprint): **48 px diameter** equivalent on the ground plane (collision uses radius below).
- Colors:
  - Body snow: **#F3FBFF**
  - Coal accents (eyes/buttons): **#1A1A1A**
  - Nose: **#FF8A2A**
  - Scarf band: **#E43D4C**
- Starting position: center of arena at **(x=480, z=270)** in screen-mapped world coordinates (see Section 5 for coordinate mapping).
- Movement/Aiming constraints:
  - **Movement:** 4-directional (WASD / Arrow Keys) only; no diagonal movement (pressing two keys resolves to the most recently pressed).
  - **Shooting:** **4-direction only** (Up/Down/Left/Right). No diagonals, no free-aim bullets.

---

## 5. Physics Values
Top-down game (no jumping). Use a simple kinematic controller with acceleration and friction for “arcade snap,” but still smooth.

| Property | Value | Unit |
|---|---:|---|
| Gravity | 0 | pixels/sec² |
| Jump velocity | 0 | pixels/sec |
| Move speed (max) | 320 | pixels/sec |
| Acceleration | 2400 | pixels/sec² |
| Deceleration (no input) | 2800 | pixels/sec² |
| Turn/redirect boost | 3200 | pixels/sec² |
| Max speed | 320 | pixels/sec |
| Arena bounds padding | 24 | pixels |
| Ground Y position (3D) | 0 | pixels from top (mapped to world Y=0) |

**World mapping rule (critical for consistency):**
- Treat the arena as a 2D plane in pixels: X increases right, Z increases down.
- Three.js world uses: (worldX = pixelX, worldY = 0, worldZ = pixelZ).
- Camera is positioned to view this XZ plane clearly (Section 3 + camera spec below).

**Camera spec (3D):**
- Perspective camera FOV: **50 degrees**
- Camera position: **(x=480, y=900, z=720)**
- LookAt: **(x=480, y=0, z=270)**
- Result: slightly angled top-down view with readable depth but consistent 2D gameplay.

---

## 6. Obstacles/Enemies
### Enemy Types (all cardinal-movement compliant)
All enemies must obey the **4-direction symmetry rule**: they may only move along X or Z axis, never diagonally, and their AI must pick a single axis to approach on at any given time.

#### 6.1 Snowball Minion (basic)
- Shape: sphere
- Size: **32 px diameter**
- Color: **#D7F1FF**
- Spawn positions: only at 4 edges, centered on “lanes” aligned to player:
  - Left edge: x=0, z = playerZ snapped to lane grid
  - Right edge: x=960, z = snapped lane
  - Top edge: z=0, x = snapped lane
  - Bottom edge: z=540, x = snapped lane
- Lane grid size: **48 px**. Enemies spawn with x or z snapped to multiples of 48 (plus 24 offset), ensuring cardinal alignments.
- Movement: straight-line along one axis toward player’s current lane coordinate.
  - Speed: **110 pixels/sec** (Wave 1 baseline)
- Despawn: when HP <= 0 (killed) or if pushed outside arena bounds by 40 px (failsafe).

#### 6.2 Icicle Runner (fast, fragile)
- Shape: cone (point forward)
- Size: **18×38 px** footprint (approx)
- Color: **#6FD3FF**
- Movement: cardinal only, chooses the axis with the larger distance to player at spawn, then commits for 1.0 sec before re-evaluating (prevents diagonal “tracking”).
  - Speed: **190 pixels/sec** baseline
- Special: slight “skid” animation on axis changes (visual only).

#### 6.3 Frost Brute (slow, tough)
- Shape: box + sphere shoulders
- Size: **52 px diameter** footprint
- Color: **#9ED0E6**
- Movement: straight cardinal only, never changes axis once spawned.
  - Speed: **70 pixels/sec** baseline

### Enemy Spawn Timing & Waves
- Game is wave-based. Each wave lasts until all spawned enemies are defeated.
- Between waves: **2.0 seconds** “breather” with a wave banner; player can move/shoot but no enemies spawn.
- Wave composition (exact, deterministic):
  - Wave 1: 8 Minions
  - Wave 2: 12 Minions
  - Wave 3: 14 Minions + 4 Runners
  - Wave 4: 16 Minions + 6 Runners
  - Wave 5: 18 Minions + 6 Runners + 2 Brutes
  - From Wave 6 onward:
    - Minions = 18 + (wave-5)*2
    - Runners = 6 + floor((wave-5)*1.5)
    - Brutes = 2 + floor((wave-5)/2)
- Spawn pacing within a wave:
  - Spawn interval starts at **0.55 sec** (Wave 1), decreases by **0.03 sec per wave**, minimum **0.20 sec**.
- Difficulty scaling (fair + clear):
  - Enemy speed multiplier per wave: **+3% per wave**, capped at **+45%**
  - Enemy HP does **not** scale (keeps readability); difficulty comes from density/speed.

**Symmetry compliance note (mandatory):**
- Enemies are only allowed to spawn from **Top/Bottom/Left/Right** edges.
- Enemies may only move **purely horizontally or purely vertically** at any instant.
- No curved steering, no diagonal drift.

---

## 7. Collision & Scoring
### Collision Detection
- Use 2D collisions on the XZ plane:
  - Player hit circle radius (for collision): **18 px**
  - Enemy hit circle radius:
    - Minion: **14 px**
    - Runner: **12 px**
    - Brute: **22 px**
  - Snowball projectile radius: **6 px**
- **Forgiving collision requirement:** subtract **3 px** from all radii for actual hit tests (rendering unchanged). Example: Player effective radius = 15 px.

### Damage / HP
- Player HP: **100**
- Contact damage (on enemy touching player):
  - Minion: **10**
  - Runner: **12**
  - Brute: **20**
- Invulnerability after taking damage: **0.60 sec**
  - During i-frames: player flashes and has a faint shield ring; collisions do not deal damage.

### Projectiles (Snowballs)
- Fire rate: **6 shots/sec** (0.1667 sec cooldown)
- Projectile speed: **520 pixels/sec**
- Projectile lifetime: **1.25 sec** (then despawn)
- Projectile damage:
  - Minion: 1 shot kill (HP 1)
  - Runner: 1 shot kill (HP 1)
  - Brute: 5 hits (HP 5)

### Scoring
- +10 per Minion kill
- +15 per Runner kill
- +40 per Brute kill
- +50 wave clear bonus
- Near-miss bonus: +5 (see Section 10.4)
- High score persistence:
  - localStorage key: **`snowmanSentinel_highScore`**
  - Also persist best wave: **`snowmanSentinel_bestWave`**

---

## 8. Controls
Controls must be shown on Menu and as in-game hint.

| Input | Action | Condition |
|---|---|---|
| W / ArrowUp | Move Up | Playing only |
| S / ArrowDown | Move Down | Playing only |
| A / ArrowLeft | Move Left | Playing only |
| D / ArrowRight | Move Right | Playing only |
| I / J / K / L | Shoot Up/Left/Down/Right | Playing only, respects fire cooldown |
| Arrow Keys (tap) | Shoot in that direction (optional mode) | If “Arrow Shoot Mode” enabled in menu toggle |
| Click/Tap (left half/right half/top/bottom zones) | Shoot in nearest cardinal direction | Playing only, respects cooldown |
| Hold Click/Tap | Auto-fire in last chosen direction | Playing only |
| P or Escape | Pause/Resume | Any time during play |
| Space | Start (menu) / Retry (game over) | On Menu or Game Over |

**Click/Tap direction zones (explicit):**
- Compute vector from player screen position to pointer.
- If |dx| >= |dy|: shoot Left (dx<0) or Right (dx>0)
- Else: shoot Up (dy<0) or Down (dy>0)

---

## 9. Game States
### Menu State
- Displays:
  - Title: “Snowman Sentinel”
  - Subtitle: “4-direction snowball survival”
  - Controls list (keyboard + mouse/touch)
  - Toggle: “Arrow Shoot Mode: OFF/ON” (default OFF; when ON, arrow keys shoot instead of move; movement stays WASD)
  - Start prompt: “Press Space or Click PLAY”
- Start transitions:
  - On start: quick zoom-in + fade (0.35 sec), then Playing.

### Playing State
- Active systems:
  - Player movement
  - Shooting (cooldowns)
  - Enemy wave spawning
  - Collision, scoring, HP
  - UI updates (score, wave, HP bar)
- Always show bottom controls hint:
  - Example: “Move: WASD | Shoot: IJKL or Click/Tap | Pause: P/Esc”

### Paused State
- Freeze:
  - No movement, no spawns, no timers advancing (except pause overlay subtle animation).
- Overlay:
  - “PAUSED”
  - “Press P/Esc to Resume”
  - Controls reminder (same as menu condensed)

### Game Over State
- Trigger: player HP <= 0
- Shows:
  - “Game Over”
  - Final Score, Wave Reached
  - Best Score, Best Wave
  - “Press Space or Click RETRY”
- Retry resets run: HP=100, score=0, wave=1.

---

## 10. Game Feel & Juice (REQUIRED)

### 10.1 Input Response (immediate feedback on every input)
- Movement key pressed:
  - Player body leans **8 px** in movement direction (visual offset/tilt), begins within the same frame.
  - Snow “skid puffs” (simple 2D quads or tiny spheres) spawn behind feet: **3 particles**, lifetime **0.25 sec**.
- Movement key released (no input):
  - Player recenters with a small overshoot and settles (timing below).
- Shoot input (any method):
  - Muzzle pop: a small snow ring expands from player center in firing direction.
  - Player recoil: body shifts **6 px** opposite firing direction for a snap.
  - Instant on-press flash: player scarf briefly brightens (color lerp toward highlight).

### 10.2 Animation Curves (easing, not linear)
All durations in seconds.
- Movement lean-in: **0.07s ease-out** to 1.0 lean amount.
- Movement settle after stop: **0.12s ease-in-out** back to center, with **10% overshoot** at 0.08s.
- Shoot recoil:
  - Kick: **0.05s ease-out** to 6 px recoil
  - Return: **0.10s ease-out** back to 0 px
- Snowball spawn scale:
  - Spawn at 0.6x scale then **0.08s ease-out** to 1.0x

### 10.3 Anticipation & Follow-through
- Shooting anticipation (tiny, but readable):
  - 0.03s pre-fire “compress” where snowman scales to **(1.06x width, 0.94x height)** then fires immediately (this happens even if holding auto-fire; it’s subtle but consistent).
- Follow-through:
  - After firing, scarf tip lags and swings for **0.18s ease-out** (purely visual).

### 10.4 Near-Miss Feedback
Near miss definition (projectile-like danger is melee contact; so near miss is “almost got touched”):
- Trigger when any enemy passes within **10 px** of the player’s effective collision radius **without** colliding, and hasn’t triggered near-miss in the last **1.2 sec**.
- Feedback:
  - Time dilation: **0.55x** time scale for **0.12 sec**, then back to 1.0 over **0.08 sec**.
  - Screen flash: additive white-blue overlay **#B8F3FF**, opacity **0.22**, duration **0.10 sec**.
  - “CLOSE!” floating text above player, rises **24 px** over **0.35 sec**, fades out.
  - Score: **+5** with a tiny +5 popup near the score UI.

### 10.5 Screen Effects
| Effect | Trigger | Specification |
|---|---|---|
| Screen shake | Player takes damage | Duration **0.18s**, intensity **8 px**, decay **ease-out** |
| Screen shake (big) | Player death | Duration **0.45s**, intensity **18 px**, decay **ease-in-out** |
| Flash | Near-miss | Color **#B8F3FF**, opacity 0.22, **0.10s** |
| Flash | Wave clear | Color **#FFFFFF**, opacity 0.18, **0.16s** |
| Zoom pulse | Wave start banner | Scale **1.03x**, **0.20s** in, **0.18s** out, ease-in-out |
| Time dilation | Near-miss | 0.55x for 0.12s + recover 0.08s |
| Time dilation | Death | Freeze-frame 0.10s (time=0), then 0.35x for 0.40s, then transition to Game Over |

### 10.6 Progressive Intensity
Escalate visuals with wave number:
- Wave 1–3:
  - Background: steady #0B1B2B
  - Ambient particles: light snow (10 flakes)
- Wave 4–7:
  - Add subtle vignette (UI overlay) opacity **0.10**
  - Snow particles increase to **18 flakes**, drift speed +20%
- Wave 8–12:
  - Vignette opacity **0.16**
  - Arena edge glow pulse (very subtle) every **2.5 sec**
- Wave 13+:
  - Color grading: slightly colder tint (lerp toward #071421 by 15%)
  - Enemy spawn flash gets sharper (edge flash opacity +0.05)

### 10.7 Idle Life
When player is not moving/shooting:
- Player “breathing” bob:
  - Vertical bob amplitude **4 px**, period **1.2 sec**, ease-in-out
- Coal eye blink:
  - Every **3.5–6.0 sec** random interval, blink duration **0.12 sec**
- Environment:
  - Gentle snow drift (particles) always active
- UI:
  - Score text subtle pulse every time it changes (also in 10.8)

### 10.8 Milestone Celebrations
- Milestones: every **500 score**
- Celebration:
  - Banner text: “500!” / “1000!” etc. at top-center for **0.9 sec**
  - Flash: **#C9FFF4**, opacity **0.14**, **0.14 sec**
  - Confetti substitute (snow sparkle): 20 small diamond sprites falling for **0.7 sec**
- New high score moment:
  - When score exceeds stored high score: “NEW BEST!” appears under score for **1.2 sec** with a gold tint pulse.

### 10.9 Death/Failure Feedback
On HP reaching 0:
- Immediate:
  - Freeze-frame **0.10 sec**
  - Player shatters into **12 snow chunks** (small spheres) that burst outward at **240 px/sec** and fade over **0.65 sec**
- Screen:
  - Big shake (Section 10.5)
  - Desaturation overlay ramps to **60%** over **0.40 sec**
  - Dark vignette ramps to opacity **0.35** over **0.55 sec**
- Transition:
  - After 0.9 sec total, show Game Over panel with a soft fade-in **0.20 sec**

---

## 11. User Experience Requirements
- Controls must be listed on the **Menu screen before gameplay** (full list).
- Controls hint must be visible during gameplay at bottom-center at all times.
- Forgiving collision:
  - Reduce collision radii by **3 px** for hit detection only.
- Clarity requirements:
  - Player bullets must be clearly visible against background (high contrast).
  - Enemies must have a subtle ground shadow ring to show position.
  - Wave banner must explicitly say: “Wave X – Get Ready” then “Wave X” on start.

---

## 12. Visual Design
| Element | Color | Notes |
|---|---|---|
| Background | #0B1B2B | Dark winter sky for contrast |
| Arena floor | #16324A | Slightly lighter than background |
| Arena grid lines | #214B6B | Helps lane readability (48 px grid) |
| Player snow | #F3FBFF | Bright, readable |
| Player scarf | #E43D4C | Strong accent; aids visibility |
| Enemy minion | #D7F1FF | Soft blue-white |
| Enemy runner | #6FD3FF | Brighter cyan to imply speed |
| Enemy brute | #9ED0E6 | Heavier, muted |
| Snowball projectile | #FFFFFF | Must pop clearly |
| UI text | #EAF6FF | High readability |
| Damage flash | #FF4D5A | Clear danger feedback |
| Near-miss glow/flash | #B8F3FF | Reward/relief tone |
| Milestone flash | #C9FFF4 | Celebration tint |

(Uses 8+ distinct hex colors, including effect colors.)

---

## 13. Out of Scope (V1)
1. No audio (no music, no SFX).
2. No online features (no leaderboards, no matchmaking).
3. No character upgrades/meta progression.
4. No power-ups or temporary buffs.
5. No complex particle simulations (only simple shapes/sprites with short lifetimes).
6. No sprite images or external art assets (primitives only).
7. No alternate weapons (single snowball gun only).
8. No boss fights (waves only).

---

## 14. Success Criteria
- [ ] Single HTML file runs with no console errors.
- [ ] Three.js loaded only from `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`.
- [ ] Controls visible on menu AND during gameplay.
- [ ] Player responds to input within the same frame (movement lean or shoot recoil).
- [ ] Shooting is strictly 4-direction; no diagonal bullets.
- [ ] Enemy spawn/movement is strictly cardinal and edge-based (symmetry preserved).
- [ ] Near-misses trigger time dilation + flash + bonus reliably.
- [ ] Score updates with a visible pulse/feedback on increment.
- [ ] High score and best wave persist via localStorage keys specified.
- [ ] Pause/resume freezes action correctly and resumes cleanly.
- [ ] Game over has impactful freeze + shake + shatter feedback.
- [ ] Collision feels fair due to 3 px forgiving hitbox reduction.
- [ ] Idle life present (breathing bob + snow drift).
- [ ] Increasingly difficult waves function as specified (counts, spawn intervals, capped speed scaling).

If you want, I can tailor enemy theming further (e.g., “snowflake bats” that still move cardinally via lane spawns) while keeping the 4-direction fairness constraints intact.