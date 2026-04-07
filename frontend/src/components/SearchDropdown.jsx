import React, { useContext, useMemo } from 'react';
import { SearchContext } from '../context/SearchContext';
import { format } from 'date-fns';
import { FiClock, FiSearch, FiCoffee, FiTruck, FiBook, FiHome, FiZap, FiHeart, FiMoreHorizontal, FiBox } from 'react-icons/fi';

const CATEGORY_ICONS = {
  'Dining & Food': { icon: FiCoffee, bg: 'bg-amber-50', text: 'text-amber-600' },
  'Transport':     { icon: FiTruck,  bg: 'bg-indigo-50', text: 'text-indigo-600' },
  'Academic Tools': { icon: FiBook,  bg: 'bg-blue-50', text: 'text-blue-600' },
  'Housing':       { icon: FiHome,   bg: 'bg-violet-50', text: 'text-violet-600' },
  'Utilities':     { icon: FiZap,    bg: 'bg-orange-50', text: 'text-orange-600' },
  'Lifestyle':     { icon: FiHeart,  bg: 'bg-pink-50', text: 'text-pink-600' },
  'Other':         { icon: FiMoreHorizontal, bg: 'bg-slate-100', text: 'text-slate-600' },
};

const DEFAULT_ICON = { icon: FiBox, bg: 'bg-slate-100', text: 'text-slate-600' };

const SearchDropdown = ({ onResultClick }) => {
  const { searchQuery, expenses, loading } = useContext(SearchContext);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return expenses
      .filter(exp => 
        exp.description?.toLowerCase().includes(query) || 
        exp.category?.toLowerCase().includes(query) ||
        exp.amount?.toString().includes(query)
      )
      .slice(0, 6); // Show top 6 matches
  }, [searchQuery, expenses]);

  if (!searchQuery.trim()) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <FiSearch size={10} /> Search Results
        </span>
        <span className="text-[10px] font-bold text-primary-600">{filteredResults.length} found</span>
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            Searching...
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
               <FiSearch className="text-slate-300" size={20} />
            </div>
            <p className="text-sm text-slate-500 font-medium">No matches found</p>
            <p className="text-[11px] text-slate-400 mt-1">Try searching for a different keyword</p>
          </div>
        ) : (
          <div className="py-2">
            {filteredResults.map((exp) => {
              const catInfo = CATEGORY_ICONS[exp.category] || DEFAULT_ICON;
              const IconComp = catInfo.icon;
              
              return (
                <div 
                  key={exp._id}
                  onClick={() => onResultClick && onResultClick(exp)}
                  className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors group flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${catInfo.bg} ${catInfo.text} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <IconComp size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-tight">{exp.description || exp.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{exp.category}</span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <FiClock size={10} /> {format(new Date(exp.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 leading-tight">₹{Number(exp.amount).toFixed(0)}</p>
                    <p className="text-[10px] text-emerald-500 font-bold mt-1 uppercase">Sent</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-center">
        <button 
          onClick={() => window.location.href = '/manage-expenses'}
          className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-widest"
        >
          View all transactions
        </button>
      </div>
    </div>
  );
};

export default SearchDropdown;
