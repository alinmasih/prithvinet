import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Phone, 
  ChevronRight, 
  Loader2,
  Search,
  ArrowUpRight
} from 'lucide-react';
import api from '../api/client';
import PageBranding from '../components/PageBranding';

const RegionalOfficesList = () => {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const res = await api.get('/public/offices');
        setOffices(res.data);
      } catch (error) {
        console.error('Failed to fetch regional offices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffices();
  }, []);

  const filteredOffices = offices.filter(office => 
    office.office_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    office.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
       <Loader2 className="animate-spin text-primary mb-6" size={56} />
       <p className="text-text-muted font-black italic text-xs tracking-[0.4em] uppercase animate-pulse">Establishing Command Links...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <PageBranding title="Regional Jurisdictions" />
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search jurisdiction..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-primary/50 transition-all text-white font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredOffices.map((office) => (
          <div 
            key={office._id}
            onClick={() => navigate(`/regional/${office._id}`)}
            className="group glass-morphism border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity">
               <ArrowUpRight className="text-primary" size={24} />
            </div>
            
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform duration-500">
              <Building2 size={28} />
            </div>

            <div>
              <h3 className="text-2xl font-black italic uppercase tracking-tight text-white mb-2 group-hover:text-primary transition-colors">
                {office.office_name}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-6">
                District: {office.district}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-xs text-text-muted group-hover:text-white/70 transition-colors">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{office.address || 'Address not available'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted group-hover:text-white/70 transition-colors">
                  <Phone size={14} className="shrink-0" />
                  <span>{office.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
               <span className="text-[9px] font-black uppercase tracking-widest text-text-muted group-hover:text-white transition-colors">Enter Intelligence Hub</span>
               <ChevronRight className="text-text-muted group-hover:translate-x-1 transition-transform" size={16} />
            </div>
          </div>
        ))}

        {filteredOffices.length === 0 && (
          <div className="col-span-full py-20 text-center glass-morphism border border-dashed border-white/10 rounded-[3rem]">
            <Building2 className="mx-auto text-text-muted mb-4 opacity-20" size={48} />
            <p className="text-text-muted font-black italic uppercase tracking-widest text-xs">No jurisdictions match your search sequence.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionalOfficesList;
