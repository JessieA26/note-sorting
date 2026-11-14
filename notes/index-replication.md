---
title: Index Replication and Passive Investing
category: study
tags: [finance, passive-investing]
status: staging
author: ai
created: 2026-11-14
updated: 2026-11-14
summary: How price, value and equal weighting differ, and how funds replicate an index at low cost.
source: Standard textbook theory (to verify against lecture slides)
related: [capm]
---

# Index Replication and Passive Investing

## Key points

- Three common weighting schemes: price-weighted, value-weighted (market cap) and equal-weighted.
- A price-weighted index gives more influence to high-priced stocks and uses a divisor that is adjusted for splits.
- A value-weighted index keeps its weights as prices move, so it needs little trading.
- An equal-weighted index must be rebalanced regularly, which raises turnover and tilts toward smaller stocks.
- Funds replicate an index by full replication, sampling or optimisation.

## Details

```
Price-weighted:  Index = sum(Pi) / divisor
Value-weighted:  Index(t) = sum(Pi(t) × Qi(t)) / sum(Pi(0) × Qi(0)) × base
Equal-weighted:  wi = 1 / N
```

Pi is price, Qi is shares outstanding and N is the number of constituents.

Two studies are often cited for passive investing: Carhart (1997) on persistence in mutual fund performance, and Bessembinder (2018) on how a small share of stocks creates most of the wealth. (To verify the exact findings against the lecture slides.)

## Related

See [[capm]] for the market portfolio that value-weighted indices approximate.
