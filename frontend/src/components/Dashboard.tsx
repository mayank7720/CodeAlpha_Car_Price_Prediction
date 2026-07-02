import { useState, useEffect } from 'react';
import { getDatasetOverview } from '../services/api';

import { ArrowLeft, ArrowRight, Info, Layers, RefreshCw, AlertCircle, Download, Search } from 'lucide-react';

const COLUMN_DESCRIPTIONS: Record<string, string> = {
    'Car_Name': 'Model name of the car (e.g. swift, fortuner, verna)',
    'Year': 'Registration year of the car (2003 - 2018)',
    'Selling_Price': 'Resale selling price in Lakhs (Target variable)',
    'Present_Price': 'Showroom price of the car when new (in Lakhs)',
    'Kms_Driven': 'Odometer reading showing total distance driven',
    'Fuel_Type': 'Type of fuel engine uses (Petrol, Diesel, CNG)',
    'Seller_Type': 'Category of seller listing the car (Dealer, Individual)',
    'Transmission': 'Gearbox transmission type (Manual, Automatic)',
    'Owner': 'Number of previous owners (0, 1, 3)'
};

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search, Sorting, and Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const overview = await getDatasetOverview();
        setData(overview);
      } catch (err) {
        console.error("Error loading dataset overview:", err);
        setError("FastAPI backend is offline. Start the uvicorn server to load statistics dynamically.");
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
        <p className="text-slate-400 text-sm">Loading dataset schema metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl border border-red-500/10 bg-red-500/5 max-w-xl mx-auto text-center space-y-4 my-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-xl font-bold text-red-400">Connection Failed</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
      </div>
    );
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    if (!data || !data.sample_data) return;
    const headers = data.columns.join(',');
    const rows = data.sample_data.map((row: any) => 
      data.columns.map((col: string) => {
        const val = row[col];
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "car_price_dataset_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort Data
  let processedRows = [...(data.sample_data || [])];
  
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    processedRows = processedRows.filter((row: any) => 
      (row.Car_Name && row.Car_Name.toLowerCase().includes(q)) ||
      (row.Fuel_Type && row.Fuel_Type.toLowerCase().includes(q)) ||
      (row.Transmission && row.Transmission.toLowerCase().includes(q)) ||
      String(row.Year).includes(q)
    );
  }

  if (sortField) {
    processedRows.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (typeof valA === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return sortDirection === 'asc' 
          ? (valA || 0) - (valB || 0) 
          : (valB || 0) - (valA || 0);
      }
    });
  }

  const totalPages = Math.ceil(processedRows.length / rowsPerPage);
  const paginatedRows = processedRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-100 uppercase">Dataset Overview</h1>
        <p className="text-slate-400 text-xs">
          Exploration of the raw dataset metrics (Vehicle Dataset from CarDekho) prior to feature engineering and preprocessing.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="saas-card p-5">
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Listings (Rows)</p>
          <h2 className="text-2xl font-black mt-2 text-white">{data.shape[0]}</h2>
        </div>
        <div className="saas-card p-5">
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Features (Columns)</p>
          <h2 className="text-2xl font-black mt-2 text-red-500">{data.shape[1]}</h2>
        </div>
        <div className="saas-card p-5">
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Missing Values</p>
          <h2 className="text-2xl font-black mt-2 text-white">
            {Number(Object.values(data.missing_values).reduce((a: any, b: any) => a + b, 0))}
          </h2>
        </div>
        <div className="saas-card p-5">
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Duplicate Rows</p>
          <h2 className="text-2xl font-black mt-2 text-white">{data.duplicate_rows}</h2>
        </div>
      </div>

      {/* Schema / Columns Metadata Table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-slate-300">
          <Info className="w-4 h-4 text-red-500" />
          <h2 className="text-sm font-extrabold uppercase tracking-wider">Data Schema & Variable Types</h2>
        </div>
        <div className="saas-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/40 text-slate-300 font-bold uppercase tracking-wider">
                  <th className="py-3 px-5">Column Name</th>
                  <th className="py-3 px-5">Data Type</th>
                  <th className="py-3 px-5">Null Count</th>
                  <th className="py-3 px-5">Feature Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {data.columns.map((col: string) => (
                  <tr key={col} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-red-400">{col}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        data.data_types[col].includes('int') || data.data_types[col].includes('float') 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/15' 
                          : 'bg-slate-500/10 text-slate-400 border border-white/10'
                      }`}>
                        {data.data_types[col]}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-400">{data.missing_values[col]}</td>
                    <td className="py-3.5 px-5 text-slate-400 leading-relaxed">{COLUMN_DESCRIPTIONS[col] || 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Interactive Raw Data Viewer */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-300">
            <Layers className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Raw Dataset Viewer (Sample)</h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search sample..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-8 pr-3 py-1.5 w-44 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            {/* Export CSV Button */}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-xs font-bold text-slate-300 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || totalPages === 0}
                className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-slate-400 font-mono">
                {totalPages === 0 ? 0 : currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="saas-card p-0 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/40 text-slate-300 font-bold uppercase tracking-wider select-none">
                  {data.columns.map((col: string) => (
                    <th 
                      key={col} 
                      onClick={() => handleSort(col)}
                      className="py-3 px-5 hover:text-white cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>{col}</span>
                        {sortField === col && (
                          <span className="text-red-500 font-mono text-[9px]">
                            {sortDirection === 'asc' ? '▲' : '▼'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-400">
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-200">{row.Car_Name}</td>
                      <td className="py-3.5 px-5 font-mono">{row.Year}</td>
                      <td className="py-3.5 px-5 font-mono text-red-400 font-bold">₹ {row.Selling_Price} L</td>
                      <td className="py-3.5 px-5 font-mono text-slate-300">₹ {row.Present_Price} L</td>
                      <td className="py-3.5 px-5 font-mono">{row.Kms_Driven?.toLocaleString()}</td>
                      <td className="py-3.5 px-5">{row.Fuel_Type}</td>
                      <td className="py-3.5 px-5">{row.Seller_Type}</td>
                      <td className="py-3.5 px-5">{row.Transmission}</td>
                      <td className="py-3.5 px-5 font-mono">{row.Owner}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={data.columns.length} className="py-8 text-center text-slate-500 font-medium">
                      No records match search filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
