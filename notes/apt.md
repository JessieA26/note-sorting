---
title: Multifactor Models and APT
category: study
tags: [finance, asset-pricing]
status: staging
author: ai
created: 2026-11-14
updated: 2026-11-14
summary: Arbitrage Pricing Theory explains expected returns with several risk factors using a no-arbitrage argument.
source: Standard textbook theory (to verify against lecture slides)
related: [capm]
---

# Multifactor Models and APT

## Key points

- Returns come from common risk factors plus firm-specific risk.
- The law of one price: assets with the same risk cannot have different expected returns, or arbitrage appears.
- A well-diversified portfolio has almost no firm-specific risk, so only factor risk matters.
- APT (Ross, 1976) needs fewer assumptions than [[capm]] but does not say which factors to use.

## Details

Factor model and APT pricing relation:

```
Ri = E(Ri) + βi1·F1 + ... + βik·Fk + ei
E(Ri) = Rf + βi1·λ1 + ... + βik·λk
```

Fk is the unexpected move in factor k, βik is the sensitivity to it, and λk is the factor's risk premium.

If two well-diversified portfolios have the same factor exposure but different expected returns, buying the higher one and shorting the lower one earns a risk-free profit. Prices adjust until the gap closes.

## Related

[[capm]] is the single-factor case with the market portfolio as the factor.
