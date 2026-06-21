import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/firebaseConfig';
import { getCategoryMeta } from '../../assets/categoryConfig';
import { useExpenses } from '../../hooks/useExpenses';
import { useAuthUser } from '../../hooks/useAuthUser';
import { useExpenseModal } from '../../hooks/useExpenseModal';
import { formatMoney } from '../../utils/formatMoney';
import TopBar from '../../components/common/TopBar';
import BottomNav from '../../components/common/BottomNav';
import FabButton from '../../components/common/FabButton';
import PageSkeleton from '../../components/common/PageSkeleton';
import MonthlyHero from '../../components/expenses/MonthlyHero';
import MetricCardGrid from '../../components/common/MetricCardGrid';
import ExpenseSearchBar from '../../components/expenses/ExpenseSearchBar';
import TransactionColumn from '../../components/common/TransactionList';
import TransactionModal from '../../components/common/TransactionModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';
import './styles.css';

const Home = ({ dark, toggleDark }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const navigate = useNavigate();
  const dataLoaded = useRef(false);

  const { user, contactId, loadingAuth, resetSession } = useAuthUser(navigate);
  const {
    expenses,
    categories,
    loading: loadingExpenses,
    error: dataError,
    setCategories,
    loadData,
  } = useExpenses();
  const { toast, showToast } = useToast();

  const {
    isModalOpen,
    editingId,
    formData,
    setFormData,
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
    if (!contactId || loadingAuth || dataLoaded.current) return;
    dataLoaded.current = true;
    (async () => {
      const token = await auth.currentUser?.getIdToken();
      if (token) await loadData(token, { showLoading: true });
    })();
  }, [contactId, loadingAuth, loadData]);

  const { currentExpenses, futureExpenses } = useMemo(() => {
    const now = new Date();
    const cur = [];
    const fut = [];
    expenses.forEach((exp) => {
      const dt = new Date(exp.Date__c);
      if (
        dt.getFullYear() < now.getFullYear()
        || (dt.getFullYear() === now.getFullYear() && dt.getMonth() <= now.getMonth())
      ) {
        cur.push(exp);
      } else {
        fut.push(exp);
      }
    });
    const byDate = (a, b) => new Date(b.Date__c) - new Date(a.Date__c);
    return {
      currentExpenses: cur.sort(byDate),
      futureExpenses: fut.sort((a, b) => new Date(a.Date__c) - new Date(b.Date__c)),
    };
  }, [expenses]);

  const monthStats = useMemo(() => {
    const now = new Date();
    const monthLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const thisMonth = currentExpenses.filter((e) => {
      const dt = new Date(e.Date__c);
      return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
    });
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = currentExpenses.filter((e) => {
      const dt = new Date(e.Date__c);
      return dt.getMonth() === lastMonthDate.getMonth() && dt.getFullYear() === lastMonthDate.getFullYear();
    });
    const sum = (arr) => arr.reduce((s, e) => s + Number(e.Amount__c), 0);
    const monthTotal = sum(thisMonth);
    const lastTotal = sum(lastMonth);
    const diff = lastTotal > 0 ? Math.round(((monthTotal - lastTotal) / lastTotal) * 100) : null;

    let trendLabel = null;
    if (thisMonth.length > 0) {
      if (diff === null) trendLabel = 'No comparison data for last month';
      else if (diff === 0) trendLabel = 'Stable vs last month';
      else trendLabel = `${diff > 0 ? '+' : ''}${diff}% vs last month`;
    }

    return { monthLabel, monthTotal, transactionCount: thisMonth.length, trendLabel };
  }, [currentExpenses]);

  const summaryData = useMemo(() => {
    const now = new Date();
    const thisMonth = currentExpenses.filter((e) => {
      const dt = new Date(e.Date__c);
      return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
    });
    const total = (arr) => arr.reduce((s, e) => s + Number(e.Amount__c), 0);
    const allTotal = total([...currentExpenses, ...futureExpenses]);
    const monthTotal = total(thisMonth);
    const upTotal = total(futureExpenses);

    const catMap = {};
    currentExpenses.forEach((e) => {
      catMap[e.Category__c] = (catMap[e.Category__c] || 0) + Number(e.Amount__c);
    });
    const top = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
    const topName = top ? top[0] : '—';
    const topPct = top && allTotal ? Math.round((top[1] / allTotal) * 100) : 0;
    const upPct = allTotal ? Math.round((upTotal / allTotal) * 100) : 0;
    const topCatMeta = getCategoryMeta(topName);

    return [
      { label: 'This month', value: formatMoney(monthTotal), sub: `${thisMonth.length} transactions`, color: '#6366f1', pct: allTotal ? Math.round((monthTotal / allTotal) * 100) : 0 },
      { label: 'Upcoming', value: formatMoney(upTotal), sub: `${futureExpenses.length} planned`, color: '#8b5cf6', pct: upPct },
      { label: 'Top category', value: topCatMeta.label, sub: `${topPct}% of spending`, color: topCatMeta.color, pct: topPct },
      { label: 'All records', value: expenses.length, sub: `${currentExpenses.length} past · ${futureExpenses.length} future`, color: '#10b981', pct: Math.round((currentExpenses.length / (expenses.length || 1)) * 100) },
    ];
  }, [expenses, currentExpenses, futureExpenses]);

  const isFiltered = Boolean(searchQuery.trim()) || filterCategory !== 'All';

  const filterList = useCallback((list) => list.filter((exp) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || exp.Name.toLowerCase().includes(q);
    const matchesCategory = filterCategory === 'All' || exp.Category__c === filterCategory;
    return matchesSearch && matchesCategory;
  }), [searchQuery, filterCategory]);

  const filteredCurrent = useMemo(() => filterList(currentExpenses), [currentExpenses, filterList]);
  const filteredFuture = useMemo(() => filterList(futureExpenses), [futureExpenses, filterList]);
  const resultCount = filteredCurrent.length + filteredFuture.length;

  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('All');
  };

  const handleLogout = () => {
    dataLoaded.current = false;
    resetSession();
    auth.signOut();
  };

  if (loadingAuth || loadingExpenses) {
    return <PageSkeleton variant="home" />;
  }

  const currentTotal = filteredCurrent.reduce((s, e) => s + Number(e.Amount__c), 0);
  const futureTotal = filteredFuture.reduce((s, e) => s + Number(e.Amount__c), 0);

  return (
    <div className="et-page app-page-shell page-enter">
      {dataError && <div className="app-banner-error">{dataError}</div>}

      <TopBar
        user={user}
        dark={dark}
        toggleDark={toggleDark}
        onLogout={handleLogout}
        onNavigateAnalysis={() => navigate('/dashboard')}
      />

      <MonthlyHero
        monthLabel={monthStats.monthLabel}
        total={monthStats.monthTotal}
        transactionCount={monthStats.transactionCount}
        trendLabel={monthStats.trendLabel}
        onAddClick={openAddModal}
      />

      <MetricCardGrid metrics={summaryData} />

      <ExpenseSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterCategory={filterCategory}
        onCategoryChange={setFilterCategory}
        categories={categories}
        resultCount={resultCount}
        totalCount={expenses.length}
        onClearAll={clearFilters}
      />

      <div className="et-cols">
        <TransactionColumn
          title="Current expenses"
          badge={<span className="et-badge">{filteredCurrent.length}</span>}
          total={filteredCurrent.length ? formatMoney(currentTotal) : ''}
          items={filteredCurrent}
          onEdit={openEditModal}
          onDelete={requestDelete}
          emptyTitle="No expenses this month"
          emptyDescription="Track your spending by adding your first transaction."
          emptyActionLabel="Add your first expense"
          onEmptyAction={isFiltered ? clearFilters : openAddModal}
          isFiltered={isFiltered}
        />
        <TransactionColumn
          title="Upcoming"
          badge={<span className="et-badge et-badge-up">{filteredFuture.length}</span>}
          total={filteredFuture.length ? formatMoney(futureTotal) : ''}
          items={filteredFuture}
          onEdit={openEditModal}
          onDelete={requestDelete}
          emptyTitle="No upcoming expenses"
          emptyDescription="Plan future payments to stay ahead of your budget."
          emptyActionLabel="Add planned expense"
          onEmptyAction={isFiltered ? clearFilters : openAddModal}
          isFiltered={isFiltered}
        />
      </div>

      <FabButton onClick={openAddModal} />

      <TransactionModal
        isOpen={isModalOpen}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        onClose={closeModal}
        onSubmit={handleSubmit}
        saving={saving}
        feedbackTone={modalFeedback}
      />

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

export default Home;
