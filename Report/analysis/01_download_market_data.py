"""Download monthly total-return proxies (adjusted closes) for the diversification analysis.

Proxies (all USD, liquid, publicly traded):
  ACWI  iShares MSCI ACWI ETF               -> global equities
  AGG   iShares Core US Aggregate Bond ETF  -> investment grade bonds
  PSP   Invesco Global Listed Private Equity -> listed private equity (proxy for PE beta)
  QAI   IQ Hedge Multi-Strategy Tracker     -> hedge fund replication
  GLD   SPDR Gold Shares                    -> gold
  ^IRX  13-week US T-bill yield             -> risk-free rate
"""
import yfinance as yf
from common import DATA

TICKERS = ["ACWI", "AGG", "PSP", "QAI", "GLD"]
px = yf.download(TICKERS, start="2009-01-01", end="2026-10-01", interval="1mo",
                 auto_adjust=True, progress=False)["Close"]
px.dropna().to_csv(DATA / "etf_monthly_prices.csv")
rf = yf.download("^IRX", start="2009-01-01", end="2026-10-01", interval="1mo",
                 progress=False)["Close"]
rf.to_csv(DATA / "tbill_13w_yield.csv")
print(px.dropna().index.min(), px.dropna().index.max(), len(px.dropna()))
