import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FiTrash2, FiEdit2, FiClock, FiDownload, FiMoreVertical, FiBook, FiCoffee, FiTruck, FiBox, FiHome, FiZap } from 'react-icons/fi';

const CategoryIcon = ({ category }) => {
  switch (category) {
    case 'Academic Tools': return <FiBook size={14} className="text-primary-600" />;
    case 'Dining & Food': return <FiCoffee size={14} className="text-emerald-600" />;
    case 'Transport': return <FiTruck size={14} className="text-orange-600" />;
    case 'Housing': return <FiHome size={14} className="text-indigo-600" />;
    case 'Utilities': return <FiZap size={14} className="text-purple-600" />;
    default: return <FiBox size={14} className="text-slate-600" />;
  }
};

const CategoryPill = ({ category }) => {
  let colorClass = "bg-slate-100 text-slate-600";
  if (category === 'Academic Tools') colorClass = "bg-primary-50 text-primary-600";
  else if (category === 'Dining & Food') colorClass = "bg-emerald-50 text-emerald-600";
  else if (category === 'Transport') colorClass = "bg-orange-50 text-orange-600";
  else if (category === 'Utilities') colorClass = "bg-purple-50 text-purple-600";
  else if (category === 'Housing') colorClass = "bg-indigo-50 text-indigo-600";

  return (
    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${colorClass}`}>
      {category}
    </span>
  );
};

const ExpenseList = ({ expenses, fetchExpenses, setExpenseToEdit }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const actionsMenuRef = useRef(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(event.target)
      ) {
        setShowActionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);
  
  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`/expenses/${id}`);
        toast.success('Expense deleted');
        fetchExpenses();
      } catch (error) {
        toast.error('Error deleting expense');
      }
    }
  };

  if (!expenses || expenses.length === 0) {
    return (
      <div className="dashboard-card flex flex-col items-center justify-center p-12 mt-6">
        <FiClock size={48} className="text-slate-300 mb-4"/>
        <h3 className="text-slate-500 font-medium">No transactions found</h3>
        <p className="text-slate-400 text-sm mt-1">Add your first expense to begin tracking.</p>
      </div>
    );
  }

  // Pagination logic
  const totalPages = Math.ceil(expenses.length / itemsPerPage);
  const currentExpenses = expenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDownloadPdf = (data, fileTag = 'all') => {
    if (!data || data.length === 0) {
      toast.info('No transactions available to export.');
      return;
    }

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const generatedOn = format(new Date(), 'dd MMM yyyy, hh:mm a');
    const totalAmount = data.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

    doc.setFontSize(16);
    doc.text('BudgetBuddy - Recent Transactions', 40, 40);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${generatedOn}`, 40, 58);
    doc.text(`Records: ${data.length}`, 40, 72);

    autoTable(doc, {
      startY: 86,
      head: [['#', 'Date', 'Description', 'Category', 'Amount (INR)']],
      body: data.map((expense, index) => [
        index + 1,
        format(new Date(expense.date), 'dd MMM yyyy'),
        expense.description || 'Untitled Transaction',
        expense.category || 'Other',
        Number(expense.amount).toFixed(2),
      ]),
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [79, 70, 229] },
      columnStyles: {
        0: { cellWidth: 24 },
        1: { cellWidth: 80 },
        2: { cellWidth: 200 },
        3: { cellWidth: 90 },
        4: { halign: 'right' },
      },
    });

    const finalY = doc.lastAutoTable?.finalY || 100;
    doc.setFontSize(11);
    doc.setTextColor(35);
    doc.text(`Total Amount: INR ${totalAmount.toFixed(2)}`, 40, finalY + 24);

    doc.save(`expense-report-${fileTag}-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF downloaded successfully');
  };

  const handleDownloadAllPdf = () => {
    handleDownloadPdf(expenses, 'all');
    setShowActionsMenu(false);
  };

  const handleDownloadCurrentPagePdf = () => {
    handleDownloadPdf(currentExpenses, `page-${currentPage}`);
    setShowActionsMenu(false);
  };

  return (
    <div className="dashboard-card mt-6 p-0 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Recent Transactions</h3>
        <div className="flex gap-2 text-slate-400 items-center">
           <button
             onClick={handleDownloadAllPdf}
             className="p-1.5 hover:bg-slate-50 rounded transition-colors"
             title="Download all as PDF"
             aria-label="Download all as PDF"
           >
             <FiDownload size={18} />
           </button>
           <div className="relative" ref={actionsMenuRef}>
             <button
               onClick={() => setShowActionsMenu(prev => !prev)}
               className="p-1.5 hover:bg-slate-50 rounded transition-colors"
               title="More actions"
               aria-label="More actions"
             >
               <FiMoreVertical size={18} />
             </button>

             {showActionsMenu && (
               <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden">
                 <button
                   onClick={handleDownloadAllPdf}
                   className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                 >
                   Download all as PDF
                 </button>
                 <button
                   onClick={handleDownloadCurrentPagePdf}
                   className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                 >
                   Download this page as PDF
                 </button>
                 <button
                   onClick={() => {
                     fetchExpenses();
                     setShowActionsMenu(false);
                   }}
                   className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-100"
                 >
                   Refresh transactions
                 </button>
               </div>
             )}
           </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-40">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentExpenses.map(expense => (
              <tr key={expense._id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-700 font-medium">{format(new Date(expense.date), 'MMM dd, yyyy')}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{format(new Date(expense.date), 'hh:mm a')}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                      <CategoryIcon category={expense.category} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{expense.description || 'Untitled Transaction'}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{expense.category}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <CategoryPill category={expense.category} />
                </td>
                <td className="px-6 py-4 font-bold text-slate-800 text-sm">
                  ₹{Number(expense.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                    <button 
                      onClick={() => setExpenseToEdit(expense)}
                      className="p-1.5 text-primary-600 hover:bg-primary-50 rounded"
                      title="Edit"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(expense._id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
        <span className="text-xs font-medium text-slate-400">
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, expenses.length)} of {expenses.length} transactions
        </span>
        <div className="flex items-center gap-1">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-2 py-1 text-slate-400 hover:text-slate-600 disabled:opacity-50 text-sm"
          >
            &lt;
          </button>
          {[...Array(totalPages)].map((_, i) => (
             <button 
               key={i}
               onClick={() => setCurrentPage(i+1)}
               className={`w-7 h-7 rounded-md text-xs font-medium flex items-center justify-center transition-colors ${
                 currentPage === i + 1 
                   ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/30' 
                   : 'text-slate-500 hover:bg-slate-100'
               }`}
             >
               {i + 1}
             </button>
          ))}
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-2 py-1 text-slate-400 hover:text-slate-600 disabled:opacity-50 text-sm"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;
