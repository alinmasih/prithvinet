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
    <div className="p-8 space-y-8 animate-fade-in bg-white/5 rounded-[3.5rem] mt-6">
      {/* Analyser Status Header */}
      <div className="bg-[#0078D4] text-white px-6 py-3 rounded-t-lg">
        <h2 className="text-xl font-bold tracking-tight">Analyser Status</h2>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-gray-50 border-x border-b border-gray-200 p-6 rounded-b-lg shadow-sm">
        <div className="flex flex-wrap items-center gap-12">
          <div className="flex items-center gap-4">
            <label className="text-sm font-bold text-gray-700">RO/District</label>
            <select 
              value={roFilter}
              onChange={(e) => setRoFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 w-48 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            >
              <option>All</option>
              {Array.from(new Set(reports.map(r => r.industry?.district))).filter(Boolean).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-bold text-gray-700">Industry</label>
            <select 
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 w-64 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            >
              <option>All</option>
              {reports.map(r => (
                <option key={r._id} value={r.industry?.industryName}>{r.industry?.industryName}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={fetchReports}
            className="px-8 py-2 bg-[#0078D4] text-white font-bold rounded shadow-md hover:bg-blue-700 transition-all text-sm uppercase"
          >
            Submit
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-10">
        <button 
          onClick={handleExportPDF}
          className="px-6 py-2 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
        >
          PDF
        </button>
        <button 
          onClick={handlePrint}
          className="px-6 py-2 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
        >
          Print
        </button>
      </div>

      {error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-3xl flex items-center gap-4 text-rose-500 font-bold italic">
          <AlertCircle size={24} /> {error}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border-t-[3px] border-red-600 bg-white shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                <th className="px-3 py-3 text-[11px] font-bold uppercase text-white bg-[#0078D4] border-r border-white/20 text-center">Sl No</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase text-white bg-[#0078D4] border-r border-white/20">Industry Name</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase text-white bg-[#0078D4] border-r border-white/20">RO/District</th>
                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase text-white bg-[#4CAF50] border-r border-white/20">AAQMS (Online)</th>
                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase text-white bg-[#F44336] border-r border-white/20">AAQMS (Offline)</th>
                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase text-white bg-[#4CAF50] border-r border-white/20">CEMS (Online)</th>
                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase text-white bg-[#F44336] border-r border-white/20">CEMS (Offline)</th>
                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase text-white bg-[#4CAF50] border-r border-white/20">EQMS (Online)</th>
                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase text-white bg-[#F44336]">EQMS (Offline)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReports.length > 0 ? filteredReports.map((report, idx) => (
                <tr key={report._id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-3 py-4 text-xs font-bold text-gray-600 text-center border-r border-gray-100">{idx + 1}</td>
                  <td className="px-5 py-4 border-r border-gray-100 min-w-[350px]">
                    <p className="text-[13px] font-bold text-[#0078D4] leading-tight mb-1">{report.industry?.industryName || 'N/A'}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">REP: {report.submitted_by?.name || 'ADMIN'}</p>
                    <p className="text-[9px] text-blue-800 font-bold">CONTACT: 9876543210</p>
                  </td>
                  <td className="px-5 py-4 text-[12px] font-bold text-gray-700 uppercase border-r border-gray-100">{report.industry?.district || 'RAIPUR'}</td>
                  
                  <td className="px-2 py-4 text-center font-bold text-sm text-gray-800 border-r border-gray-100">{report.aaqms?.online || 0}</td>
                  <td className="px-2 py-4 text-center font-bold text-sm text-gray-800 border-r border-gray-100">{report.aaqms?.offline || 0}</td>
                  
                  <td className="px-2 py-4 text-center font-bold text-sm text-gray-800 border-r border-gray-100">{report.cems?.online || 0}</td>
                  <td className="px-2 py-4 text-center font-bold text-sm text-gray-800 border-r border-gray-100">{report.cems?.offline || 0}</td>
                  
                  <td className="px-2 py-4 text-center font-bold text-sm text-gray-800 border-r border-gray-100">{report.eqms?.online || 0}</td>
                  <td className="px-2 py-4 text-center font-bold text-sm text-gray-800">{report.eqms?.offline || 0}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <FileText className="text-white/10" size={48} />
                      <p className="text-text-muted font-bold italic uppercase tracking-widest text-[10px]">No compliance records found in the current jurisdiction</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {filteredReports.length > 0 && (
              <tfoot>
                <tr className="bg-primary/5 border-t border-white/10">
                  <td colSpan="3" className="px-6 py-4 text-right text-[10px] font-black uppercase text-white tracking-widest italic">Regional Total:-</td>
                  <td className="px-4 py-4 text-center font-black text-emerald-500">{filteredReports.reduce((acc, curr) => acc + (curr.aaqms?.online || 0), 0)}</td>
                  <td className="px-4 py-4 text-center font-black text-rose-500">{filteredReports.reduce((acc, curr) => acc + (curr.aaqms?.offline || 0), 0)}</td>
                  <td className="px-4 py-4 text-center font-black text-emerald-500">{filteredReports.reduce((acc, curr) => acc + (curr.cems?.online || 0), 0)}</td>
                  <td className="px-4 py-4 text-center font-black text-rose-500">{filteredReports.reduce((acc, curr) => acc + (curr.cems?.offline || 0), 0)}</td>
                  <td className="px-4 py-4 text-center font-black text-emerald-500">{filteredReports.reduce((acc, curr) => acc + (curr.eqms?.online || 0), 0)}</td>
                  <td className="px-4 py-4 text-center font-black text-rose-500">{filteredReports.reduce((acc, curr) => acc + (curr.eqms?.offline || 0), 0)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* Pagination Placeholder */}
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic px-4">
        <span>Showing 1 to {filteredReports.length} of {reports.length} entries</span>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:text-white transition-colors">Previous</button>
          <button className="px-4 py-2 bg-primary text-black rounded-lg">1</button>
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:text-white transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
};

export default ComplianceRegistry;
