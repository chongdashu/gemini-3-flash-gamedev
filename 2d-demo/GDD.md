# Frostbound Run - Game Design Document

## 1. Summary
A 2D endless runner where you control a snowman auto-running to the right, jumping to avoid sliding ice blocks and rolling snowballs; you earn score over time and by passing obstacles, and the game ends on collision.

## 2. Technical Requirements
- Rendering: Canvas 2D (native browser canvas)
- Single HTML file: `index.html` only
- All CSS and JS must be inline in the HTML file
- No external dependencies, no build tools, no npm
- Must run offline once saved locally (no network calls)

## 3. Canvas & Layout
- Canvas dimensions: 900×500 pixels (fixed, not responsive for V1)
- Background: solid color fill plus simple drawn shapes (no images)
- Ground line (snow surface): horizontal band occupying y = 410 to y = 500
- UI layout (all text drawn on canvas):
  - Top-left: Score label `SCORE: {number}` at x = 20, y = 34
  - Top-right: Best score `BEST: {number}` aligned to right edge with padding 20 (measure text width and place so right edge is x = 880)
  - Top-center: State text only when paused or game over
  - Bottom-center (controls hint): one-line hint at x = 450, y = 485 (centered text)
- Buttons (menu and game over) are canvas-drawn rectangles:
  - Primary button size: 220×56 pixels
  - Primary button centered at x = 450, y = 300 (centered on both axes)
  - Button label centered inside

## 4. Player Specifications
- Player character: “Snowman” built from simple shapes (no sprite files)
  - Body: 2 stacked circles (lower + upper)
  - Eyes/buttons: small circles for readability
- Collision body (hitbox): rectangle (for predictable collision)
  - Hitbox size: 44×58 pixels
- Visual size (drawn):
  - Lower snowball: circle radius 26 pixels
  - Upper snowball: circle radius 20 pixels
  - Small “carrot nose” triangle extending 10 pixels to the right (visual only; not part of hitbox)
- Player color:
  - Snow: #F5FBFF
  - Outline: #CFE8F6 (1–2 px stroke)
  - Eyes/buttons: #1F2A33
  - Nose: #F28C28
- Starting position:
  - Player hitbox X: 140 pixels from left
  - Player hitbox bottom aligned to ground: hitbox bottom y = 410 (so hitbox y = 410 - 58 = 352)

## 5. Physics Values
All motion is side-view platformer style (player mainly moves vertically; world scrolls left).

| Property | Value | Unit |
|----------|-------|------|
| Gravity | 2200 | pixels/sec² |
| Jump velocity | -780 | pixels/sec (negative = up) |
| Move speed (world scroll speed) | 360 | pixels/sec |
| Max fall speed | 1200 | pixels/sec |
| Ground Y position (top of ground) | 410 | pixels from top |
| Jump input buffer | 0.12 | seconds |
| Coyote time (late jump after leaving ground) | 0.10 | seconds |
| Jump cooldown (prevents double-trigger) | 0.05 | seconds |

Notes/requirements:
- Player can only jump when grounded OR within coyote time.
- If jump is pressed slightly before landing (within input buffer), it triggers immediately upon grounding.

## 6. Obstacles/Enemies
Two obstacle types, both move left at the same speed as the world scroll speed (360 pixels/sec). Only one obstacle is active per spawn event.

### Obstacle Type A: Ice Block
- Shape: rectangle
- Size: 46×56 pixels
- Color: #8AD3FF with a lighter highlight strip (#CFF1FF) 8 pixels tall at the top
- Spawn position:
  - X = 940 pixels (40 pixels off the right edge)
  - Bottom aligned to ground: bottom y = 410 (so y = 410 - 56 = 354)
- Movement: constant left at 360 pixels/sec
- Despawn: when x < -80 pixels

### Obstacle Type B: Rolling Snowball
- Shape: circle (visual), rectangle hitbox for consistency
- Visual radius: 22 pixels
- Hitbox: 44×44 pixels
- Color: #EAF7FF outline #CFE8F6
- Spawn position:
  - X = 940 pixels
  - Bottom aligned to ground: bottom y = 410 (so hitbox y = 410 - 44 = 366)
- Movement: constant left at 420 pixels/sec (faster than world for variety)
- Despawn: when x < -80 pixels

### Spawn Timing
- Spawn interval: every 1.35 seconds (1350 ms), starting 1.0 second after gameplay begins
- Random selection per spawn:
  - 60% Ice Block
  - 40% Rolling Snowball
- Safety rule: never spawn a new obstacle if the nearest existing obstacle’s x is greater than 680 pixels (ensures at least 260 pixels spacing). If violated, delay spawn until spacing is met (check every frame).

## 7. Collision & Scoring
### Collision Detection
- Use axis-aligned rectangle overlap (AABB) between player hitbox and obstacle hitbox.
- Forgiving collision requirement:
  - Shrink player hitbox by 4 pixels on each side for collision checks (effective collision box becomes 36×50 pixels).
  - Shrink obstacle hitboxes by 3 pixels on each side for collision checks.

### Collision Outcome
- On collision:
  - Immediate transition to Game Over state
  - Freeze world movement after a 0.15 second “impact” moment where:
    - A brief screen shake occurs (see Game Over visual feedback)
    - Player stops accepting jump input

### Scoring
- Score increases by time survived:
  - +1 point every 0.10 seconds of active Playing time (i.e., 10 points/sec)
- Additional score for passing an obstacle:
  - +25 points when an obstacle’s right edge moves left of the player’s left edge (count each obstacle once)
- Score display:
  - Integer only (no decimals)

### High Score Storage
- Persist best score using `localStorage`
- Key name: `frostboundRun_bestScore`
- Best score updates immediately upon Game Over if current score exceeds stored value.

## 8. Controls
Controls must work on keyboard AND mouse/touch.

| Input | Action | Condition |
|-------|--------|-----------|
| Space | Jump / Start game from menu / Retry from game over | Jump only if grounded or within coyote time; Start/Retry only in those states |
| ArrowUp | Jump | Same as Space |
| Click/Tap anywhere on canvas | Jump / Start / Retry | Same conditions as Space |
| P | Pause/Resume | Only during Playing (toggles) |
| Escape | Pause/Resume | Only during Playing (toggles) |

Additional control requirements:
- If paused, Jump input must NOT unpause (only P/Escape unpauses).
- Prevent default page scroll on Space/ArrowUp while canvas is focused/active.

## 9. Game States
### Menu State
Displayed:
- Title: `FROSTBOUND RUN` centered at x = 450, y = 120
- Subtitle: `Jump over obstacles. Survive as long as you can.` centered at x = 450, y = 165
- Controls list (must be readable, left-aligned block centered on screen):
  - `SPACE / ↑ / TAP: Jump`
  - `P or ESC: Pause`
- Primary button: `PLAY` (220×56) centered at x = 450, y = 300
- Best score shown: `BEST: {best}` centered at x = 450, y = 360
Start:
- Clicking PLAY starts the game.
- Pressing Space also starts the game.

Transition:
- Menu → Playing: reset score to 0, clear obstacles, reset player vertical velocity and position to starting grounded position.

### Playing State
Active systems:
- Gravity and jump physics
- World scrolling (obstacles move left)
- Obstacle spawning and despawning
- Collision detection
- Scoring updates
Displayed:
- Score (top-left), Best (top-right)
- Controls hint at bottom-center: `SPACE/↑/TAP: JUMP   P/ESC: PAUSE`

Transition:
- Playing → Paused: on P or Escape
- Playing → Game Over: on collision

### Paused State
Behavior:
- Freeze everything: no physics integration, no spawning timers advancing, no score increases.
Displayed:
- Semi-transparent overlay rectangle covering entire canvas (e.g., black at 45% opacity)
- Center text:
  - `PAUSED` at y = 220
  - `Press P or ESC to resume` at y = 260
- Controls hint remains visible at bottom, but dimmed.

Transition:
- Paused → Playing: on P or Escape

### Game Over State
Trigger:
- Any collision between player and obstacle.

Behavior:
- Obstacles stop moving (fully frozen).
- Final score is fixed.
Displayed:
- Center text:
  - `GAME OVER` at y = 190
  - `SCORE: {score}` at y = 240
  - `BEST: {best}` at y = 275
- Primary button: `RETRY` centered at x = 450, y = 320
- Secondary instruction text: `SPACE or TAP to retry` at y = 385

Visual feedback:
- Screen shake on collision:
  - Duration: 0.20 seconds
  - Magnitude: 8 pixels maximum offset in x and y, randomized per frame but easing to 0 by end.

Transition:
- Game Over → Playing: clicking RETRY or pressing Space or tap.

## 10. User Experience Requirements
- Controls MUST be listed on the menu screen before gameplay begins (see Menu State).
- A controls hint MUST be visible at the bottom of the screen during gameplay (see Playing State).
- Visual feedback requirements:
  - On jump: snowman scales up to 1.08× immediately, then eases back to 1.00× over 0.18 seconds (visual only; hitbox unchanged).
  - On score increment from passing an obstacle (+25): score text flashes (change color to highlight) for 0.12 seconds.
- Forgiving collision:
  - Implement hitbox shrinking exactly as specified in Section 7.
- Readability:
  - All UI text must use a single sans-serif font (e.g., 20–28 px depending on hierarchy) with high contrast against background.
- Input responsiveness:
  - Jump must apply velocity on the same frame the input is accepted (no added delay beyond buffering rules).

## 11. Visual Design
| Element | Color | Notes |
|---------|-------|-------|
| Background sky | #0B1D3A | Dark winter night for strong contrast with snowman and snow |
| Distant haze | #163A63 | Subtle layered rectangles/curves to suggest depth without images |
| Ground snow | #EAF7FF | Bright snow surface; clean runway feel |
| Ground shadow band | #CFE8F6 | 8–12 px strip at top of ground for separation from sky |
| Player snow | #F5FBFF | Slightly brighter than ground so player reads clearly |
| Player details | #1F2A33 | Eyes/buttons contrast |
| Ice block obstacle | #8AD3FF | “Danger” through saturation; distinct from ground |
| UI text | #FFFFFF | Readable on dark sky |
| UI highlight (score flash) | #FFD166 | Warm contrast pop used only briefly |
| Primary button | #2EC4B6 | High-contrast actionable color |
| Button text | #072B2A | Dark text for readability on button |

Additional environment dressing (non-interactive, simple shapes):
- Parallax “snowdrift” mounds:
  - Layer 1 speed: 120 pixels/sec
  - Layer 2 speed: 60 pixels/sec
  - Colors: #163A63 (far), #0F2A4C (near)
- Falling snow streaks (visual only, not particles system complexity):
  - Draw 40 short lines per frame at fixed randomized positions that loop vertically
  - Fall speed: 140 pixels/sec
  - Color: #FFFFFF at 35% opacity

## 12. Out of Scope (V1)
- No sound effects or music
- No particle explosion effects on collision (beyond specified screen shake)
- No difficulty progression (speed and spawn interval remain constant)
- No power-ups or collectibles
- No sprite images or external art assets (shapes only)
- No character selection or cosmetics
- No settings/options menu
- No online leaderboards or sharing
- No mobile haptics/vibration

## 13. Success Criteria
- [ ] Single HTML file runs with no console errors
- [ ] Controls visible on menu AND during gameplay
- [ ] Player responds to input immediately (within buffering/coyote rules)
- [ ] Score increases over time and +25 when passing obstacles
- [ ] High score persists after page refresh using `frostboundRun_bestScore`
- [ ] Pause/resume works correctly and freezes gameplay fully
- [ ] Game over shows final and best scores and allows retry
- [ ] Collision feels fair due to specified forgiving hitboxes and clear obstacle silhouettes