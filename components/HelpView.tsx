
import React from 'react';

const HelpView: React.FC = () => {
  return (
    <div className="bg-white p-10 rounded-lg border border-[#E0E0E0] premium-shadow animate-in fade-in duration-500">
      <h2 className="text-xl font-black text-[#A80000] uppercase mb-8 text-center tracking-[0.2em]">📖 Manual de Uso v17.0</h2>
      
      <div className="space-y-10 text-sm text-[#2C3E50] leading-relaxed">
        <section>
          <h3 className="font-black uppercase mb-3 text-[#A80000] text-[10px] tracking-widest border-b border-[#EEE] pb-2">01. Interfaz de Reporte</h3>
          <p className="opacity-80">El reporte final ahora se presenta como una <strong>Tarjeta Médica</strong>. Los datos críticos como la Dosis Real, el Qb y la UF Neta se resaltan en la parte central. Usa la pestaña desplegable para ver el detalle de bombas.</p>
        </section>

        <div className="bg-[#F8F9FA] border-l-4 border-[#A80000] p-6 rounded">
          <h3 className="font-black uppercase mb-4 text-[#A80000] text-[10px]">🧪 Lógica de Dosimetría v17</h3>
          <p className="opacity-80 mb-4">El sistema automatiza el reparto de efluente según el peso para alcanzar la meta en mL/kg/h:</p>
          <ul className="space-y-2 text-[11px] font-bold">
            <li className="flex items-center gap-2"><i className="fas fa-check-circle text-[#A80000]"></i> CVVHDF: 50% Dializante / 50% Post-filtro.</li>
            <li className="flex items-center gap-2"><i className="fas fa-check-circle text-[#A80000]"></i> CVVHD: 100% Dializante.</li>
            <li className="flex items-center gap-2"><i className="fas fa-check-circle text-[#A80000]"></i> CVVH: 30% Pre-filtro / 70% Post-filtro.</li>
          </ul>
        </div>

        <section>
          <h3 className="font-black uppercase mb-3 text-[#A80000] text-[10px] tracking-widest border-b border-[#EEE] pb-2">02. Barra de Navegación</h3>
          <p className="opacity-80">Navega fluidamente entre la <strong>Prescripción</strong>, los módulos de <strong>Sodio</strong> y <strong>Anticoagulación</strong> usando la barra premium inferior. El estado se guarda mientras no reinicies la aplicación.</p>
        </section>

        <section>
          <h3 className="font-black uppercase mb-3 text-[#A80000] text-[10px] tracking-widest border-b border-[#EEE] pb-2">03. Exportación Profesional</h3>
          <p className="opacity-80">El botón de exportación genera un PDF optimizado con un diseño sobrio, apto para adjuntar a la historia clínica digital o impresa.</p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-[#EEE] text-center">
         <p className="text-[10px] font-black text-[#A80000] uppercase tracking-[0.4em]">Protocolo Soporte Renal Especializado</p>
         <p className="text-[8px] text-slate-400 mt-2 font-bold uppercase">Diseño de Interfaz Elegante • Cullen Pro Series</p>
      </div>
    </div>
  );
};

export default HelpView;
