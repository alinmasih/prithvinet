import { 
  ShieldCheck
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import ComplianceRegistry from '../components/Monitoring/ComplianceRegistry';
import MonitoringTeamReports from '../components/Monitoring/MonitoringTeamReports';
import IoTDataGrid from '../components/Monitoring/IoTDataGrid';

const Reports = () => {
  const { type } = useParams();
  const activeTab = type === 'regional' ? 'monitoring' : type === 'iot' ? 'iot' : 'industry';

  return (
    <div className="grow animate-fade-in p-8 lg:p-12 max-w-[1600px] mx-auto w-full space-y-8">
      {/* Report View Panel */}
      <div className="glass-morphism border border-white/10 rounded-[3.5rem] p-4 lg:p-12 min-h-[600px] relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-transparent to-transparent"></div>
         <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === 'industry' ? <ComplianceRegistry /> : 
             activeTab === 'monitoring' ? <MonitoringTeamReports /> : 
             <IoTDataGrid />}
         </div>
      </div>
      
      {/* Disclaimer Context */}
      <div className="flex items-center gap-4 px-10 py-6 bg-white/[0.02] border border-white/5 rounded-3xl">
         <ShieldCheck className="text-primary/40" size={20} />
         <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] italic">
            This terminal view is strictly for regulatory reporting. To submit new field data or industrial compliance logs, please navigate to the respective Input Portals.
         </p>
      </div>
    </div>
  );
};

export default Reports;
