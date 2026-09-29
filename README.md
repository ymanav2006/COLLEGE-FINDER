# COLLEGE-FINDER

**Your Future Has More Than One Path.**
Explore. Compare. Plan. Move Forward.

A student college & career discovery platform for students who have just completed Class 12 — a College Finder + Career Counselor + Course Explorer + Scholarship Finder + Study-Abroad Guide + Higher-Education Planner + Personalised Student Roadmap.

---

## What it does

The platform never says *"this is the best college."* It walks a student through:

**WHO YOU ARE → WHAT YOU CAN STUDY → WHERE YOU CAN STUDY → WHAT IT COSTS → WHAT CAREERS IT LEADS TO → WHAT YOU CAN DO NEXT**

Every recommendation explains **why** it appears, and every important number carries:

```
VALUE  →  SOURCE  →  DATE  →  CONFIDENCE
```

---

## Core features

| Area | Highlights |
| --- | --- |
| **Onboarding** | Academic profile, interests, budget, location preferences |
| **Your Education Map** | Personalised dashboard across 10 sections |
| **Stream → Career Explorer** | PCM, PCB, PCMB, Commerce, Arts, Vocational |
| **Outside Your Stream** | *"What Else Can I Become?"* — direct / additional / alternate pathways |
| **College database** | Filters, profiles, scorecards, comparison, affordability check |
| **Universities worldwide** | Every university in one list — **outside India first, then India** — with the ordering formula printed in full (never a "best" verdict) |
| **Know more about a university** | Five-tab deep dive on each profile: applying here, money & funding, life/city/campus, routes in, official links |
| **2+2 & transfer pathways** | Study 2 years in India + 2 years abroad (plus 3+1, 2+1, 1+3, credit transfer) with both legs costed side by side |
| **Search abroad opportunities** | One search across international universities, pathways, countries, scholarships, tests and courses |
| **Course & Career explorers** | Pathways, "what can I do after this degree?" |
| **Entrance exams** | India + international (IELTS, TOEFL, TestDaF, JLPT, EJU, TOPIK, DELF…), dates, syllabus, prep resources |
| **Scholarships & Study Abroad** | Country guides with last-verified dates + official sources |
| **Planning tools** | Budget planner, 5-year map, decision matrix, deadline tracker, application tracker |
| **Confusion solver** | *"I Don't Know What To Do"* → several possible pathways |
| **Higher studies planner** | Master's, professional, research, medical and law routes after a bachelor's |
| **What-If / Plan B** | Change a variable, see alternative routes |
| **Pathfinder AI** | Retrieval-grounded answers that always cite a source |
| **Source transparency** | *"How We Know This"* + Verified / Cross-checked / Reported / Unverified labels |
| **Admin dashboard** | Edit records with audit trail + data-freshness monitoring |

---

## Trust & safety rules

Never done on this platform:

- Guarantee admission, employment or salary
- Invent placement statistics or university information
- Present opinions as facts
- Claim outdated visa rules are current
- Hide uncertainty

Missing information shows **"Data unavailable"** rather than an invented number.

> **Information may have changed — verify before applying.**

---

## Tech stack

- **Frontend:** Next.js (App Router) · React · TypeScript · Tailwind CSS
- **State:** Zustand (local persistence for saved items, roadmap, applications)
- **Charts:** Recharts · **Maps:** d3-geo + world-atlas · **Motion:** Framer Motion
- **Search:** Full-text + natural-language query parsing
- **Data layer:** Typed entity model (`Student`, `University`, `Course`, `Career`, `EntranceExam`, `Scholarship`, `Skill`, `Source`, `Application`, `Deadline`, …) so colleges and courses are **records, not hard-coded pages**

---

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000

```bash
npm run build   # production build
npm start       # serve production build
```

---

## Demo mode

Four sample profiles ship with the build so you can explore without an account:

- **Student A** — PCM, 85%, ₹4 lakh/year budget, technology interests
- **Student B** — PCB, 90%, medicine-focused
- **Student C** — Commerce, 78%, finance-focused
- **Student D** — Humanities, 88%, psychology-focused

> Seed data is **labelled as demo content** and is not verified production data.

---

## Data freshness

Every time-sensitive field (fees, deadlines, admission requirements, placement data, scholarships, visa rules, exam dates) carries a `last_verified` timestamp, and the UI surfaces a staleness warning when the information ages.

---

## License

MIT
