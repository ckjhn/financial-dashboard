/**
 * FinanceAI — Rule-based Financial Intelligence Engine
 * No external API dependencies. Pure algorithmic analysis.
 * v2.0
 */

class FinanceAI {
  constructor() {
    this.name = "ARIA";
    this.version = "2.0";
    this.thresholds = {
      subscriptionWarning: 0.15,
      subscriptionDanger: 0.30,
      savingsHealthy: 0.20,
      investmentMin: 0.10,
      emergencyMonths: 6,
      debtIncomeRatio: 0.36,
    };
    this.sentimentKeywords = {
      positive: ["salário", "receita", "renda", "investimento", "lucro", "retorno", "economia", "salary", "income", "profit", "return", "savings"],
      negative: ["despesa", "gasto", "dívida", "perda", "multa", "juros", "expense", "debt", "loss", "fee", "interest"],
    };
  }

  // ─── CORE ANALYSIS ───
  analyzeFinancialHealth(data) {
    const { totalBalance, monthlyIncome, monthlyExpenses, subscriptions, allocations, transactions, goals, investments } = data;
    const score = this._calculateHealthScore(data);
    const insights = this._generateInsights(data);
    const warnings = this._generateWarnings(data);
    const suggestions = this._generateSuggestions(data);
    const forecast = this._generateForecast(data);
    const subscriptionAnalysis = this._analyzeSubscriptions(subscriptions, monthlyIncome);
    const allocationAnalysis = this._analyzeAllocations(allocations);
    const investmentAnalysis = this._analyzeInvestments(investments);
    const goalAnalysis = this._analyzeGoals(goals, data);

    return {
      score,
      grade: this._scoreToGrade(score),
      insights,
      warnings,
      suggestions,
      forecast,
      subscriptionAnalysis,
      allocationAnalysis,
      investmentAnalysis,
      goalAnalysis,
      summary: this._buildSummary(score, insights, warnings),
      timestamp: new Date().toISOString(),
    };
  }

  // ─── HEALTH SCORE (0-100) ───
  _calculateHealthScore(data) {
    let score = 50;
    const { totalBalance, monthlyIncome, monthlyExpenses, subscriptions, allocations, investments } = data;

    if (monthlyIncome <= 0) return 20;

    const savingsRate = (monthlyIncome - monthlyExpenses) / monthlyIncome;
    if (savingsRate >= 0.30) score += 20;
    else if (savingsRate >= 0.20) score += 15;
    else if (savingsRate >= 0.10) score += 8;
    else if (savingsRate >= 0) score += 2;
    else score -= 20;

    const subTotal = this._totalMonthlySubscriptions(subscriptions);
    const subRatio = monthlyIncome > 0 ? subTotal / monthlyIncome : 0;
    if (subRatio < 0.05) score += 10;
    else if (subRatio < 0.15) score += 5;
    else if (subRatio > 0.30) score -= 15;
    else if (subRatio > 0.20) score -= 8;

    const emergencyMonths = monthlyExpenses > 0 ? totalBalance / monthlyExpenses : 0;
    if (emergencyMonths >= 12) score += 15;
    else if (emergencyMonths >= 6) score += 10;
    else if (emergencyMonths >= 3) score += 5;
    else score -= 10;

    if (allocations && allocations.length > 0) {
      const totalPct = allocations.reduce((s, a) => s + a.percentage, 0);
      if (Math.abs(totalPct - 100) < 1) score += 5;
      const hasInvest = allocations.some(a => a.name.toLowerCase().includes("invest") || a.percentage >= 30);
      if (hasInvest) score += 5;
    }

    if (investments && investments.length > 0) score += 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  _scoreToGrade(score) {
    if (score >= 90) return { letter: "A+", label: "Excelente", color: "#00ff88" };
    if (score >= 80) return { letter: "A", label: "Ótimo", color: "#00dd66" };
    if (score >= 70) return { letter: "B+", label: "Bom", color: "#88dd00" };
    if (score >= 60) return { letter: "B", label: "Adequado", color: "#cccc00" };
    if (score >= 50) return { letter: "C", label: "Regular", color: "#ffaa00" };
    if (score >= 40) return { letter: "D", label: "Atenção", color: "#ff6600" };
    return { letter: "F", label: "Crítico", color: "#ff2244" };
  }

  // ─── INSIGHTS ───
  _generateInsights(data) {
    const insights = [];
    const { totalBalance, monthlyIncome, monthlyExpenses, transactions } = data;

    if (monthlyIncome > 0) {
      const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1);
      insights.push({
        type: savingsRate >= 20 ? "positive" : savingsRate >= 0 ? "neutral" : "negative",
        icon: savingsRate >= 20 ? "📈" : savingsRate >= 0 ? "📊" : "📉",
        title: "Taxa de Poupança",
        text: `Sua taxa de poupança atual é de ${savingsRate}%. ${savingsRate >= 20 ? "Excelente! Você está acima da recomendação de 20%." : savingsRate >= 10 ? "Bom, mas tente alcançar 20% para uma saúde financeira ideal." : "Atenção: tente reduzir despesas para poupar pelo menos 20% da renda."}`,
      });
    }

    if (monthlyExpenses > 0) {
      const runway = (totalBalance / monthlyExpenses).toFixed(1);
      insights.push({
        type: runway >= 6 ? "positive" : runway >= 3 ? "neutral" : "negative",
        icon: "🛡️",
        title: "Reserva de Emergência",
        text: `Seu saldo atual cobre ${runway} meses de despesas. ${runway >= 6 ? "Sua reserva de emergência está saudável." : "Recomenda-se ter pelo menos 6 meses de despesas como reserva."}`,
      });
    }

    if (transactions && transactions.length >= 5) {
      const recent = transactions.slice(-10);
      const expenses = recent.filter(t => t.type === "expense");
      const avgExpense = expenses.length > 0 ? expenses.reduce((s, t) => s + t.amount, 0) / expenses.length : 0;
      if (avgExpense > 0) {
        insights.push({
          type: "info",
          icon: "🔍",
          title: "Padrão de Gastos",
          text: `Suas últimas ${expenses.length} despesas tiveram média de ${this._formatCurrency(avgExpense)}. Monitore padrões para identificar oportunidades de economia.`,
        });
      }
    }

    return insights;
  }

  // ─── WARNINGS ───
  _generateWarnings(data) {
    const warnings = [];
    const { totalBalance, monthlyIncome, monthlyExpenses, subscriptions } = data;

    if (monthlyExpenses > monthlyIncome && monthlyIncome > 0) {
      warnings.push({
        severity: "high",
        icon: "🚨",
        title: "Gastos Excedem Renda",
        text: `Suas despesas (${this._formatCurrency(monthlyExpenses)}) superam sua renda (${this._formatCurrency(monthlyIncome)}) em ${this._formatCurrency(monthlyExpenses - monthlyIncome)}.`,
      });
    }

    const subTotal = this._totalMonthlySubscriptions(subscriptions);
    if (monthlyIncome > 0 && subTotal / monthlyIncome > this.thresholds.subscriptionWarning) {
      const pct = (subTotal / monthlyIncome * 100).toFixed(1);
      warnings.push({
        severity: subTotal / monthlyIncome > this.thresholds.subscriptionDanger ? "high" : "medium",
        icon: "⚠️",
        title: "Assinaturas Elevadas",
        text: `Suas assinaturas representam ${pct}% da sua renda mensal. Revise quais são essenciais.`,
      });
    }

    if (totalBalance < 0) {
      warnings.push({
        severity: "critical",
        icon: "🔴",
        title: "Saldo Negativo",
        text: `Seu saldo está negativo (${this._formatCurrency(totalBalance)}). Ação imediata necessária.`,
      });
    }

    return warnings;
  }

  // ─── SUGGESTIONS ───
  _generateSuggestions(data) {
    const suggestions = [];
    const { monthlyIncome, monthlyExpenses, subscriptions, allocations, investments, goals } = data;

    const subTotal = this._totalMonthlySubscriptions(subscriptions);
    if (subscriptions && subscriptions.length > 3) {
      const annuals = subscriptions.filter(s => s.billing === "annual");
      if (annuals.length === 0) {
        suggestions.push({
          icon: "💡",
          title: "Converta para Planos Anuais",
          text: "Considere migrar assinaturas frequentes para planos anuais. A maioria oferece 15-20% de desconto.",
          impact: "medium",
        });
      }
    }

    if (!allocations || allocations.length === 0) {
      suggestions.push({
        icon: "📋",
        title: "Crie Alocações",
        text: "Configure alocações para organizar automaticamente sua renda. Sugestão: Necessidades (50%), Desejos (30%), Investimentos (20%).",
        impact: "high",
      });
    }

    if (!investments || investments.length === 0) {
      suggestions.push({
        icon: "📈",
        title: "Comece a Investir",
        text: "Você ainda não registrou investimentos. Mesmo pequenos valores investidos regularmente podem gerar resultados significativos com juros compostos.",
        impact: "high",
      });
    }

    if (monthlyIncome > 0 && (monthlyIncome - monthlyExpenses) / monthlyIncome < 0.10) {
      suggestions.push({
        icon: "✂️",
        title: "Reduza Gastos Não Essenciais",
        text: `Sua margem é apertada. Revise despesas para liberar pelo menos 10% da renda para poupança.`,
        impact: "high",
      });
    }

    if (!goals || goals.length === 0) {
      suggestions.push({
        icon: "🎯",
        title: "Defina Metas Financeiras",
        text: "Ter metas claras aumenta em até 42% a chance de alcançar objetivos financeiros. Crie suas primeiras metas!",
        impact: "medium",
      });
    }

    return suggestions;
  }

  // ─── FORECAST ───
  _generateForecast(data) {
    const { totalBalance, monthlyIncome, monthlyExpenses } = data;
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const months = [1, 3, 6, 12, 24, 60];
    const scenarios = {
      pessimistic: { label: "Pessimista", growthRate: -0.02, expenseGrowth: 0.05 },
      realistic: { label: "Realista", growthRate: 0.005, expenseGrowth: 0.02 },
      optimistic: { label: "Otimista", growthRate: 0.02, expenseGrowth: 0.01 },
    };

    const forecast = {};
    for (const [key, scenario] of Object.entries(scenarios)) {
      forecast[key] = {
        label: scenario.label,
        projections: months.map(m => {
          let balance = totalBalance;
          let income = monthlyIncome;
          let expenses = monthlyExpenses;
          for (let i = 0; i < m; i++) {
            income *= (1 + scenario.growthRate / 12);
            expenses *= (1 + scenario.expenseGrowth / 12);
            balance += (income - expenses);
          }
          return { month: m, balance: Math.round(balance * 100) / 100, income: Math.round(income * 100) / 100, expenses: Math.round(expenses * 100) / 100 };
        }),
      };
    }

    return forecast;
  }

  // ─── SUBSCRIPTIONS ───
  _analyzeSubscriptions(subscriptions, monthlyIncome) {
    if (!subscriptions || subscriptions.length === 0) return { total: 0, ratio: 0, insights: [] };
    const total = this._totalMonthlySubscriptions(subscriptions);
    const ratio = monthlyIncome > 0 ? total / monthlyIncome : 0;
    const sorted = [...subscriptions].sort((a, b) => {
      const am = a.billing === "annual" ? a.amount / 12 : a.amount;
      const bm = b.billing === "annual" ? b.amount / 12 : b.amount;
      return bm - am;
    });
    const insights = [];
    if (sorted.length > 0) {
      const top = sorted[0];
      const topMonthly = top.billing === "annual" ? top.amount / 12 : top.amount;
      insights.push(`A assinatura mais cara é "${top.name}" (${this._formatCurrency(topMonthly)}/mês).`);
    }
    if (ratio > 0.15) {
      insights.push(`Assinaturas consomem ${(ratio * 100).toFixed(1)}% da renda. Considere revisar.`);
    }
    return { total, ratio, sorted, insights };
  }

  // ─── ALLOCATIONS ───
  _analyzeAllocations(allocations) {
    if (!allocations || allocations.length === 0) return { balanced: false, insights: [] };
    const totalPct = allocations.reduce((s, a) => s + a.percentage, 0);
    const insights = [];
    if (Math.abs(totalPct - 100) > 1) {
      insights.push(`As alocações totalizam ${totalPct.toFixed(1)}%. Ajuste para 100% para uma distribuição completa.`);
    }
    const hasEmergency = allocations.some(a => /reserva|emerg|segur/i.test(a.name));
    if (!hasEmergency) {
      insights.push("Considere criar uma alocação específica para reserva de emergência.");
    }
    return { balanced: Math.abs(totalPct - 100) < 1, totalPct, insights };
  }

  // ─── INVESTMENTS ───
  _analyzeInvestments(investments) {
    if (!investments || investments.length === 0) return { total: 0, insights: ["Nenhum investimento registrado."] };
    const total = investments.reduce((s, i) => s + (i.currentValue || i.amount || 0), 0);
    const totalInvested = investments.reduce((s, i) => s + (i.amount || 0), 0);
    const overallReturn = totalInvested > 0 ? ((total - totalInvested) / totalInvested * 100).toFixed(2) : 0;
    const insights = [];
    insights.push(`Patrimônio investido: ${this._formatCurrency(total)} (retorno geral: ${overallReturn}%).`);

    const categories = {};
    investments.forEach(i => {
      const cat = i.category || "Outros";
      categories[cat] = (categories[cat] || 0) + (i.currentValue || i.amount || 0);
    });
    const cats = Object.entries(categories);
    if (cats.length === 1) {
      insights.push("Diversifique! Todos os investimentos estão em uma única categoria.");
    }
    return { total, totalInvested, overallReturn, categories, insights };
  }

  // ─── GOALS ───
  _analyzeGoals(goals, data) {
    if (!goals || goals.length === 0) return { insights: [] };
    const insights = [];
    const monthlySavings = data.monthlyIncome - data.monthlyExpenses;
    goals.forEach(g => {
      const remaining = g.targetAmount - (g.currentAmount || 0);
      if (remaining <= 0) {
        insights.push({ goal: g.name, status: "completed", text: `Meta "${g.name}" atingida! 🎉` });
      } else if (monthlySavings > 0) {
        const monthsNeeded = Math.ceil(remaining / monthlySavings);
        insights.push({
          goal: g.name,
          status: monthsNeeded <= 6 ? "on_track" : "long_term",
          text: `"${g.name}": faltam ${this._formatCurrency(remaining)}. No ritmo atual, ~${monthsNeeded} meses.`,
        });
      } else {
        insights.push({
          goal: g.name,
          status: "at_risk",
          text: `"${g.name}": sem margem mensal para alcançar esta meta. Revise despesas.`,
        });
      }
    });
    return { insights };
  }

  // ─── CHAT ───
  chat(message, data) {
    const lower = message.toLowerCase();
    const responses = [];

    if (/saúde|health|score|nota/i.test(lower)) {
      const analysis = this.analyzeFinancialHealth(data);
      responses.push(`📊 **Saúde Financeira: ${analysis.grade.letter} (${analysis.score}/100) — ${analysis.grade.label}**`);
      analysis.insights.forEach(i => responses.push(`${i.icon} ${i.text}`));
      if (analysis.warnings.length) {
        responses.push("---");
        analysis.warnings.forEach(w => responses.push(`${w.icon} ${w.text}`));
      }
    } else if (/assinatura|subscription|sub/i.test(lower)) {
      const sa = this._analyzeSubscriptions(data.subscriptions, data.monthlyIncome);
      responses.push(`📋 **Assinaturas:** Total mensal de ${this._formatCurrency(sa.total)}`);
      sa.insights.forEach(i => responses.push(`• ${i}`));
    } else if (/investi|invest|carteira|portfolio/i.test(lower)) {
      const ia = this._analyzeInvestments(data.investments);
      responses.push(`💰 **Investimentos**`);
      ia.insights.forEach(i => responses.push(`• ${i}`));
    } else if (/meta|goal|objetivo/i.test(lower)) {
      const ga = this._analyzeGoals(data.goals, data);
      responses.push(`🎯 **Análise de Metas**`);
      ga.insights.forEach(i => responses.push(`• ${i.text}`));
    } else if (/previsão|forecast|futuro|projeção/i.test(lower)) {
      const f = this._generateForecast(data);
      responses.push(`🔮 **Previsão Financeira (12 meses)**`);
      for (const [key, scenario] of Object.entries(f)) {
        const p12 = scenario.projections.find(p => p.month === 12);
        responses.push(`• ${scenario.label}: ${this._formatCurrency(p12.balance)}`);
      }
    } else if (/dica|sugestão|suggest|tip|ajuda|help/i.test(lower)) {
      const analysis = this.analyzeFinancialHealth(data);
      responses.push(`💡 **Sugestões para você:**`);
      analysis.suggestions.forEach(s => responses.push(`${s.icon} **${s.title}**: ${s.text}`));
    } else if (/aloca|alloc/i.test(lower)) {
      const aa = this._analyzeAllocations(data.allocations);
      responses.push(`📋 **Alocações**`);
      aa.insights.forEach(i => responses.push(`• ${i}`));
    } else if (/olá|oi|hey|hi|hello/i.test(lower)) {
      responses.push(`👋 Olá! Eu sou a **ARIA**, sua assistente de inteligência financeira.`);
      responses.push(`Posso analisar: saúde financeira, assinaturas, investimentos, metas, previsões e alocações.`);
      responses.push(`Experimente perguntar: "Como está minha saúde financeira?" ou "Me dê dicas".`);
    } else if (/relat|report|resumo|summary/i.test(lower)) {
      const analysis = this.analyzeFinancialHealth(data);
      responses.push(`📊 **Relatório Financeiro — ${analysis.grade.letter} (${analysis.score}/100)**`);
      responses.push(`💵 Saldo: ${this._formatCurrency(data.totalBalance)}`);
      responses.push(`📈 Renda mensal: ${this._formatCurrency(data.monthlyIncome)}`);
      responses.push(`📉 Despesas: ${this._formatCurrency(data.monthlyExpenses)}`);
      responses.push(`💰 Margem: ${this._formatCurrency(data.monthlyIncome - data.monthlyExpenses)}`);
      if (analysis.warnings.length) {
        responses.push("---");
        responses.push("**⚠️ Alertas:**");
        analysis.warnings.forEach(w => responses.push(`${w.icon} ${w.text}`));
      }
      if (analysis.suggestions.length) {
        responses.push("---");
        responses.push("**💡 Sugestões:**");
        analysis.suggestions.slice(0, 3).forEach(s => responses.push(`${s.icon} ${s.text}`));
      }
    } else {
      responses.push(`🤖 Não entendi completamente, mas posso ajudar com:`);
      responses.push(`• **"saúde financeira"** — nota e análise geral`);
      responses.push(`• **"assinaturas"** — análise das suas assinaturas`);
      responses.push(`• **"investimentos"** — análise da carteira`);
      responses.push(`• **"metas"** — progresso dos objetivos`);
      responses.push(`• **"previsão"** — projeção futura`);
      responses.push(`• **"dicas"** — sugestões personalizadas`);
      responses.push(`• **"relatório"** — resumo completo`);
    }

    return responses.join("\n");
  }

  // ─── SUMMARY ───
  _buildSummary(score, insights, warnings) {
    const parts = [];
    if (score >= 70) parts.push("Sua situação financeira está saudável.");
    else if (score >= 50) parts.push("Sua situação financeira é estável, com pontos de atenção.");
    else parts.push("Sua situação financeira precisa de atenção imediata.");
    if (warnings.length) parts.push(`Existem ${warnings.length} alerta(s) que requerem atenção.`);
    if (insights.length) parts.push(`${insights.filter(i => i.type === "positive").length} indicador(es) positivo(s) identificado(s).`);
    return parts.join(" ");
  }

  // ─── HELPERS ───
  _totalMonthlySubscriptions(subscriptions) {
    if (!subscriptions) return 0;
    return subscriptions.reduce((sum, s) => {
      return sum + (s.billing === "annual" ? s.amount / 12 : s.amount);
    }, 0);
  }

  _formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  }
}

// Export for use
if (typeof module !== "undefined") module.exports = FinanceAI;
