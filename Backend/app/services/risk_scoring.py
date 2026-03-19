from ..models.vendor import Vendor


RISK_BANDS = [
    (80, "Critical", "#EF4444"),
    (60, "High",     "#F59E0B"),
    (40, "Medium",   "#64748B"),
    (0,  "Low",      "#10B981"),
]

STAGE_COLORS = {
    "Acquisition": "#0EA5E9",
    "Retention":   "#10B981",
    "Upgradation": "#F59E0B",
    "Offboarding": "#94A3B8",
}


def score_to_risk(score: int) -> tuple[str, str]:
    """Return (risk_label, risk_color) for a given numeric score."""
    for threshold, label, color in RISK_BANDS:
        if score >= threshold:
            return label, color
    return "Low", "#10B981"


def stage_color(stage: str) -> str:
    return STAGE_COLORS.get(stage, "#94A3B8")


def recalculate_vendor_risk(vendor: Vendor) -> Vendor:
    """
    Recompute risk label and colors from the current score and stage.
    Mutates and returns the vendor object — call before db.commit().
    """
    vendor.risk, vendor.risk_color = score_to_risk(vendor.score)
    vendor.stage_color = stage_color(vendor.stage)
    return vendor
