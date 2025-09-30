# Vibe Workflow: A Multi-Personality Development Approach

> A local multiplayer Scrabble game that demonstrates a revolutionary AI-assisted development workflow

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Table of Contents

- [What Is This Project?](#what-is-this-project)
- [Why the Workflow Matters](#why-the-workflow-matters)
- [The 7-Layer Structure](#the-7-layer-structure)
- [Quick Start](#quick-start)
  - [For Developers: Understanding the Workflow](#for-developers-understanding-the-workflow)
  - [For Players: Running the Game](#for-players-running-the-game)
- [The Game: Local Multiplayer Scrabble](#the-game-local-multiplayer-scrabble)
- [The Workflow: Multi-Personality Development](#the-workflow-multi-personality-development)
- [Key Documentation](#key-documentation)
- [Architecture Highlights](#architecture-highlights)
- [Contributing](#contributing)
- [License](#license)

---

## What Is This Project?

This repository contains **two interrelated experiments**:

### 1. The Product: Local Multiplayer Scrabble
A browser-based word game that runs on your local network. No accounts, no cloud, no hassle—just start a server and play with friends on any device with a web browser.

### 2. The Process: Multi-Personality Development Workflow
A structured approach to AI-assisted development where **different AI personalities handle different concerns**. Each "personality" has clear decision boundaries, escalation protocols, and specific responsibilities.

**The real innovation here is the workflow**, not the game. The Scrabble implementation serves as a practical demonstration of how this structured approach prevents the chaos that often emerges in AI-assisted development.

---

## Why the Workflow Matters

### The Problem with Traditional AI-Assisted Development

When working with AI assistants like Claude, developers often experience:
- **Scope creep**: AI suggests features beyond requirements
- **Inconsistent decisions**: No clear authority on architectural choices
- **Lost context**: Decisions made without documentation of alternatives
- **Analysis paralysis**: Every chat starts from scratch
- **Responsibility diffusion**: Unclear who decides what

### The Solution: Structured Personalities with Clear Boundaries

This project introduces a **7-layer hierarchy** where each layer has:
- A distinct **personality** (Philosophical Visionary, Terse Implementer, Paranoid Defender, etc.)
- **Clear decision authority** (what this personality CAN and CANNOT decide)
- **Escalation protocols** (when to defer to other layers)
- **Documentation requirements** (capturing the WHY, not just the WHAT)

**Key Insight**: Personalities avoid mess through **humility, not omniscience**. Each knows when to ask for help.

### Why This Approach Works

1. **Prevents Scope Creep**: The "Terse Implementer" personality implements specs exactly—no surprise features
2. **Maintains Context**: Each layer has a `CLAUDE.md` file that defines its personality and constraints
3. **Documents Decisions**: The "Socratic Documentarian" captures WHY decisions were made, not just what was done
4. **Enables Delegation**: Clear escalation paths prevent decisions from being made by the wrong authority
5. **Self-Organizing System**: Work flows naturally downward (design → implementation), problems bubble upward (implementation → design when stuck)

---

## The 7-Layer Structure

```
/root (Socratic Project Manager - "Should we?")
│
├── /0-vision (Philosophical - Why does this exist?)
│   ├── MISSION.md
│   ├── VALUES.md
│   ├── CONSTRAINTS.md
│   └── CLAUDE.md (Personality: Philosophical Visionary)
│
├── /1-design
│   ├── /user-stories (Stakeholder Advocate - Empathy-driven)
│   │   ├── STORIES.md
│   │   └── CLAUDE.md
│   ├── /architecture (Big Picture Generalist - System design)
│   │   ├── SYSTEM-OVERVIEW.md
│   │   └── CLAUDE.md
│   └── /interfaces (Perfectionist - Contract-first)
│       ├── HTTP-API.md
│       ├── WEBSOCKET-API.md
│       └── CLAUDE.md
│
├── /2-logic
│   ├── /pseudocode (Feature-driven Designer - "What" not "How")
│   │   ├── GAME-ENGINE.md
│   │   └── CLAUDE.md
│   └── /implementation (Terse Implementer - Follows spec exactly)
│       ├── src/
│       ├── README.md
│       └── CLAUDE.md
│
├── /3-validation
│   ├── /unit-tests (Defensive Specialist)
│   │   ├── TEST-SPECS.md
│   │   └── CLAUDE.md
│   └── /integration-tests (Skeptical Generalist)
│       ├── TEST-SCENARIOS.md
│       └── CLAUDE.md
│
├── /4-security
│   ├── /security-tests (Paranoid Defender - Penetration testing mindset)
│   │   ├── THREAT-MODEL.md
│   │   └── CLAUDE.md
│   └── /compliance (Dogmatic Enforcer - Standards & regulations)
│       └── CLAUDE.md
│
├── /5-performance
│   ├── /benchmarks (Skeptical Measurer - "Prove it")
│   │   ├── PERFORMANCE-TARGETS.md
│   │   └── CLAUDE.md
│   └── /optimizations (Bold Optimizer - Improves without breaking contracts)
│       ├── OPTIMIZATION-PLAN.md
│       └── CLAUDE.md
│
└── /6-for-future-maintainers
    ├── /decision-logs (Socratic Documentarian - Explains trade-offs)
    │   ├── DECISIONS.md
    │   └── CLAUDE.md
    ├── /refactoring-notes (Iterative - What to improve)
    │   ├── IMPROVEMENTS.md
    │   └── CLAUDE.md
    └── /technical-debt-registry (Honest - What's broken, why we kept it)
        ├── DEBT.md
        └── CLAUDE.md
```

### Decision Hierarchy

```
┌─────────────────────────────────────┐
│  ROOT (Strategic decisions)         │
└──────────────┬──────────────────────┘
               │
         ┌─────┴─────┐
         │  VISION   │ (Mission alignment)
         └─────┬─────┘
               │
         ┌─────┴─────┐
         │  DESIGN   │ (Architecture & interfaces)
         └─────┬─────┘
               │
         ┌─────┴─────┐
         │   LOGIC   │ (Implementation)
         └─────┬─────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───┴────┐         ┌──────┴──────┐
│VALIDATE│         │   SECURITY  │ (VETO POWER)
└────────┘         └─────────────┘
    │                     │
┌───┴────┐         ┌──────┴──────┐
│PERFORM │         │FUTURE-MAINT │ (Advisory)
└────────┘         └─────────────┘
```

**Special Powers**:
- **Security (Layer 4)**: VETO POWER on releases, can inject requirements into any layer
- **Future Maintainers (Layer 6)**: Advisory only, cannot block work

---

## Quick Start

### For Developers: Understanding the Workflow

1. **Start at `/0-vision`** to understand WHY this project exists
   ```bash
   cat 0-vision/MISSION.md
   cat 0-vision/VALUES.md
   ```

2. **Read the root `CLAUDE.md`** to understand the personality system
   ```bash
   cat CLAUDE.md
   ```

3. **Explore layer by layer** (follow the natural 0→6 progression)
   - Each layer's `CLAUDE.md` defines its personality and decision boundaries
   - Each layer's content documents decisions made by that personality

4. **See decisions in action** in `/6-for-future-maintainers/decision-logs/DECISIONS.md`
   - Explains WHY TypeScript (type safety for complex game state)
   - Explains WHY Socket.io (real-time with automatic fallbacks)
   - Explains WHY no authentication (simplicity for local network)
   - Explains WHY Set for dictionary (O(1) lookup vs O(n) array search)

### For Players: Running the Game

#### Prerequisites
- Node.js (v16 or higher)
- npm

#### Installation & Running

1. **Clone and navigate to implementation**
   ```bash
   git clone <repository-url>
   cd vibe-workflow/2-logic/implementation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   # Development mode (auto-reload)
   npm run dev

   # OR Production mode
   npm run build
   npm start
   ```

4. **Connect and play**
   - Server displays URL (e.g., `http://localhost:3000`)
   - Open URL in any browser on the same network
   - Enter your name to join
   - Wait for 2-4 players
   - Host starts the game
   - Play Scrabble!

---

## The Game: Local Multiplayer Scrabble

### Core Features

- **Local Network Only**: No cloud, no accounts, no data leaves your machine
- **Browser-Based**: Works on any device with a modern browser
- **Real-Time**: Instant updates via WebSocket (Socket.io)
- **2-4 Players**: Standard Scrabble player count
- **Classic Rules**: Dictionary validation, premium squares, bingo bonus (50 points for using all 7 tiles)

### Technology Stack

| Layer | Technology | Why? |
|-------|-----------|------|
| **Server** | Node.js + Express | Familiar, event-driven, great for real-time |
| **Real-Time** | Socket.io | WebSocket with automatic fallbacks |
| **Language** | TypeScript | Type safety for complex game state |
| **Client** | HTML + CSS + Vanilla JS | Simple, no build complexity |
| **State** | In-Memory | No database complexity for MVP |
| **Dictionary** | Set (hash-based) | O(1) lookup vs O(n) array (1000x faster) |

### Design Decisions (with Rationale)

All major decisions are documented as Architecture Decision Records (ADRs) in `/6-for-future-maintainers/decision-logs/DECISIONS.md`. Examples:

**ADR-003: No Authentication System**
- **Why**: Local network provides physical security; simplicity is core value
- **Trade-off**: Gained ease of use, gave up identity verification
- **When to reconsider**: If deployed publicly or competitive play

**ADR-006: In-Memory State Only**
- **Why**: Simplest implementation; MVP doesn't need persistence
- **Trade-off**: Gained simplicity, gave up game save/resume
- **When to reconsider**: V2 features like save/load

**ADR-007: Single Game Instance Per Server**
- **Why**: Matches target use case (family/friends at home)
- **Trade-off**: Gained simplicity, gave up multi-game capability
- **Workaround**: Run multiple servers on different ports

---

## The Workflow: Multi-Personality Development

### How Personalities Collaborate

#### Scenario: Implementing Login Feature

**Without Structure** (typical AI chaos):
```
Implementer sees password field → picks bcrypt arbitrarily →
potential security vulnerability → no documentation of choice
```

**With Structure** (delegation):
```
1. Terse Implementer: "Password hashing not specified in interface"
   → Escalates to /1-design/interfaces AND /4-security

2. Root: Routes to /4-security/compliance (security-critical decision)

3. Security Decides: "Use Argon2id per OWASP recommendations"
   → Documents reasoning (resistant to GPU attacks)
   → Updates /1-design/interfaces with requirement

4. Terse Implementer: Implements with clear specification
   → Links to security requirement SEC-001

5. Socratic Documentarian: Captures decision in ADR
   → Future maintainers understand WHY Argon2id
```

### Key Principles

1. **Humility Over Omniscience**: Know when to escalate
2. **Context Preservation**: Every decision documented with alternatives
3. **Clear Authority**: No ambiguity about who decides what
4. **Escalation Protocols**: Defined paths for stuck situations
5. **Trade-off Transparency**: Admit what was sacrificed

### Escalation Matrix

| Situation | Escalate To | Format |
|-----------|-------------|--------|
| Unclear requirement | `/1-design/user-stories` | Create `QUESTION.md` |
| Interface ambiguity | `/1-design/interfaces` | Update with `???` markers |
| Security concern | `/4-security` | IMMEDIATE flag |
| Performance issue | `/5-performance` | Add benchmark |
| Messy code | `/6-future-maintainers/refactoring-notes` | Document |
| Conflicting requirements | `/root` | Create `CONFLICT.md` |

---

## Key Documentation

### Understanding the Project
- [`/0-vision/MISSION.md`](0-vision/MISSION.md) - What and why this exists
- [`/0-vision/VALUES.md`](0-vision/VALUES.md) - Core principles (Accessibility, Local & Private, Simplicity)
- [`/0-vision/CONSTRAINTS.md`](0-vision/CONSTRAINTS.md) - Technical and scope boundaries

### Understanding the Game
- [`/1-design/user-stories/STORIES.md`](1-design/user-stories/STORIES.md) - 18 user stories from player perspective
- [`/1-design/architecture/SYSTEM-OVERVIEW.md`](1-design/architecture/SYSTEM-OVERVIEW.md) - System architecture and data flow
- [`/1-design/interfaces/WEBSOCKET-API.md`](1-design/interfaces/WEBSOCKET-API.md) - Real-time communication protocol

### Understanding the Implementation
- [`/2-logic/implementation/README.md`](2-logic/implementation/README.md) - How to run the game
- [`/2-logic/pseudocode/GAME-ENGINE.md`](2-logic/pseudocode/GAME-ENGINE.md) - Core game logic (high-level)

### Understanding the Decisions
- [`/6-for-future-maintainers/decision-logs/DECISIONS.md`](6-for-future-maintainers/decision-logs/DECISIONS.md) - 7 major ADRs with trade-offs explained

### Understanding the Personalities
- [`CLAUDE.md`](CLAUDE.md) - Root personality and hierarchy explanation
- Each layer's `CLAUDE.md` - Specific personality definitions

---

## Architecture Highlights

### Client-Server Communication

```
┌──────────────┐                    ┌──────────────┐
│   Browser    │                    │   Server     │
│  (Client)    │                    │  (Node.js)   │
└──────┬───────┘                    └──────┬───────┘
       │                                   │
       │  1. HTTP GET /                    │
       │─────────────────────────────────→ │
       │                                   │
       │  2. HTML + CSS + JS               │
       │←───────────────────────────────── │
       │                                   │
       │  3. WebSocket Connect             │
       │═════════════════════════════════→ │
       │                                   │
       │  4. emit('joinGame', {name})      │
       │─────────────────────────────────→ │
       │                                   │
       │              [Validate & Add]     │
       │                                   │
       │  5. broadcast('playerJoined')     │
       │←───────────────────────────────── │
       │                                   │
       │  6. emit('submitWord', {tiles})   │
       │─────────────────────────────────→ │
       │                                   │
       │        [Validate, Score, Update]  │
       │                                   │
       │  7. broadcast('boardUpdate')      │
       │←───────────────────────────────── │
       │                                   │
```

### Server-Authoritative Design

**Why**: Prevents cheating; clients can be modified, server is trusted

| Validated by Server | Client Responsibility |
|---------------------|----------------------|
| Tile ownership | Display game state |
| Placement rules | Provide UX feedback |
| Word validity | Send player actions |
| Turn order | Local tile preview |
| Score calculation | Drag-and-drop handling |

### Data Structures

**Dictionary: Set (Hash-Based)**
- **Why**: O(1) lookup time vs O(n) array (1000x faster for 10K+ words)
- **Trade-off**: ~2MB memory overhead (acceptable)
- **Benchmark**: 0.5ms validation vs 500ms with array

**Game State: In-Memory**
- **Why**: No database setup, fastest access, simplest implementation
- **Trade-off**: Game lost on server restart (acceptable for local sessions)

---

## Contributing

### Using This Workflow in Your Project

1. **Copy the structure**
   ```bash
   mkdir -p {0-vision,1-design/{user-stories,architecture,interfaces}}
   mkdir -p {2-logic/{pseudocode,implementation},3-validation/{unit-tests,integration-tests}}
   mkdir -p {4-security/{security-tests,compliance},5-performance/{benchmarks,optimizations}}
   mkdir -p 6-for-future-maintainers/{decision-logs,refactoring-notes,technical-debt-registry}
   ```

2. **Start with `/0-vision`**
   - Define your MISSION.md (what, who, why)
   - Define your VALUES.md (core principles)
   - Define your CONSTRAINTS.md (boundaries)

3. **Create personality files**
   - Copy the `CLAUDE.md` template from this repo
   - Customize decision boundaries for your domain

4. **Work top-down**
   - Vision → Design → Logic → Validation → Security → Performance → Documentation
   - Let each personality handle its concerns
   - Escalate when you hit boundaries

### Contributing to This Project

1. **Read the workflow first**
   - Understand the 7-layer structure
   - Know which personality you're acting as
   - Follow escalation protocols

2. **Document decisions**
   - Add ADRs to `/6-for-future-maintainers/decision-logs/DECISIONS.md`
   - Explain WHY, not just WHAT
   - List alternatives considered

3. **Respect boundaries**
   - Don't let Terse Implementer make architectural decisions
   - Don't let Security skip documenting trade-offs
   - Escalate when unclear

4. **Submit PRs**
   - Reference relevant user stories
   - Update documentation
   - Include tests

---

## Project Status

### Completed
- ✅ Project structure and personality system
- ✅ Vision, values, and constraints defined
- ✅ User stories (18 stories across 5 epics)
- ✅ System architecture documented
- ✅ API interfaces specified (HTTP + WebSocket)
- ✅ Pseudocode for game engine
- ✅ Core implementation (server + game engine)
- ✅ Security threat model
- ✅ Performance targets defined
- ✅ Major ADRs documented (7 decisions)

### In Progress
- 🔄 Client implementation (UI)
- 🔄 Unit tests
- 🔄 Integration tests

### Planned (V2)
- 📋 Save/load games
- 📋 Multiple game rooms
- 📋 Chat feature
- 📋 Challenge word mechanism
- 📋 Undo/redo functionality

---

## Why "Vibe Workflow"?

The name reflects the core philosophy: each layer has a distinct **vibe** (personality) with clear responsibilities. The workflow **vibes** are:

- **0-vision**: Philosophical (Why?)
- **1-design**: Empathetic + Big Picture (Who? What?)
- **2-logic**: Terse + Precise (How?)
- **3-validation**: Defensive + Skeptical (Does it work?)
- **4-security**: Paranoid + Dogmatic (Is it safe?)
- **5-performance**: Skeptical + Bold (Is it fast?)
- **6-maintainers**: Socratic + Honest (Will future us understand?)

The workflow creates a **harmonious collaboration** between different modes of thinking, preventing the chaos of unstructured AI-assisted development.

---

## License

MIT License - See [LICENSE](LICENSE) for details

---

## Acknowledgments

This workflow was developed through iteration with Claude (Anthropic) as an experiment in structured AI-assisted development. The approach demonstrates how clear boundaries and personality definitions can transform AI collaboration from chaotic to systematic.

---

## Further Reading

- [The Socratic Method in Software Development](6-for-future-maintainers/decision-logs/CLAUDE.md)
- [Why Decision Logs Matter](6-for-future-maintainers/decision-logs/DECISIONS.md)
- [Escalation Protocols Explained](CLAUDE.md)
- [Architecture Decision Records (ADRs)](https://adr.github.io/)

---

**Built with ❤️ and structured chaos management**
