"""Market context charts, competitive assessment, pilot statistics and economics."""
import numpy as np, pandas as pd
import matplotlib.pyplot as plt
from scipy.stats import norm
from common import *

# ---------- Wealth transfer -------------------------------------------------------
fig, axs = plt.subplots(1, 2, figsize=(7.2, 2.9), gridspec_kw={"width_ratios": [1.1, 1]})
ax = axs[0]
ax.bar(["UBS (global,\n20 to 25 years)", "Cerulli (US,\nthrough 2048)"], [74, 105], color=BLUE, width=0.55, label="To heirs (vertical)")
ax.bar(["UBS (global,\n20 to 25 years)", "Cerulli (US,\nthrough 2048)"], [9, 18], bottom=[74, 105], color=SEQ[1], width=0.55, label="Spouses (UBS) / charity (Cerulli)")
for xv, tot in enumerate([83, 124]):
    ax.text(xv, tot + 3, f"USD {tot}tn", ha="center", fontsize=8, color=INK)
ax.set_ylim(0, 145); ax.set_ylabel("USD trillion"); ax.legend(loc="upper left", fontsize=7)
ax.set_title("Wealth set to change hands"); ax.grid(axis="x", visible=False)
ax = axs[1]
yrs = [2025, 2030, 2035, 2040]; share = [0, 30, 63, 84]
ax.plot(yrs, share, color=BLUE, marker="o", markersize=5)
for x, y in zip(yrs[1:], share[1:]):
    ax.text(x, y + 5, f"{y}%", ha="center", fontsize=8, color=INK)
ax.set_ylim(0, 100); ax.set_xticks(yrs); ax.set_ylabel("% of next gen HNWIs having inherited")
ax.set_title("Inheritance timing, next gen HNWIs")
source_note(fig, "UBS Global Wealth Report 2025; Cerulli Associates, US High Net Worth and Ultra High Net Worth Markets 2024; Capgemini World Wealth Report 2025.")
fig.tight_layout(); save(fig, "fig_wealth_transfer")

# ---------- Generation gap ------------------------------------------------------
gap = pd.DataFrame([
    ("Portfolio allocated to alternatives\n(BofA Private Bank, US, 2024)", 17, 5, "Age 21 to 43", "Age 44+"),
    ("Doubt above average returns possible\nfrom stocks and bonds alone (BofA, 2024)", 72, 28, "Age 21 to 43", "Age 44+"),
    ("Would let an AI assistant manage\ntheir investments (WEF, 2025)", 41, 14, "Gen Z and Millennials", "Baby Boomers"),
    ("Use ChatGPT for investing\n(UK Investor Index, 2025)", 70, 33, "Age 18 to 34", "All investors"),
], columns=["metric", "young", "older", "young_label", "older_label"])
gap.to_csv(DATA / "generation_gap.csv", index=False)
fig, ax = plt.subplots(figsize=(7.2, 3.4))
y = np.arange(len(gap))
ax.barh(y - 0.18, gap.young, height=0.34, color=BLUE, label="Younger cohort")
ax.barh(y + 0.18, gap.older, height=0.34, color=MUTED, label="Older cohort or all investors")
for i, rw in gap.iterrows():
    ax.text(rw.young + 1, i - 0.18, f"{rw.young}%  {rw.young_label}", va="center", fontsize=7, color=INK2)
    ax.text(rw.older + 1, i + 0.18, f"{rw.older}%  {rw.older_label}", va="center", fontsize=7, color=INK2)
ax.set_yticks(y); ax.set_yticklabels(gap.metric, fontsize=7.5); ax.invert_yaxis()
ax.set_xlim(0, 110); ax.set_xlabel("% of respondents (allocation: % of portfolio)")
ax.grid(axis="y", visible=False); ax.legend(loc="lower right")
ax.set_title("The next generation wants alternatives and already trusts AI")
source_note(fig, "Bank of America Private Bank Study of Wealthy Americans 2024; World Economic Forum Global Retail Investor Outlook (Mar 2025); UK Investor Index 2025 (NationalWorld).")
save(fig, "fig_generation_gap")

# ---------- Democratisation of alternatives --------------------------------------
fig, axs = plt.subplots(1, 2, figsize=(7.2, 2.8))
ax = axs[0]
ax.bar(["2022", "2025", "2030e"], [267, 534, 1000], color=[BLUE, BLUE, SEQ[1]], width=0.55)
for xv, v, t in zip(range(3), [267, 534, 1000], ["267", "534", "~1,000"]):
    ax.text(xv, v + 25, f"USD {t}bn", ha="center", fontsize=8)
ax.set_ylim(0, 1150); ax.set_title("Evergreen private market funds, AUM"); ax.grid(axis="x", visible=False)
ax = axs[1]
ax.bar(["Alternatives AUM of\nprivate wealth, today", "Bain forecast\n2034"], [4, 12], color=[BLUE, SEQ[1]], width=0.5)
for xv, v in enumerate([4, 12]):
    ax.text(xv, v + 0.3, f"USD {v}tn", ha="center", fontsize=8)
ax.set_ylim(0, 14); ax.set_title("Private wealth in alternatives"); ax.grid(axis="x", visible=False)
source_note(fig, "PitchBook and Morningstar evergreen fund data (2022, 2025; 2030 path to USD 1tn per Morningstar/PitchBook Q4 2025); Bain & Company via Capgemini.")
fig.tight_layout(); save(fig, "fig_democratisation")

# ---------- Swiss scale ------------------------------------------------------------
sw = pd.DataFrame([("Pictet (AuM/AuC)", 757), ("Julius Baer (AuM)", 521), ("Lombard Odier (client assets)", 349), ("Lombard Odier (AuM)", 223)],
                  columns=["bank", "chf_bn"])
sw.to_csv(DATA / "swiss_peers_2025.csv", index=False)
fig, ax = plt.subplots(figsize=(6.4, 2.3))
ax.barh(sw.bank, sw.chf_bn, color=[MUTED, MUTED, BLUE, SEQ[2]], height=0.55)
for i, v in enumerate(sw.chf_bn):
    ax.text(v + 8, i, f"CHF {v}bn", va="center", fontsize=8, color=INK2)
ax.invert_yaxis(); ax.set_xlim(0, 900); ax.grid(axis="y", visible=False)
ax.set_xlabel("CHF billion, 31 December 2025 (UBS invested assets of about USD 7tn not shown)")
ax.set_title("Lombard Odier competes against far larger balance sheets")
source_note(fig, "Pictet, Julius Baer, Lombard Odier full year 2025 releases; UBS Form 20-F 2025.")
save(fig, "fig_swiss_scale")

# ---------- Competitive assessment heatmap ---------------------------------------
crit = ["Proprietary\nalternatives shelf", "Low minimums,\nsemi liquid access", "Digital and AI\nclient experience",
        "Allocation and\nliquidity planning", "Human trust and\nfamily continuity", "Next gen\nproposition"]
players = {
    "Lombard Odier":            [4, 2, 4, 4, 5, 3],
    "UBS":                      [4, 4, 4, 4, 4, 5],
    "Pictet":                   [4, 2, 3, 4, 5, 3],
    "Julius Baer":              [3, 3, 3, 4, 4, 3],
    "J.P. Morgan Private Bank": [5, 4, 4, 4, 4, 4],
    "Goldman Sachs PWM":        [5, 4, 3, 4, 4, 3],
    "iCapital / CAIS":          [3, 4, 4, 1, 1, 2],
    "Moonfare / Titanbay":      [2, 4, 4, 1, 1, 3],
    "Robinhood and AI brokers": [1, 3, 5, 2, 1, 4],
    "General purpose AI":       [0, 0, 5, 2, 1, 4],
}
m = pd.DataFrame(players, index=[c.replace("\n", " ") for c in crit]).T
m.to_csv(DATA / "competitive_assessment.csv")
fig, ax = plt.subplots(figsize=(7.2, 4.4))
cmap = matplotlib.colors.LinearSegmentedColormap.from_list("s", ["#f4f3f0"] + SEQ)
ax.imshow(m.values, cmap=cmap, vmin=0, vmax=5, aspect="auto")
ax.set_xticks(range(len(crit))); ax.set_xticklabels(crit, fontsize=7)
ax.xaxis.tick_top(); ax.set_yticks(range(len(m))); ax.set_yticklabels(m.index, fontsize=8)
ax.grid(False); ax.tick_params(length=0)
for i in range(m.shape[0]):
    for j in range(m.shape[1]):
        v = m.values[i, j]
        ax.text(j, i, "n/a" if v == 0 else str(v), ha="center", va="center", fontsize=8, color="white" if v >= 4 else INK)
for s in ax.spines.values(): s.set_visible(False)
ax.add_patch(plt.Rectangle((-0.5, -0.5), len(crit), 1, fill=False, edgecolor=ORANGE, linewidth=2))
source_note(fig, "Indicative team assessment, scale 1 (weak) to 5 (leading), based on the public sources cited in Section 3; to be validated with mystery shopping in Month 1.")
save(fig, "fig_competitive_heatmap")

# ---------- Pilot statistics: minimum detectable effect ----------------------------
def mde(n, p0=0.20, alpha=0.10, power=0.80):
    z = norm.ppf(1 - alpha / 2) + norm.ppf(power)
    # solve p1 numerically
    for p1 in np.linspace(p0 + 0.001, 0.99, 2000):
        se = np.sqrt(p0 * (1 - p0) / n + p1 * (1 - p1) / n)
        if (p1 - p0) / se >= z:
            return p1 - p0
    return np.nan
ns = np.arange(20, 301, 10)
md = [mde(n) for n in ns]
d_cont = [(norm.ppf(0.95) + norm.ppf(0.8)) * np.sqrt(2 / n) for n in ns]  # Cohen d for a continuous KPI
pd.DataFrame({"n_per_arm": ns, "mde_conversion_pp": md, "mde_cohen_d": d_cont}).to_csv(DATA / "pilot_power.csv", index=False, float_format="%.4f")
fig, ax = plt.subplots(figsize=(7, 2.9))
ax.plot(ns, np.array(md) * 100, color=BLUE, label="Conversion rate uplift detectable (pp, base 20%)")
ax.plot(ns, np.array(d_cont) * 100, color=ORANGE, label="Share of wallet effect detectable (Cohen d x 100)")
ax.axvspan(30, 50, color=YELLOW, alpha=0.18); ax.text(40, 62, "Pilot\nsize", ha="center", fontsize=7.5, color=INK2)
ax.set_xlabel("Participants per arm"); ax.set_ylabel("Minimum detectable effect")
ax.set_ylim(0, 75); ax.legend(loc="upper right")
ax.set_title("A 30 to 50 person pilot can detect large effects only, so it is designed as a signal test")
source_note(fig, "Two sided test, alpha 10%, power 80%; team analysis.")
save(fig, "fig_pilot_power")
print("MDE at n=40:", round(mde(40), 3), " d:", round((norm.ppf(0.95) + norm.ppf(0.8)) * np.sqrt(2 / 40), 2))

# ---------- Economics at scale (illustrative, assumptions to replace with LO data) ---
A = dict(prospects_per_year=400, avg_investable_chf_m=6.0, base_conv=0.15, base_sow=0.35,
         alt_share_base=0.10, roa_core=0.0075, roa_alts=0.0120)
scen = {"Conservative": dict(conv=0.17, sow=0.40, alt=0.15), "Base": dict(conv=0.20, sow=0.45, alt=0.20),
        "Ambitious": dict(conv=0.25, sow=0.55, alt=0.25)}
rows = []
for name, s in scen.items():
    aum_inc = 0; rev = []
    for y in range(1, 6):
        new_base = A["prospects_per_year"] * A["base_conv"] * A["avg_investable_chf_m"] * A["base_sow"]
        new_scn = A["prospects_per_year"] * s["conv"] * A["avg_investable_chf_m"] * s["sow"]
        aum_inc += new_scn - new_base
        roa_b = (1 - A["alt_share_base"]) * A["roa_core"] + A["alt_share_base"] * A["roa_alts"]
        roa_s = (1 - s["alt"]) * A["roa_core"] + s["alt"] * A["roa_alts"]
        r_inc = aum_inc * roa_s + (A["prospects_per_year"] * A["base_conv"] * A["avg_investable_chf_m"] * A["base_sow"] * y) * (roa_s - roa_b)
        rows.append({"scenario": name, "year": y, "incremental_aum_chf_m": aum_inc, "incremental_revenue_chf_m": r_inc})
econ = pd.DataFrame(rows); econ.to_csv(DATA / "scale_economics.csv", index=False, float_format="%.2f")
pd.Series(A).to_csv(DATA / "scale_economics_assumptions.csv", header=["value"])
fig, axs = plt.subplots(1, 2, figsize=(7.2, 2.8))
for (name, g), c in zip(econ.groupby("scenario", sort=False), [SEQ[1], BLUE, NAVY]):
    axs[0].plot(g.year, g.incremental_aum_chf_m / 1000, color=c, marker="o", markersize=4, label=name)
    axs[1].plot(g.year, g.incremental_revenue_chf_m, color=c, marker="o", markersize=4, label=name)
axs[0].set_title("Incremental AuM, CHF bn"); axs[1].set_title("Incremental annual revenue, CHF m")
axs[0].set_xlabel("Year after roll out"); axs[1].set_xlabel("Year after roll out"); axs[0].legend(loc="upper left")
source_note(fig, "Illustrative model; all inputs are placeholder assumptions listed in Section 8 and data/scale_economics_assumptions.csv, to be replaced with Lombard Odier internal data.")
fig.tight_layout(); save(fig, "fig_scale_economics")
print(econ[econ.year == 5].round(1))

# ---------- Twelve week plan (Gantt) -----------------------------------------------
tasks = [
    ("WS1 Client: interviews and AI usage diary", 1, 5, BLUE), ("WS1 Client: segment and personas", 4, 7, BLUE),
    ("WS2 Proof: data, backtests, methodology", 1, 6, AQUA), ("WS2 Proof: comparison tool prototype", 5, 9, AQUA),
    ("WS3 Pitch: narrative and session script", 4, 8, ORANGE), ("WS3 Pitch: banker training and dry runs", 8, 9, ORANGE),
    ("WS4 Channel: AI answer audit (baseline)", 1, 4, VIOLET), ("WS4 Channel: content and visibility plan", 5, 10, VIOLET),
    ("Pilot sessions with clients (test and control)", 9, 12, NAVY), ("Synthesis and partner pack", 11, 12, INK2),
]
fig, ax = plt.subplots(figsize=(7.2, 3.6))
for i, (t, a, b, c) in enumerate(tasks):
    ax.barh(i, b - a + 1, left=a - 0.5, color=c, height=0.55)
ax.set_yticks(range(len(tasks))); ax.set_yticklabels([t[0] for t in tasks], fontsize=7.5); ax.invert_yaxis()
ax.set_xticks(range(1, 13)); ax.set_xlim(0.5, 12.5); ax.set_xlabel("Week")
for w, lab in [(4, "Checkpoint 1\nDiagnostic"), (8, "Checkpoint 2\nDesign freeze"), (12, "Partner\ndecision")]:
    ax.axvline(w + 0.5, color=RED, linewidth=1, linestyle="--")
    ax.text(w + 0.4, -1.1, lab, ha="right", fontsize=7, color=RED)
ax.grid(axis="y", visible=False); ax.set_ylim(len(tasks) - 0.5, -1.6)
ax.set_title("Twelve week plan for the ten associates", pad=18)
save(fig, "fig_gantt")
