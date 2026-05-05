"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function VenueWinesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [masterWines, setMasterWines] = useState<any[]>([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [venueWines, setVenueWines] = useState<any[]>([]);
  const [searchWine, setSearchWine] = useState('');

  useEffect(() => {
    loadInitData();
  }, []);

  async function loadInitData() {
    const { data: v } = await supabase.from('sm_venues').select('*').order('name');
    const { data: mw } = await supabase.from('sm_master_wines').select('*').order('name');
    setVenues(v || []);
    setMasterWines(mw || []);
  }

  // Carica i vini già associati al locale selezionato
  async function loadVenueWines(venueId: string) {
    if (!venueId) return;
    const { data, error } = await supabase
      .from('sm_venue_wines')
      .select('*, sm_master_wines(*)')
      .eq('venue_id', venueId);
    
    if (error) console.error(error);
    else setVenueWines(data || []);
  }

  // Funzione per aggiungere un vino al locale
  async function associateWine(wine: any) {
    const price = prompt(`Inserisci il prezzo per ${wine.name} nel locale:`);
    if (price === null) return;

    const { error } = await supabase.from('sm_venue_wines').upsert({
      venue_id: selectedVenue,
      wine_id: wine.id,
      price: parseFloat(price),
      category: wine.wine_type, // Prende automaticamente la tipologia dal master!
      is_available: true
    });

    if (error) alert('Errore nell\'associazione');
    else loadVenueWines(selectedVenue);
  }

  async function updatePrice(id: string, newPrice: string) {
    await supabase.from('sm_venue_wines').update({ price: parseFloat(newPrice) }).eq('id', id);
    loadVenueWines(selectedVenue);
  }

  async function toggleAvailability(id: string, current: boolean) {
    await supabase.from('sm_venue_wines').update({ is_available: !current }).eq('id', id);
    loadVenueWines(selectedVenue);
  }

  async function dissociateWine(id: string) {
    if (confirm('Rimuovere questo vino dalla carta di questo locale?')) {
      await supabase.from('sm_venue_wines').delete().eq('id', id);
      loadVenueWines(selectedVenue);
    }
  }

  const filteredMaster = masterWines.filter(w => w.name.toLowerCase().includes(searchWine.toLowerCase()));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Associazione Vini 🍷</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNA SINISTRA: Selezione Locale e Ricerca Master */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <label className="block font-bold mb-2">1. Scegli il Locale</label>
            <select 
              className="w-full border p-2 rounded text-black" 
              value={selectedVenue} 
              onChange={(e) => { setSelectedVenue(e.target.value); loadVenueWines(e.target.value); }}
            >
              <option value="">-- Seleziona Locale --</option>
              {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>

          {selectedVenue && (
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <label className="block font-bold mb-2">2. Aggiungi Vino dal Master</label>
              <input 
                type="text" 
                placeholder="Cerca vino nel master..." 
                className="w-full border p-2 rounded mb-4 text-black" 
                onChange={(e) => setSearchWine(e.target.value)}
              />
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredMaster.map(wine => (
                  <div key={wine.id} className="flex justify-between items-center p-2 hover:bg-gray-50 border rounded group">
                    <span className="text-sm">{wine.name}</span>
                    <button 
                      onClick={() => associateWine(wine)}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      + Aggiungi
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COLONNA DESTRA: La Carta Vini del Locale */}
        <div className="lg:col-span-2">
          {!selectedVenue ? (
            <div className="h-full flex items-center justify-center text-gray-400 italic border-2 border-dashed rounded-xl p-20">
              Seleziona un locale per gestire la sua carta vini
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-xl font-bold mb-6">Vini associati al locale</h2>
              <div className="space-y-4">
                {venueWines.map(vw => (
                  <div key={vw.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-4">
                      <img src={vw.sm_master_wines?.image_url} className="w-8 h-12 object-contain" />
                      <div>
                        <span className="font-bold block">{vw.sm_master_wines?.name}</span>
                        <span className="text-xs text-gray-500">{vw.category} • {vw.sm_master_wines?.region}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">€</span>
                        <input 
                          type="number" 
                          className="w-20 border p-1 rounded text-center text-black" 
                          value={vw.price} 
                          onChange={(e) => updatePrice(vw.id, e.target.value)}
                        />
                      </div>
                      <button 
                        onClick={() => toggleAvailability(vw.id, vw.is_available)}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${vw.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {vw.is_available ? 'Disponibile' : 'Esaurito'}
                      </button>
                      <button onClick={() => dissociateWine(vw.id)} className="text-red-400 hover:text-red-600">🗑️</button>
                    </div>
                  </div>
                ))}
                {venueWines.length === 0 && <div className="text-center py-10 text-gray-400">Nessun vino associato. Usa il pannello a sinistra per aggiungerli.</div>}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}