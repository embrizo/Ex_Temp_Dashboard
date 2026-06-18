# UI & Design System Skill Guide (`UiSkill.md`)

This guide is a portable design system for building premium web applications. It covers design tokens, layout, components, animations, and a full **Light/Dark Mode system** — extended with patterns sourced from high-quality portfolio UI including telemetry widgets, live status badges, project image cards, vertical timelines, and scroll-reveal entry animations.

---

## 1. Design Tokens & Theme Reflex (CSS Variables)

Define these in your global stylesheet (`index.css` or `globals.css`). Variables auto-switch via `prefers-color-scheme` or a `.dark` class toggle.

```css
/* ═══════════════════════════════════════
   LIGHT THEME DEFAULT
   ═══════════════════════════════════════ */
:root {
  /* Backgrounds */
  --color-bg:   #F8FAFC;
  --color-bg-2: #FFFFFF;
  --color-bg-3: #F1F5F9;
  --color-surface:       rgba(15, 23, 42, 0.02);
  --color-surface-hover: rgba(15, 23, 42, 0.05);
  --color-border:        rgba(15, 23, 42, 0.06);
  --color-border-hover:  rgba(15, 23, 42, 0.12);

  /* Text */
  --color-text:   #0F172A;
  --color-text-2: #475569;
  --color-text-3: #94A3B8;

  /* Blue */
  --color-blue:       #3B82F6;
  --color-blue-light: #60A5FA;
  --color-blue-dark:  #1D4ED8;
  --color-blue-glow:  rgba(59, 130, 246, 0.15);

  /* Cyan — telemetry / live-data accent */
  --color-cyan:       #06B6D4;
  --color-cyan-light: #22D3EE;
  --color-cyan-dark:  #0891B2;
  --color-cyan-glow:  rgba(6, 182, 212, 0.15);

  /* Green */
  --color-green:       #10B981;
  --color-green-light: #34D399;
  --color-green-glow:  rgba(16, 185, 129, 0.15);

  /* Purple */
  --color-purple:       #8B5CF6;
  --color-purple-light: #A78BFA;
  --color-purple-glow:  rgba(139, 92, 246, 0.15);

  /* Amber */
  --color-amber:       #F59E0B;
  --color-amber-light: #FCD34D;

  /* Red */
  --color-red:       #EF4444;
  --color-red-light: #FCA5A5;

  /* Radii */
  --radius-xs:   6px;
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   24px;
  --radius-2xl:  32px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm:          0 2px 8px  rgba(15, 23, 42, 0.04);
  --shadow-md:          0 8px 24px rgba(15, 23, 42, 0.08);
  --shadow-lg:          0 16px 48px rgba(15, 23, 42, 0.12);
  --shadow-blue:        0 4px 20px rgba(59, 130, 246, 0.2);
  --shadow-cyan:        0 4px 20px rgba(6, 182, 212, 0.2);
  --shadow-green:       0 4px 20px rgba(16, 185, 129, 0.2);
  --shadow-glow-blue:   0 0 60px   rgba(59, 130, 246, 0.06);
  --shadow-glow-purple: 0 0 60px   rgba(139, 92, 246, 0.06);
  --shadow-glow-cyan:   0 0 60px   rgba(6, 182, 212, 0.06);

  /* Spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Typography scale */
  --text-xs:   11px;
  --text-sm:   13px;
  --text-base: 15px;
  --text-lg:   18px;
  --text-xl:   22px;
  --text-2xl:  28px;
  --text-3xl:  36px;
  --text-4xl:  48px;
  --text-5xl:  64px;

  /* Transitions */
  --ease-out:   cubic-bezier(0.2, 0, 0, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast:   150ms;
  --duration-base:   200ms;
  --duration-slow:   350ms;
  --duration-reveal: 600ms;
}

/* ═══════════════════════════════════════
   DARK THEME REFLEX
   ═══════════════════════════════════════ */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg:   #08091A;
    --color-bg-2: #0D1029;
    --color-bg-3: #121530;
    --color-surface:       rgba(255, 255, 255, 0.035);
    --color-surface-hover: rgba(255, 255, 255, 0.065);
    --color-border:        rgba(255, 255, 255, 0.07);
    --color-border-hover:  rgba(255, 255, 255, 0.14);

    --color-text:   #EEF2FF;
    --color-text-2: #94A3B8;
    --color-text-3: #475569;

    --color-blue-glow:   rgba(59, 130, 246, 0.25);
    --color-cyan-glow:   rgba(6, 182, 212, 0.25);
    --color-green-glow:  rgba(16, 185, 129, 0.25);
    --color-purple-glow: rgba(139, 92, 246, 0.25);

    --shadow-sm:          0 2px 8px  rgba(0, 0, 0, 0.30);
    --shadow-md:          0 4px 24px rgba(0, 0, 0, 0.40);
    --shadow-lg:          0 8px 48px rgba(0, 0, 0, 0.50);
    --shadow-blue:        0 4px 24px rgba(59, 130, 246, 0.3);
    --shadow-cyan:        0 4px 24px rgba(6, 182, 212, 0.3);
    --shadow-green:       0 4px 24px rgba(16, 185, 129, 0.3);
    --shadow-glow-blue:   0 0 60px   rgba(59, 130, 246, 0.12);
    --shadow-glow-purple: 0 0 60px   rgba(139, 92, 246, 0.12);
    --shadow-glow-cyan:   0 0 60px   rgba(6, 182, 212, 0.12);
  }
}

/* Explicit .dark class toggle fallback */
.dark {
  --color-bg:   #08091A;
  --color-bg-2: #0D1029;
  --color-bg-3: #121530;
  --color-surface:       rgba(255, 255, 255, 0.035);
  --color-surface-hover: rgba(255, 255, 255, 0.065);
  --color-border:        rgba(255, 255, 255, 0.07);
  --color-border-hover:  rgba(255, 255, 255, 0.14);

  --color-text:   #EEF2FF;
  --color-text-2: #94A3B8;
  --color-text-3: #475569;

  --color-blue-glow:   rgba(59, 130, 246, 0.25);
  --color-cyan-glow:   rgba(6, 182, 212, 0.25);
  --color-green-glow:  rgba(16, 185, 129, 0.25);
  --color-purple-glow: rgba(139, 92, 246, 0.25);

  --shadow-sm:          0 2px 8px  rgba(0, 0, 0, 0.30);
  --shadow-md:          0 4px 24px rgba(0, 0, 0, 0.40);
  --shadow-lg:          0 8px 48px rgba(0, 0, 0, 0.50);
  --shadow-blue:        0 4px 24px rgba(59, 130, 246, 0.3);
  --shadow-cyan:        0 4px 24px rgba(6, 182, 212, 0.3);
  --shadow-green:       0 4px 24px rgba(16, 185, 129, 0.3);
  --shadow-glow-blue:   0 0 60px   rgba(59, 130, 246, 0.12);
  --shadow-glow-purple: 0 0 60px   rgba(139, 92, 246, 0.12);
  --shadow-glow-cyan:   0 0 60px   rgba(6, 182, 212, 0.12);
}
```

---

## 2. Global Resets & Layout

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
  transition: background-color 250ms ease, color 250ms ease;
  min-height: 100vh;
  /* Subtle dot-grid ambient background */
  background-image: radial-gradient(var(--color-border) 1px, transparent 1px);
  background-size: 28px 28px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.page    { min-height: 100vh; padding-top: 80px; }
.section { padding: var(--space-12) 0; }
.section-lg { padding: 96px 0; }

/* Grid helpers */
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-6); }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6); }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-6); }

@media (max-width: 1024px) {
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .container { padding: 0 var(--space-4); }
  .section { padding: var(--space-8) 0; }
  .page { padding-top: 64px; }
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
}
```

---

## 3. Typography

```css
/* Gradient text utility */
.text-gradient {
  background: linear-gradient(135deg, var(--color-blue) 0%, var(--color-cyan) 50%, var(--color-purple) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Eyebrow / section category label */
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-cyan);
  margin-bottom: var(--space-3);
}

/* Section heading pattern: eyebrow + h2 + optional subtitle */
.section-header { text-align: center; margin-bottom: var(--space-12); }
.section-header h2 {
  font-size: var(--text-3xl);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: var(--space-3);
}
.section-header p {
  font-size: var(--text-base);
  color: var(--color-text-2);
  max-width: 540px;
  margin: 0 auto;
}

/* Hero headline */
.hero-title {
  font-size: clamp(var(--text-3xl), 6vw, var(--text-5xl));
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
}
.hero-subtitle {
  font-size: clamp(var(--text-lg), 3vw, var(--text-2xl));
  font-weight: 500;
  color: var(--color-text-2);
  margin-top: var(--space-3);
}
```

---

## 4. Glassmorphism & Core UI Components

### Glass Card

```css
.glass {
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--color-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.glass-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: var(--radius-lg);
  transition:
    background var(--duration-base) ease,
    border-color var(--duration-base) ease,
    transform 220ms var(--ease-out),
    box-shadow 220ms ease;
  will-change: transform;
}
.glass-card:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-border-hover);
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}
```

### Buttons

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 11px 22px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  border: none;
  text-decoration: none;
  transition: all 180ms var(--ease-out);
  white-space: nowrap;
}
.btn:active  { transform: scale(0.96); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

.btn-primary {
  background: linear-gradient(135deg, var(--color-blue) 0%, #2563EB 100%);
  color: #fff;
  box-shadow: var(--shadow-blue), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}
.btn-primary:hover {
  box-shadow: 0 6px 32px rgba(59, 130, 246, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.btn-cyan {
  background: linear-gradient(135deg, var(--color-cyan) 0%, var(--color-cyan-dark) 100%);
  color: #fff;
  box-shadow: var(--shadow-cyan), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}
.btn-cyan:hover {
  box-shadow: 0 6px 32px rgba(6, 182, 212, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.btn-ghost {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-2);
  border: 1px solid var(--color-border);
}
.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.09);
  color: var(--color-text);
  border-color: var(--color-border-hover);
}

.btn-sm { padding: 7px 14px; font-size: var(--text-xs); }
.btn-lg { padding: 14px 28px; font-size: var(--text-base); }
```

### Forms & Inputs

```css
.form-group { display: flex; flex-direction: column; gap: 6px; }

.label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-2);
  margin-bottom: 6px;
}

.input {
  width: 100%;
  padding: 11px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: var(--text-sm);
  transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
  outline: none;
}
.input:focus {
  border-color: var(--color-blue);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}
.input::placeholder { color: var(--color-text-3); }
```

---

## 5. Navbar

Sticky top navigation with backdrop blur and smooth anchor links.

```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 64px;
  display: flex;
  align-items: center;
  background: rgba(var(--color-bg), 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border);
  transition: background var(--duration-base) ease;
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.navbar-logo {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
  letter-spacing: -0.01em;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  list-style: none;
}

.navbar-link {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-2);
  text-decoration: none;
  transition: color var(--duration-fast) ease;
  position: relative;
}
.navbar-link::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0; right: 0;
  height: 2px;
  background: var(--color-cyan);
  border-radius: 2px;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform var(--duration-base) var(--ease-out);
}
.navbar-link:hover        { color: var(--color-text); }
.navbar-link:hover::after { transform: scaleX(1); }

@media (max-width: 768px) {
  .navbar-links { display: none; }
}
```

**HTML pattern:**
```html
<nav class="navbar">
  <div class="navbar-inner">
    <a href="#top" class="navbar-logo">PT</a>
    <ul class="navbar-links">
      <li><a href="#about"      class="navbar-link">About</a></li>
      <li><a href="#projects"   class="navbar-link">Projects</a></li>
      <li><a href="#skills"     class="navbar-link">Skills</a></li>
      <li><a href="#experience" class="navbar-link">Experience</a></li>
      <li><a href="#contact"    class="navbar-link">Contact</a></li>
    </ul>
  </div>
</nav>
```

---

## 6. Hero Section

Full-viewport hero with headline, subtitle, CTA buttons, and a floating data widget.

```css
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: var(--space-16) 0;
}

/* Ambient glow blobs behind content */
.hero::before,
.hero::after {
  content: '';
  position: absolute;
  border-radius: var(--radius-full);
  pointer-events: none;
  filter: blur(80px);
  opacity: 0.35;
}
.hero::before {
  width: 600px; height: 600px;
  background: var(--color-blue-glow);
  top: -200px; left: -200px;
}
.hero::after {
  width: 400px; height: 400px;
  background: var(--color-cyan-glow);
  bottom: -100px; right: -100px;
}

.hero-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-12);
  align-items: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 6px 14px;
  background: var(--color-cyan-glow);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-cyan);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: var(--space-5);
}

.hero-cta {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-8);
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .hero-layout { grid-template-columns: 1fr; }
  .hero-title   { font-size: var(--text-3xl); }
}
```

**HTML pattern:**
```html
<section class="hero">
  <div class="container">
    <div class="hero-layout">
      <div>
        <div class="hero-badge">Industry 4.0 / MES Integration</div>
        <h1 class="hero-title">Hi, I'm <span class="text-gradient">Your Name</span></h1>
        <p class="hero-subtitle">Smart Factory & IoT Engineer</p>
        <div class="hero-cta">
          <a href="#projects" class="btn btn-primary">View Work</a>
          <a href="/resume.pdf" class="btn btn-ghost">Download CV</a>
        </div>
      </div>
      <div class="hero-widget">
        <!-- Telemetry Widget — see §7 -->
      </div>
    </div>
  </div>
</section>
```

---

## 7. Telemetry & Status Widgets

Industrial live-data display components.

### Live Status Badge

```css
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.status-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Variants */
.status-running {
  background: rgba(16, 185, 129, 0.12);
  color: var(--color-green);
  border: 1px solid rgba(16, 185, 129, 0.25);
}
.status-running .status-dot {
  background: var(--color-green);
  animation: pulse-dot 1.6s ease-in-out infinite;
}

.status-warning {
  background: rgba(245, 158, 11, 0.12);
  color: var(--color-amber);
  border: 1px solid rgba(245, 158, 11, 0.25);
}
.status-warning .status-dot { background: var(--color-amber); }

.status-error {
  background: rgba(239, 68, 68, 0.12);
  color: var(--color-red);
  border: 1px solid rgba(239, 68, 68, 0.25);
}
.status-error .status-dot { background: var(--color-red); }

.status-idle {
  background: var(--color-surface);
  color: var(--color-text-3);
  border: 1px solid var(--color-border);
}
.status-idle .status-dot { background: var(--color-text-3); }

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.75); }
}
```

**HTML pattern:**
```html
<span class="status-badge status-running">
  <span class="status-dot"></span>
  Running
</span>
```

### Telemetry Widget (Floating Card)

The floating data panel used as hero decoration or dashboard widget.

```css
.telemetry-widget {
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  box-shadow: var(--shadow-lg), var(--shadow-glow-cyan);
  min-width: 240px;
}

.telemetry-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.telemetry-title {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-3);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.telemetry-metric {
  margin-bottom: var(--space-4);
}

.telemetry-metric-label {
  font-size: var(--text-xs);
  color: var(--color-text-3);
  margin-bottom: 4px;
}

.telemetry-metric-value {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.02em;
  line-height: 1;
}

.telemetry-metric-value span {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-3);
  margin-left: 2px;
}

/* Inline sparkline bar */
.telemetry-bar {
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  margin-top: var(--space-2);
  overflow: hidden;
}
.telemetry-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-cyan) 0%, var(--color-blue) 100%);
  border-radius: 2px;
  transition: width 800ms var(--ease-out);
}
```

**HTML pattern:**
```html
<div class="telemetry-widget animate-fade-up">
  <div class="telemetry-header">
    <span class="telemetry-title">Telemetry Hub</span>
    <span class="status-badge status-running">
      <span class="status-dot"></span>Running
    </span>
  </div>

  <div class="telemetry-metric">
    <div class="telemetry-metric-label">Robot OEE Rate</div>
    <div class="telemetry-metric-value">96.8<span>%</span></div>
    <div class="telemetry-bar"><div class="telemetry-bar-fill" style="width:96.8%"></div></div>
  </div>

  <div class="telemetry-metric">
    <div class="telemetry-metric-label">Active MQTT Tags</div>
    <div class="telemetry-metric-value">15,420</div>
  </div>
</div>
```

---

## 8. Tag Pills & Tech Badges

Inline pills for skills, tech stacks, and category labels.

```css
/* Base tag */
.tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 500;
  white-space: nowrap;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-2);
  transition: background var(--duration-fast) ease, border-color var(--duration-fast) ease;
}
.tag:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-border-hover);
  color: var(--color-text);
}

/* Colored variants */
.tag-blue   { background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.25); color: var(--color-blue-light); }
.tag-cyan   { background: rgba(6,182,212,0.1);  border-color: rgba(6,182,212,0.25);  color: var(--color-cyan-light); }
.tag-green  { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.25); color: var(--color-green-light); }
.tag-purple { background: rgba(139,92,246,0.1); border-color: rgba(139,92,246,0.25); color: var(--color-purple-light); }
.tag-amber  { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); color: var(--color-amber-light); }

/* Tag row container */
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
```

---

## 9. Stats Counter Row

Prominent numeric stats for credibility (years, projects, certificates).

```css
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-6);
  padding: var(--space-8) 0;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: var(--text-4xl);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, var(--color-text) 60%, var(--color-cyan) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-text-3);
  margin-top: var(--space-1);
}
```

**HTML pattern:**
```html
<div class="stats-row">
  <div class="stat-item">
    <div class="stat-number">6+</div>
    <div class="stat-label">Years in IoT</div>
  </div>
  <div class="stat-item">
    <div class="stat-number">12</div>
    <div class="stat-label">Project Domains</div>
  </div>
  <div class="stat-item">
    <div class="stat-number">7</div>
    <div class="stat-label">Certificates</div>
  </div>
</div>
```

---

## 10. Project Image Card

Card with full image, overlay category label, title, description, and tag row.

```css
.project-card {
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition:
    transform 260ms var(--ease-out),
    box-shadow 260ms ease,
    border-color 260ms ease;
  will-change: transform;
}
.project-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border-hover);
}

.project-card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--color-bg-3);
}
.project-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 400ms var(--ease-out);
}
.project-card:hover .project-card-image img {
  transform: scale(1.04);
}

/* Category label overlaid on image */
.project-card-category {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  padding: 4px 10px;
  background: rgba(8, 9, 26, 0.72);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-cyan-light);
  letter-spacing: 0.04em;
}

.project-card-body {
  padding: var(--space-5);
}

.project-card-title {
  font-size: var(--text-lg);
  font-weight: 700;
  margin-bottom: var(--space-2);
  line-height: 1.3;
}

.project-card-desc {
  font-size: var(--text-sm);
  color: var(--color-text-2);
  line-height: 1.6;
  margin-bottom: var(--space-4);
}
```

**HTML pattern:**
```html
<div class="project-card stagger-child" style="--i:0">
  <div class="project-card-image">
    <img src="/projects/hero.jpg" alt="Project title" loading="lazy" />
    <span class="project-card-category">Smart Factory Demo</span>
  </div>
  <div class="project-card-body">
    <h3 class="project-card-title">Robot OEE Dashboard</h3>
    <p class="project-card-desc">
      Real-time OEE monitoring with Kepware and ThingWorx for METALEX2024.
    </p>
    <div class="tag-row">
      <span class="tag tag-cyan">Yaskawa</span>
      <span class="tag">OEE</span>
      <span class="tag">Kepware</span>
      <span class="tag">ThingWorx</span>
    </div>
  </div>
</div>
```

---

## 11. Skill Category Grid

Grouped skill tags under a bold category heading.

```css
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-5);
}

.skill-category {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  transition: border-color var(--duration-base) ease;
}
.skill-category:hover { border-color: var(--color-border-hover); }

.skill-category-title {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-cyan);
  margin-bottom: var(--space-3);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}
```

**HTML pattern:**
```html
<div class="skills-grid">
  <div class="skill-category stagger-child" style="--i:0">
    <div class="skill-category-title">Industrial IoT</div>
    <div class="tag-row">
      <span class="tag">ThingWorx</span>
      <span class="tag">Kepware</span>
      <span class="tag">MQTT</span>
      <span class="tag">OPC UA</span>
    </div>
  </div>
  <div class="skill-category stagger-child" style="--i:1">
    <div class="skill-category-title">Programming</div>
    <div class="tag-row">
      <span class="tag">C#</span>
      <span class="tag">JavaScript</span>
      <span class="tag">Python</span>
      <span class="tag">SQL</span>
    </div>
  </div>
</div>
```

---

## 12. Vertical Timeline

Experience / professional journey component.

```css
.timeline {
  position: relative;
  padding-left: var(--space-8);
}

/* Vertical line */
.timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 0;
  width: 2px;
  background: linear-gradient(
    to bottom,
    var(--color-cyan) 0%,
    var(--color-border) 100%
  );
  border-radius: 1px;
}

.timeline-item {
  position: relative;
  margin-bottom: var(--space-10);
}
.timeline-item:last-child { margin-bottom: 0; }

/* Dot on the line */
.timeline-item::before {
  content: '';
  position: absolute;
  left: calc(-1 * var(--space-8) - 5px);
  top: 6px;
  width: 12px; height: 12px;
  border-radius: 50%;
  background: var(--color-cyan);
  border: 3px solid var(--color-bg);
  box-shadow: 0 0 0 2px var(--color-cyan);
}

.timeline-date {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-cyan);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: var(--space-2);
}

.timeline-role {
  font-size: var(--text-lg);
  font-weight: 700;
  margin-bottom: 2px;
}

.timeline-company {
  font-size: var(--text-sm);
  color: var(--color-text-2);
  margin-bottom: var(--space-3);
}

.timeline-bullets {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.timeline-bullets li {
  font-size: var(--text-sm);
  color: var(--color-text-2);
  padding-left: var(--space-4);
  position: relative;
  line-height: 1.6;
}
.timeline-bullets li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--color-cyan);
  font-size: 11px;
  top: 3px;
}
```

**HTML pattern:**
```html
<div class="timeline">
  <div class="timeline-item animate-reveal">
    <div class="timeline-date">Aug 2020 – Present</div>
    <div class="timeline-role">IoT Engineer</div>
    <div class="timeline-company">Material Automation (Thailand) Co., Ltd.</div>
    <ul class="timeline-bullets">
      <li>Connect PLCs, MQTT, OPC UA, REST APIs to IoT platforms.</li>
      <li>Develop ThingWorx dashboards and automatic tag binding.</li>
    </ul>
  </div>
</div>
```

---

## 13. Contact CTA Section

Full-width dark call-to-action strip with email and phone links.

```css
.cta-section {
  background: var(--color-bg-2);
  border-top: 1px solid var(--color-border);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  padding: var(--space-16) var(--space-6);
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* Ambient glow */
.cta-section::before {
  content: '';
  position: absolute;
  top: -120px; left: 50%;
  transform: translateX(-50%);
  width: 600px; height: 300px;
  background: var(--color-cyan-glow);
  filter: blur(80px);
  opacity: 0.4;
  pointer-events: none;
}

.cta-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  margin-bottom: var(--space-3);
}

.cta-subtitle {
  font-size: var(--text-base);
  color: var(--color-text-2);
  max-width: 480px;
  margin: 0 auto var(--space-8);
}

.cta-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: var(--space-8);
}

.cta-contact-links {
  display: flex;
  gap: var(--space-8);
  justify-content: center;
  flex-wrap: wrap;
}

.cta-contact-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.cta-contact-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.cta-contact-value {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-cyan);
  text-decoration: none;
  transition: color var(--duration-fast) ease;
}
.cta-contact-value:hover { color: var(--color-cyan-light); }
```

---

## 14. Premium Micro-Animations (Keyframes)

```css
/* ── Entry Animations ─────────────────────── */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes fade-right {
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0);     }
}

/* ── State / Loop Animations ──────────────── */
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.75); }
}

@keyframes float {
  0%, 100% { transform: translateY(0);   }
  50%       { transform: translateY(-8px); }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ── Loading ──────────────────────────────── */
@keyframes shimmer {
  from { transform: translateX(-100%); }
  to   { transform: translateX(200%);  }
}

/* ── Utility Classes ──────────────────────── */
.animate-fade-up    { animation: fade-up   var(--duration-reveal) var(--ease-out) 1 both; }
.animate-fade-in    { animation: fade-in   var(--duration-reveal) ease              1 both; }
.animate-fade-right { animation: fade-right var(--duration-reveal) var(--ease-out) 1 both; }
.animate-float      { animation: float 3s ease-in-out infinite; }
.animate-spin-slow  { animation: spin-slow 8s linear infinite; }

/* Staggered children: set --i on each child */
.stagger-child {
  animation: fade-up var(--duration-reveal) var(--ease-out) 1 both;
  animation-delay: calc(var(--i, 0) * 80ms);
}

/* ── Scroll Reveal ────────────────────────── */
/* 
  JS usage:
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('revealed');
    }),
    { threshold: 0.15 }
  );
  document.querySelectorAll('.animate-reveal').forEach(el => observer.observe(el));
*/
.animate-reveal {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity  var(--duration-reveal) var(--ease-out),
    transform var(--duration-reveal) var(--ease-out);
}
.animate-reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered reveal via CSS custom property */
.animate-reveal[style*="--delay"] {
  transition-delay: var(--delay, 0ms);
}

/* ── Skeleton Loader ──────────────────────── */
.skeleton {
  background: rgba(255, 255, 255, 0.04);
  border-radius: var(--radius-md);
  position: relative;
  overflow: hidden;
}
.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%);
  animation: shimmer 1600ms ease infinite;
}
```

---

## 15. Scroll Reveal — Minimal JS Bootstrap

Drop this at the bottom of your page `<body>` to activate `.animate-reveal` elements automatically.

```html
<script>
(function () {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // fire once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.animate-reveal').forEach((el, i) => {
    // Auto-stagger siblings inside the same parent
    const siblings = [...el.parentElement.children].filter(
      (c) => c.classList.contains('animate-reveal')
    );
    const idx = siblings.indexOf(el);
    if (idx > 0) el.style.setProperty('--delay', `${idx * 80}ms`);
    observer.observe(el);
  });
})();
</script>
```

---

## 16. Theme Toggle (JS)

```html
<button class="btn btn-ghost btn-sm" id="theme-toggle" aria-label="Toggle theme">
  ☀️
</button>

<script>
(function () {
  const root   = document.documentElement;
  const btn    = document.getElementById('theme-toggle');
  const stored = localStorage.getItem('theme');
  const system = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = stored ? stored === 'dark' : system;

  if (isDark) root.classList.add('dark');
  btn.textContent = isDark ? '☀️' : '🌙';

  btn.addEventListener('click', () => {
    const nowDark = root.classList.toggle('dark');
    btn.textContent = nowDark ? '☀️' : '🌙';
    localStorage.setItem('theme', nowDark ? 'dark' : 'light');
  });
})();
</script>
```

---

## Quick-Reference: Component Checklist

| Component              | Class(es)                                    | Notes                          |
|------------------------|----------------------------------------------|--------------------------------|
| Glass card             | `.glass-card`                                | Hover lift + blur              |
| Primary button         | `.btn .btn-primary`                          | Blue gradient                  |
| Cyan button            | `.btn .btn-cyan`                             | Telemetry accent               |
| Ghost button           | `.btn .btn-ghost`                            | Bordered, subtle               |
| Live status badge      | `.status-badge .status-running`              | Pulse dot animation            |
| Telemetry widget       | `.telemetry-widget`                          | Metric + bar fill              |
| Tag pill               | `.tag` + `.tag-cyan` etc.                    | Inline tech badge              |
| Stats row              | `.stats-row` → `.stat-item`                  | Gradient number                |
| Project image card     | `.project-card`                              | Image zoom on hover            |
| Skill category group   | `.skill-category`                            | Tags under heading             |
| Vertical timeline      | `.timeline` → `.timeline-item`               | Gradient left line             |
| Section header         | `.section-header` + `.eyebrow`               | Category + heading + subtitle  |
| Gradient text          | `.text-gradient`                             | Blue → cyan → purple           |
| Scroll reveal          | `.animate-reveal` + JS bootstrap (§15)       | One-time IntersectionObserver  |
| Stagger children       | `.stagger-child` with `style="--i:N"`        | CSS delay cascade              |
| Skeleton loader        | `.skeleton`                                  | Shimmer pseudo-element         |
| Theme toggle           | `#theme-toggle` + JS (§16)                   | Persists to localStorage       |
| Navbar                 | `.navbar` → `.navbar-links`                  | Sticky blur + underline hover  |
| Ambient dot grid       | Applied on `body`                            | `radial-gradient` background   |
