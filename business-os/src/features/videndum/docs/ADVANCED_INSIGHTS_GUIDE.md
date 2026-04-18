# Videndum — Advanced Insights Integration Guide

**Module:** Advanced Analytics with Claude AI  
**Route:** `/videndum/advanced-insights`  
**Status:** ✅ Ready for activation  
**Date:** 2026-04-18

---

## 📊 Overview

Advanced Insights brings AI-powered analysis to Videndum's production planning workflow. Using Claude AI, the system analyzes historical forecast data, identifies risk patterns, and provides actionable recommendations for inventory and production optimization.

**Key benefit:** Reduce 30 hours/week of manual analysis to minutes.

---

## 🎯 Use Cases for Videndum

### 1. Forecast Variance Analysis

**Problem:** Identify which SKUs deviate most from forecast (inventory bloat or shortages).

**Claude Analysis:**
- Calculates variance % by product
- Identifies trend (increasing/decreasing deviation)
- Recommends safety stock adjustments
- Flags products needing attention

**Example prompt:**
```
Analyze our forecast vs actual sales data for the past 8 weeks. 
Which SKUs have the largest negative variance? 
What does this tell us about demand patterns? 
Recommend adjustments to our safety stock levels.
```

### 2. Production Risk Assessment

**Problem:** Which products are at risk of stockout or excess inventory in the next 30 days?

**Claude Analysis:**
- Projects inventory levels given current order book
- Identifies bottleneck products
- Calculates risk severity
- Recommends production plan adjustments

**Example prompt:**
```
Based on current inventory levels and forecast for the next 30 days, 
identify which SKUs are at risk of stockout. 
Which products have excess inventory? 
Recommend production plan adjustments.
```

### 3. Seasonal Pattern Detection

**Problem:** Leverage 8 years of historical data to optimize for seasonal fluctuations.

**Claude Analysis:**
- Identifies peak and low seasons by product
- Calculates seasonal adjustment factors
- Recommends forecast adjustments
- Predicts demand for upcoming quarters

**Example prompt:**
```
Analyze our historical sales data (2018-present) to identify seasonal patterns. 
What are the peak and low seasons by product line? 
How should we adjust our forecast for the next quarters?
```

### 4. Order Book Impact Planning

**Problem:** How will current orders impact production capacity and component lead times?

**Claude Analysis:**
- Explodes order book by component
- Identifies critical path items
- Calculates lead time buffers needed
- Proposes production sequence

**Example prompt:**
```
Given our current order book and order intake, 
what is the impact on production scheduling for the next 7 weeks? 
Which products are bottlenecks? 
What are the component lead time implications?
```

---

## 🚀 How to Activate for Videndum

### Step 1: Admin enables the feature

```bash
# Via Supabase dashboard or API:
curl -X POST http://localhost:3000/api/advanced-analytics/subscription \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "videndum-tenant-uuid",
    "user_id": "admin-user-uuid",
    "plan": "pro",
    "power_bi_workspace_id": "videndum-workspace-id"
  }'
```

### Step 2: Users access the dashboard

1. Log in to business-os as Videndum user
2. Navigate to **Videndum** → **Advanced Insights**
3. See the 4 analysis templates in the interface

### Step 3: Start analyzing

**Option A: Use templates**
- Click a template button (e.g., "Forecast Variance Analysis")
- Claude auto-populates the prompt
- Click "Analyze"

**Option B: Custom question**
- Type a custom question about your data
- Include timeframe (e.g., "past 8 weeks", "next 30 days")
- Mention specific metrics (variance %, inventory levels, etc.)

### Step 4: Export insights

- Copy analysis to Excel/PDF
- Share with SI&OP team for weekly review
- Use recommendations to adjust production plan

---

## 📈 Template Prompts (Customizable)

Each template sends a prompt to Claude adapted for Videndum's data:

### Template: Forecast Variance Analysis

```
Analyze our forecast vs actual sales data for the past 8 weeks.
Which SKUs have the largest negative variance?
What does this tell us about demand patterns?
Recommend adjustments to our safety stock levels.
```

### Template: Production Risk Assessment

```
Based on current inventory levels and forecast for the next 30 days,
identify which SKUs are at risk of stockout.
Which products have excess inventory?
Recommend production plan adjustments.
```

### Template: Seasonal Pattern Detection

```
Analyze our historical sales data (2018-present) to identify seasonal patterns.
What are the peak and low seasons by product line?
How should we adjust our forecast for the next quarters?
```

### Template: Order Book Impact

```
Given our current order book and order intake,
what is the impact on production scheduling for the next 7 weeks?
Which products are bottlenecks?
What are the component lead time implications?
```

---

## 🔧 Integration with Existing Workflows

### Weekly SI&OP Review

**Current workflow (manual, 30 hrs/week):**
1. Download forecast file
2. Load into Excel
3. Calculate variance manually
4. Create pivot tables
5. Analyze bottlenecks
6. Present findings

**New workflow (automated, ~10 min):**
1. Open Advanced Insights
2. Click "Forecast Variance Analysis" template
3. Share Claude analysis with team
4. Discuss recommendations in meeting
5. Adjust production plan in IFS ERP

**Time saved:** ~28 hours/week

### Production Planning

**Use Advanced Insights to:**
- Identify SKUs needing expedited production
- Balance inventory investment vs service level
- Optimize component procurement timing
- Prepare contingency plans for risky items

### Demand Forecasting

**Claude can help with:**
- Detecting trend changes
- Identifying outliers (special orders, events)
- Recommending forecast corrections
- Validating seasonal adjustments

---

## 💡 Best Practices

### 1. Be Specific with Time Ranges

❌ **Bad:** "Which SKUs are at risk?"
✅ **Good:** "Which SKUs are at risk of stockout in the next 30 days?"

### 2. Mention Decision Context

❌ **Bad:** "Analyze our products"
✅ **Good:** "Which products need inventory adjustment to meet our 95% service level target?"

### 3. Ask for Recommendations

❌ **Bad:** "Show me the variance"
✅ **Good:** "Show variance and recommend which products need safety stock increases"

### 4. Reference Specific Data Sources

If you have Power BI connected:
- "Based on the forecast report in Power BI..."
- "Looking at the inventory dashboard..."

If data is manual:
- "Given our current order book..."
- "Based on last month's actuals..."

---

## 🛠️ Configuration Options

### Power BI Integration (Optional)

If Videndum has Power BI workspace with forecast data:

1. Provide Power BI workspace ID
2. Specify report IDs for:
   - Forecast vs actual comparison
   - Inventory levels by SKU
   - Order book summary

Claude can then reference Power BI data directly in analysis.

### Custom Report Templates

Videndum can request custom weekly report templates:
- Variance summary by product line
- Risk dashboard (red/yellow/green flags)
- Recommended production adjustments
- Capacity utilization forecast

---

## 📊 Metrics Tracked

Advanced Insights tracks usage:
- Number of analyses per week
- Average analysis response time
- Most common analysis types
- Claude API usage costs

Reports available in dashboard.

---

## 💬 Example Conversations

### Conversation 1: SKU Analysis

**User:** "Which of our top 50 SKUs have the largest forecast error?"

**Claude:**
```
Based on your data:

TOP 5 VARIANCE OFFENDERS:
1. SKU-4521 (industrial valves): -22% variance
2. SKU-3847 (connectors): +18% variance
3. SKU-2104 (pumps): -15% variance
4. SKU-5633 (seals): +12% variance
5. SKU-1892 (gaskets): -11% variance

PATTERN: Items with long lead times (valves, pumps) show 
negative variance (demand > forecast). Items with short lead 
times (connectors, seals) show positive variance (overstock).

RECOMMENDATION:
- Increase safety stock for valves, pumps by 20%
- Reduce procurement for connectors, seals by 15%
- Review forecast methodology for long-lead items
```

### Conversation 2: Risk Alert

**User:** "What's our inventory risk situation for next week?"

**Claude:**
```
CRITICAL ALERTS (Next 7 days):
- SKU-4521 (valves): 3 days inventory remaining
- SKU-2104 (pumps): 5 days inventory remaining

WARNING ALERTS (Next 14 days):
- SKU-3847 (connectors): 12 days inventory
- SKU-5633 (seals): 10 days inventory

RECOMMENDATIONS:
1. URGENT: Expedite valves order (lead time 21 days)
2. URGENT: Fast-track pumps production
3. Monitor connector inventory daily
4. Consider overtime for seal production

PRODUCTION PLAN IMPACT:
- Recommend producing 250 units of valves this week
- Skip connector production; use existing stock
```

---

## 📞 Support & Troubleshooting

### "Claude doesn't know my data"

**Solution:** Provide more context in question. Example:

❌ "Which SKUs are at risk?"
✅ "Based on our current inventory levels (as of April 18) and our 7-week production forecast, which of our 490 SKUs are at risk of stockout?"

### "Analysis seems wrong"

**Solution:** Check data recency. Ask Claude to:
- Validate assumptions
- Show calculation breakdown
- Compare to your manual analysis

### "Power BI not connecting"

**Solution:** Verify in Supabase:
- `power_bi_workspace_id` is set
- `power_bi_report_ids` array populated
- Power BI credentials valid

---

## 🎓 Training

### For Videndum Planning Team

1. **Week 1:** Explore templates, understand Claude's analysis style
2. **Week 2:** Start using for daily risk monitoring
3. **Week 3:** Integrate into weekly SI&OP meeting
4. **Week 4:** Custom use cases and advanced prompting

Estimated ramp-up: 4-6 hours of training

---

## 📋 Pricing & Activation

| Plan | Cost | Features | Best for |
|------|------|----------|----------|
| Pro | $99/mo | 100 analyses/month, 1 weekly report | Videndum (recommended) |
| Enterprise | Custom | Unlimited analyses, custom reports | Future scaling |

**Recommendation:** Start with Pro plan, upgrade to Enterprise if >100 analyses/month.

---

## ✅ Activation Checklist

- [ ] Supabase schema deployed (`advanced_analytics_*` tables)
- [ ] `.env.local` configured with Anthropic API key
- [ ] Subscription activated in database
- [ ] Videndum team notified of new feature
- [ ] Training session scheduled
- [ ] Templates reviewed with planning team
- [ ] First analysis test completed
- [ ] Weekly report template created
- [ ] Integration with SI&OP meeting planned
- [ ] Success metrics defined (time saved, decisions improved)

---

## 🔮 Future Enhancements

**Phase 2:**
- Email delivery of weekly reports
- Automated alerts (risk thresholds)
- Slack integration for notifications

**Phase 3:**
- Custom ML forecast models trained on Videndum data
- Recommendation engine for production scheduling
- Component shortage prediction

**Phase 4:**
- IFS ERP integration (auto-sync forecast)
- Real-time inventory tracking
- Demand sensing from customer orders

---

*Document version: 1.0*  
*Last updated: 2026-04-18*  
*Contact: support@stratoscore.com*
