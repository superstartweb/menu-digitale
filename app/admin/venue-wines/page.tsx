"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function VenueWinesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [masterWines, setMasterWines] = useState<any[]>([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [venueWines, setVenueWines] = useState<any[]>([]);
  const [searchWine, setSearchWine] = useState('');

  useEffect(() => { loadInitData(); }, []);

  async function loadInitData() {
    const { data: v } = await supabase.from('sm_venues').select('*').order('name');
    const { data: mw } = await supabase.from('sm_master_wines').select('*').order('name');
    setVenues(v || []);
    setMasterWines(mw || []);
  }

  async function loadVenueWines(venueId: string) {
    if (!venueId) return;
    const { data, error } = await supabase
      .from('sm_venue_wines')
      .select('*, sm_master_wines(*)')
      .eq('venue_id', venueId)
      .order('position');
    
    if (error) console.error(error);
    else setVenueWines(data || []);
  }

  async function associateWine(wine: any) {
    const price = prompt(`Prezzo per ${wine.name}:`);
    if (price === null) return;

    const { error } = await supabase.from('sm_venue_wines').upsert({
      venue_id: selectedVenue,
      wine_id: wine.id,
      price: parseFloat(price.replace(',', '.')),
      category: wine.wine_type,
      is_available: true
    });

    if (error) alert('Errore nell\'associazione');
    else loadVenueWines(selectedVenue);
  }

  async function updatePrice(id: string, newPrice: string) {
    const numericPrice = parseFloat(newPrice.replace(',', '.'));
    if (isNaN(numericPrice)) return;
    await supabase.from('sm_venue_wines').update({ price: numericPrice }).eq('id', id);
    // Non ricarichiamo tutto per evitare sfarfallio, aggiorniamo solo lo stato locale se necessario
  }

  async function toggleAvailability(id: string, current: boolean) {
    await supabase.from('sm_venue_wines').update({ is_available: !current }).eq('id', id);
    loadVenueWines(selectedVenue);
  }

  async function dissociateWine(id: string) {
    if (confirm('Rimuovere questo vino dalla carta?')) {
      await supabase.from('sm_venue_wines').delete().eq('id', id);
      loadVenueWines(selectedVenue);
    }
  }

  const filteredMaster = masterWines.filter(w => w.name.toLowerCase().includes(searchWine.toLowerCase()));
  const categories = ['Bollicine', 'Bianchi', 'Rosé/Orange', 'Rossi', 'Dolci/Passiti'];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Wine Manager Pro 🍷</h1>
        <button onClick={() => window.history.back()} className="text-blue-600 font-bold text-sm">← Dashboard</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* PANEL SINISTRO: SELEZIONE E AGGIUNTA */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <label className="block font-bold mb-2 text-sm uppercase text-gray-500">1. Locale</label>
            <select className="w-full border p-2 rounded-lg text-black font-medium" value={selectedVenue} onChange={(e) => { setSelectedVenue(e.target.value); loadVenueWines(e.target.value); }}>
              <option value="">-- Seleziona --</option>
              {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>

          {selectedVenue && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <label className="block font-bold mb-2 text-sm uppercase text-gray-500">2. Aggiungi dal Master</label>
              <input type="text" placeholder="Cerca vino..." className="w-full border p-2 rounded-lg mb-4 text-black text-sm" onChange={(e) => setSearchWine(e.target.value)} />
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredMaster.map(wine => (
                  <div key={wine.id} className="flex justify-between items-center p-2 hover:bg-gray-50 border rounded-lg group transition">
                    <span className="text-xs font-medium">{wine.name}</span>
                    <button onClick={() => associateWine(wine)} className="bg-blue-600 text-white px-2 py-1 rounded-md text-[10px] opacity-0 group-hover:opacity-100 transition">Add</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PANEL DESTRO: GRID DI GESTIONE */}
        <div className="lg:col-span-3">
          {!selectedVenue ? (
            <div className="h-full flex items-center justify-center text-gray-400 italic border-2 border-dashed rounded-2xl p-20">Seleziona un locale per gestire la carta vini</div>
          ) : (
            <div className="space-y-12">
              {categories.map(cat => {
                const winesInCat = venueWines.filter(vw => vw.category === cat);
                if (winesInCat.length === 0) return null;

                return (
                  <div key={cat} className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-700 border-b pb-2 flex items-center gap-2">
                      <span className="w-2 h-6 bg-red-900 rounded-full"></span> {cat}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {winesInCat.map(vw => (
                        <div key={vw.id} className={`p-4 rounded-2xl border transition shadow-sm flex flex-col justify-between ${vw.is_available ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
                          <div className="text-center mb-4">
                            <img src={vw.sm_master_wines?.image_url} className="h-24 mx-auto object-contain mb-2" />
                            <h3 className="font-bold text-sm leading-tight mb-1">{vw.sm_master_wines?.name}</h3>
                            <p className="text-[10px] text-gray-400 uppercase">{vw.sm_master_wines?.sm_wineries?.name}</p>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border">
                              <span className="text-xs font-bold text-gray-500">€</span>
                              <input 
                                type="text" 
                                className="w-full text-right bg-transparent font-bold text-sm outline-none" 
                                value={vw.price} 
                                onChange={(e) => updatePrice(vw.id, e.target.value)} 
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              <button 
                                onClick={() => toggleAvailability(vw.id, vw.is_available)}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition ${vw.is_available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                              >
                                {vw.is_available ? 'Sì' : 'No'}
                              </button>
                              <button onClick={() => dissociateWine(vw.id)} className="p-1.5 bg-gray-100 text-gray-400 rounded-lg hover:text-red-600 transition">🗑️</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}