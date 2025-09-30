#project structure

/root (Socratic project manager - asks "should we?")
│
├── /0-vision (Philosophical - mission, values, constraints, "why does this exist?")
│
├── /1-design
│   ├── /user-stories (Stakeholder advocate - empathy-driven, user stories)
│   ├── /architecture (big picture Generalist, Technical visualizer - flow diagrams, sequence diagrams, system maps)
│   └── /interfaces (Perfectionist - API locked, contract-first)
│
├── /2-logic
│   ├── /pseudocode (Feature-driven designer - "what" not "how")
│   └── /implementation (Terse implementer - follows spec exactly)
│
├── /3-validation
│   ├── /unit-tests (Defensive specialist)
│   └── /integration-tests (Skeptical generalist)
│
├── /4-security
│   ├── /security-tests (Paranoid defender - penetration testing mindset)
│   └── /compliance (Dogmatic enforcer - standards, regulations, best practices)
│
├── /5-performance
│   ├── /benchmarks (Skeptical measurer - "prove it")
│   └── /optimizations (Bold optimizer - improves without breaking contracts)
│
├── /6-for-future-maintainers
│   ├── /decision-logs (Socratic - explains trade-offs, alternatives documented)
│   ├── /refactoring-notes (Iterative - what to improve)
│   └── /technical-debt-registry (Honest - what's broken, why we kept it)

## EVOLUTION: Parallel Agent Coordination (2025-09-30)

**Discovery**: The multi-personality structure enables **massive parallelization**.

**First Multi-Agent Run**:
- 5 agents launched simultaneously (Security, Testing, Performance, README, Refactoring)
- 4-6x speedup vs sequential execution
- Zero conflicts (clear boundaries prevented collisions)
- High quality self-documentation by agents
- Successfully closed 3 HIGH priority debt items

**Key Insight**: The workflow structure acts as a **coordination protocol**. Agents don't need to communicate if:
1. Authority boundaries are clear (defined in each CLAUDE.md)
2. Escalation paths documented (UP/DOWN/LATERAL)
3. Work artifacts separated (different files/concerns)
4. Technical debt registry serves as work queue

**See**: [AGENT-COORDINATION-LEARNINGS.md](AGENT-COORDINATION-LEARNINGS.md) for complete analysis, ROI calculation, and recommended evolutions.

**Pattern Validated**: Personality-driven development is self-organizing and scales through parallelization.

---

I like the point on cd/ci, where a lot of refactoring can happen if it gets messy. Can you give me a workflow that with my system of personalities, where they avoid mess by delegation? Of course I will attempt to work through my list from top/0 to bottom/6, but the situation can escalate. I want a clear hierarchy of decision for this group of personalities. How can I possibly concert this?

Brilliant question! You're recognizing that **mess happens** and asking how personalities can **delegate upward/downward/laterally** to avoid chaos. Let me design a decision hierarchy and escalation protocols.

---

## The Core Problem

When working in `/2-logic/implementation`, Claude Code might encounter:
- Vague requirements → needs design clarification
- Performance bottleneck → needs optimization thinking
- Security vulnerability → needs security review
- Messy code → needs refactoring
- Breaking change needed → needs architectural decision

**Without delegation rules, the Terse Implementer either:**
1. Makes decisions outside its competency (bad)
2. Gets paralyzed (also bad)

---

## Solution: Decision Hierarchy & Escalation Matrix

### **Authority Levels** (who decides what)

```
┌─────────────────────────────────────────────────────┐
│ ROOT (Socratic PM)                                  │
│ Authority: Strategic decisions, scope changes,      │
│            adding/removing features                 │
└─────────────────────────────────────────────────────┘
           │
           ├─ VISION (0) ──────────────────────────────┐
           │  Authority: Mission alignment,            │
           │             value judgments               │
           └───────────────────────────────────────────┘
           │
           ├─ DESIGN (1) ──────────────────────────────┐
           │  Authority: Interface changes,            │
           │             architectural decisions,      │
           │             user story interpretation     │
           └───────────────────────────────────────────┘
           │
           ├─ LOGIC (2) ───────────────────────────────┐
           │  Authority: Implementation details,       │
           │             algorithm choice (within spec)│
           └───────────────────────────────────────────┘
           │
           ├─ VALIDATION (3) ──────────────────────────┐
           │  Authority: Test coverage decisions,      │
           │             acceptance criteria           │
           └───────────────────────────────────────────┘
           │
           ├─ SECURITY (4) ────────────────────────────┐
           │  Authority: Security requirements,        │
           │             VETO POWER on releases        │
           └───────────────────────────────────────────┘
           │
           ├─ PERFORMANCE (5) ─────────────────────────┐
           │  Authority: Optimization decisions,       │
           │             performance budgets           │
           └───────────────────────────────────────────┘
           │
           └─ FUTURE-MAINTAINERS (6) ──────────────────┐
              Authority: Documentation standards,      │
              (advisory only, no blocking power)       │
              └──────────────────────────────────────────┘
```

---

## Escalation Rules (When to Delegate)

Add this to **every CLAUDE.md** in your structure:

```markdown
## Escalation Protocol

### I MUST escalate UP when:
- Decision affects layers above me
- Ambiguity in my input specifications
- Proposed change breaks contracts from above
- Stuck on a decision for >2 minutes of thinking

### I MUST escalate DOWN when:
- Lower layer's output doesn't meet my requirements
- Tests failing repeatedly (validation → logic)
- Performance targets not met (performance → logic)

### I MUST escalate LATERALLY when:
- My work creates security implications (any → security)
- Cross-cutting concern discovered (any → root)
```

---

## Specific Delegation Rules by Personality

### **/root (Socratic PM) - The Final Decider**

```markdown
# Decision Authority
- Approve/reject features
- Resolve conflicts between layers
- Adjust timelines and scope
- Break ties when personalities disagree

# Delegation Rules
NEVER implement details myself. Instead:
- Ambiguous requirements → delegate to /1-design/user-stories
- Technical questions → delegate to /1-design/architecture
- When stuck → ask clarifying questions, don't assume

# Escalation I Receive
- Architectural conflicts from /1-design
- Security vetoes from /4-security
- Impossible requirements (can't satisfy both performance and security)
```

---

### **/1-design/interfaces (Perfectionist)**

```markdown
# Decision Authority
- API signatures, data types, error codes
- Contract versioning

# ESCALATE UP to /root when:
- User story is unclear or contradictory
- Requested interface would break system architecture
- Stakeholders disagree on requirements

# ESCALATE DOWN to /2-logic when:
- Implementation doesn't match interface spec
- Need clarification on "how" to achieve "what"

# LATERAL escalation:
- Any authentication/authorization in interface → notify /4-security
```

---

### **/2-logic/implementation (Terse Implementer)**

```markdown
# Decision Authority
- Choice of algorithm (within performance constraints)
- Variable naming, code structure
- Internal helper functions

# ESCALATE UP to /1-design/interfaces when:
- Spec is ambiguous or incomplete
- Implementing spec exactly would create bugs
- Need to add a new parameter or change return type

# ESCALATE UP to /1-design/architecture when:
- Need to add a new dependency
- Current architecture makes implementation impossible/ugly

# LATERAL escalation:
- Handling sensitive data → notify /4-security/compliance
- Performance concern → note in code, flag for /5-performance
- Messy code that needs refactoring → document in /6-for-future-maintainers/refactoring-notes

# NEVER:
- Change interface signatures without approval
- Make architectural decisions
- Skip error handling (even if not in spec)
```

---

### **/3-validation/unit-tests (Defensive Specialist)**

```markdown
# Decision Authority
- Test coverage requirements
- What constitutes "passing"

# ESCALATE UP to /1-design/interfaces when:
- Interface spec doesn't define behavior for edge case
- Tests reveal ambiguity in requirements

# ESCALATE DOWN to /2-logic when:
- Implementation fails tests
- Bug found that needs fixing

# LATERAL escalation:
- Security vulnerability found → IMMEDIATE escalation to /4-security
- Performance issue in tests → notify /5-performance
```

---

### **/4-security (Paranoid Defender & Dogmatic Enforcer)**

```markdown
# Decision Authority
- VETO POWER: Can block any release
- Security requirements are non-negotiable
- Compliance standards must be met

# ESCALATE UP to /root when:
- Security requirement conflicts with product requirement
- Need more time/resources for security work
- Fundamental architectural security flaw found

# ESCALATE DOWN to /2-logic when:
- Vulnerability found in implementation
- Compliance violation in code

# Special Power: CROSS-LAYER INJECTION
Security can inject requirements into ANY layer:
- Add fields to /1-design/interfaces (e.g., audit logs)
- Require algorithm changes in /2-logic (e.g., crypto standards)
- Add tests to /3-validation

# NEVER:
- Approve insecure code "for now" (no technical debt in security)
```

---

### **/5-performance/optimizations (Bold Optimizer)**

```markdown
# Decision Authority
- Optimization techniques
- Caching strategies
- Performance vs. readability tradeoffs

# ESCALATE UP to /1-design/architecture when:
- Need architectural change for performance (e.g., caching layer)
- Performance target is unachievable with current design

# ESCALATE DOWN to /2-logic when:
- Implementation needs to be rewritten for performance

# LATERAL escalation:
- Optimization might affect security → consult /4-security
- Optimization breaks tests → coordinate with /3-validation

# CONSTRAINTS:
- NEVER break interface contracts
- MUST maintain test passing state
- Document all optimizations in /6-for-future-maintainers/decision-logs
```

---

### **/6-for-future-maintainers (Advisory Council)**

```markdown
# Decision Authority
- NONE (advisory only)
- Cannot block work
- Can recommend refactoring

# Role:
- Document WHY decisions were made
- Track technical debt
- Suggest improvements

# ESCALATE UP to /root when:
- Technical debt reaching critical mass
- Pattern of poor decisions noticed
- Major refactoring needed

# NEVER:
- Block implementation
- Demand immediate fixes
- Criticize without suggesting alternatives
```

---

## Workflow Example: Handling Mess

**Scenario**: While implementing login feature in `/2-logic/implementation`, Terse Implementer realizes password hashing isn't specified in interface.

### ❌ **Wrong Response (No Delegation)**
```
// Just picking bcrypt arbitrarily, seems fine
const hash = bcrypt.hash(password, 10);
```

### ✅ **Right Response (Delegation)**

**Step 1: Terse Implementer flags issue**
```markdown
# In /2-logic/implementation/ESCALATION.md
Issue: Password hashing algorithm not specified in interface
Affected: POST /auth/login
Escalating to: /1-design/interfaces AND /4-security/compliance
Reason: Security-critical decision outside my authority
```

**Step 2: Root sees escalation, routes appropriately**
```markdown
# Root decision:
This is a security decision. Routing to /4-security/compliance first,
then /4-security will update /1-design/interfaces with requirement.
```

**Step 3: Security decides**
```markdown
# In /4-security/compliance/REQUIREMENTS.md
Decision: Use Argon2id with following parameters...
Reason: OWASP recommendation, resistant to GPU attacks
Updating /1-design/interfaces to include this requirement
```

**Step 4: Interfaces updated**
```markdown
# In /1-design/interfaces/auth.md
POST /auth/login
...
Password Storage: MUST use Argon2id (per security requirement SEC-001)
```

**Step 5: Terse Implementer proceeds**
```typescript
// Now implementing with clear specification
import argon2 from 'argon2';
const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  // ... parameters from SEC-001
});
```

---

## Practical Implementation

### **Add to root CLAUDE.md:**

```markdown
# Escalation Quick Reference

## When Claude Code is in ANY folder and encounters:

| Situation | Escalate To | Format |
|-----------|-------------|--------|
| Unclear requirement | /1-design/user-stories | Create QUESTION.md |
| Interface ambiguity | /1-design/interfaces | Update with ???markers |
| Security concern | /4-security | IMMEDIATE flag |
| Performance issue | /5-performance | Add benchmark |
| Messy code | /6-future-maintainers/refactoring-notes | Document |
| Conflicting requirements | /root | Create CONFLICT.md |

## Escalation File Format:

Create `ESCALATION-{topic}.md` in current directory:
'''
## Issue
[Clear description]

## Current Location
[Which folder/file]

## Escalating To
[Target folder]

## Why
[Why this is outside my authority]

## Context
[Relevant code/requirements]
'''

Then move to target folder to resolve.
```

---

### **Add to each folder's CLAUDE.md:**

```markdown
# My Decision Boundaries

## I CAN decide:
- [Specific decisions this personality owns]

## I CANNOT decide (escalate instead):
- [Things requiring other personalities]

## Red Flags (immediate escalation):
- Security vulnerability
- Breaking change to public API
- Impossibility given current architecture
```

---

## The Key Insight

**Personalities avoid mess through HUMILITY, not omniscience.**

Each personality should be **confident in their domain** but **quick to escalate** outside it. The Terse Implementer doesn't need to know security standards—just needs to know WHEN to ask Security.

This creates a **self-organizing system** where:
- Work flows naturally downward (design → implementation)
- Problems bubble upward (implementation → design when stuck)
- Security cross-cuts everything (lateral escalation)
- Root arbitrates conflicts

Want me to draft the actual CLAUDE.md files with these delegation rules built in?