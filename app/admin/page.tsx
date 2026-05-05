"use client";
import Link from 'next/link';

const adminModules = [
  { name: 'Gestione Locali', path: '/admin/venues', icon: '🏢', desc: 'Crea e attiva i locali' },
  { name: 'Enciclopedia Vini', path: '/admin/master-wines', icon: '📖', desc: 'Gestisci l\'archivio globale' },
  { name: 'Associazione Vini', path: '/admin/venue-wines', icon: '🍷', desc: 'Assegna vini e prezzi ai locali' },
  { name: 'Menù e Drink', path: '/admin/venue-menu', icon: '🍽️', desc: 'Crea sezioni e piatti' },
  { name: 'Vedi Menù Pubblico', path: '/menu', icon: '📱', desc: 'Anteprima lato cliente' },
];

export default function AdminDashboard() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-black mb-2">Super Menu <span className="text-blue-600">Admin</span></h1>
        <p className="text-gray-500">Benvenuto, Manager. Cosa vogliamo configurare oggi?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminModules.map((mod) => (
          <Link 
            key={mod.path} 
            href={mod.path}
            className="group p-6 bg-white border rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-500 transition-all duration-300 flex flex-col items-start"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{mod.icon}</div>
            <h2 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{mod.name}</h2>
            <p className="text-gray-500 text-sm">{mod.desc}</p>
            <div className="mt-4 text-blue-600 text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Entra nel pannello $\rightarrow$
            </div>
          </Link>
        ))}
      </div>

      <footer className="mt-20 text-center text-gray-400 text-xs">
        SuPeR HO.RE.CA. Edition &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}