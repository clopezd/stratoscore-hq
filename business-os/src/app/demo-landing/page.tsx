'use client'

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Bot,
  Stethoscope,
  TrendingUp,
  Settings,
  Calendar,
  ShieldCheck,
  Layers,
  CheckCircle2,
  ChevronRight,
  Menu,
  X,
  Zap,
  Activity,
  BarChart3,
  Globe,
  Cpu,
  MousePointerClick,
  BrainCircuit,
  Target
} from 'lucide-react';

// --- LOGO REAL DE STRATOSCORE (chevrons cyan + wordmark) ---
const StratoscoreBrandLogo = ({ className = "w-48 h-auto" }) => (
  <svg viewBox="0 0 220 56" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Chevrons cyan (marca de acento) */}
    <g>
      {/* Chevron exterior */}
      <polyline
        points="4,10 18,28 4,46"
        stroke="#00F2FE"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      {/* Chevron interior */}
      <polyline
        points="13,18 22,28 13,38"
        stroke="#00F2FE"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>

    {/* Wordmark */}
    <text
      x="34"
      y="29"
      dominantBaseline="middle"
      fontFamily="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
      fontWeight="700"
      fontSize="22"
      letterSpacing="1.5"
      fill="currentColor"
    >
      STRATOSCORE
    </text>
  </svg>
);

export default function DemoLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Solución 360', href: '#360' },
    { name: 'Clínicas', href: '#clinicas' },
    { name: 'Agentes IA', href: '#agentes' },
    { name: 'Contacto', href: '#contacto' }
  ];

  return (
    <div className="min-h-screen bg-[#0A1929] text-white font-sans selection:bg-cyan-500 selection:text-black">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#0A1929]/95 backdrop-blur-xl border-b border-cyan-500/30 py-2' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

          {/* Logo Real StratosCore */}
          <div className="flex items-center cursor-pointer text-white">
            <StratoscoreBrandLogo className="w-48 md:w-56 h-auto" />
          </div>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-xs font-bold text-gray-300 hover:text-cyan-400 transition-all uppercase tracking-widest relative group">
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-500 transition-all group-hover:w-full"></span>
              </a>
            ))}
            <button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black px-8 py-3 rounded-md font-black text-xs uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(0,242,254,0.3)] border border-cyan-400/50">
              RESERVAR CITA
            </button>
          </div>

          <button className="md:hidden text-cyan-500" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0A1929] pt-32 px-10 md:hidden animate-fade-in">
          <div className="flex flex-col gap-8">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-2xl font-black text-cyan-500 uppercase italic" onClick={() => setIsMenuOpen(false)}>
                {link.name}
              </a>
            ))}
            <button className="bg-cyan-500 text-black w-full py-5 rounded-lg font-black text-xl">CONTACTAR</button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Gradients decorativos con paleta StratosCore */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full -z-10"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8">
              <Zap className="w-4 h-4 text-cyan-500 fill-cyan-500" />
              <span className="text-[10px] font-black tracking-[0.2em] text-cyan-200 uppercase">Agencia Agéntica 360</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
              LLEVA TU NEGOCIO A LA <br />
              <span className="text-cyan-500 italic">ESTRATOSFERA</span>
            </h1>
            <p className="max-w-xl mx-auto lg:mx-0 text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
              Transformamos Clínicas y PYMES con sistemas autónomos que <span className="text-white font-bold italic">piensan, venden y ejecutan</span> mientras tú te enfocas en liderar.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
              <button className="group bg-white text-black px-10 py-5 rounded-sm font-black text-lg transition-all hover:bg-cyan-500 flex items-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.1)]">
                EMPEZAR TRANSFORMACIÓN
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
              <div className="flex flex-col items-center lg:items-start">
                <div className="text-cyan-500 font-bold text-sm tracking-widest uppercase">Resultados 360</div>
                <div className="text-gray-500 text-xs">Automatización sin fricciones</div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="bg-gradient-to-tr from-cyan-500/20 to-transparent p-1 rounded-[3rem] border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=800"
                className="rounded-[2.8rem] opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                alt="Empresa Digital Inteligente"
              />
              <div className="absolute -bottom-6 -left-6 bg-[#0A1929] border border-cyan-500/50 p-6 rounded-2xl shadow-2xl animate-float">
                <BrainCircuit className="text-cyan-500 w-10 h-10 mb-2" />
                <span className="text-xs font-black uppercase tracking-widest text-white">IA Agéntica Activa</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-white/5 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-40">
           <span className="font-black text-xl italic tracking-tighter uppercase">Odontología Pro</span>
           <span className="font-black text-xl italic tracking-tighter uppercase">SME Growth</span>
           <span className="font-black text-xl italic tracking-tighter uppercase">HealthTech 360</span>
           <span className="font-black text-xl italic tracking-tighter uppercase">Smart Solutions</span>
        </div>
      </section>

      {/* 360 Solution for SME */}
      <section id="360" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase italic underline decoration-cyan-500/30 underline-offset-8">Infraestructura 360</h2>
            <p className="text-gray-400">Todo lo que tu empresa requiere, operado por inteligencia artificial.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: MousePointerClick, title: "Marketing & Webs", desc: "Páginas diseñadas para convertir y sistemas de pauta que aprenden de tus clientes." },
              { icon: TrendingUp, title: "Seguimiento Automático", desc: "Nunca pierdas un lead. Nuestra IA nutre a tus prospectos hasta el cierre final." },
              { icon: Settings, title: "Sistemas Agénticos", desc: "Agentes autónomos que gestionan inventario, reportes y operaciones internas." }
            ].map((card, i) => (
              <div key={i} className="group p-8 bg-zinc-900/50 border border-white/5 rounded-2xl hover:border-cyan-500/50 transition-all">
                <div className="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cyan-500 transition-colors">
                  <card.icon className="text-cyan-500 group-hover:text-black w-7 h-7" />
                </div>
                <h4 className="text-2xl font-black mb-4 italic uppercase tracking-tighter">{card.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinics Focus - The "Day to Day" Visuals */}
      <section id="clinicas" className="py-24 bg-cyan-500 text-black rounded-[3rem] mx-4 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none italic uppercase">Tu Clínica,<br/>Sin Parar.</h2>
              <p className="text-black/80 text-xl font-medium mb-10 leading-relaxed">
                Entendemos tu día a día: agendas vacías, cancelaciones de último minuto y recepcionistas desbordadas. **Stratoscore** soluciona esto de raíz.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/5 p-6 rounded-2xl border border-black/10">
                  <Calendar className="w-8 h-8 mb-4" />
                  <h5 className="font-black text-sm uppercase">Agenda 24/7</h5>
                  <p className="text-xs text-black/60">Agendamiento directo sin intervención humana.</p>
                </div>
                <div className="bg-black/5 p-6 rounded-2xl border border-black/10">
                  <Target className="w-8 h-8 mb-4" />
                  <h5 className="font-black text-sm uppercase">Pacientes Cualificados</h5>
                  <p className="text-xs text-black/60">Filtramos leads por tratamiento y urgencia.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1590105577767-e21a1067899f?auto=format&fit=crop&q=80&w=800"
                className="rounded-[2rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000"
                alt="Clínica dental trabajando"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-8 py-4 rounded-full font-black text-sm shadow-2xl animate-pulse">
                +45 CITAS NUEVAS ESTA SEMANA
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agentic Reasoner - Advanced Tech */}
      <section id="agentes" className="py-32 bg-[#0A1929]">
        <div className="max-w-7xl mx-auto px-6 text-center mb-20">
          <span className="text-cyan-500 font-black tracking-widest text-xs uppercase mb-4 block">El Futuro es Agéntico</span>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic">TRABAJADORES DIGITALES</h2>
          <p className="max-w-2xl mx-auto text-gray-400">
            Nuestros agentes no solo responden preguntas; son capaces de navegar por tus sistemas, tomar decisiones operativas y reportar resultados.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {[
            { q: "¿Qué hace a un sistema agéntico diferente?", a: "A diferencia de un chatbot normal que solo busca información, un agente agéntico tiene 'objetivos'. Puede navegar por tu CRM, enviar correos a pacientes que no asistieron y re-agendar de forma autónoma." },
            { q: "¿Cómo se integra con mi PYME?", a: "Nosotros construimos la capa de inteligencia sobre tus herramientas actuales (WhatsApp, Email, CRM). La IA actúa como un empleado de élite que nunca duerme." },
            { q: "¿Es seguro el manejo de datos médicos?", a: "Totalmente. Implementamos protocolos de seguridad industrial y cumplimiento normativo para asegurar la privacidad de tus pacientes." }
          ].map((faq, i) => (
            <div key={i} className="p-6 bg-zinc-900 border border-white/5 rounded-xl text-left hover:border-cyan-500/30 transition-all">
              <h5 className="font-black text-lg text-cyan-500 mb-2 italic">0{i+1}. {faq.q}</h5>
              <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-40 relative overflow-hidden text-center bg-gradient-to-b from-[#0A1929] to-cyan-500/10">
        <div className="text-white/30 mb-10">
          <StratoscoreBrandLogo className="w-48 h-auto mx-auto opacity-30 animate-pulse" />
        </div>
        <h2 className="text-6xl md:text-9xl font-black tracking-tighter mb-10 italic leading-none">STRATOSCORE</h2>
        <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-2xl mx-auto font-light italic">
          "La excelencia no es un acto, es un hábito automatizado."
        </p>
        <button className="bg-cyan-500 text-black px-16 py-8 rounded-sm font-black text-2xl hover:bg-white transition-all transform hover:scale-110 shadow-[0_0_100px_rgba(0,242,254,0.3)] uppercase tracking-widest">
          ELEVA TU SCORE HOY
        </button>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center mb-6 text-white">
              <StratoscoreBrandLogo className="w-40 h-auto" />
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Agencia líder en automatización agéntica 360 para PYMES y Clínicas Médicas. Transformando la gestión en resultados reales y escalables.
            </p>
          </div>
          <div>
            <h6 className="font-black text-cyan-500 uppercase text-xs tracking-widest mb-6">Navegación</h6>
            <ul className="space-y-4 text-sm text-gray-400 font-bold">
              <li className="hover:text-white cursor-pointer transition-colors uppercase">Casos de Éxito</li>
              <li className="hover:text-white cursor-pointer transition-colors uppercase">Nuestro Sistema</li>
              <li className="hover:text-white cursor-pointer transition-colors uppercase">Blog IA</li>
            </ul>
          </div>
          <div>
            <h6 className="font-black text-cyan-500 uppercase text-xs tracking-widest mb-6">Contacto</h6>
            <ul className="space-y-4 text-sm text-gray-400 font-bold uppercase">
              <li>contacto@stratoscore.app</li>
              <li>+506 8888 8888</li>
              <li>San José, Costa Rica</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] font-black tracking-widest text-gray-700 uppercase">
          <span>© 2026 STRATOSCORE - Soluciones Inteligentes. Todos los derechos reservados.</span>
          <div className="flex gap-6 mt-4 md:mt-0">
             <span>Privacidad</span>
             <span>Términos</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
