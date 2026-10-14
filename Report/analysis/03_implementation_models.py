"""Models of what an AI can recommend but not implement.

1. Private equity commitment pacing (Takahashi and Alexander, Yale, 2002) to reach and hold a
   10% target allocation: capital calls, distributions, NAV and the uncommitted cash drag.
2. Capital protected note: payoff and bootstrapped 3 year outcome distribution vs direct equity.
3. Stress year comparison (2022) mixing computed proxies and published index returns.
4. Manager dispersion (J.P. Morgan Asset Management, Nov 2025).
"""
import numpy as np, pandas as pd
import matplotlib.pyplot as plt
from math import log, sqrt, exp
from scipy.stats import norm
from common import *

# 1. Takahashi Alexander pacing ------------------------------------------------
def ta_fund(commit=1.0, life=12, invest_years=5, rc=(0.25, 0.333, 0.5, 0.5, 1.0), bow=2.5, g=0.11, yld=0.0):
    nav, unfunded, paid = 0.0, commit, 0.0
    calls, dists, navs = [], [], []
    for t in range(1, life + 1):
        c = unfunded * (rc[t - 1] if t <= len(rc) else 0)
        rd = max(yld, (t / life) ** bow)
        d = rd * nav * (1 + g)
        nav = nav * (1 + g) + c - d
        unfunded -= c
        calls.append(c); dists.append(d); navs.append(nav)
    return np.array(calls), np.array(dists), np.array(navs)

years = 15
portfolio = 10_000_000.0  # CHF 10m liquid portfolio of a next gen client
target = 0.10
port_growth = 0.05
calls_tot = np.zeros(years + 12); dist_tot = np.zeros(years + 12); nav_tot = np.zeros(years + 12)
commit_plan = [0.045, 0.035, 0.03, 0.025, 0.02] + [0.02] * (years - 5)  # share of portfolio committed per year
rows = []
pv = portfolio
for y in range(years):
    commit = commit_plan[y] * pv
    c, d, n = ta_fund(commit)
    calls_tot[y:y + 12] += c; dist_tot[y:y + 12] += d; nav_tot[y:y + 12] += n
    total = pv
    rows.append({"year": y + 1, "commitment": commit, "calls": calls_tot[y], "distributions": dist_tot[y],
                 "pe_nav": nav_tot[y], "pe_weight": nav_tot[y] / total})
    pv *= 1 + port_growth
pace = pd.DataFrame(rows)
pace.to_csv(DATA / "pe_commitment_pacing.csv", index=False, float_format="%.4f")
naive = pd.DataFrame({"year": range(1, years + 1)})
c, d, n = ta_fund(target * portfolio)
w_naive = np.concatenate([n, np.zeros(3)])[:years] / (portfolio * (1 + port_growth) ** np.arange(years))
fig, ax = plt.subplots(figsize=(7, 3.2))
ax.plot(pace.year, pace.pe_weight * 100, color=BLUE, marker="o", markersize=4, label="Paced programme (vintage diversified)")
ax.plot(naive.year, w_naive * 100, color=ORANGE, marker="o", markersize=4, label="Single commitment of 10% in year 1")
ax.axhline(10, color=INK2, linewidth=0.8, linestyle="--"); ax.text(15.2, 10, "Target 10%", va="center", fontsize=7.5, color=INK2)
ax.set_xlabel("Year"); ax.set_ylabel("Private equity NAV, % of portfolio")
ax.set_title("Reaching a 10% private equity allocation takes a multi year commitment plan")
ax.legend(loc="upper right"); ax.set_xlim(0.5, 16.5)
source_note(fig, "Takahashi and Alexander (2002) cash flow model; illustrative parameters (5 year investment period, 12 year life, 11% gross growth); team analysis.")
save(fig, "fig_pe_pacing")
print(pace.round(3).iloc[[0, 2, 4, 7, 10, 14]])
print("naive weight path", np.round(w_naive * 100, 1))

# 2. Capital protected note ---------------------------------------------------
# 3 year, 100% capital protection, uncapped participation. Zero coupon at r, ATM call priced Black Scholes.
r, sig, T = 0.03, 0.17, 3.0
zc = exp(-r * T)
d1 = (log(1) + (r + sig ** 2 / 2) * T) / (sig * sqrt(T)); d2 = d1 - sig * sqrt(T)
call = norm.cdf(d1) - exp(-r * T) * norm.cdf(d2)
fee = 0.01
participation = (1 - zc - fee) / call
print(f"zero coupon {zc:.3f}, ATM call {call:.3f}, participation {participation:.2f}")
px = pd.read_csv(DATA / "etf_monthly_prices.csv", index_col=0, parse_dates=True)
eq = px["ACWI"].pct_change().dropna().values
rng = np.random.default_rng(11)
N = 20000
# Monthly returns demeaned and re-centred on a forward looking 6% p.a. drift (avoids the 2009-2026 bull market bias)
eq_c = eq - eq.mean() + 0.06 / 12
draws = rng.integers(0, len(eq_c), (N, 36))
eq3 = np.prod(1 + eq_c[draws], axis=1) - 1
note = participation * np.maximum(eq3, 0)
fig, axs = plt.subplots(1, 2, figsize=(7.2, 3.0), gridspec_kw={"width_ratios": [1, 1.25]})
x = np.linspace(-0.5, 0.8, 100)
axs[0].plot(x * 100, x * 100, color=MUTED, label="Direct equity")
axs[0].plot(x * 100, participation * np.maximum(x, 0) * 100, color=BLUE, label=f"Protected note ({participation:.0%} part.)")
axs[0].set_xlabel("Equity index return over 3 years, %"); axs[0].set_ylabel("Investor return, %")
axs[0].set_title("Payoff at maturity"); axs[0].legend(loc="upper left")
bins = np.linspace(-0.6, 1.2, 46)
axs[1].hist(eq3 * 100, bins=bins * 100, color=MUTED, alpha=0.55, label="Direct equity")
axs[1].hist(note * 100, bins=bins * 100, color=BLUE, alpha=0.7, label="Protected note")
axs[1].set_xlabel("3 year return, %"); axs[1].set_ylabel("Simulated paths")
axs[1].set_title("Distribution of outcomes"); axs[1].legend(loc="upper right")
source_note(fig, "Black Scholes pricing (r 3%, vol 17%, fee 1%); 20,000 bootstrapped 36 month paths of ACWI monthly returns 2009 to 2026, re-centred on 6% p.a.; team analysis.")
fig.tight_layout()
save(fig, "fig_structured_note")
sp = pd.DataFrame({"metric": ["participation", "P(loss) equity", "P(loss) note", "median equity", "median note", "5th pct equity", "5th pct note", "mean equity", "mean note"],
                   "value": [participation, (eq3 < 0).mean(), (note < 0).mean(), np.median(eq3), np.median(note),
                             np.percentile(eq3, 5), np.percentile(note, 5), eq3.mean(), note.mean()]})
sp.to_csv(DATA / "structured_note_sim.csv", index=False, float_format="%.4f")
print(sp.round(3))

# 3. 2022 stress year ------------------------------------------------------------
yr = pd.read_csv(DATA / "calendar_year_returns.csv", index_col=0)
y22 = yr.loc[2022]
items = [
    ("Listed private equity ETF (PSP)", y22["Listed private equity"], ORANGE),
    ("Global equities (ACWI)", y22["Global equities"], MUTED),
    ("AI default 60/40 (computed)", y22["AI default 60/40"], MUTED),
    ("IG bonds (AGG)", y22["IG bonds"], MUTED),
    ("Hedge fund replication ETF (QAI)", y22["Hedge fund replication"], ORANGE),
    ("HFRI Fund Weighted Composite", -0.042, BLUE),
    ("Gold (GLD)", y22["Gold"], MUTED),
    ("HFRI 500 Macro Index", 0.142, BLUE),
]
fig, ax = plt.subplots(figsize=(7, 3.3))
labels = [i[0] for i in items]; vals = [i[1] * 100 for i in items]; cols = [i[2] for i in items]
ax.barh(labels, vals, color=cols, height=0.6)
for yv, v in enumerate(vals):
    ax.text(v + (0.8 if v >= 0 else -0.8), yv, f"{v:+.1f}%", va="center", ha="left" if v >= 0 else "right", fontsize=7.5, color=INK2)
ax.axvline(0, color=INK2, linewidth=0.8); ax.invert_yaxis(); ax.set_xlim(-45, 22)
ax.set_xlabel("Total return in calendar year 2022, %"); ax.grid(axis="y", visible=False)
ax.set_title("2022: liquid 'alternative' wrappers fell with markets; selected hedge fund strategies did not")
source_note(fig, "Yahoo Finance (ETFs, computed); HFR via WealthBriefing, Jan 2023 (HFRI indices). Blue: institutional manager indices; orange: liquid wrappers an AI typically suggests.")
save(fig, "fig_2022_stress")

# 4. Manager dispersion --------------------------------------------------------
fig, ax = plt.subplots(figsize=(6.2, 2.2))
ax.barh(["Public equity managers", "Private equity managers"], [2.0, 19.6], color=[MUTED, BLUE], height=0.5)
for yv, v in enumerate([2.0, 19.6]):
    ax.text(v + 0.3, yv, f"{v:.1f} pp", va="center", fontsize=8, color=INK2)
ax.set_xlabel("Return gap between top and bottom decile managers, percentage points")
ax.grid(axis="y", visible=False); ax.set_xlim(0, 23)
ax.set_title("Selection matters ten times more in private equity than in public equity")
source_note(fig, "J.P. Morgan Asset Management, 'Considerations and questions for new alternatives investors', 2026 LTCMA, Nov 2025.")
save(fig, "fig_dispersion")
