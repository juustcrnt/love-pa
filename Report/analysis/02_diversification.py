"""Quantitative case: a liquid 'AI default' 60/40 vs a diversified allocation with alternatives.

Outputs: data/portfolio_stats.csv, data/correlation_matrix.csv, data/calendar_2022.csv
Figures: fig_corr_matrix, fig_growth, fig_drawdown, fig_rolling_corr, fig_frontier
"""
import numpy as np, pandas as pd
import matplotlib.pyplot as plt
from common import *

px = pd.read_csv(DATA / "etf_monthly_prices.csv", index_col=0, parse_dates=True)
rf = pd.read_csv(DATA / "tbill_13w_yield.csv", index_col=0, parse_dates=True).iloc[:, 0]
r = px.pct_change().dropna()
rf_m = (rf.reindex(r.index).ffill() / 100 / 12).fillna(0)

NAMES = {"ACWI": "Global equities", "AGG": "IG bonds", "PSP": "Listed private equity",
         "QAI": "Hedge fund replication", "GLD": "Gold"}
PORTS = {
    "AI default 60/40": {"ACWI": .60, "AGG": .40},
    "Diversified with alternatives": {"ACWI": .45, "AGG": .25, "PSP": .10, "QAI": .15, "GLD": .05},
}

def port_returns(w):
    w = pd.Series(w)
    return (r[w.index] * w).sum(axis=1)  # monthly rebalanced

def stats(x):
    n = len(x) / 12
    cagr = (1 + x).prod() ** (1 / n) - 1
    vol = x.std() * np.sqrt(12)
    ex = x - rf_m.reindex(x.index)
    sharpe = ex.mean() * 12 / vol
    wealth = (1 + x).cumprod()
    mdd = (wealth / wealth.cummax() - 1).min()
    down = x[x < 0].std() * np.sqrt(12)
    return {"CAGR": cagr, "Volatility": vol, "Sharpe": sharpe, "Max drawdown": mdd,
            "Downside vol": down, "Calmar": cagr / abs(mdd)}

pr = pd.DataFrame({k: port_returns(v) for k, v in PORTS.items()})
table = pd.DataFrame({k: stats(pr[k]) for k in pr}).T
for c in r.columns:
    table.loc[NAMES[c]] = stats(r[c])
table.to_csv(DATA / "portfolio_stats.csv", float_format="%.4f")
print(table.round(3))

# 2022 stress year and 2020 covid quarter
cal = pd.concat([pr, r.rename(columns=NAMES)], axis=1)
yr = (1 + cal).groupby(cal.index.year).prod() - 1
yr.to_csv(DATA / "calendar_year_returns.csv", float_format="%.4f")
print(yr.loc[[2018, 2020, 2022]].round(3).T)

# Correlation matrix
corr = r.rename(columns=NAMES).corr()
corr.to_csv(DATA / "correlation_matrix.csv", float_format="%.3f")
fig, ax = plt.subplots(figsize=(5.4, 4.2))
im = ax.imshow(corr.values, cmap=matplotlib.colors.LinearSegmentedColormap.from_list("s", SEQ), vmin=-0.2, vmax=1)
ax.set_xticks(range(5)); ax.set_yticks(range(5))
ax.set_xticklabels(corr.columns, rotation=30, ha="right"); ax.set_yticklabels(corr.columns)
ax.grid(False)
for i in range(5):
    for j in range(5):
        v = corr.values[i, j]
        ax.text(j, i, f"{v:.2f}", ha="center", va="center", fontsize=8, color="white" if v > .55 else INK)
ax.set_title("Correlation of monthly returns, Apr 2009 to Sep 2026")
source_note(fig, "Yahoo Finance adjusted prices for ACWI, AGG, PSP, QAI, GLD; team analysis.")
save(fig, "fig_corr_matrix")

# Growth of 100
fig, ax = plt.subplots(figsize=(7, 3.4))
for k, c in zip(pr, [MUTED, BLUE]):
    ax.plot((1 + pr[k]).cumprod() * 100, color=c, label=k)
ax.set_ylabel("Growth of USD 100"); ax.legend(loc="upper left")
ax.set_title("Cumulative growth, monthly rebalanced")
source_note(fig, "Yahoo Finance; team analysis. Liquid proxies, before fees and taxes.")
save(fig, "fig_growth")

# Drawdowns
fig, ax = plt.subplots(figsize=(7, 3.0))
for k, c in zip(pr, [MUTED, BLUE]):
    w = (1 + pr[k]).cumprod(); dd = w / w.cummax() - 1
    ax.plot(dd * 100, color=c, label=k, linewidth=1.6)
ax.set_ylabel("Drawdown from peak, %"); ax.legend(loc="lower left")
ax.set_title("With liquid proxies, adding 'alternatives' did not reduce drawdowns")
source_note(fig, "Yahoo Finance; team analysis.")
save(fig, "fig_drawdown")

# Rolling 36m equity bond correlation
rc = r["ACWI"].rolling(36).corr(r["AGG"]).dropna()
rh = r["ACWI"].rolling(36).corr(r["QAI"]).dropna()
fig, ax = plt.subplots(figsize=(7, 3.0))
ax.plot(rc, color=ORANGE, label="Global equities vs IG bonds")
ax.plot(rh, color=VIOLET, label="Global equities vs hedge fund replication ETF")
ax.axhline(0, color=INK2, linewidth=0.8)
ax.set_ylabel("36 month rolling correlation"); ax.legend(loc="center left", bbox_to_anchor=(0, 0.6))
ax.set_title("The bond hedge is not constant: equity bond correlation turned strongly positive after 2021")
source_note(fig, "Yahoo Finance; team analysis.")
save(fig, "fig_rolling_corr")
pd.DataFrame({"eq_bond": rc, "eq_hf": rh}).to_csv(DATA / "rolling_correlations.csv", float_format="%.3f")

# Efficient frontier: long only random portfolios, traditional vs extended universe
mu = r.mean() * 12; cov = r.cov() * 12
rng = np.random.default_rng(7)
def cloud(assets, n=20000):
    w = rng.dirichlet(np.ones(len(assets)) * 0.6, n)
    m = w @ mu[assets].values
    v = np.sqrt(np.einsum("ij,jk,ik->i", w, cov.loc[assets, assets].values, w))
    return v, m
def frontier(v, m, bins=40):
    edges = np.linspace(v.min(), v.max(), bins)
    out = []
    for a, b in zip(edges[:-1], edges[1:]):
        s = (v >= a) & (v < b)
        if s.any(): out.append((v[s][m[s].argmax()], m[s].max()))
    o = np.array(out)
    keep = [i for i in range(len(o)) if o[i, 1] >= o[:i + 1, 1].max() - 1e-9]
    return o[keep]
v1, m1 = cloud(["ACWI", "AGG"]); v2, m2 = cloud(list(r.columns))
f1, f2 = frontier(v1, m1), frontier(v2, m2)
fig, ax = plt.subplots(figsize=(7, 3.6))
ax.scatter(v2 * 100, m2 * 100, s=1, color="#c9dcf5", rasterized=True)
ax.plot(f1[:, 0] * 100, f1[:, 1] * 100, color=MUTED, label="Equities and bonds only")
ax.plot(f2[:, 0] * 100, f2[:, 1] * 100, color=BLUE, label="Adding alternatives (PE, hedge funds, gold)")
for k, c in zip(PORTS, [MUTED, BLUE]):
    s = table.loc[k]
    ax.scatter(s["Volatility"] * 100, s["CAGR"] * 100 if False else pr[k].mean() * 1200, s=40, color=c, edgecolor="white", zorder=5)
ax.set_xlabel("Annualised volatility, %"); ax.set_ylabel("Annualised mean return, %")
ax.legend(loc="lower right"); ax.set_title("Long only opportunity set, Apr 2009 to Sep 2026")
source_note(fig, "Yahoo Finance; 20,000 random long only portfolios per universe; team analysis.")
save(fig, "fig_frontier")
gain = []
for vol in [0.06, 0.08, 0.10]:
    a = np.interp(vol, f1[:, 0], f1[:, 1]); b = np.interp(vol, f2[:, 0], f2[:, 1])
    gain.append((vol, a, b, b - a))
pd.DataFrame(gain, columns=["vol", "trad", "extended", "pickup"]).to_csv(DATA / "frontier_pickup.csv", float_format="%.4f")
print(pd.DataFrame(gain, columns=["vol", "trad", "extended", "pickup"]).round(4))
