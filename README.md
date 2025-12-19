# 🎮 Gemini 3.0 Flash Game Generation

> **📺 As seen in:** [Why Gemini 3.0 Flash Fails to One Shot Apps / Games (And How to Fix It)](https://www.youtube.com/watch?v=Rc3vJ0Iuduw)

> **📝 AI Tool For Better Specs:** [TinyPRD](https://tinyprd.app/?utm_source=github&utm_medium=readme&utm_campaign=gemini3flash)

## 💡 The Problem & Solution

Fast AI models like Gemini 3.0 Flash generate code quickly, but often produce buggy, incomplete results. The key difference? **Context and specifications.**

This repository demonstrates how using detailed specifications produces polished, playable games on the first try - compared to simple prompts that result in broken code.

**TinyPRD Features:**
- 🎮 Game Mode for generating detailed GDDs
- ⚡ Converts simple prompts to AI-ready specs in seconds
- 💯 100 free generations available

---

**Chong-U** | AI Oriented

[![X](https://img.shields.io/badge/X-@chongdashu-000000?style=flat&logo=x)](https://www.x.com/chongdashu)
[![YouTube](https://img.shields.io/badge/YouTube-@AIOriented-FF0000?style=flat&logo=youtube)](https://www.youtube.com/@AIOriented)

---

## 📋 Overview

This repository contains the **complete resources** from the video showcasing **Gemini 3.0 Flash** for game generation. It demonstrates the critical difference between:

- ❌ **Simple one-shot prompts** → Fast but buggy, incomplete games
- ✅ **Detailed specifications (GDD/PRD)** → Polished, playable, production-ready games

### 💡 The Key Insight

Gemini 3.0 Flash is **extremely fast** ⚡, but speed alone isn't enough. With proper context and specifications, you get:
- ✅ Working collision detection
- ✅ Complete game states (menu, pause, game over)
- ✅ Visual polish (screen shake, particles, animations)
- ✅ Proper game feel and progression
- ✅ Playable results on first try

## 📁 Repository Structure

```
yt-gemini-3-flash/
│
├── 2d-demo/                    # 2D Endless Runner Examples
│   ├── PROMPT.txt              # Simple one-line prompt
│   ├── GDD.md                  # Detailed Game Design Document (from TinyPRD)
│   ├── regular-demo/           # Game built with simple prompt (buggy)
│   │   └── index.html
│   └── tinyprd-demo/           # Game built with GDD (polished)
│       └── index.html
│
├── 3d-demo/                    # 3D Arena Shooter Examples
│   ├── PROMPT.txt              # Simple one-line prompt
│   ├── GDD.md                  # Detailed Game Design Document (from TinyPRD)
│   ├── regular-demo/           # Game built with simple prompt (unplayable)
│   │   ├── index.html
│   │   └── README.md
│   └── tinyprd-demo/           # Game built with GDD (fully playable)
│       ├── index.html
│       └── README.md
│
└── broll-remotion/             # B-roll animations for video
    ├── src/compositions/       # Remotion compositions for visuals
    └── ...
```

## 🎮 Game Demos

### ❄️ 2D Endless Runner: "Frostbound Run"

**Simple Prompt Version** (`2d-demo/regular-demo/`)
- ❌ Collision detection doesn't work
- ❌ No progression or difficulty curve
- ❌ Missing game states
- ⚡ Generated quickly but unplayable

**TinyPRD GDD Version** (`2d-demo/tinyprd-demo/`)
- ✅ Perfect collision detection with forgiving hitboxes
- ✅ Full game states (menu, play, pause, game over)
- ✅ Visual polish (parallax backgrounds, screen shake, score flashing)
- ✅ Proper game feel with jump buffering and coyote time
- ✅ Persistent high score
- ⚡ Still fast, AND it works!

### 🎯 3D Arena Shooter: "Snow Arena"

**Simple Prompt Version** (`3d-demo/regular-demo/`)
- ❌ Can't hit enemies (broken projectiles)
- ❌ No menu or game over screen
- ❌ Incomplete gameplay loop
- ⚡ 23 seconds to generate, but unplayable

**TinyPRD GDD Version** (`3d-demo/tinyprd-demo/`)
- ✅ Full 3D shooter mechanics
- ✅ Wave-based enemy spawning with multiple types
- ✅ Particle effects and screen shake
- ✅ Working collision and scoring
- ✅ Complete UI and game states
- ⚡ ~3 minutes to generate, fully playable!

## 🛠️ How to Use These Resources

### 1️⃣ Try the Simple Prompts (See the Problem 😢)

```bash
# Check the simple prompts
cat 2d-demo/PROMPT.txt
cat 3d-demo/PROMPT.txt

# Open the buggy versions
open 2d-demo/regular-demo/index.html
open 3d-demo/regular-demo/index.html
```

### 2️⃣ Compare with Detailed Specifications (See the Solution 🎉)

```bash
# Read the detailed GDDs
cat 2d-demo/GDD.md
cat 3d-demo/GDD.md

# Open the polished versions
open 2d-demo/tinyprd-demo/index.html
open 3d-demo/tinyprd-demo/index.html
```

### 3️⃣ Generate Your Own Games 🚀

1. 💭 Start with a simple idea/prompt
2. 📝 Use [**TinyPRD**](https://tinyprd.app/?utm_source=github&utm_medium=readme_2&utm_campaign=gemini3flash) to expand it into a detailed specification
   - Switch to **Game Mode** 🎮 for game projects
   - Get AI-ready specs with no fluff, no timelines ⚡
3. 🤖 Feed the GDD to Gemini 3.0 Flash (or any AI model)
4. 🎊 Get playable results on the first try!

## 🧰 Tools Used

### 🤖 Google AI Studio
- **Gemini 3.0 Flash** model
- Built-in code editor and preview
- Quick iterations and deployments

### 🌐 Anti-Gravity IDE
- Agentic browser control (screenshots, button clicks, console logs)
- Automatic debugging and troubleshooting
- Perfect for rapid prototyping

### ⚡ TinyPRD
- Converts simple prompts → detailed specifications
- Game Mode specifically for game development
- No fluff, no timelines - just what AI needs to build correctly
- Get 100 free generations to try it out

## 🎯 Key Takeaways

1. ⚡ **Fast models need good context** - Gemini 3.0 Flash is incredibly fast, but requires detailed specifications to produce quality results

2. 📊 **Specs > Speed** - A 3-minute generation with a proper GDD beats a 23-second generation that doesn't work

3. 🎮 **One-shot is possible** - With the right approach, you CAN build complete games in a single prompt

4. ⏱️ **Specifications saves time** - Spending 30 seconds on specs saves hours of debugging and iteration

5. 🎯 **Context is everything** - The more specific your requirements, the better the AI performs

## 📄 License

MIT - Feel free to use these resources for learning and building your own projects!

## ❓ Questions?

- 🐦 Follow me on X: [@chongdashu](https://www.x.com/chongdashu)
- 📺 Subscribe on YouTube: [@AIOriented](https://www.youtube.com/@AIOriented)
- 🚀 Try TinyPRD: [tinyprd.app](https://tinyprd.app/?utm_source=github&utm_medium=readme_3&utm_campaign=gemini3flash)

---

**🎉 Happy Building!** Remember: We prompt in seconds ⚡, build in minutes 🛠️, and ship in hours 🚀. No time for weeks and months.
