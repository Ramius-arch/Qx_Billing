import { ref, computed } from 'vue';

// Coach visibility state (persisted)
const STORAGE_KEY = 'qx_coach_hud_active';

function getInitialCoachState() {
  if (typeof window === 'undefined') return true;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null ? saved === 'true' : true;
  } catch (e) {
    return true;
  }
}

export const isCoachActive = ref(getInitialCoachState());

export function toggleCoachHUD() {
  isCoachActive.value = !isCoachActive.value;
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(isCoachActive.value));
    }
  } catch (e) {
    // ignore
  }
}

// Live Commercial Stock & Sales Intelligence Data
export const coachMetrics = ref({
  totalGMV: 48500,
  settledOrdersCount: 12,
  pendingDeliveriesCount: 2,
  reconciledMpesaRate: 100, // 100%
  monthlyTarget: 150000,
  dailyExpenseRunRate: 1650, // KES per day
  vatRate: 0.16,
  courierCostPerDelivery: 250,
  inventoryItems: [
    { id: '1', title: 'Vintage Nike Colorblock Windbreaker', stockUnits: 2, dailyBurnRate: 1.2, runwayDays: 1.7, status: 'starving', reorderThreshold: 5 },
    { id: '2', title: 'Stüssy 8-Ball Mohair Knit Sweater', stockUnits: 6, dailyBurnRate: 0.8, runwayDays: 7.5, status: 'healthy', reorderThreshold: 4 },
    { id: '3', title: 'Carhartt Duck Double-Knee Work Pants', stockUnits: 11, dailyBurnRate: 0.6, runwayDays: 18.3, status: 'healthy', reorderThreshold: 4 },
    { id: '4', title: 'Minimalist Bias-Cut Silk Midi Skirt', stockUnits: 4, dailyBurnRate: 0.5, runwayDays: 8.0, status: 'healthy', reorderThreshold: 3 },
    { id: '5', title: 'Salomon XT-6 Gore-Tex Sneakers', stockUnits: 1, dailyBurnRate: 0.7, runwayDays: 1.4, status: 'starving', reorderThreshold: 3 },
    { id: '6', title: 'Arc\'teryx Beta LT Shell Jacket', stockUnits: 8, dailyBurnRate: 0.4, runwayDays: 20.0, status: 'healthy', reorderThreshold: 3 }
  ]
});

// 1. Calculated Financial Reality (Beyond Amber/Red)
export const financialBreakdown = computed(() => {
  const gmv = coachMetrics.value.totalGMV;
  // Statutory 16% KRA eTIMS VAT included in gross sales
  const vatReserve = Math.round((gmv - (gmv / (1 + coachMetrics.value.vatRate))) * 100) / 100;
  // Rider delivery payouts
  const deliveryCosts = coachMetrics.value.settledOrdersCount * coachMetrics.value.courierCostPerDelivery;
  // True Net in pocket
  const netProfit = Math.round(gmv - vatReserve - deliveryCosts);
  // Days of cash runway
  const cashRunwayDays = Math.round((netProfit / coachMetrics.value.dailyExpenseRunRate) * 10) / 10;

  return {
    gmv,
    vatReserve,
    deliveryCosts,
    netProfit,
    cashRunwayDays,
    profitMarginPercent: Math.round((netProfit / gmv) * 100)
  };
});

// 2. Calculated Stock Provision & Depletion Range
export const stockHealth = computed(() => {
  const items = coachMetrics.value.inventoryItems;
  const starvingItems = items.filter(i => i.runwayDays <= 3);
  const healthyItems = items.filter(i => i.runwayDays > 3 && i.runwayDays <= 30);
  const overstockedItems = items.filter(i => i.runwayDays > 30);

  const averageRunwayDays = Math.round(
    items.reduce((acc, i) => acc + i.runwayDays, 0) / items.length
  );

  return {
    totalSkus: items.length,
    starvingItems,
    healthyItems,
    overstockedItems,
    averageRunwayDays,
    healthScorePercent: Math.round((healthyItems.length / items.length) * 100)
  };
});

// 3. Composite Store Vitality Index (0 - 100)
export const storeVitality = computed(() => {
  // Score breakdown:
  // - Cash Runway & M-Pesa Settlement Health (up to 40 pts)
  // - Stock Balance & Provision Health (up to 35 pts)
  // - Delivery & SLA Fulfillment (up to 25 pts)
  let score = 0;

  // 1. Settlement: 100% = 40 pts
  score += Math.round((coachMetrics.value.reconciledMpesaRate / 100) * 40);

  // 2. Stock Provision: penalty for starving top-sellers
  const starvingCount = stockHealth.value.starvingItems.length;
  if (starvingCount === 0) score += 35;
  else if (starvingCount <= 2) score += 28;
  else score += 15;

  // 3. Margin & Delivery Health
  if (financialBreakdown.value.profitMarginPercent >= 60) score += 25;
  else if (financialBreakdown.value.profitMarginPercent >= 40) score += 20;
  else score += 12;

  // Grade classification
  let grade = 'THRIVING';
  let badgeColor = 'text-emerald-700 bg-emerald-100 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-700';
  let summary = 'Your business form is exceptional. Cash runway is secure, and M-Pesa settlement is 100% clean.';

  if (score < 70) {
    grade = 'ATTENTION NEEDED';
    badgeColor = 'text-amber-700 bg-amber-100 border-amber-300 dark:text-amber-300 dark:bg-amber-950/60 dark:border-amber-700';
    summary = 'Immediate inventory reorder required on top-moving apparel to prevent lost walk-in sales.';
  }

  return {
    score,
    grade,
    badgeColor,
    summary
  };
});

// 4. Dynamic Situational Coach Briefings (EA Sports Trainer Metaphor)
export const coachBriefings = computed(() => {
  const list = [];

  // Tip A: Stock Starvation Warning
  const starving = stockHealth.value.starvingItems;
  if (starving.length > 0) {
    const topStarving = starving[0];
    list.push({
      id: 'tip-stock',
      category: 'INVENTORY RUNWAY',
      icon: 'parcel',
      badge: `${topStarving.runwayDays} DAYS LEFT`,
      badgeType: 'amber',
      headline: `${topStarving.title} is starving (${topStarving.stockUnits} units left)`,
      actionLabel: 'Plan Reorder',
      actionKey: 'reorder',
      body: `At your current velocity of ${topStarving.dailyBurnRate} sales/day, you will stock out before Friday evening. Reorder at least 5 pieces today to capture Saturday walk-in foot traffic.`
    });
  }

  // Tip B: Tax Reserve & Clean Cash in Pocket
  list.push({
    id: 'tip-tax',
    category: 'TAX & CASH PURITY',
    icon: 'tax',
    badge: '16% VAT RING-FENCED',
    badgeType: 'indigo',
    headline: `KES ${financialBreakdown.value.netProfit.toLocaleString()} is your true net spendable cash`,
    actionLabel: 'View Breakdown',
    actionKey: 'tax-breakdown',
    body: `We have automatically segregated KES ${financialBreakdown.value.vatReserve.toLocaleString()} for statutory KRA eTIMS VAT and KES ${financialBreakdown.value.deliveryCosts.toLocaleString()} for courier riders. What remains is 100% clean profit with 24 days of operational runway.`
  });

  // Tip C: Delivery Pipeline & Customer Delight
  list.push({
    id: 'tip-delivery',
    category: 'LOGISTICS & RIDERS',
    icon: 'transit',
    badge: '2 IN TRANSIT',
    badgeType: 'emerald',
    headline: 'Boda-Boda Courier turnaround: 38 mins average',
    actionLabel: 'WhatsApp Riders',
    actionKey: 'riders',
    body: `2 customers (Kilimani and Westlands) have orders out for delivery. Rider ETA is under 25 minutes. WhatsApp dispatch links are pre-formatted for both drop-offs.`
  });

  return list;
});
