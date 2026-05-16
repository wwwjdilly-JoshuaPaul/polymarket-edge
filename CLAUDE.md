# CLAUDE.md — MASTER BUSINESS CONTEXT

**Owner:** Joshua Paul (Selah Aisings)
**Mission:** Deploy automated SaaS tools and white-label apps that generate revenue while I sleep, priced better than competitors with real human value.
**Stack:** GitHub → Cloudflare (Pages/Workers) → Postmark → Gumroad → Fiverr
**Mantra:** Bots work 24/7. I build once, sell forever.

---

## 1. BUSINESS PHILOSOPHY & PRICING STRATEGY

**Core Rule:** Every product must be a real service at a better price than the incumbent. No fake scarcity. No AI slop. Deliver PDFs, signals, or working apps that save the customer time or money.

**Revenue Models (in order of priority):**
1. **Fiverr Gigs** — Immediate cash flow, proof of concept, lead gen for upsells
2. **Subscription SaaS** — Monthly recurring via Gumroad/Stripe (goal: $500/month per app)
3. **White-Label Licensing** — Sell MorningLamp to churches as a branded package
4. **Affiliate/Referral** — Built into every app (ADA scanner → web dev referral, etc.)

**Pricing Psychology:**
- Always offer 3 tiers: Basic ($29-49), Pro ($99-149), Enterprise ($299+)
- Fiverr gigs start at $25 to win the click, upsell to $95 for the real deliverable
- Undercut competitors by 40-60% but deliver faster (24-48h turnaround)

---

## 2. TECH STACK & DEPLOYMENT RULES

**Non-Negotiable Infrastructure:**

| Service | Role | Rules |
|---|---|---|
| GitHub | Source of truth | Every project is a repo. Main branch is sacred. |
| Cloudflare | Hosting + Edge | Pages for static/apps. Workers for API/bots. Always use custom domains. |
| Postmark | Transactional email | All PDF reports, welcome sequences, signal alerts go through Postmark. |
| Gumroad | Payments | Subscriptions, one-time licenses, digital downloads. |
| Telegram | Bot delivery | Kelshi signals, admin alerts, customer support bot. |
| Fiverr | Lead gen + gigs | Every gig links back to my domain for credibility. |

**Deployment Standards:**
- All web apps must be ADA-compliant (WCAG 2.1 AA minimum — eat your own dogfood)
- All repos must have a README.md with live URL, screenshot, and pricing
- Use Cloudflare Workers for serverless functions (no VPS management)
- Environment variables in `.env.example` never committed with real keys
- GitHub Actions for auto-deploy on push to main

---

## 3. ACTIVE PROJECTS — THE PORTFOLIO

### A. SelahSavings.com — ADA Compliance Scanner
**What it does:** Scans any website for ADA/WCAG violations and emails a professional PDF report.
**Tech:** Cloudflare Pages + Worker (scan API) + Postmark (PDF delivery)
**Monetization:**
- Fiverr Gig: "I will audit your website for ADA compliance and send a PDF report" — $35 basic, $95 with remediation guide
- SaaS: $29/month for automated quarterly scans
- Upsell: "I will fix the violations for you" — custom quote ($500+)

**Claude Context:** This is the proof-of-concept for all future scanner apps. The PDF generation engine and Postmark integration are reusable modules.

### B. Kelshi.us — Trading Signals App
**What it does:** Automated market scanning that posts recommended trades to a Telegram channel every 15 minutes.
**Tech:** Cloudflare Worker (cron trigger) + Telegram Bot API + Market data API
**Monetization:**
- Free Telegram channel (lead gen)
- Premium signals via Gumroad subscription: $49/month
- Fiverr Gig: "I will build you a trading signals bot for Telegram" — $150 setup + $29/month maintenance
- White-label: Sell the bot framework to trading educators

**Claude Context:** The cron-worker pattern here is the template for any recurring bot task. Reuse this architecture.

### C. MorningLamp.com — Church Interactive App
**What it does:** Branded church portal with directories, links, devotionals, and announcements.
**Tech:** Cloudflare Pages (static) + Workers (dynamic content) + Postmark (prayer requests)
**Monetization (THE BIG ONE):**
- White-Label License: $199 setup + $49/month per church
- Fiverr Gig: "I will build a custom church app with your branding" — $99 basic, $299 full feature
- Upsell: Add sermon audio hosting, event registration, giving integration
- Target: Small churches (50-500 members) who can't afford $5k+ custom dev

**Claude Context:** This must be designed as a multi-tenant template. One codebase, infinite churches via config file (`church.config.json`). The branding system (colors, logo, domain) must be 100% automated.

---

## 4. FIVERR GIG STRATEGY — IMMEDIATE REVENUE

**Goal:** Launch 5 gigs in 30 days. All gigs must point to my real websites as portfolio proof.

**Gig Lineup:**
1. "I will audit your website for ADA compliance and deliver a PDF report" — **$35**
   - Uses: SelahSavings engine
   - Upsell: Fix the issues (+$100)
2. "I will build a Telegram bot that posts automated signals or alerts" — **$125**
   - Uses: Kelshi.us framework
   - Upsell: Custom data source (+$75)
3. "I will create a branded church app with directory and links" — **$99**
   - Uses: MorningLamp template
   - Upsell: Custom domain + hosting (+$49/month)
4. "I will set up your automated email system with Postmark" — **$75**
   - Uses: Postmark expertise from all projects
   - Upsell: Welcome sequence copywriting (+$50)
5. "I will deploy your web app to Cloudflare with custom domain" — **$45**
   - Uses: Deployment pipeline expertise
   - Upsell: Speed optimization + ADA scan (+$50)

**Fiverr SEO Rules:**
- Title must contain the exact search phrase a buyer types
- Thumbnail: Before/After or "24h Delivery" badge
- Description: Lead with result, not process. "Get a professional ADA report in 24 hours."
- Always offer "Source Code" as a Gig Extra for SaaS gigs

---

## 5. AUTOMATION ARCHITECTURE — BOTS THAT SLEEP FOR YOU

**Philosophy:** If I do it twice, a bot should do it forever.

**Current Bot Fleet:**

| Bot | Task | Trigger | Platform |
|---|---|---|---|
| Kelshi Scanner | Market scan + signal post | Every 15 min | Cloudflare Cron Worker |
| ADA Auditor | Website crawl + PDF gen | On-demand (API) | Cloudflare Worker |
| MorningLamp Builder | Church config → deployed site | On purchase | GitHub Action + Worker |
| Fiverr Fulfillment | Gig order → auto-start project | Webhook (manual for now) | Postmark notification |

**Bot Development Rules for Claude:**
- Every bot must have a `/health` endpoint
- Every bot must log to a Telegram admin channel on failure
- Every bot must be idempotent (running twice shouldn't break anything)
- Use Cloudflare D1 or KV for lightweight state; upgrade to D1 for relational needs

---

## 6. REVENUE MAXIMIZATION PLAYBOOK

**The $500/Month Per App Formula:**
- 10 customers × $49/month = $490
- 20 customers × $25/month = $500
- 2 white-label churches × $199 + $49 = $496

**Tactics:**
1. **Tripwire → Core → Profit Maximizer** (from all funnels)
   - Free scan → $29 PDF → $299 remediation
   - Free Telegram → $49 premium → $199 strategy call
2. **Annual Discount:** 2 months free when paying yearly (improves cash flow)
3. **Charity Angle:** 10% of all revenue donated to Pathway Church of Redding, CA. Mention this in copy. It builds trust and aligns with mission.
4. **Cross-Sell:** Every ADA report footer links to MorningLamp. Every MorningLamp admin panel links to Kelshi (for church investment clubs, etc.).

---

## 7. CLAUDE CODE COLLABORATION PROTOCOL

**How I Work:**
- I think in systems, not tasks. I want Claude to see the business implication of every line of code.
- I prefer working code over perfect code. Ship fast, iterate.
- I love agent swarms and parallel execution. If a task can be split into 4 workers, do it.
- I need bots that run while I sleep. Cron jobs, webhooks, and automation are priority #1.

**Claude's Role:**
1. **Senior Architect:** Propose the simplest viable architecture. No over-engineering.
2. **Business Analyst:** Every feature suggestion must include a monetization angle.
3. **DevOps Engineer:** Write the GitHub Action, the Cloudflare Worker, the deployment script.
4. **Copywriter:** Write the Fiverr gig description, the landing page headline, the email sequence.
5. **Bot Builder:** If it can be automated, automate it. I should not be copy-pasting at 2 AM.

**When I Ask for Code:**
- Include the full file unless I specifically ask for a diff
- Include environment variable examples in comments
- Include deployment instructions at the bottom of the file
- If it's a new project, scaffold the full folder structure

**When I Ask for Strategy:**
- Lead with the revenue impact
- Include a 30-60-90 day timeline
- Identify which existing project/module can be reused

---

## 8. BRAND VOICE & ETHICS

**Voice:** Confident but humble. Professional but approachable. Christian values without being preachy.

**Ethics:**
- Never sell fake trading signals. Kelshi is educational/alert-based only.
- Never claim 100% ADA compliance guarantee. We scan and report; legal liability stays with the client.
- Always deliver what was promised on Fiverr before asking for a review.
- Honor the 10% giving commitment. Build it into Gumroad/Stripe as an automated transfer if possible.

---

## 9. GROWTH ROADMAP

**Phase 1: Fiverr Foundation (Now - Month 1)**
- Launch 5 gigs
- Complete 10 orders to get Level 1 Seller
- Collect testimonials for landing pages

**Phase 2: SaaS Subscription (Month 2-3)**
- Move Fiverr buyers to monthly subscriptions
- Launch Gumroad checkout on all project sites
- Automate onboarding (payment → bot deploys their instance)

**Phase 3: White-Label Scale (Month 4-6)**
- MorningLamp church template sales via cold email to pastors
- Kelshi bot licensing to trading Discord/Telegram admins
- ADA scanner API for web agencies (B2B)

**Phase 4: Passive Income (Month 6+)**
- All systems run without daily intervention
- Focus shifts to new product invention and content marketing
- Revenue target: $3,000/month across all properties

---

## 10. QUICK REFERENCE — MY DOMAINS & KEYS

| Asset | URL | Purpose |
|---|---|---|
| ADA Scanner | https://selahsavings.com | Lead gen + SaaS |
| Trading Signals | https://kelshi.us | Subscription + Bot demo |
| Church App | https://morninglamp.com | White-label template |
| Music/Brand | https://selahaisings.com | Personal brand credibility |
| Devotional | https://morninglamp.net | Content site (cross-sell) |

**Social Proof (use in Fiverr gigs & landing pages):**
- GitHub: wwwjdilly-JoshuaPaul
- X/Twitter: @selahaisings
- YouTube: @SelahAisings
- TikTok: @selahaisings

---

## 11. CLAUDE CODE INSTRUCTIONS

**When starting any new task, Claude should:**
1. Check which project above it relates to
2. Reuse existing modules from that project's repo
3. Ask: "How does this make money or save time?"
4. Ask: "Can this run automatically at 2 AM?"
5. Write code that deploys to Cloudflare in < 5 minutes

**Forbidden Patterns:**
- No AWS complexity unless explicitly requested
- No Docker unless the client specifically demands it
- No monthly server bills when Cloudflare Workers are free/cheap
- No manual email sending when Postmark is configured

**Preferred Patterns:**
- Cloudflare Pages + Workers (serverless)
- GitHub Actions (CI/CD)
- Postmark (transactional email)
- Gumroad/Stripe (payments)
- Telegram (bot notifications + delivery)
- JSON config files (no databases for simple apps)

---

**Last Updated:** 2026-05-16
**Next Review:** After Fiverr Level 1 achievement or first $1,000 month
