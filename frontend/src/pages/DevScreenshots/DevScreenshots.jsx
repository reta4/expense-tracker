import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCategoryMeta } from '../../assets/categoryConfig';
import { formatMoney } from '../../utils/formatMoney';
import { buildMonthFilterOptions, buildTrendChartData } from '../../utils/monthAnalytics';
import { MOCK_CATEGORIES, MOCK_EXPENSES, MOCK_USER } from '../../dev/mockExpenses';
import TopBar from '../../components/common/TopBar';
import BottomNav from '../../components/common/BottomNav';
import FabButton from '../../components/common/FabButton';
import LoadingScreen from '../../components/common/LoadingScreen';
import Toast from '../../components/common/Toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import MonthlyHero from '../../components/expenses/MonthlyHero';
import MetricCardGrid from '../../components/common/MetricCardGrid';
import ExpenseSearchBar from '../../components/expenses/ExpenseSearchBar';
import TransactionColumn, { TransactionRows } from '../../components/common/TransactionList';
import TransactionModal from '../../components/common/TransactionModal';
import AnalysisSummary from '../../components/analytics/AnalysisSummary';
import MonthlyTrends from '../../components/analytics/MonthlyTrends';
import CategoryBreakdown from '../../components/analytics/CategoryBreakdown';
import '../../pages/Home/styles.css';
import '../../pages/AnalysisView/style.css';

const noop = () => {};

const DevScreenshots = ({ dark, toggleDark }) => {
  const [params] = useSearchParams();
  const view = params.get('view') || 'home';
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(view === 'home-empty' ? 'no-match' : '');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterCategoryAnalysis, setFilterCategoryAnalysis] = useState(view === 'analysis-filter' ? 'Food' : 'All');
  const [analysisSearchQuery, setAnalysisSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(view === 'analysis-modal');
  const [confirmOpen, setConfirmOpen] = useState(view === 'feedback');
  const [toastVisible] = useState(view === 'feedback');
  const [isHomeModalOpen, setIsHomeModalOpen] = useState(view === 'home-edit');

  const editingId = view === 'home-edit' ? '1' : null;
  const editExpense = MOCK_EXPENSES[0];

  const summaryData = useMemo(() => [
    { label: 'This month', value: formatMoney(360), sub: '4 transactions', color: '#6366f1', pct: 72 },
    { label: 'Upcoming', value: formatMoney(450), sub: '1 planned', color: '#8b5cf6', pct: 28 },
    { label: 'Top category', value: 'Food', sub: '42% of spending', color: '#6366f1', pct: 42 },
    { label: 'Total expenses', value: 6, sub: '5 past · 1 future', color: '#10b981', pct: 83 },
  ], []);

  const processed = useMemo(() => MOCK_EXPENSES.map((exp) => {
    const d = new Date(exp.Date__c);
    return {
      ...exp,
      amount: Number(exp.Amount__c),
      monthKey: `${d.getMonth() + 1}/${d.getFullYear()}`,
      monthLabel: d.toLocaleString('en-US', { month: 'short' }),
    };
  }), []);

  const kpis = useMemo(() => [
    { label: 'Current Month', value: formatMoney(360), sub: '+12% vs last month', color: '#6366f1', pct: 85, delay: '.05s' },
    { label: 'Last Month', value: formatMoney(320), sub: 'Previous period', color: '#8b5cf6', pct: 75, delay: '.1s' },
    { label: 'Top Category', value: 'Food', sub: formatMoney(153), color: '#6366f1', pct: 60, delay: '.15s' },
    { label: 'Monthly Average', value: formatMoney(340), sub: '6 total entries', color: '#10b981', pct: 70, delay: '.2s' },
  ], []);

  const barData = useMemo(() => buildTrendChartData(processed), [processed]);
  const monthFilterOptions = useMemo(() => buildMonthFilterOptions(processed), [processed]);

  const donutSegments = useMemo(() => {
    const totals = {};
    let total = 0;
    processed.forEach((e) => {
      totals[e.Category__c] = (totals[e.Category__c] || 0) + e.amount;
      total += e.amount;
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([name, val]) => {
      const meta = getCategoryMeta(name);
      return { name, label: meta.label, val, percent: (val / total) * 100, color: meta.color, light: meta.light };
    });
  }, [processed]);

  const filteredList = processed.filter((e) => {
    const q = analysisSearchQuery.trim().toLowerCase();
    const matchesSearch = !q || e.Name.toLowerCase().includes(q);
    return matchesSearch && (filterCategoryAnalysis === 'All' || e.Category__c === filterCategoryAnalysis);
  });

  const currentExpenses = processed.filter((e) => new Date(e.Date__c) <= new Date());
  const futureExpenses = processed.filter((e) => new Date(e.Date__c) > new Date());

  const filterList = (list) => list.filter((exp) => {
    const q = searchQuery.trim().toLowerCase();
    return (!q || exp.Name.toLowerCase().includes(q))
      && (filterCategory === 'All' || exp.Category__c === filterCategory);
  });

  const filteredCurrent = filterList(currentExpenses);
  const filteredFuture = filterList(futureExpenses);

  if (view === 'loading') {
    return <LoadingScreen message="Loading your expenses..." />;
  }

  if (view.startsWith('analysis')) {
    return (
      <div className="av-page app-page-shell page-enter">
        <TopBar user={MOCK_USER} dark={dark} toggleDark={toggleDark} onLogout={noop} onNavigateHome={() => navigate('/dev/screenshot?view=home')} />
        <div className="av-toolbar av-toolbar-desktop-only">
          <button type="button" className="et-btn et-btn-accent" onClick={() => setIsModalOpen(true)}>Add expense</button>
        </div>
        <TransactionModal
          isOpen={isModalOpen}
          editingId={null}
          formData={{
            Name: '', Amount__c: '', Category__c: 'Food', Date__c: '2026-06-16', Is_Recurring__c: false,
          }}
          setFormData={noop}
          categories={MOCK_CATEGORIES}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(e) => e.preventDefault()}
        />
        <AnalysisSummary
          periodLabel="All time"
          periodTotal={formatMoney(810)}
          entryCount={6}
          filterMonth={filterMonth}
          filterCategory={filterCategoryAnalysis}
          onClearMonth={() => setFilterMonth('All')}
          onClearCategory={() => setFilterCategoryAnalysis('All')}
          onClearAll={() => { setFilterMonth('All'); setFilterCategoryAnalysis('All'); }}
        />
        <MetricCardGrid metrics={kpis} className="av-metric-grid" />
        <MonthlyTrends
          barData={barData}
          monthFilterOptions={monthFilterOptions}
          filterMonth={filterMonth}
          setFilterMonth={setFilterMonth}
        />
        <CategoryBreakdown
          donutSegments={donutSegments}
          filterCategory={filterCategoryAnalysis}
          setFilterCategory={setFilterCategoryAnalysis}
          filterMonthLabel={filterMonth === 'All' ? 'All time' : monthFilterOptions.all.find((o) => o.key === filterMonth)?.label ?? filterMonth}
        />
        <ExpenseSearchBar
          searchQuery={analysisSearchQuery}
          onSearchChange={setAnalysisSearchQuery}
          filterCategory={filterCategoryAnalysis}
          onCategoryChange={setFilterCategoryAnalysis}
          categories={MOCK_CATEGORIES}
          resultCount={filteredList.length}
          totalCount={processed.length}
          onClearAll={() => { setAnalysisSearchQuery(''); setFilterCategoryAnalysis('All'); }}
        />
        <div className="av-card av-card--transactions">
          <TransactionRows items={filteredList} onEdit={noop} onDelete={noop} />
        </div>
        <FabButton onClick={() => setIsModalOpen(true)} />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="et-page app-page-shell page-enter">
      <TopBar user={MOCK_USER} dark={dark} toggleDark={toggleDark} onLogout={noop} onNavigateAnalysis={() => navigate('/dev/screenshot?view=analysis')} />
      <MonthlyHero monthLabel="June 2026" total={360} transactionCount={4} trendLabel="+12% vs last month" onAddClick={noop} />
      <MetricCardGrid metrics={summaryData} />
      <ExpenseSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterCategory={filterCategory}
        onCategoryChange={setFilterCategory}
        categories={MOCK_CATEGORIES}
        resultCount={filteredCurrent.length + filteredFuture.length}
        totalCount={MOCK_EXPENSES.length}
        onClearAll={() => { setSearchQuery(''); setFilterCategory('All'); }}
      />
      <TransactionModal
        isOpen={isHomeModalOpen}
        editingId={editingId}
        formData={editingId ? {
          Name: editExpense.Name,
          Amount__c: editExpense.Amount__c,
          Category__c: editExpense.Category__c,
          Date__c: editExpense.Date__c,
          Is_Recurring__c: editExpense.Is_Recurring__c,
        } : {
          Name: '', Amount__c: '', Category__c: 'Food', Date__c: '2026-06-16', Is_Recurring__c: false,
        }}
        setFormData={noop}
        categories={MOCK_CATEGORIES}
        onClose={() => setIsHomeModalOpen(false)}
        onSubmit={(e) => e.preventDefault()}
      />
      <div className="et-cols">
        <TransactionColumn
          title="Current expenses"
          badge={<span className="et-badge">{filteredCurrent.length}</span>}
          total={formatMoney(filteredCurrent.reduce((s, e) => s + e.Amount__c, 0))}
          items={filteredCurrent}
          onEdit={noop}
          onDelete={noop}
          isFiltered={Boolean(searchQuery.trim())}
        />
        <TransactionColumn
          title="Upcoming"
          badge={<span className="et-badge et-badge-up">{filteredFuture.length}</span>}
          total={formatMoney(filteredFuture.reduce((s, e) => s + e.Amount__c, 0))}
          items={filteredFuture}
          onEdit={noop}
          onDelete={noop}
        />
      </div>
      <FabButton onClick={() => setIsHomeModalOpen(true)} />
      <Toast message="Transaction added successfully" visible={toastVisible} type="success" />
      <ConfirmDialog open={confirmOpen} title="Delete transaction?" message="This action cannot be undone." confirmLabel="Delete" cancelLabel="Keep" onConfirm={noop} onCancel={noop} />
      <BottomNav />
    </div>
  );
};

export default DevScreenshots;
