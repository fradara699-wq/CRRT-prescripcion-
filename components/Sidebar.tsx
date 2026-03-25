
import React from 'react';
import { TreatmentCategory } from '../types';

interface SidebarProps {
  activeView: 'prescription' | 'sodium' | 'anticoagulation';
  setActiveView: (view: 'prescription' | 'sodium' | 'anticoagulation') => void;
  activeStep: number;
  setActiveStep: (step: number) => void;
  onExportPdf: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  category: TreatmentCategory;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  setActiveView, 
  activeStep, 
  setActiveStep, 
  onExportPdf,
  isOpen = false,
  onClose,
  category
}) => {
  const prescriptionSteps = [
    { icon: 'fa-id-card', label: 'Info Paciente', sub: 'Watson V', targetId: 'patient-info' },
    { icon: 'fa-cogs', label: 'Setup Técnico', sub: category, targetId: 'hardware-config' },
    { icon: 'fa-balance-scale', label: 'Meta Balance', sub: 'UF Neta', targetId: 'balance-config' },
  ];

  const handlePrescriptionClick = (idx: number, targetId: string) => {
    setActiveView('prescription');
    setActiveStep(idx);
    if (onClose) onClose();
    
    setTimeout(() => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleModuleClick = (view: 'sodium' | 'anticoagulation') => {
    setActiveView(view);
    if (onClose) onClose();
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-400 p-5 
      border-r border-slate-800 shadow-2xl transition-transform duration-300 transform
      md:relative md:translate-x-0 md:flex md:flex-col h-screen
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <button 
        onClick={onClose}
        className="md:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white"
      >
        <i className="fas fa-times"></i>
      </button>

      <div className="flex items-center gap-3 text-white mb-8 px-2">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <i className="fas fa-heartbeat text-xl"></i>
        </div>
        <span className="font-bold text-xl tracking-tight italic">Cullen<span className="text-blue-500 not-italic">Pro</span></span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 no-scrollbar pb-4">
        <div>
          <p className="px-3 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Protocolo {category}</p>
          <nav className="space-y-3 px-1">
            {prescriptionSteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => handlePrescriptionClick(idx, step.targetId)}
                className={`w-full group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 border-2 overflow-hidden shadow-md ${
                  activeView === 'prescription' && activeStep === idx 
                    ? 'bg-blue-600 border-blue-400 text-white shadow-blue-900/40 scale-[1.02]' 
                    : 'bg-slate-800 border-slate-900 text-white/90 hover:bg-slate-700 hover:border-slate-600 shadow-slate-950/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 shadow-inner ${
                  activeView === 'prescription' && activeStep === idx ? 'bg-white text-blue-600' : 'bg-slate-500/30 text-white'
                }`}>
                  <i className={`fas ${step.icon} text-base`}></i>
                </div>
                <div className="text-left overflow-hidden">
                  <span className="block font-black text-[10px] uppercase tracking-[0.05em] text-white truncate">{step.label}</span>
                  <span className="block text-[8px] font-bold opacity-70 uppercase tracking-widest text-white truncate">{step.sub}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-4 px-1">
          <p className="px-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Cálculos Críticos</p>
          <div className="space-y-3">
            <button
              onClick={() => handleModuleClick('sodium')}
              className={`w-full group relative flex items-center gap-3 p-4 rounded-xl transition-all duration-500 border-2 overflow-hidden shadow-lg ${
                activeView === 'sodium'
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-900/40 scale-[1.02]' 
                  : 'bg-indigo-800 border-indigo-900 text-white/90 hover:bg-indigo-700 hover:border-indigo-600 shadow-indigo-950/40'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-inner ${
                activeView === 'sodium' ? 'bg-white text-indigo-600' : 'bg-indigo-500/30 text-white'
              }`}>
                <i className="fas fa-flask-vial text-xl"></i>
              </div>
              <div className="text-left">
                <span className="block font-black text-[11px] uppercase tracking-[0.1em] text-white">Manejo de Sodio</span>
                <span className="block text-[9px] font-bold opacity-80 uppercase tracking-widest text-white mt-0.5">Disnatremias</span>
              </div>
            </button>

            <button
              onClick={() => handleModuleClick('anticoagulation')}
              className={`w-full group relative flex items-center gap-3 p-4 rounded-xl transition-all duration-500 border-2 overflow-hidden shadow-lg ${
                activeView === 'anticoagulation'
                  ? 'bg-rose-600 border-rose-400 text-white shadow-rose-900/40 scale-[1.02]' 
                  : 'bg-rose-800 border-rose-900 text-white/90 hover:bg-rose-700 hover:border-rose-600 shadow-slate-950/40'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-inner ${
                activeView === 'anticoagulation' ? 'bg-white text-rose-600' : 'bg-rose-500/30 text-white'
              }`}>
                <i className="fas fa-droplet text-xl"></i>
              </div>
              <div className="text-left">
                <span className="block font-black text-[11px] uppercase tracking-[0.1em] text-white">Anticoagulación</span>
                <span className="block text-[9px] font-bold opacity-80 uppercase tracking-widest text-white mt-0.5">Regional</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-4">
        <button
          onClick={onExportPdf}
          className="w-full relative group bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-4 rounded-xl shadow-xl shadow-blue-900/60 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 border-2 border-blue-400/40"
        >
          <i className="fas fa-file-pdf text-xl group-hover:rotate-6 transition-transform text-white"></i>
          <span className="text-[10px] uppercase tracking-[0.15em] text-white">Exportar PDF Premium</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
