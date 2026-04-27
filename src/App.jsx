import { useState, useEffect, useCallback, useRef } from "react";

/* ─────────────────────────────────────────────
   EDGE ENGINE  (5 factors + Kelly)
   ───────────────────────────────────────────── */

function f1_priceSweet(price) {
  if (price < 0.05 || price > 0.50) return 0;
  return Math.round(30 * Math.exp(-Math.pow((price - 0.22) / 0.14, 2)));
}

function f2_liquidity(vol) {
  return Math.round(Math.min(25, Math.max(0, (Math.log10(Math.max(vol, 1)) - 3.7) * 9)));
}

function f3_capitalEfficiency(price, days) {
  if (days <= 0 || price <= 0) return 0;
  const annReturn = ((1 / price) - 1) / (days / 365);
  return Math.round(Math.min(25, Math.max(0, Math.log10(Math.max(annReturn, 1)) * 10)));
}

function f4_activity(vol, vol24h, days) {
  if (!vol24h || !vol || days <= 0) return 4;
  const avgDaily = vol / Math.max(days, 1);
  const ratio = vol24h / Math.max(avgDaily, 1);
  return Math.round(Math.min(10, ratio * 5));
}

function f5_urgency(days) {
  if (days <= 7)  return 10;
  if (days <= 21) return 8;
  if (days <= 45) return 5;
  if (days <= 90) return 2;
  return 0;
}

function kellyFraction(price, score) {
  const estP = Math.min(0.82, price + (score / 100) * 0.28);
  const b = Math.max(0.01, (1 - price) / price);
  const k = (estP * b - (1 - estP)) / b;
  return Math.max(0, Math.min(0.20, k));
}

function scoreMarket(price, vol, days, vol24h) {
  const F1 = f1_priceSweet(price);
  const F2 = f2_liquidity(vol);
  const F3 = f3_capitalEfficiency(price, days);
  const F4 = f4_activity(vol, vol24h, days);
  const F5 = f5_urgency(days);
  const total = F1 + F2 + F3 + F4 + F5;
  const kelly = kellyFraction(price, total);
  const annReturn = days > 0 ? ((1 / price - 1) / (days / 365)) : 0;
  let tier = total >= 68 ? "STRONG" : total >= 48 ? "TRADE" : total >= 30 ? "WATCH" : "PASS";
  return { total, F1, F2, F3, F4, F5, kelly, annReturn, tier };
}

/* ─────────────────────────────────────────────
   STYLES
   ───────────────────────────────────────────── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#0a0c10;--surface:#111318;--surface2:#161a22;
    --border:#1e2433;--border2:#2a3347;
    --green:#22c55e;--green-dim:#16a34a;
    --amber:#f59e0b;--red:#ef4444;--blue:#3b82f6;--purple:#a855f7;
    --text:#e2e8f0;--text-dim:#94a3b8;--text-muted:#475569;
    --mono:'JetBrains Mono',monospace;--sans:'Inter',sans-serif;
  }
  body{background:var(--bg);color:var(--text);font-family:var(--sans)}
  .app{min-height:100vh;display:flex;flex-direction:column}

  /* HEADER */
  .hdr{padding:12px 22px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:var(--surface)}
  .logo{display:flex;align-items:center;gap:9px}
  .logo-dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green);animation:breathe 2s ease-in-out infinite}
  @keyframes breathe{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
  .logo-text{font-size:13px;font-weight:600}
  .logo-text span{color:var(--text-muted);font-weight:400}
  .hdr-right{display:flex;align-items:center;gap:14px}
  .pill{font-size:10px;color:var(--text-dim);display:flex;align-items:center;gap:4px}
  .pill .v{font-weight:700;font-family:var(--mono)}
  .pill.g .v{color:var(--green)}.pill.a .v{color:var(--amber)}
  .utc{font-family:var(--mono);font-size:11px;color:var(--amber);background:rgba(245,158,11,.08);padding:3px 8px;border-radius:4px;border:1px solid rgba(245,158,11,.2)}
  .rfbtn{font-size:10px;padding:5px 12px;border-radius:6px;border:1px solid var(--border2);background:transparent;color:var(--text-dim);cursor:pointer;transition:all .2s}
  .rfbtn:hover{border-color:var(--green);color:var(--green)}.rfbtn:disabled{opacity:.4;cursor:not-allowed}
  .countdown{font-size:9px;color:var(--text-muted);font-family:var(--mono)}

  /* SCORECARD */
  .sc{display:grid;grid-template-columns:repeat(5,1fr);border-bottom:1px solid var(--border);background:var(--surface)}
  .sc-cell{padding:13px 18px;border-right:1px solid var(--border)}
  .sc-cell:last-child{border-right:none}
  .sc-cell.hi{background:linear-gradient(135deg,rgba(34,197,94,.05),transparent 70%)}
  .sc-cell.wa{background:linear-gradient(135deg,rgba(245,158,11,.05),transparent 70%)}
  .sc-lbl{font-size:8px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--text-muted);margin-bottom:5px}
  .sc-val{font-size:21px;font-weight:700;font-family:var(--mono);line-height:1}
  .sc-val.g{color:var(--green)}.sc-val.a{color:var(--amber)}.sc-val.b{color:var(--blue)}.sc-val.p{color:var(--purple)}
  .sc-sub{font-size:9px;color:var(--text-muted);margin-top:3px}
  .sc-bar{height:2px;background:var(--border);border-radius:1px;margin-top:7px;overflow:hidden}
  .sc-fill{height:100%;border-radius:1px;transition:width 1s}

  /* GRID */
  .grid{flex:1;display:grid;grid-template-columns:1fr 1fr}
  .col{border-right:1px solid var(--border)}
  .col:last-child{border-right:none}
  .col-hdr{padding:11px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:var(--surface)}
  .col-title{font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;display:flex;align-items:center;gap:6px}
  .cbadge{font-size:8px;font-weight:700;padding:2px 8px;border-radius:20px}
  .cbadge-g{background:rgba(34,197,94,.15);color:var(--green);border:1px solid rgba(34,197,94,.25)}
  .cbadge-b{background:rgba(59,130,246,.15);color:var(--blue);border:1px solid rgba(59,130,246,.25)}
  .col-desc{font-size:9px;color:var(--text-muted);padding:6px 18px;border-bottom:1px solid var(--border);background:var(--surface2)}
  .cards{padding:10px;display:flex;flex-direction:column;gap:9px}

  /* ACTION CARD */
  .acard{border:1px solid var(--border);border-radius:10px;overflow:hidden;background:var(--surface2)}
  .acard.s1{border-color:rgba(34,197,94,.45);background:linear-gradient(135deg,rgba(34,197,94,.04),var(--surface2) 60%)}
  .acard.s2{border-color:rgba(34,197,94,.28)}
  .acard.s3{border-color:rgba(245,158,11,.28)}
  .ctop{padding:11px 13px 9px;display:flex;gap:10px;align-items:flex-start}
  .rk{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0}
  .rk1{background:rgba(34,197,94,.2);color:var(--green)}.rk2{background:rgba(34,197,94,.12);color:var(--green)}
  .rk3{background:rgba(245,158,11,.15);color:var(--amber)}.rk4{background:rgba(245,158,11,.1);color:var(--amber)}
  .rk5{background:rgba(148,163,184,.08);color:var(--text-dim)}
  .cq{font-size:10.5px;font-weight:500;line-height:1.5;margin-bottom:5px}
  .tags{display:flex;gap:4px;flex-wrap:wrap}
  .tag{font-size:7.5px;font-weight:600;padding:2px 5px;border-radius:3px;letter-spacing:.04em}
  .tr{background:rgba(59,130,246,.12);color:var(--blue);border:1px solid rgba(59,130,246,.2)}
  .tg{background:rgba(34,197,94,.1);color:var(--green);border:1px solid rgba(34,197,94,.2)}
  .ta{background:rgba(245,158,11,.1);color:var(--amber);border:1px solid rgba(245,158,11,.2)}
  .tn{background:rgba(148,163,184,.08);color:var(--text-muted);border:1px solid var(--border)}

  /* METRICS ROW */
  .mrow{display:grid;grid-template-columns:repeat(5,1fr);border-top:1px solid var(--border)}
  .mc{padding:7px 9px;border-right:1px solid var(--border)}
  .mc:last-child{border-right:none}
  .ml{font-size:7.5px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:3px}
  .mv{font-size:12px;font-weight:700;font-family:var(--mono)}
  .mv.g{color:var(--green)}.mv.a{color:var(--amber)}.mv.b{color:var(--blue)}.mv.p{color:var(--purple)}.mv.d{color:var(--text-dim)}
  .live-tag{font-size:6.5px;font-weight:700;background:rgba(34,197,94,.15);color:var(--green);padding:1px 4px;border-radius:2px;margin-left:3px}

  /* SCORE BREAKDOWN */
  .breakdown{padding:8px 13px;border-top:1px solid var(--border);background:rgba(0,0,0,.15)}
  .bd-title{font-size:8px;font-weight:600;color:var(--text-muted);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px}
  .bd-bars{display:flex;flex-direction:column;gap:4px}
  .bd-row{display:flex;align-items:center;gap:7px}
  .bd-lbl{font-size:8px;color:var(--text-muted);width:100px;flex-shrink:0}
  .bd-track{flex:1;height:3px;background:var(--border);border-radius:2px;overflow:hidden}
  .bd-fill{height:100%;border-radius:2px;transition:width 1s}
  .bd-val{font-size:8px;color:var(--text-dim);width:22px;text-align:right;font-family:var(--mono)}

  /* CARD FOOTER */
  .cftr{padding:8px 13px;background:rgba(0,0,0,.22);border-top:1px solid var(--border);display:flex;align-items:center;gap:10px}
  .crat{font-size:9px;color:var(--text-dim);flex:1;line-height:1.5}
  .tbtn{font-size:9px;font-weight:700;padding:5px 12px;border-radius:6px;border:none;cursor:pointer;white-space:nowrap;text-decoration:none;display:inline-block}
  .btn-go{background:var(--green);color:#000}.btn-go:hover{background:var(--green-dim)}
  .btn-wt{background:rgba(59,130,246,.15);color:var(--blue);border:1px solid rgba(59,130,246,.25)}

  /* MONITOR CARD */
  .mcard{border:1px solid var(--border);border-radius:10px;overflow:hidden;background:var(--surface2)}
  .mcard.soon{border-color:rgba(245,158,11,.38)}
  .soon-banner{background:linear-gradient(90deg,rgba(245,158,11,.14),rgba(245,158,11,.03));border-bottom:1px solid rgba(245,158,11,.2);padding:4px 13px;font-size:8px;font-weight:600;color:var(--amber);display:flex;align-items:center;gap:5px;letter-spacing:.06em}
  .sdot{width:5px;height:5px;border-radius:50%;background:var(--amber);animation:breathe 1.4s ease-in-out infinite}
  .mtop{padding:11px 13px 9px;display:flex;gap:10px}
  .mn{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;background:rgba(59,130,246,.1);color:var(--blue)}
  .mcard.soon .mn{background:rgba(245,158,11,.12);color:var(--amber)}
  .mbody{flex:1}
  .mq{font-size:10.5px;font-weight:500;line-height:1.5;margin-bottom:5px}
  .prog{margin-top:7px}
  .prog-row{display:flex;justify-content:space-between;font-size:8px;color:var(--text-muted);margin-bottom:3px}
  .prog-track{height:3px;background:var(--border);border-radius:2px;overflow:hidden}
  .prog-fill{height:100%;border-radius:2px;transition:width 1.2s}
  .fill-b{background:linear-gradient(90deg,var(--blue),#60a5fa)}
  .fill-a{background:linear-gradient(90deg,var(--amber),#fbbf24)}
  .mftr{padding:8px 13px;border-top:1px solid var(--border);background:rgba(0,0,0,.15);display:flex;align-items:center}
  .mst{font-size:8.5px;color:var(--text-muted);flex:1;line-height:1.4}
  .mprice{font-family:var(--mono);font-size:12px;font-weight:700;color:var(--blue);margin-left:10px}
  .mcard.soon .mprice{color:var(--amber)}

  /* STATES */
  .loading{padding:60px 20px;text-align:center;color:var(--text-muted)}
  .spinner{width:26px;height:26px;border:2px solid var(--border);border-top-color:var(--green);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 14px}
  @keyframes spin{to{transform:rotate(360deg)}}
  .lt{font-size:11px;letter-spacing:.1em}
  .ls{font-size:9px;margin-top:5px;opacity:.55}
  .err{padding:18px;background:rgba(239,68,68,.05);border:1px solid rgba(239,68,68,.2);border-radius:8px;margin:16px;font-size:11px;color:var(--red)}

  /* FOOTER */
  .ftr{border-top:1px solid var(--border);padding:8px 22px;background:var(--surface);display:flex;justify-content:space-between;align-items:center}
  .fl{font-size:8.5px;color:var(--text-muted)}
  .fr{font-size:8.5px;color:var(--text-muted)}
  .fr span{color:var(--amber)}
`;

/* ─────────────────────────────────────────────
   UTILITIES
   ───────────────────────────────────────────── */
const AUTO_REFRESH_SEC = 300;

function useClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const u = () => setT(new Date().toLocaleTimeString("en-US", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    u(); const id = setInterval(u, 1000); return () => clearInterval(id);
  }, []);
  return t;
}

function fmtVol(v) {
  const n = parseFloat(v); if (isNaN(n) || n === 0) return "—";
  if (n >= 1_000_000) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}
function fmtSettle(s) {
  if (!s) return "—";
  try { return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return "—"; }
}
function daysTo(s) {
  if (!s) return 999;
  try { return Math.max(0, Math.round((new Date(s) - new Date()) / 86_400_000)); }
  catch { return 999; }
}
function fmtROI(r) {
  if (!r || r <= 0) return "—";
  if (r > 99) return ">9900% ann";
  return `${Math.round(r * 100)}% ann`;
}
function fmtKelly(k) {
  if (!k || k <= 0) return "—";
  return `${(k * 100).toFixed(1)}%`;
}
function detectRegion(q) {
  const t = q.toLowerCase();
  if (t.includes("japan") || t.includes("boj") || t.includes("yen")) return "JP";
  if (t.includes("europe") || t.includes("ecb") || t.includes("eu ") || t.includes("eurozone")) return "EU";
  if (t.includes("korea")) return "KR";
  if (t.includes("australia") || t.includes("rba")) return "AU";
  if (t.includes("singapore") || t.includes("mas ")) return "SG";
  if (t.includes("china") || t.includes("pboc") || t.includes("yuan")) return "CN";
  if (t.includes("taiwan")) return "TW";
  if (t.includes("uk ") || t.includes("britain") || t.includes("boe") || t.includes("pound")) return "UK";
  if (t.includes("canada") || t.includes("boc ")) return "CA";
  if (t.includes("india") || t.includes("rbi ")) return "IN";
  if (t.includes("opec") || t.includes("saudi")) return "OPEC";
  if (t.includes("fed ") || t.includes("federal reserve") || t.includes("trump") || t.includes("us ") || t.includes("u.s.")) return "US";
  return "GLOBAL";
}
function rationale(tier, price, days, kelly) {
  const p = Math.round(price * 100);
  const k = fmtKelly(kelly);
  if (tier === "STRONG") return `High-conviction setup. ${p}¢ YES with ${days}d to settle. Suggested Kelly: ${k}. Strong edge across multiple factors.`;
  if (tier === "TRADE") return `Solid opportunity at ${p}¢. Capital-efficient given ${days}d window. Kelly suggests ${k} position.`;
  if (tier === "WATCH") return `Borderline. ${p}¢, ${days}d left. Confirm signal before committing capital.`;
  return `Low edge. Watch only — no position recommended.`;
}

const KEYWORDS = ["japan", "boj", "ecb", "europe", "korea", "australia", "rba", "singapore",
  "china", "pboc", "yuan", "taiwan", "uk", "britain", "boe", "pound", "canada", "boc",
  "india", "rbi", "opec", "saudi", "fed", "federal reserve", "trump", "tariff", "rate",
  "inflation", "gdp", "recession", "election", "bitcoin", "crypto", "oil", "gold"];

async function fetchMarkets() {
  const res = await fetch("/api/markets?active=true&closed=false&limit=100&order=volume&ascending=false");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const raw = Array.isArray(data) ? data : (data.markets || []);

  return raw
    .filter(m => {
      const q = (m.question || m.title || "").toLowerCase();
      return KEYWORDS.some(kw => q.includes(kw));
    })
    .map(m => {
      const question = m.question || m.title || "Unknown";
      let price = 0.5;
      if (m.bestAsk) price = parseFloat(m.bestAsk);
      else if (m.lastTradePrice) price = parseFloat(m.lastTradePrice);
      else if (m.outcomePrices) {
        try { price = parseFloat(JSON.parse(m.outcomePrices)[0]); } catch { }
      }
      price = Math.max(0.01, Math.min(0.99, price));

      const vol = parseFloat(m.volume || 0);
      const vol24 = parseFloat(m.volume24hr || m.volume24h || 0);
      const days = daysTo(m.endDate);
      const region = detectRegion(question);
      const s = scoreMarket(price, vol, days, vol24);

      return { id: m.id, question, price, vol, vol24, days, region, endDate: m.endDate, slug: m.slug, ...s };
    })
    .filter(m => m.tier !== "PASS")
    .sort((a, b) => b.total - a.total);
}

/* ─────────────────────────────────────────────
   SCORECARD
   ───────────────────────────────────────────── */
function Scorecard({ actions, monitors }) {
  const soon = monitors.filter(m => m.soon).length;
  const topScore = actions[0]?.total ?? 0;
  const totalVol = fmtVol(actions.reduce((s, a) => s + (a.vol || 0), 0));
  const cells = [
    { lbl: "Action Ready", val: actions.length, cls: "g", sub: "ranked markets", fill: (actions.length / 5) * 100, hi: true },
    { lbl: "Possible Soon", val: soon, cls: "a", sub: "monitors alerted", fill: (soon / 5) * 100, wa: true },
    { lbl: "Top Score", val: topScore, cls: "g", sub: "edge engine pts", fill: Math.min(100, topScore) },
    { lbl: "Monitoring", val: monitors.length, cls: "b", sub: "watching", fill: 100 },
    { lbl: "Signal Vol", val: totalVol, cls: "p", sub: "action liquidity", fill: 68 },
  ];
  return (
    <div className="sc">
      {cells.map(c => (
        <div key={c.lbl} className={`sc-cell${c.hi ? " hi" : c.wa ? " wa" : ""}`}>
          <div className="sc-lbl">{c.lbl}</div>
          <div className={`sc-val ${c.cls}`}>{c.val}</div>
          <div className="sc-sub">{c.sub}</div>
          <div className="sc-bar">
            <div className="sc-fill" style={{ width: `${c.fill}%`, background: c.cls === "g" ? "var(--green)" : c.cls === "a" ? "var(--amber)" : c.cls === "b" ? "var(--blue)" : "var(--purple)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ACTION CARD
   ───────────────────────────────────────────── */
function ActionCard({ item, rank }) {
  const shade = rank === 1 ? "s1" : rank === 2 ? "s2" : rank === 3 ? "s3" : "";
  const rkCls = `rk${rank}`;
  const pct = Math.round(item.price * 100);
  const implied = Math.min(97, Math.round(item.price * 100 + item.total * 0.38));
  const tagCls = item.tier === "STRONG" ? "tg" : item.tier === "TRADE" ? "tg" : "ta";
  const isAct = item.tier === "STRONG" || item.tier === "TRADE";

  const factors = [
    { lbl: "Asymmetric upside", val: item.F1, max: 30, color: "var(--green)" },
    { lbl: "Liquidity", val: item.F2, max: 25, color: "var(--blue)" },
    { lbl: "Capital efficiency", val: item.F3, max: 25, color: "var(--purple)" },
    { lbl: "Recent activity", val: item.F4, max: 10, color: "var(--amber)" },
    { lbl: "Time urgency", val: item.F5, max: 10, color: "var(--amber)" },
  ];

  return (
    <div className={`acard ${shade}`}>
      <div className="ctop">
        <div className={`rk ${rkCls}`}>{rank}</div>
        <div style={{ flex: 1 }}>
          <div className="cq">{item.question.length > 92 ? item.question.slice(0, 92) + "…" : item.question}</div>
          <div className="tags">
            <span className="tag tr">{item.region}</span>
            <span className={`tag ${tagCls}`}>{item.tier}</span>
            <span className="tag tn">{fmtSettle(item.endDate)}</span>
            <span className="tag tn">{item.days}d left</span>
          </div>
        </div>
      </div>

      <div className="mrow">
        <div className="mc">
          <div className="ml">Live Price</div>
          <div className={`mv ${pct < 40 ? "g" : "d"}`}>{pct}¢ <span className="live-tag">LIVE</span></div>
        </div>
        <div className="mc">
          <div className="ml">Implied</div>
          <div className="mv a">{implied}¢</div>
        </div>
        <div className="mc">
          <div className="ml">Score</div>
          <div className="mv g">{item.total}/100</div>
        </div>
        <div className="mc">
          <div className="ml">Kelly %</div>
          <div className="mv p">{fmtKelly(item.kelly)}</div>
        </div>
        <div className="mc">
          <div className="ml">Ann. ROI</div>
          <div className="mv b" style={{ fontSize: 10 }}>{fmtROI(item.annReturn)}</div>
        </div>
      </div>

      <div className="breakdown">
        <div className="bd-title">Score Breakdown — {item.total} pts</div>
        <div className="bd-bars">
          {factors.map(f => (
            <div className="bd-row" key={f.lbl}>
              <div className="bd-lbl">{f.lbl}</div>
              <div className="bd-track">
                <div className="bd-fill" style={{ width: `${(f.val / f.max) * 100}%`, background: f.color }} />
              </div>
              <div className="bd-val">{f.val}/{f.max}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="cftr">
        <div className="crat">{rationale(item.tier, item.price, item.days, item.kelly)}</div>
        <a href={`https://polymarket.com/event/${item.slug || item.id}`} target="_blank" rel="noopener noreferrer">
          <button className={`tbtn ${isAct ? "btn-go" : "btn-wt"}`}>{isAct ? "Trade ↗" : "Watch ↗"}</button>
        </a>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MONITOR CARD
   ───────────────────────────────────────────── */
function MonitorCard({ item, num }) {
  const pct = Math.round(item.price * 100);
  const conf = Math.min(95, Math.round(item.total * 0.7));
  const timeScore = Math.min(95, Math.max(5, 100 - item.days * 0.6));

  return (
    <div className={`mcard${item.soon ? " soon" : ""}`}>
      {item.soon && (
        <div className="soon-banner"><div className="sdot" />Possible Action Coming Soon</div>
      )}
      <div className="mtop">
        <div className="mn">{num}</div>
        <div className="mbody">
          <div className="mq">{item.question.length > 90 ? item.question.slice(0, 90) + "…" : item.question}</div>
          <div className="tags" style={{ marginBottom: 7 }}>
            <span className="tag tr">{item.region}</span>
            <span className="tag tn">{fmtSettle(item.endDate)}</span>
            <span className="tag tn">{item.days}d left</span>
            <span className="tag tn">Score {item.total}</span>
          </div>
          <div className="prog">
            <div className="prog-row"><span>Signal score</span><span>{conf}%</span></div>
            <div className="prog-track">
              <div className={`prog-fill ${item.soon ? "fill-a" : "fill-b"}`} style={{ width: `${conf}%` }} />
            </div>
          </div>
          <div className="prog" style={{ marginTop: 5 }}>
            <div className="prog-row"><span>Time pressure</span><span>{Math.round(timeScore)}%</span></div>
            <div className="prog-track">
              <div className={`prog-fill ${item.soon ? "fill-a" : "fill-b"}`} style={{ width: `${timeScore}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className="mftr">
        <div className="mst">
          {item.soon
            ? `Approaching action threshold — settle in ${item.days}d. Ann. ROI ${fmtROI(item.annReturn)}.`
            : `Monitoring — score ${item.total} pts. No action threshold yet.`}
        </div>
        <div className="mprice">{pct}¢ <span className="live-tag" style={{ fontSize: 6.5 }}>LIVE</span></div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   APP
   ───────────────────────────────────────────── */
export default function App() {
  const clock = useClock();
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLast] = useState(null);
  const [cdSec, setCdSec] = useState(AUTO_REFRESH_SEC);
  const timerRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null); setCdSec(AUTO_REFRESH_SEC);
    try {
      const mkts = await fetchMarkets();
      setAll(mkts);
      setLast(new Date().toLocaleTimeString("en-US", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" }));
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    timerRef.current = setInterval(() => {
      setCdSec(s => {
        if (s <= 1) { load(); return AUTO_REFRESH_SEC; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [load]);

  const actions = all.slice(0, 5);
  const monitors = all.slice(5, 10).map(m => ({ ...m, soon: m.days < 50 || m.total > 32 }));
  const soon = monitors.filter(m => m.soon).length;

  return (
    <>
      <style>{STYLE}</style>
      <div className="app">
        <div className="hdr">
          <div className="logo">
            <div className="logo-dot" />
            <div className="logo-text">OpenClaw <span>/ Edge Engine</span></div>
          </div>
          <div className="hdr-right">
            <div className="pill g"><span>●</span><span className="v">{actions.length}</span> action ready</div>
            <div className="pill a"><span>◐</span><span className="v">{soon}</span> possible soon</div>
            <div className="utc">{clock} UTC</div>
            <div className="countdown">↻ {Math.floor(cdSec / 60)}:{String(cdSec % 60).padStart(2, "0")}</div>
            <button className="rfbtn" onClick={load} disabled={loading}>{loading ? "…" : "⟳ Now"}</button>
          </div>
        </div>

        <Scorecard actions={actions} monitors={monitors} />

        {loading ? (
          <div className="loading">
            <div className="spinner" />
            <div className="lt">FETCHING LIVE POLYMARKET DATA</div>
            <div className="ls">gamma-api.polymarket.com · applying edge engine</div>
          </div>
        ) : error ? (
          <div className="err">⚠ {error}</div>
        ) : (
          <div className="grid">
            <div className="col">
              <div className="col-hdr">
                <div className="col-title">⚡ Recommended Actions</div>
                <span className="cbadge cbadge-g">5-Factor · Live</span>
              </div>
              <div className="col-desc">
                Scored by: Asymmetric upside · Liquidity · Capital efficiency · Recent activity · Time urgency
              </div>
              <div className="cards">
                {actions.map((a, i) => <ActionCard key={a.id} item={a} rank={i + 1} />)}
                {!actions.length && <div style={{ padding: 20, color: "var(--text-muted)", fontSize: 11 }}>No actionable markets found. Refresh to try again.</div>}
              </div>
            </div>
            <div className="col">
              <div className="col-hdr">
                <div className="col-title">👁 Monitoring</div>
                <span className="cbadge cbadge-b">Watching</span>
              </div>
              <div className="col-desc">
                Below action threshold. Amber = approaching signal within settlement window.
              </div>
              <div className="cards">
                {monitors.map((m, i) => <MonitorCard key={m.id} item={m} num={i + 1} />)}
                {!monitors.length && <div style={{ padding: 20, color: "var(--text-muted)", fontSize: 11 }}>No markets in monitoring queue.</div>}
              </div>
            </div>
          </div>
        )}

        <div className="ftr">
          <div className="fl">
            Live · gamma-api.polymarket.com · {lastFetch ? `fetched ${lastFetch} UTC` : "loading…"}
          </div>
          <div className="fr"><span>⚠</span> Heuristic scores only — not financial advice. Verify before trading.</div>
        </div>
      </div>
    </>
  );
}
