import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/firebaseConfig';
import { getCategoryMeta } from '../../assets/categoryConfig';
import { useExpenses, clearExpensesSession, hasExpensesSession } from '../../hooks/useExpenses';
import { useAuthUser, clearAuthSession } from '../../hooks/useAuthUser';
import { useExpenseModal } from '../../hooks/useExpenseModal';
import { formatMoney } from '../../utils/formatMoney';
import {
  buildMonthFilterOptions,
  buildTrendChartData,
  getMonthOptionLabel,
} from '../../utils/monthAnalytics';
import TopBar from '../../components/common/TopBar';
import BottomNav from '../../components/common/BottomNav';
import FabButton from '../../components/common/FabButton';
import PageSkeleton from '../../components/common/PageSkeleton';
import EmptyState from '../../components/common/EmptyState';
import AnalysisSummary from '../../components/analytics/AnalysisSummary';
import MetricCardGrid from '../../components/common/MetricCardGrid';
import MonthlyTrends from '../../components/analytics/MonthlyTrends';
import CategoryBreakdown from '../../components/analytics/CategoryBreakdown';
import TransactionModal from '../../components/common/TransactionModal';
import { TransactionRows } from '../../components/common/TransactionList';
import ExpenseSearchBar from '../../components/expenses/ExpenseSearchBar';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';
import './style.css';

const AnalysisView = ({ dark, toggleDark }) => {
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { user, contactId, loadingAuth, resetSession } = useAuthUser(navigate);
  const {
    expenses,
    categories,
    loading: loadingExpenses,
    setCategories,
    loadData,
  } = useExpenses();
  const { toast, showToast } = useToast();

  const {
    isModalOpen,
    editingId,
    formData,
    setFormData,
    saveError,
    clearSaveError,
    deleteTarget,
    saving,
    deleting,
    modalFeedback,
    deleteFeedback,
    openAddModal,
    closeModal,
    openEditModal,
    handleSubmit,
    requestDelete,
    closeDeleteDialog,
    confirmDelete,
  } = useExpenseModal({
    contactId,
    categories,
    setCategories,
    expenses,
    loadData,
    showToast,
  });

  useEffect(() => {
    if (!contactId || loadingAuth) return;
    (async () => {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      await loadData(token, { showLoading: !hasExpensesSession() });
    })();
  }, [contactId, loadingAuth, loadData]);

  const handleLogout = () => {
    clearExpensesSession();
    clearAuthSession();
    resetSession();
    auth.signOut();
  };

  const processed = useMemo(() => expenses.map((exp) => {
    const d = new Date(exp.Date__c);
    return {
      ...exp,
      Category__c: exp.Category__c || 'Other',
      amount: Number(exp.Amount__c) || 0,
      monthKey: `${d.getMonth() + 1}/${d.getFullYear()}`,
      monthLabel: d.toLocaleString('en-US', { month: 'short' }),
    };
  }), [expenses]);

  const kpis = useMemo(() => {
    const now = new Date();
    const thisMonth = processed.filter((e) => {
      const d = new Date(e.Date__c);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const lastMonth = processed.filter((e) => {
      const d = new Date(e.Date__c);
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
    });
    const sum = (arr) => arr.reduce((s, e) => s + e.amount, 0);
    const thisTotal = sum(thisMonth);
    const lastTotal = sum(lastMonth);
    const diff = lastTotal > 0 ? Math.round(((thisTotal - lastTotal) / lastTotal) * 100) : 0;

    const catMap = {};
    processed.forEach((e) => {
      catMap[e.Category__c] = (catMap[e.Category__c] || 0) + e.amount;
    });
    const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];

    const avg = processed.length
      ? Math.round(sum(processed) / new Set(processed.map((e) => e.monthKey)).size)
      : 0;

    return [
      {
        label: 'Current Month',
        value: formatMoney(thisTotal),
        sub: diff === 0 ? 'Stable vs last month' : `${diff > 0 ? '+' : ''}${diff}% vs last month`,
        subTone: diff > 0 ? 'positive' : diff < 0 ? 'negative' : undefined,
        color: '#6366f1',
        pct: 70,
        delay: '.05s',
      },
      {
        label: 'Last Month',
        value: formatMoney(lastTotal),
        sub: 'Previous period',
        color: '#a78bfa',
        pct: 50,
        delay: '.1s',
      },
      {
        label: 'Top Category',
        value: topCat ? getCategoryMeta(topCat[0]).label : '—',
        sub: topCat ? formatMoney(topCat[1]) : '',
        color: topCat ? getCategoryMeta(topCat[0]).color : '#64748b',
        pct: 80,
        delay: '.15s',
      },
      {
        label: 'Monthly Average',
        value: formatMoney(avg),
        sub: `${processed.length} total entries`,
        color: '#10b981',
        pct: 60,
        delay: '.2s',
      },
    ];
  }, [processed]);

  const barData = useMemo(() => buildTrendChartData(processed), [processed]);
  const monthFilterOptions = useMemo(() => buildMonthFilterOptions(processed), [processed]);

  const { donutSegments } = useMemo(() => {
    const totals = {};
    let total = 0;
    processed.forEach((e) => {
      if (filterMonth === 'All' || e.monthKey === filterMonth) {
        totals[e.Category__c] = (totals[e.Category__c] || 0) + e.amount;
        total += e.amount;
      }
    });
    const segs = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([name, val]) => {
        const meta = getCategoryMeta(name);
        return {
          name,
          label: meta.label,
          val,
          percent: total > 0 ? (val / total) * 100 : 0,
          color: meta.color,
          light: meta.light,
        };
      });
    return { donutSegments: segs };
  }, [processed, filterMonth]);

  const filteredList = useMemo(() => processed
    .filter((e) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || e.Name.toLowerCase().includes(q);
      return matchesSearch
        && (filterMonth === 'All' || e.monthKey === filterMonth)
        && (filterCategory === 'All' || e.Category__c === filterCategory);
    })
    .sort((a, b) => new Date(b.Date__c) - new Date(a.Date__c)),
  [processed, filterMonth, filterCategory, searchQuery]);

  const periodTotal = useMemo(() => {
    const source = filterMonth === 'All' ? processed : processed.filter((e) => e.monthKey === filterMonth);
    return source.reduce((sum, e) => sum + e.amount, 0);
  }, [processed, filterMonth]);

  const periodEntryCount = useMemo(() => {
    const source = filterMonth === 'All' ? processed : processed.filter((e) => e.monthKey === filterMonth);
    return source.length;
  }, [processed, filterMonth]);

  const periodLabel = useMemo(() => {
    if (filterMonth === 'All') return 'All time';
    return getMonthOptionLabel(monthFilterOptions, filterMonth) ?? filterMonth;
  }, [filterMonth, monthFilterOptions]);

  const isFiltered = filterMonth !== 'All' || filterCategory !== 'All' || Boolean(searchQuery.trim());

  const clearTransactionFilters = () => {
    setFilterMonth('All');
    setFilterCategory('All');
    setSearchQuery('');
  };

  if (loadingAuth || (loadingExpenses && expenses.length === 0)) {
    return <PageSkeleton variant="analysis" />;
  }

  return (
    <div className="av-page app-page-shell page-enter">
      <TopBar
        user={user}
        dark={dark}
        toggleDark={toggleDark}
        onLogout={handleLogout}
        onNavigateHome={() => navigate('/')}
      />

      <div className="av-toolbar av-toolbar-desktop-only">
        <button type="button" className="et-btn et-btn-accent" onClick={openAddModal}>
          Add expense
        </button>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        categories={categories.length ? categories : ['Other']}
        onClose={closeModal}
        onSubmit={handleSubmit}
        saving={saving}
        feedbackTone={modalFeedback}
        saveError={saveError}
        onDismissError={clearSaveError}
      />

      <AnalysisSummary
        periodLabel={periodLabel}
        periodTotal={formatMoney(periodTotal)}
        entryCount={periodEntryCount}
        filterMonth={filterMonth}
        filterCategory={filterCategory}
        onClearMonth={() => setFilterMonth('All')}
        onClearCategory={() => setFilterCategory('All')}
        onClearAll={() => {
          setFilterMonth('All');
          setFilterCategory('All');
        }}
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
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterMonthLabel={periodLabel}
      />

      <ExpenseSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterCategory={filterCategory}
        onCategoryChange={setFilterCategory}
        categories={categories.length ? categories : ['Other']}
        resultCount={filteredList.length}
        totalCount={processed.length}
        onClearAll={clearTransactionFilters}
      />

      <div className="av-card av-card--transactions" style={{ animationDelay: '.26s' }}>
        {filteredList.length === 0 ? (
          <EmptyState
            title={isFiltered ? 'No matching transactions' : 'No transactions yet'}
            description={isFiltered ? 'Try a different search or category filter.' : 'Add your first expense to see analysis here.'}
            actionLabel={isFiltered ? 'Clear filters' : 'Add expense'}
            onAction={isFiltered ? clearTransactionFilters : openAddModal}
            icon="chart"
          />
        ) : (
          <TransactionRows
            items={filteredList}
            onEdit={openEditModal}
            onDelete={requestDelete}
          />
        )}
      </div>

      <FabButton onClick={openAddModal} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete transaction?"
        message="This action cannot be undone."
        itemName={deleteTarget?.name}
        itemAmount={deleteTarget?.amount}
        itemCategory={deleteTarget?.category}
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={confirmDelete}
        onCancel={closeDeleteDialog}
        confirming={deleting}
        feedbackTone={deleteFeedback}
      />
      <Toast message={toast.message} visible={toast.visible} type={toast.type} />
      <BottomNav />
    </div>
  );
};

export default AnalysisView;
