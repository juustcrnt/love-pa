"""Render source/report.html to the A4 PDF with Chromium (Playwright)."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
html = ROOT / "source" / "report.html"
out = ROOT / "Winning_the_AI_Native_Investor_Lombard_Odier.pdf"
footer = ('<div style="font-family:Inter,sans-serif;font-size:7px;color:#8a8984;width:100%;padding:0 20mm;'
          'display:flex;justify-content:space-between"><span>Winning the AI Native Investor &middot; Draft for discussion</span>'
          '<span class="pageNumber"></span></div>')
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    pg = b.new_page()
    pg.goto(html.as_uri(), wait_until="networkidle")
    pg.pdf(path=str(out), format="A4", print_background=True, display_header_footer=True,
           header_template="<div></div>", footer_template=footer, prefer_css_page_size=True)
    b.close()
print(out)
