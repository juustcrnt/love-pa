"""Shared chart style for the report (light, print oriented)."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
FIG = ROOT / "figures"

# Categorical slots, fixed order (validated reference palette, light mode)
BLUE, ORANGE, AQUA, YELLOW, MAGENTA, GREEN, VIOLET, RED = (
    "#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948")
NAVY = "#0b2545"
INK, INK2, MUTED, GRID = "#0b0b0b", "#52514e", "#8a8984", "#e4e3df"
SEQ = ["#d6e6fa", "#a9c9f2", "#6fa4e6", "#2a78d6", "#1a5aa8", "#0e3b73"]

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "font.size": 9,
    "axes.edgecolor": MUTED,
    "axes.labelcolor": INK2,
    "axes.titlesize": 10,
    "axes.titleweight": "bold",
    "axes.titlecolor": INK,
    "axes.titlelocation": "left",
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.grid": True,
    "grid.color": GRID,
    "grid.linewidth": 0.6,
    "xtick.color": INK2,
    "ytick.color": INK2,
    "legend.frameon": False,
    "legend.fontsize": 8,
    "lines.linewidth": 2,
    "figure.dpi": 200,
    "savefig.bbox": "tight",
    "savefig.facecolor": "white",
})

def source_note(fig, text):
    """Sources are printed under each exhibit in the report; kept here for traceability."""
    return
    fig.text(0.0, -0.02, "Source: " + text, fontsize=6.5, color=MUTED, ha="left", va="top", wrap=True)

def save(fig, name):
    FIG.mkdir(exist_ok=True)
    fig.savefig(FIG / f"{name}.png")
    plt.close(fig)
