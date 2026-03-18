import React, { useState, useEffect } from 'react';
import { FileText, Printer, Download, Search, AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { getComplianceReports, exportCompliancePDF } from '../../api/monitoring';

const ComplianceRegistry = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roFilter, setRoFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await getComplianceReports();
      setReports(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch compliance registry data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      // In a real app, this would trigger a download
      // For now, we'll simulate the intent
      alert('Generating PDF report. This will download shortly.');
      // const response = await exportCompliancePDF();
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', 'Compliance_Report.pdf');
      // document.body.appendChild(link);
      // link.click();
    } catch (err) {
      alert('Failed to export PDF');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.industry?.industryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.industry?.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRO = roFilter === 'All' || report.industry?.district === roFilter;
    const matchesIndustry = industryFilter === 'All' || report.industry?.industryName === industryFilter;
    
    return matchesSearch && matchesRO && matchesIndustry;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-text-muted font-black uppercase tracking-widest text-xs">Accessing Environmental Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in p-2">
      {/* Premium Header Card */}
      <div className="glassmorphism rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
        <div className="bg-gradient-to-r from-primary/20 via-primary/5 to-transparent px-8 py-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">
              Analyser <span className="text-primary italic">Status</span>
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mt-1 opacity-70">
              Environmental Compliance Registry & Regulatory Monitor
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Live Feed Active</span>
          </div>
        </div>

        {/* Filter Toolbar - Glassmorphism */}
        <div className="p-8 bg-black/40 backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-end">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <Search size={12} className="text-primary" /> Regional Jurisdiction
              </label>
              <select 
                value={roFilter}
                onChange={(e) => setRoFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-primary/50 transition-all outline-none appearance-none hover:bg-white/10 cursor-pointer font-bold"
              >
                <option className="bg-background-void">All Jurisdictions</option>
                {Array.from(new Set(reports.map(r => r.industry?.district))).filter(Boolean).map(d => (
                  <option key={d} value={d} className="bg-background-void">{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <FileText size={12} className="text-primary" /> Industrial Unit
              </label>
              <select 
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-primary/50 transition-all outline-none appearance-none hover:bg-white/10 cursor-pointer font-bold"
              >
                <option className="bg-background-void">All Industries</option>
                {reports.map(r => (
                  <option key={r._id} value={r.industry?.industryName} className="bg-background-void">{r.industry?.industryName}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={fetchReports}
                className="flex-1 px-8 py-4 bg-primary text-black font-black rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-[1.02] transition-all text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 group"
              >
                Refresh Data
                <Loader2 className={`group-hover:rotate-180 transition-transform ${loading ? 'animate-spin' : ''}`} size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className="flex gap-3">
          <button 
            onClick={handleExportPDF}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-text-muted hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 group tracking-widest uppercase italic"
          >
            <Download size={14} className="group-hover:translate-y-0.5 transition-transform text-primary" /> Export PDF
          </button>
          <button 
            onClick={handlePrint}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-text-muted hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 group tracking-widest uppercase italic"
          >
            <Printer size={14} className="group-hover:-translate-y-0.5 transition-transform text-secondary" /> Print Report
          </button>
        </div>
        
        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted italic opacity-60">
          Showing {filteredReports.length} Active Records
        </div>
      </div>

      {error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-[2.5rem] flex items-center gap-4 text-rose-500 font-black italic tracking-tight shadow-lg">
          <AlertCircle size={24} className="shrink-0" /> {error}
        </div>
      ) : (
        <div className="glassmorphism rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="hidden lg:table-header-group">
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted text-center w-20 italic">#</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Industry Context</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Location</th>
                  <th className="px-4 py-6 text-center text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/5">AAQMS Online</th>
                  <th className="px-4 py-6 text-center text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/5">AAQMS Offline</th>
                  <th className="px-4 py-6 text-center text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/5">CEMS Online</th>
                  <th className="px-4 py-6 text-center text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/5">CEMS Offline</th>
                  <th className="px-4 py-6 text-center text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/5">EQMS Online</th>
                  <th className="px-4 py-6 text-center text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/5">EQMS Offline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredReports.length > 0 ? (
                  <>
                    {/* Desktop Table View */}
                    {filteredReports.map((report, idx) => (
                      <tr key={report._id} className="hidden lg:table-row hover:bg-white/[0.03] transition-colors group">
                        <td className="px-6 py-6 text-[11px] font-black text-text-muted text-center italic opacity-40">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="px-8 py-6 min-w-[300px]">
                          <h4 className="text-[14px] font-black text-white leading-tight mb-2 group-hover:text-primary transition-colors tracking-tighter italic">
                            {report.industry?.industryName || 'N/A'}
                          </h4>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] text-text-muted font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
                              REF: {report._id.substring(0, 8).toUpperCase()}
                            </span>
                            <span className="text-[9px] text-primary/80 font-black uppercase tracking-widest italic flex items-center gap-1">
                              <CheckCircle size={10} /> Verified
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-[12px] font-black text-white uppercase tracking-tighter italic">
                              {report.industry?.district || 'RAIPUR'}
                            </span>
                            <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest">
                              Industrial Sector
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-4 py-6 text-center font-black text-sm text-emerald-400/90">{report.aaqms?.online || 0}</td>
                        <td className="px-4 py-6 text-center font-black text-sm text-rose-400/90">{report.aaqms?.offline || 0}</td>
                        
                        <td className="px-4 py-6 text-center font-black text-sm text-emerald-400/90">{report.cems?.online || 0}</td>
                        <td className="px-4 py-6 text-center font-black text-sm text-rose-400/90">{report.cems?.offline || 0}</td>
                        
                        <td className="px-4 py-6 text-center font-black text-sm text-emerald-400/90">{report.eqms?.online || 0}</td>
                        <td className="px-4 py-6 text-center font-black text-sm text-rose-400/90">{report.eqms?.offline || 0}</td>
                      </tr>
                    ))}

                    {/* Mobile Card View */}
                    <tr className="lg:hidden">
                      <td colSpan="9" className="p-4 space-y-4">
                        {filteredReports.map((report, idx) => (
                          <div key={report._id} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <h4 className="text-base font-black text-white italic leading-tight">
                                  {report.industry?.industryName || 'N/A'}
                                </h4>
                                <span className="text-[10px] text-primary font-black uppercase tracking-widest">
                                  {report.industry?.district || 'RAIPUR'}
                                </span>
                              </div>
                              <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-text-muted italic">
                                #{idx + 1}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/5">
                              <div className="text-center">
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">AAQMS</p>
                                <div className="flex justify-center gap-2 font-black text-xs">
                                  <span className="text-emerald-500">{report.aaqms?.online || 0}</span>
                                  <span className="text-white/20">/</span>
                                  <span className="text-rose-500">{report.aaqms?.offline || 0}</span>
                                </div>
                              </div>
                              <div className="text-center border-x border-white/5">
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">CEMS</p>
                                <div className="flex justify-center gap-2 font-black text-xs">
                                  <span className="text-emerald-500">{report.cems?.online || 0}</span>
                                  <span className="text-white/20">/</span>
                                  <span className="text-rose-500">{report.cems?.offline || 0}</span>
                                </div>
                              </div>
                              <div className="text-center">
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">EQMS</p>
                                <div className="flex justify-center gap-2 font-black text-xs">
                                  <span className="text-emerald-500">{report.eqms?.online || 0}</span>
                                  <span className="text-white/20">/</span>
                                  <span className="text-rose-500">{report.eqms?.offline || 0}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-text-muted italic">
                              <span>REF: {report._id.substring(0, 8)}</span>
                              <span className="text-primary flex items-center gap-1">
                                <CheckCircle size={10} /> Verified
                              </span>
                            </div>
                          </div>
                        ))}
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center gap-6 opacity-20">
                        <FileText className="text-white" size={64} strokeWidth={1} />
                        <div className="space-y-1">
                           <p className="text-white font-black italic uppercase tracking-[0.4em] text-xs">No Records Signal Detected</p>
                           <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Adjust filters or initialize system scan</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredReports.length > 0 && (
                <tfoot>
                  <tr className="bg-white/5 border-t border-white/10 backdrop-blur-md">
                    <td colSpan="3" className="px-8 py-8 text-right text-[11px] font-black uppercase text-text-muted tracking-[0.2em] italic">
                      Cumulative Jurisdiction <span className="text-white">Analysis</span>:
                    </td>
                    <td className="px-4 py-8 text-center font-black text-emerald-500 text-lg shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
                      {filteredReports.reduce((acc, curr) => acc + (curr.aaqms?.online || 0), 0)}
                    </td>
                    <td className="px-4 py-8 text-center font-black text-rose-500 text-lg shadow-[inset_0_0_20px_rgba(244,67,54,0.05)]">
                      {filteredReports.reduce((acc, curr) => acc + (curr.aaqms?.offline || 0), 0)}
                    </td>
                    <td className="px-4 py-8 text-center font-black text-emerald-500 text-lg shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
                      {filteredReports.reduce((acc, curr) => acc + (curr.cems?.online || 0), 0)}
                    </td>
                    <td className="px-4 py-8 text-center font-black text-rose-500 text-lg shadow-[inset_0_0_20px_rgba(244,67,54,0.05)]">
                      {filteredReports.reduce((acc, curr) => acc + (curr.cems?.offline || 0), 0)}
                    </td>
                    <td className="px-4 py-8 text-center font-black text-emerald-500 text-lg shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
                      {filteredReports.reduce((acc, curr) => acc + (curr.eqms?.online || 0), 0)}
                    </td>
                    <td className="px-4 py-8 text-center font-black text-rose-500 text-lg shadow-[inset_0_0_20px_rgba(244,67,54,0.05)]">
                      {filteredReports.reduce((acc, curr) => acc + (curr.eqms?.offline || 0), 0)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* Modern Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white/5 border border-white/10 p-6 rounded-[2rem] gap-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted italic opacity-60">
          Showing 1 - {filteredReports.length} <span className="text-white">|</span> {reports.length} Total Registry Entries
        </span>
        <div className="flex gap-2">
          <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-text-muted hover:text-white hover:bg-white/10 transition-all italic tracking-widest">Prev System</button>
          <button className="h-10 w-10 bg-primary text-black rounded-xl font-black text-xs shadow-lg shadow-primary/20">01</button>
          <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-text-muted hover:text-white hover:bg-white/10 transition-all italic tracking-widest">Next System</button>
        </div>
      </div>
    </div>
  );
};

export default ComplianceRegistry;
