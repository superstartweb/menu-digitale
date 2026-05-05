"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function PublicMenu() {
  const params = useParams();
  const venueId = params.id;

  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'food' | 'drink' | 'wine'>('wine');
  
  // STATI PER LA NAVIGAZIONE SOTTO-CATEGORIE
  const [activeWineCat, setActiveWineCat] = useState<string>('');
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  
  const [menuData, setMenuData] = useState<{sections: any[], items: any[]}>({ sections: [], items: [] });
  const [wineData, setWineData] = useState<any[]>([]);
  const [wineCategories, setWineCategories] = useState<any[]>([]);
  const [allergens, setAllergens] = useState<any[]>([]);

  const [selectedWinery, setSelectedWinery] = useState<any>(null);
  const [showAllergens, setShowAllergens] = useState(false);

  useEffect(() => {
    async function loadAll() {
      try {
        const { data: v } = await supabase.from('sm_venues').select('*').eq('id', venueId).single();
        setVenue(v);

        const { data: s } = await supabase.from('sm_menu_sections').select('*').eq('venue_id', venueId).order('position');
        const { data: i } = await supabase.from('sm_menu_items').select('*').order('position');
        setMenuData({ sections: s || [], items: i || [] });

        const { data: w } = await supabase.from('sm_venue_wines').select('*, sm_master_wines(*, sm_wineries(*))').eq('venue_id', venueId).order('position');
        setWineData(w || []);

        const { data: cats } = await supabase.from('sm_wine_categories').select('*').order('position');
        setWineCategories(cats || []);

        const { data: a } = await supabase.from('sm_allergens').select('*').order('id');
        setAllergens(a || []);

        // Impostazione default
        if (cats && cats.length > 0) setActiveWineCat(cats[0].name);
        if (s && s.length > 0) setActiveSectionId(s[0].id);
        
      } catch (e) {
        console.error("Errore:", e);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [venueId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gray-300"></div></div>;
  if (!venue || !venue.is_active) return <div className="min-h-screen flex items-center justify-center p-6 text-center bg-white text-gray-800"><h1>Menù non disponibile</h1></div>;

  const hasFood = menuData.sections.some(s => s.type === 'food');
  const hasDrinks = menuData.sections.some(s => s.type === 'drink');
  const hasWines = wineData.length > 0;

  const goToRecommendedWine = (wineId: string) => {
    const wine = wineData.find(vw => vw.sm_master_wines?.id === wineId);
    if (wine) {
      setActiveTab('wine');
      setActiveWineCat(wine.category);
      setTimeout(() => {
        const element = document.getElementById(`wine-${wineId}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 text-slate-800 font-sans">
      <header className="pt-12 pb-8 px-4 text-center bg-white">
        <div className="flex justify-center mb-6">
          {venue.logo_url ? <img src={venue.logo_url} alt={venue.name} className="h-24 w-auto object-contain" /> : <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">No Logo</div>}
        </div>
        <h1 className="text-3xl font-bold text-slate-700 tracking-tight">{venue.name}</h1>
      </header>

      {/* NAVIGAZIONE PRINCIPALE */}
      <nav className="flex justify-around bg-white border-b sticky top-0 z-20 shadow-sm">
        {hasWines && (
          <button onClick={() => setActiveTab('wine')} className={`flex-1 py-4 text-xs font-bold tracking-widest transition ${activeTab === 'wine' ? 'text-red-900 border-b-2 border-red-900' : 'text-gray-400'}`}>CARTA VINI</button>
        )}
        {hasFood && (
          <button onClick={() => setActiveTab('food')} className={`flex-1 py-4 text-xs font-bold tracking-widest transition ${activeTab === 'food' ? 'text-red-900 border-b-2 border-red-900' : 'text-gray-400'}`}>MENÙ</button>
        )}
        {hasDrinks && (
          <button onClick={() => setActiveTab('drink')} className={`flex-1 py-4 text-xs font-bold tracking-widest transition ${activeTab === 'drink' ? 'text-red-900 border-b-2 border-red-900' : 'text-gray-400'}`}>DRINK</button>
        )}
      </nav>

      {/* SOTTO-NAVIGAZIONE DINAMICA (Vini, Cibo o Drink) */}
      <div className="sticky top-[61px] z-20 bg-white border-b shadow-sm overflow-x-auto no-scrollbar">
        {activeTab === 'wine' && (
          <div className="flex border-t-4 border-t-red-900">
            {wineCategories.map(cat => (
              <button key={cat.id} onClick={() => setActiveWineCat(cat.name)} className={`flex-1 min-w-fit px-6 py-4 text-xs font-black uppercase tracking-widest transition ${activeWineCat === cat.name ? 'text-red-800 bg-red-50 border-b-4 border-red-900' : 'text-gray-400'}`}>
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {(activeTab === 'food' || activeTab === 'drink') && (
          <div className="flex justify-center gap-2 p-4">
            {menuData.sections.filter(s => s.type === activeTab).map(section => (
              <button 
                key={section.id} 
                onClick={() => setActiveSectionId(section.id)}
                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition shadow-sm border ${activeSectionId === section.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
              >
                {section.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="p-4 max-w-4xl mx-auto">
        {(activeTab === 'food' || activeTab === 'drink') && (
          <div className="mt-6">
            {/* Mostra solo i piatti della sezione selezionata */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {menuData.items.filter(item => {
                const section = menuData.sections.find(s => s.id === item.section_id);
                return section?.id === activeSectionId;
              }).map(item => {
                const recommendedWine = wineData.find(vw => vw.sm_master_wines?.id === item.recommended_wine_id);
                return (
                  <div key={item.id} className="bg-white p-3 md:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="font-bold text-sm md:text-lg text-slate-900 leading-tight">{item.name_it}</h3>
                        <span className="font-serif font-bold text-sm md:text-lg text-red-900 whitespace-nowrap">€ {item.price}</span>
                      </div>
                      <p className="text-[10px] md:text-sm text-gray-500 italic mb-3">{item.name_en}</p>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => setShowAllergens(true)} className="text-[9px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-md border border-gray-100 text-left">
                          Allergeni: {item.allergens || 'Nessuno'}
                        </button>
                        {recommendedWine && (
                          <button onClick={() => goToRecommendedWine(item.recommended_wine_id)} className="text-[9px] bg-red-50 text-red-800 px-2 py-0.5 rounded-md border border-red-100 font-bold text-left hover:bg-red-100 transition">
                            🍷 {recommendedWine.sm_master_wines.name}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Messaggio se la sezione è vuota */}
            {menuData.items.filter(item => item.section_id === activeSectionId).length === 0 && (
              <div className="text-center py-20 text-gray-400 italic">Nessun piatto in questa sezione.</div>
            )}
          </div>
        )}

        {activeTab === 'wine' && (
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
              {wineData.filter(vw => vw.category === activeWineCat).map(vw => {
                const wine = vw.sm_master_wines;
                const winery = wine?.sm_wineries;
                return (
                  <div key={vw.id} id={`wine-${vw.sm_master_wines?.id}`} className="flex flex-col items-center text-center bg-white p-2">
                    <img src={wine?.image_url} className="h-64 object-contain mb-4" alt={wine?.name} />
                    <h3 className="text-2xl font-bold text-red-700 mb-1">{wine?.name}</h3>
                    <button onClick={() => setSelectedWinery(winery)} className="text-lg font-semibold text-slate-900 hover:text-red-700 transition underline underline-offset-4 mb-1">{winery?.name}</button>
                    <p className="text-md text-red-700 font-medium mb-1">{wine?.region}</p>
                    <p className="text-xl font-bold mb-6">€ {vw.price}</p>
                    <div className="w-full text-left text-sm space-y-1 border-t border-gray-100 pt-4">
                      {[
                        { label: 'Denominazione', val: wine?.denomination },
                        { label: 'Affinamento', val: wine?.aging },
                        { label: 'Uve', val: wine?.blend },
                        { label: 'Gradazione alcolica', val: wine?.alcohol_percentage ? `${wine?.alcohol_percentage}%` : '' },
                      ].map((row, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <span className="text-red-600 text-xs">✔</span>
                          <span className="text-slate-500 font-medium">{row.label}:</span> 
                          <span className="text-slate-700">{row.val}</span>
                        </div>
                      ))}
                      <div className="mt-3">
                        <div className="flex gap-2 items-start">
                          <span className="text-red-600 text-xs">✔</span>
                          <span className="text-slate-500 font-medium">Olfatto:</span> 
                          <span className="text-slate-700 italic leading-tight">{wine?.smell_description}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex gap-2 items-start">
                          <span className="text-red-600 text-xs">✔</span>
                          <span className="text-slate-500 font-medium">Gusto:</span> 
                          <span className="text-slate-700 italic leading-tight">{wine?.taste_description}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* MODALS e FOOTER (Mantengo quelli lussuosi della versione precedente) */}
      {selectedWinery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto p-8 relative animate-in fade-in zoom-in duration-300 border-t-8 border-slate-800">
            <button onClick={() => setSelectedWinery(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
            <div className="flex justify-center mb-6">
              {selectedWinery.logo_url ? <img src={selectedWinery.logo_url} className="h-24 object-contain" /> : <div className="h-24 w-24 bg-gray-100 rounded-full" />}
            </div>
            <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">{selectedWinery.name}</h2>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3 items-start">
                <span className="text-xl">📍</span>
                <div><span className="font-bold text-slate-700 block">Territorio</span><p className="text-slate-600">{selectedWinery.territory || 'Informazione non disponibile'}</p></div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-xl">🌿</span>
                <div><span className="font-bold text-slate-700 block">Coltura & Filosofia</span><p className="text-slate-600">{selectedWinery.cultivation || 'Informazione non disponibile'}</p></div>
              </div>
              {selectedWinery.foundation_year && (
                <div className="flex gap-3 items-start">
                  <span className="text-xl">📅</span>
                  <div><span className="font-bold text-slate-700 block">Fondazione</span><p className="text-slate-600">{selectedWinery.foundation_year}</p></div>
                </div>
              )}
              <div className="pt-4 border-t border-gray-100">
                <span className="font-bold text-slate-700 block mb-2">Il Racconto</span>
                <p className="text-slate-600 leading-relaxed italic">{selectedWinery.story || 'Nessun racconto disponibile.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAllergens && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300 border-t-8 border-slate-800">
            <button onClick={() => setShowAllergens(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
            <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Legenda Allergeni</h2>
            <div className="grid gap-3 max-h-96 overflow-y-auto pr-2">
              {allergens.map(a => (
                <div key={a.id} className="flex gap-3 text-sm border-b border-gray-50 pb-2">
                  <span className="font-bold text-red-600">{a.id}.</span>
                  <span className="text-gray-700">{a.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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