from __future__ import annotations

from typing import Dict

DEFAULT_WEIGHTS = {
    "pillar1": 0.20,   # Bot detection — useful but jitter alone is a lighter signal
    "pillar2": 0.35,   # Environmental — server-side, independent of worker device, hardest to fake
    "pillar3": 0.30,   # Work-proof — chain + IP + active minutes + login_hour
    "pillar4": 0.15,   # Ring detector — critical for Telegram syndicate scenarios
}


def aggregate_four_pillars(
    pillar1_score: float,
    pillar2_score: float,
    pillar3_score: float,
    pillar4_ring_risk: float,
    weights: Dict[str, float] | None = None,
) -> Dict[str, float | str]:
    w = dict(DEFAULT_WEIGHTS)
    if weights:
        w.update(weights)

    total_w = max(sum(w.values()), 1e-6)
    normalized = {k: v / total_w for k, v in w.items()}

    # First three pillars are trust-oriented; fourth is risk-oriented.
    trust = (
        pillar1_score * normalized["pillar1"]
        + pillar2_score * normalized["pillar2"]
        + pillar3_score * normalized["pillar3"]
        + (1 - pillar4_ring_risk) * normalized["pillar4"]
    )

    trust = max(0.0, min(1.0, trust))
    fraud = max(0.0, min(1.0, 1 - trust))

    decision = "PAID" if trust >= 0.65 else "REVIEW"

    return {
        "trustScore": round(trust, 4),
        "fraudScore": round(fraud, 4),
        "decision": decision,
    }
