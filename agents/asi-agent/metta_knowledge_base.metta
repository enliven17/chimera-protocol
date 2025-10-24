; ChimeraProtocol MeTTa Knowledge Base
; Prediction Market Analysis Rules and Knowledge Graphs

; === MARKET ANALYSIS RULES ===

; Contrarian betting strategy - when crowd is heavily biased
(= (contrarian-opportunity $ratio $volume)
   (and (or (> $ratio 0.75) (< $ratio 0.25))
        (> $volume 1000)))

; Risk assessment based on volume and time
(= (risk-level $volume $time-remaining)
   (if (< $volume 500) high-risk
       (if (and (> $volume 5000) (> $time-remaining 86400)) low-risk
           medium-risk)))

; Confidence calculation using multiple factors
(= (confidence-score $ratio $volume $time-remaining)
   (let $contrarian-strength (abs (- $ratio 0.5))
        $volume-factor (min 1.0 (/ $volume 10000))
        $time-factor (min 1.0 (/ $time-remaining 604800))
        (* (* $contrarian-strength $volume-factor) $time-factor)))

; Market category analysis
(= (market-category crypto) high-volatility)
(= (market-category sports) medium-volatility)
(= (market-category politics) high-volatility)
(= (market-category weather) low-volatility)

; === BETTING STRATEGY RULES ===

; Kelly criterion for bet sizing
(= (kelly-bet-size $edge $odds)
   (/ $edge (- $odds 1)))

; Maximum bet size based on bankroll
(= (max-bet-size $bankroll $risk-level)
   (if (== $risk-level high-risk) (* $bankroll 0.01)
       (if (== $risk-level medium-risk) (* $bankroll 0.05)
           (* $bankroll 0.10))))

; Recommendation logic
(= (betting-recommendation $ratio $volume $category)
   (if (contrarian-opportunity $ratio $volume)
       (if (> $ratio 0.5) 
           (bet-against-majority option-b)
           (bet-against-majority option-a))
       hold))

; === MARKET SENTIMENT ANALYSIS ===

; Sentiment indicators
(= (market-sentiment bullish) (> recent-volume-ratio 1.5))
(= (market-sentiment bearish) (< recent-volume-ratio 0.5))
(= (market-sentiment neutral) (and (<= recent-volume-ratio 1.5) (>= recent-volume-ratio 0.5)))

; Momentum indicators
(= (momentum strong-up) (> price-change-24h 0.1))
(= (momentum strong-down) (< price-change-24h -0.1))
(= (momentum sideways) (and (<= price-change-24h 0.1) (>= price-change-24h -0.1)))

; === KNOWLEDGE GRAPH RELATIONSHIPS ===

; Market relationships
(related-to crypto bitcoin)
(related-to crypto ethereum)
(related-to sports football)
(related-to sports basketball)
(related-to politics election)
(related-to politics policy)

; Correlation patterns
(correlated bitcoin ethereum 0.8)
(correlated stocks crypto 0.3)
(correlated weather agriculture 0.9)

; Historical patterns
(pattern crypto bull-run (> duration 6-months))
(pattern sports playoff-season (> betting-volume 2x))
(pattern politics election-year (> volatility 1.5x))

; === AGENT BEHAVIOR RULES ===

; When to be more aggressive
(= (aggressive-mode $market-conditions)
   (and (== $market-conditions high-opportunity)
        (> agent-confidence 0.8)
        (< current-exposure 0.3)))

; When to be conservative  
(= (conservative-mode $market-conditions)
   (or (== $market-conditions uncertain)
       (< agent-confidence 0.6)
       (> current-exposure 0.7)))

; Learning and adaptation
(= (update-confidence $prediction-accuracy)
   (if (> $prediction-accuracy 0.7)
       (increase-confidence 0.1)
       (decrease-confidence 0.05)))

; === UTILITY FUNCTIONS ===

; Expected value calculation
(= (expected-value $probability $payout $cost)
   (- (* $probability $payout) $cost))

; Sharpe ratio for strategy evaluation
(= (sharpe-ratio $returns $risk-free-rate $volatility)
   (/ (- $returns $risk-free-rate) $volatility))

; Portfolio diversification score
(= (diversification-score $positions)
   (/ (count-unique-categories $positions) (count $positions)))

; === REAL-TIME ANALYSIS RULES ===

; Market anomaly detection
(= (anomaly-detected $current-ratio $historical-average)
   (> (abs (- $current-ratio $historical-average)) 0.2))

; Liquidity assessment
(= (liquidity-level $bid-ask-spread $volume)
   (if (and (< $bid-ask-spread 0.02) (> $volume 10000)) high-liquidity
       (if (and (< $bid-ask-spread 0.05) (> $volume 1000)) medium-liquidity
           low-liquidity)))

; Market efficiency indicator
(= (market-efficiency $price-discovery-speed $arbitrage-opportunities)
   (if (and (< $price-discovery-speed 300) (< $arbitrage-opportunities 0.01)) efficient
       (if (< $price-discovery-speed 600) semi-efficient
           inefficient)))

; === INTEGRATION RULES ===

; Hedera network specific rules
(= (hedera-gas-optimal $network-congestion)
   (< $network-congestion 0.5))

; PYUSD stability check
(= (pyusd-stable $price-deviation)
   (< $price-deviation 0.02))

; Bridge safety assessment
(= (bridge-safe $bridge-liquidity $bridge-history)
   (and (> $bridge-liquidity 100000) (> $bridge-history 30-days)))