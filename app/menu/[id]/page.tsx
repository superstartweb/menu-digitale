"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function PublicMenu() {
  const params = useParams();
  const venueId = params.id;

  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'food' | 'drink' | 'wine'>('food');
  
  const [menuData, setMenuData] = useState<{sections: any[], items: any[]}>({ sections: [], items: [] });
  const [wineData, setWineData] = useState<any[]>([]);
  const [allergens, setAllergens] = useState<any[]>([]);

  const [selectedWinery, setSelectedWinery] = useState<any>(null);
  const [showAllergens, setShowAllergens] = useState(false);

  useEffect(() => {
    async function loadAll() {
      const { data: v } = await supabase.from('sm_venues').select('*').eq('id', venueId).single();
      setVenue(v);

      const { data: s } = await supabase.from('sm_menu_sections').select('*').eq('venue_id', venueId).order('position');
      const { data: i } = await supabase.from('sm_menu_items').select('*').order('position');
      setMenuData({ sections: s || [], items: i || [] });

      const { data: w } = await supabase.from('sm_venue_wines').select('*, sm_master_wines(*, sm_wineries(*))').eq('venue_id', venueId).order('position');
      setWineData(w || []);

      const { data: a } = await supabase.from('sm_allergens').select('*').order('id');
      setAllergens(a || []);

      setLoading(false);
    }
    loadAll();
  }, [venueId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-900"></div></div>;
  if (!venue || !venue.is_active) return <div className="min-h-screen flex items-center justify-center p-6 text-center bg-white text-gray-800"><h1>Menù non disponibile</h1></div>;

  const hasFood = menuData.sections.some(s => s.type === 'food');
  const hasDrinks = menuData.sections.some(s => s.type === 'drink');
  const hasWines = wineData.length > 0;

  // FUNZIONE: Salta al vino consigliato
  const goToRecommendedWine = (wineId: string) => {
    setActiveTab('wine');
    // Diamo un piccolo tempo per il cambio tab e poi scrolliamo verso l'elemento
    setTimeout(() => {
      const element = document.getElementById(`wine-${wineId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element?.classList.add('ring-4', 'ring-red-200', 'transition-all');
      setTimeout(() => element?.classList.remove('ring-4', 'ring-red-200'), 2000);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white pb-24 text-gray-900">
      {/* Header - Pulito e Bianco */}
      <header className="pt-12 pb-8 px-4 text-center bg-white">
        <div className="flex justify-center mb-6">
          {venue.logo_url ? <img src={venue.logo_url} alt={venue.name} className="h-28 w-auto object-contain" /> : <div className="h-28 w-28 bg-gray-100 rounded-full flex items-center justify-center">No Logo</div>}
        </div>
        <h1 className="text-4xl font-serif font-bold text-red-900 tracking-tight">{venue.name}</h1>
      </header>

      {/* Navigazione - Colori Vino */}
      <nav className="flex justify-around bg-white border-b sticky top-0 z-20 shadow-sm">
        {hasFood && (
          <button onClick={() => setActiveTab('food')} className={`flex-1 py-4 text-xs font-black tracking-widest transition ${activeTab === 'food' ? 'text-red-900 border-b-2 border-red-900' : 'text-gray-400'}`}>MENÙ</button>
        )}
        {hasDrinks && (
          <button onClick={() => setActiveTab('drink')} className={`flex-1 py-4 text-xs font-black tracking-widest transition ${activeTab === 'drink' ? 'text-red-900 border-b-2 border-red-900' : 'text-gray-400'}`}>DRINK</button>
        )}
        {hasWines && (
          <button onClick={() => setActiveTab('wine')} className={`flex-1 py-4 text-xs font-black tracking-widest transition ${activeTab === 'wine' ? 'text-red-900 border-b-2 border-red-900' : 'text-gray-400'}`}>CARTA VINI</button>
        )}
      </nav>

      <main className="p-4 max-w-2xl mx-auto">
        {/* VIEW FOOD & DRINK */}
        {(activeTab === 'food' || activeTab === 'drink') && (
          <div className="space-y-12 mt-6">
            {menuData.sections.filter(s => s.type === activeTab).map(section => (
              <div key={section.id} className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-red-900 text-center uppercase tracking-widest border-b border-red-100 pb-2">{section.name}</h2>
                <div className="grid gap-8">
                  {menuData.items.filter(item => item.section_id === section.id).map(item => {
                    const recommendedWine = wineData.find(vw => vw.sm_master_wines?.id === item.recommended_wine_id);
                    return (
                      <div key={item.id} className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">{item.name_it}</h3>
                          <p className="text-sm text-gray-500 italic">{item.name_en}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <button 
                              onClick={() => setShowAllergens(true)}
                              className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full hover:bg-gray-200 transition"
                            >
                              Allergeni: {item.allergens || 'Nessuno'}
                            </button>
                            {recommendedWine && (
                              <button 
                                onClick={() => goToRecommendedWine(item.recommended_wine_id)}
                                className="text-[10px] bg-red-50 text-red-800 px-2 py-0.5 rounded-full border border-red-100 font-bold hover:bg-red-100 transition"
                              >
                                🍷 Consigliato: {recommendedWine.sm_master_wines.name}
                              </button>
                            )}
                          </div>
                        </div>
                        <span className="font-serif font-bold text-xl text-red-900">€ {item.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW WINE "WOW" - Identica allo screen */}
        {activeTab === 'wine' && (
          <div className="space-y-16 mt-6">
            {['Bollicine', 'Bianchi', 'Rosé/Orange', 'Rossi', 'Dolci/Passiti'].map(cat => {
              const filteredWines = wineData.filter(vw => vw.category === cat);
              if (filteredWines.length === 0) return null;

              return (
                <div key={cat} className="space-y-10">
                  <h2 className="text-center text-2xl font-serif font-bold text-red-900 uppercase tracking-[0.2em] border-b-2 border-double border-red-200 pb-2">{cat}</h2>
                  <div className="grid gap-16">
                    {filteredWines.map(vw => {
                      const wine = vw.sm_master_wines;
                      const winery = wine?.sm_wineries;
                      return (
                        <div key={vw.id} id={`wine-${vw.sm_master_wines?.id}`} className="flex flex-col items-center text-center bg-white p-4 rounded-lg transition-all duration-500">
                          <img src={wine?.image_url} className="h-72 object-contain mb-6 drop-shadow-2xl" alt={wine?.name} />
                          <h3 className="text-3xl font-serif font-bold text-red-800 mb-2">{wine?.name}</h3>
                          <button 
                            onClick={() => setSelectedWinery(winery)}
                            className="text-xl font-semibold text-gray-900 hover:text-red-800 transition underline underline-offset-4 mb-1"
                          >
                            {winery?.name}
                          </button>
                          <p className="text-lg text-red-700 font-medium mb-2">{wine?.region}</p>
                          <p className="text-2xl font-serif font-bold mb-8">€ {vw.price}</p>
                          
                          {/* Scheda Tecnica - Minimalista */}
                          <div className="w-full max-w-md grid grid-cols-1 gap-y-3 text-left text-sm border-t border-gray-100 pt-6">
                            {[
                              { label: 'Denominazione', val: wine?.denomination },
                              { label: 'Affinamento', val: wine?.aging },
                              { label: 'Uve', val: wine?.blend },
                              { label: 'Gradazione alcolica', val: wine?.alcohol_percentage ? `${wine?.alcohol_percentage}%` : '' },
                            ].map((row, i) => (
                              <div key={i} className="flex gap-2">
                                <span className="text-red-800 font-bold">{row.label}:</span> 
                                <span className="text-gray-600">{row.val}</span>
                              </div>
                            ))}
                            <div className="mt-4">
                              <span className="text-red-800 font-bold block mb-1">Olfatto:</span>
                              <p className="text-gray-600 italic leading-relaxed text-sm">{wine?.smell_description}</p>
                            </div>
                            <div className="mt-3">
                              <span className="text-red-800 font-bold block mb-1">Gusto:</span>
                              <p className="text-gray-600 italic leading-relaxed text-sm">{wine?.taste_description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL CANTINA - Elegante */}
      {selectedWinery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300 border-t-8 border-red-900">
            <button onClick={() => setSelectedWinery(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
            <div className="flex justify-center mb-6">
              {selectedWinery.logo_url ? <img src={selectedWinery.logo_url} className="h-20 object-contain" /> : <div className="h-20 w-20 bg-gray-100 rounded-full" />}
            </div>
            <h2 className="text-2xl font-serif font-bold text-center text-red-900 mb-4">{selectedWinery.name}</h2>
            <p className="text-gray-600 text-center leading-relaxed italic">{selectedWinery.description}</p>
          </div>
        </div>
      )}

      {/* MODAL ALLERGENI */}
      {showAllergens && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300 border-t-8 border-red-900">
            <button onClick={() => setShowAllergens(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
            <h2 className="text-2xl font-serif font-bold mb-6 text-center text-red-900">Legenda Allergeni</h2>
            <div className="grid gap-3 max-h-96 overflow-y-auto pr-2">
              {allergens.map(a => (
                <div key={a.id} className="flex gap-3 text-sm border-b border-gray-50 pb-2">
                  <span className="font-bold text-red-800">{a.id}.</span>
                  <span className="text-gray-700">{a.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Super HO.RE.CA. */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 text-center shadow-lg z-10">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">SuPeR HO.RE.CA. Edition</p>
        <div className="flex justify-center gap-4 text-xs text-gray-600 font-medium">
          <a href="tel:+393934533500" className="hover:text-red-800 transition">📞 Tel</a>
          <a href="https://wa.me/393934533500" className="hover:text-green-600 transition">💬 WhatsApp</a>
          <a href="mailto:info@superstart.it" className="hover:text-red-800 transition">✉️ Mail</a>
          <a href="https://www.superstart.it" className="hover:text-red-800 transition">🌐 Sito</a>
        </div>
      </footer>
    </div>
  );
}