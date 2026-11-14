---
title: CAPM
category: study
tags: [finance, asset-pricing]
status: staging
author: ai
created: 2026-11-14
updated: 2026-11-14
summary: Expected return depends only on systematic risk, measured by beta.
source: Standard textbook theory (to verify against lecture slides)
related: [apt, index-replication]
---

# CAPM

## Key points

- Total risk splits into systematic (market) risk and diversifiable (firm-specific) risk.
- Diversifiable risk can be removed by holding many assets, so the market does not pay for it.
- Only systematic risk is priced, and beta measures it.
- Expected return is a straight line in beta, called the security market line (SML).

## Details

Expected return of asset i:

```
E(Ri) = Rf + βi × [E(Rm) − Rf]
βi = Cov(Ri, Rm) / Var(Rm)
```

Rf is the risk-free rate, E(Rm) − Rf is the market risk premium, and alpha is actual return minus the CAPM expected return.

Example: with Rf = 2%, E(Rm) = 8% and β = 1.5, the expected return is 2% + 1.5 × 6% = 11%.

A stock that plots above the SML has a positive alpha, which CAPM reads as underpriced.

## Related

[[apt]] relaxes the single-factor assumption. [[index-replication]] covers how market indices are built.
