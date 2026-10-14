# Report: Winning the AI Native Investor

Project report for the Lombard Odier associate banker working group.

**Key question.** In the age of AI, why would a next generation client still need a private bank to invest their money? What concrete, pilot ready initiative can Lombard Odier launch to convince AI native clients that its diversified allocations, built with alternative assets, deliver value AI alone cannot, and to measurably grow its share of their investable wealth?

## Contents

| Path | What it is |
|---|---|
| `Winning_the_AI_Native_Investor_Lombard_Odier.pdf` | The full report (A4, 34 pages, 16 exhibits, 46 numbered sources) |
| `source/report.html` | Report source (HTML/CSS) |
| `source/build_pdf.py` | Renders the HTML to PDF with Chromium (Playwright) |
| `analysis/` | Python scripts that produce every number and exhibit |
| `data/` | Raw market data and all analysis outputs (CSV) |
| `figures/` | Exhibits as PNG |

## Analyses

1. `01_download_market_data.py`: monthly prices for ACWI, AGG, PSP, QAI and GLD, plus the T-bill yield (Yahoo Finance), 2009 to 2026.
2. `02_diversification.py`: AI default 60/40 compared with a diversified allocation that uses liquid alternatives. Covers correlations, drawdowns, rolling equity/bond correlation and the efficient frontier.
3. `03_implementation_models.py`: what AI cannot implement. Covers private equity commitment pacing (Takahashi-Alexander), a capital protected note (Black-Scholes plus bootstrap), the 2022 stress year and manager dispersion.
4. `04_market_and_pilot.py`: wealth transfer, generational gap, democratisation of alternatives, Swiss peers, competitive heatmap, pilot statistical power, economics at scale and the 12 week plan.

## Reproduce

```bash
pip install -r requirements.txt
cd analysis
python3 01_download_market_data.py && python3 02_diversification.py \
  && python3 03_implementation_models.py && python3 04_market_and_pilot.py
cd .. && python3 source/build_pdf.py
```

Public sources only. Every input in the economics model is a placeholder, to be replaced with internal Lombard Odier data. The competitive scoring is the working group's own assessment and is validated in Month 1 of the project. This is not investment advice.
