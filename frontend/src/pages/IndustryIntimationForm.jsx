import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Package, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  CreditCard,
  Shield,
  Briefcase,
  AlertCircle,
  ArrowRight,
  Download,
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';
import FormInput from '../components/forms/FormInput';
import FormSelect from '../components/forms/FormSelect';
import FormDate from '../components/forms/FormDate';
import api from '../api/client';

const IndustryIntimationForm = () => {
  const [formData, setFormData] = useState({
    // Industry Details
    industryName: '',
    address: '',
    productName: '',
    productActivity: 'Manufacturing',
    productionStartingDate: '14-03-2026',
    productionCapacity: '',
    unit: 'Metric Tons',
    district: '',
    place: '',
    // Entity Identification
    entityName: '',
    entityType: 'Private Limited',
    incorporationDate: '',
    registrationNumber: '',
    // Legal & Statutory
    panNumber: '',
    gstNumber: '',
    msmeNumber: '',
    licenseNumber: '',
    // Contact & Communication
    officeAddress: '',
    operationalAddress: '',
    contactMobile: '',
    contactEmail: '',
    alternateNumber: '',
    // Owner Details
    ownerName: '',
    ownerMobile: '',
    ownerEmail: '',
    // Declaration Meta
    formDate: '14-03-2026'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(1);

  const districts = ['Raipur', 'Bilaspur', 'Durg', 'Korba', 'Raigarh', 'Bastar', 'Surguja'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await api.post('/industries/create-form', formData);
      setResult(data);
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Reference generation failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadPDF = () => {
    if (!result?.pdfBase64) return;
    const linkSource = `data:application/pdf;base64,${result.pdfBase64}`;
    const downloadLink = document.createElement("a");
    const fileName = `CECB_Intimation_${result.referenceNumber}.pdf`;
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  };

  if (result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 animate-fade-in">
        <div className="w-full max-w-3xl glass-morphism rounded-[4rem] p-16 border border-white/10 text-center shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
           <div className="w-24 h-24 bg-emerald-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-emerald-500/30 mb-10">
              <CheckCircle2 className="text-white" size={48} />
           </div>
           <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Intimation Initialized</h2>
           <p className="text-text-muted font-bold tracking-[0.3em] uppercase text-xs mb-12">WC Protocol reference generated successfully</p>
           
           <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10 mb-12">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-4 italic">Filing Reference</p>
              <h3 className="text-3xl font-black italic tracking-widest text-white selection:bg-emerald-500">{result.referenceNumber}</h3>
           </div>

           <div className="space-y-6">
              <button 
                onClick={downloadPDF}
                className="w-full py-6 bg-emerald-600 text-white rounded-2xl font-black uppercase italic tracking-widest text-sm shadow-2xl shadow-emerald-600/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-4"
              >
                Download Official Form <Download size={24} />
              </button>
              <div className="flex gap-4">
                 <button onClick={() => window.location.href = '/'} className="flex-1 py-5 bg-white/5 border border-white/10 text-white/50 rounded-2xl font-black uppercase italic tracking-widest text-[10px] hover:bg-white/10 transition-all">Close Uplink</button>
                 <button onClick={() => window.location.href = '/register-industry/submit'} className="flex-1 py-5 bg-white/10 text-white rounded-2xl font-black uppercase italic tracking-widest text-[10px] hover:bg-primary hover:text-black transition-all">Upload Signed Doc</button>
              </div>
           </div>
           
           <div className="mt-12 flex items-start gap-4 p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl text-left">
              <AlertCircle className="text-amber-500 flex-shrink-0" size={24} />
              <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest leading-relaxed">
                 IMPORTANT: Print this form on project letterhead, sign and stamp it, and upload the scanned copy along with supporting documents for final authorization.
              </p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060608] py-20 px-6 lg:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16 flex justify-between items-end">
           <div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-4 leading-none">Industry Registration <br/><span className="text-primary">Form</span></h1>
              <p className="text-text-muted font-bold tracking-[0.3em] uppercase text-[10px] italic">Submit your white category industry intimation to CECB</p>
           </div>
           <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50 italic mr-4">Protocol Step</span>
              <span className="text-xl font-black italic text-primary">{step} / 5</span>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
           {/* Section 1: Industry Details */}
           <div className="glass-morphism rounded-[3rem] p-12 border border-white/5">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <Building2 size={20} />
                 </div>
                 <h3 className="text-xl font-black uppercase italic tracking-tight text-white">Industry Details</h3>
              </div>
              <p className="text-text-muted font-bold tracking-widest uppercase text-[10px] mb-10 ml-14">Provide basic information about your industry or business activity</p>
              
              <div className="grid grid-cols-1 gap-8 mb-8">
                 <FormInput label="Name of Industry/Activity/Project *" name="industryName" value={formData.industryName} onChange={handleInputChange} placeholder="Enter your industry name" icon={<Building2 size={18}/>} />
              </div>

              <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 mb-8">
                 <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-8 italic flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Production Details
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormInput label="Complete Address *" name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter complete production address" icon={<MapPin size={18}/>} isTextarea />
                    <div className="space-y-8">
                       <FormInput label="Product Name *" name="productName" value={formData.productName} onChange={handleInputChange} placeholder="Describe your products or services" icon={<Package size={18}/>} />
                       <FormSelect label="Product/Activity *" name="productActivity" value={formData.productActivity} onChange={handleInputChange} options={['Manufacturing', 'Processing', 'Assembly', 'Services', 'Distillery', 'Other']} icon={<Briefcase size={18}/>} />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                    <FormDate label="Production Starting Date *" name="productionStartingDate" value={formData.productionStartingDate} onChange={handleInputChange} />
                    <FormInput label="Production Capacity (Annual) *" name="productionCapacity" value={formData.productionCapacity} onChange={handleInputChange} placeholder="Enter capacity" />
                    <FormSelect label="Select Unit *" name="unit" value={formData.unit} onChange={handleInputChange} options={['Metric Tons', 'Liters', 'Cubic Meters', 'Pieces', 'MTPA']} />
                 </div>
              </div>
           </div>

           {/* Section 2: Entity Identification */}
           <div className="glass-morphism rounded-[3rem] p-12 border border-white/5">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <Shield size={20} />
                 </div>
                 <h3 className="text-xl font-black uppercase italic tracking-tight text-white">Entity Identification</h3>
              </div>
              <p className="text-text-muted font-bold tracking-widest uppercase text-[10px] mb-10 ml-14">Legal entity information and registration details</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <FormInput label="Registered Name Of Entity *" name="entityName" value={formData.entityName} onChange={handleInputChange} placeholder="Enter registered entity name" icon={<Building2 size={18}/>} />
                 <FormSelect label="Type of Entity *" name="entityType" value={formData.entityType} onChange={handleInputChange} options={['Private Limited', 'Public Limited', 'Proprietorship', 'Partnership', 'LLP', 'Co-operative', 'Society']} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                 <FormDate label="Date of Incorporation/Establishment *" name="incorporationDate" value={formData.incorporationDate} onChange={handleInputChange} />
                 <FormInput label="Registration/Incorporation Number *" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} placeholder="Enter registration number" icon={<FileText size={18}/>} />
              </div>
           </div>

           {/* Section 3: Legal & Statutory */}
           <div className="glass-morphism rounded-[3rem] p-12 border border-white/5">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 border border-purple-500/20">
                    <CreditCard size={20} />
                 </div>
                 <h3 className="text-xl font-black uppercase italic tracking-tight text-white">Legal & Statutory Details</h3>
              </div>
              <p className="text-text-muted font-bold tracking-widest uppercase text-[10px] mb-10 ml-14">Tax and regulatory compliance information</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <FormInput label="PAN Number of Entity/Owner *" name="panNumber" value={formData.panNumber} onChange={handleInputChange} placeholder="Enter PAN number" icon={<CreditCard size={18}/>} />
                 <FormInput label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} placeholder="Enter GST number" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                 <FormInput label="Udyam/MSME Registration Number" name="msmeNumber" value={formData.msmeNumber} onChange={handleInputChange} placeholder="Enter Udyam number" />
                 <FormInput label="Factory License/Shop Establishment Number" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} placeholder="Enter license number" />
              </div>
           </div>

           {/* Section 4: Contact & Owner */}
           <div className="glass-morphism rounded-[3rem] p-12 border border-white/5">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 border border-rose-500/20">
                    <User size={20} />
                 </div>
                 <h3 className="text-xl font-black uppercase italic tracking-tight text-white">Contact & Owner Details</h3>
              </div>
              
              <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 mb-8">
                 <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-8 italic flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div> Communication Details
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormInput label="Registered Office Address *" name="officeAddress" value={formData.officeAddress} onChange={handleInputChange} placeholder="Plot No, Street, Area, City, District, State, PIN Code" isTextarea />
                    <FormInput label="Operational Address" name="operationalAddress" value={formData.operationalAddress} onChange={handleInputChange} placeholder="Plot No, Street, Area, City, District, State, PIN Code" isTextarea />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                    <FormInput label="Mobile Number *" name="contactMobile" value={formData.contactMobile} onChange={handleInputChange} placeholder="Enter 10-digit mobile number" icon={<Phone size={18}/>} />
                    <FormInput label="Email Address *" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} placeholder="email@example.com" icon={<Mail size={18}/>} />
                    <FormInput label="Landline/Alternate Number" name="alternateNumber" value={formData.alternateNumber} onChange={handleInputChange} placeholder="Enter landline or alternate number" />
                 </div>
              </div>

              <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                 <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-8 italic flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div> Industry Owner/Proprietor Details
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FormInput label="Name of Industry Owner/Proprietor *" name="ownerName" value={formData.ownerName} onChange={handleInputChange} placeholder="Enter owner's full name" icon={<User size={18}/>} />
                    <FormInput label="Mobile Number *" name="ownerMobile" value={formData.ownerMobile} onChange={handleInputChange} placeholder="Enter 10-digit mobile number" icon={<Phone size={18}/>} />
                    <FormInput label="Email Address *" name="ownerEmail" value={formData.ownerEmail} onChange={handleInputChange} placeholder="email@example.com" icon={<Mail size={18}/>} />
                 </div>
              </div>
           </div>

           {/* Section 5: Jurisdiction & Final */}
           <div className="glass-morphism rounded-[3rem] p-12 border border-white/5">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <MapPin size={20} />
                 </div>
                 <h3 className="text-xl font-black uppercase italic tracking-tight text-white">Jurisdiction & Intimation</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                 <FormDate label="Date *" name="formDate" value={formData.formDate} onChange={handleInputChange} />
                 <FormInput label="Place *" name="place" value={formData.place} onChange={handleInputChange} placeholder="City/Town" icon={<MapPin size={18}/>} />
                 <FormSelect label="District *" name="district" value={formData.district} onChange={handleInputChange} options={districts} />
              </div>

              <div className="bg-white/5 p-8 rounded-3xl border border-white/5 mb-12">
                 <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 block italic">Intimation Notice</label>
                 <p className="text-xl font-black italic text-emerald-500 tracking-tight leading-relaxed selection:bg-emerald-500">
                    "The above proposed activity comes under WHITE CATEGORY, hence does not require CTE/CTO from CECB. This is for your kind intimation."
                 </p>
              </div>

              <div className="flex gap-6 items-center pt-4">
                 <button 
                   type="reset"
                   onClick={() => setFormData({})}
                   className="flex-1 py-6 bg-white/5 border border-white/10 rounded-2xl font-black uppercase italic tracking-widest text-[10px] text-white/50 hover:bg-white/10 hover:text-white transition-all"
                 >
                   Reset Form
                 </button>
                 <button 
                   type="submit"
                   disabled={isSubmitting}
                   className="flex-[2] py-6 bg-primary text-black rounded-2xl font-black uppercase italic tracking-widest text-sm shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
                 >
                   {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : (
                      <>Submit Registration <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" /></>
                   )}
                 </button>
              </div>
           </div>
        </form>
      </div>
    </div>
  );
};

export default IndustryIntimationForm;
