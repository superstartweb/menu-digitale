"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function VenuesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');

  async function fetchVenues() {
    const { data, error } = await supabase.from('sm_venues').select('*');
    if (error) console.error('Errore:', error);
    else setVenues(data || []);
  }

  useEffect(() => {
    fetchVenues();
  }, []);

  async function addVenue(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('sm_venues').insert([{ name, logo_url: logo }]);
    if (error) alert('Errore nell\'inserimento');
    else {
      setName('');
      setLogo('');
      fetchVenues();
    }
  }

  // NUOVA FUNZIONE: Cambia lo stato Attivo/Disattivo
  async function toggleStatus(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('sm_venues')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) alert('Errore nell\'aggiornamento dello stato');
    else fetchVenues(); // Aggiorna la lista
  }

  // Funzione per copiare il link negli appunti
  async function copyLink(id: string) {
    const url = `${window.location.origin}/menu/${id}`;
    await navigator.clipboard.writeText(url);
    alert('Link copiato negli appunti!');
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Gestione Locali 🏢</h1>
      
      <form onSubmit={addVenue} className="mb-12 flex gap-4 bg-gray-100 p-4 rounded-lg shadow-inner">
        <input 
          className="border p-2 rounded flex-1 text-black" 
          placeholder="Nome Locale" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <input 
          className="border p-2 rounded flex-1 text-black" 
          placeholder="Link Logo" 
          value={logo} 
          onChange={(e) => setLogo(e.target.value)} 
        />
        <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 transition">Aggiungi</button>
      </form>

      <div className="grid gap-4">
        {venues.map((venue) => (
          <div key={venue.id} className="border p-4 rounded-xl flex justify-between items-center bg-white shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-4">
              {venue.logo_url ? (
                <img src={venue.logo_url} alt="logo" className="w-14 h-14 object-contain bg-gray-50 rounded-full border" />
              ) : (
                <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xs">No Logo</div>
              )}
              <div>
                <span className="text-xl font-bold block">{venue.name}</span>
                <span className="text-xs text-gray-400 font-mono">{venue.id}</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Link per il cliente */}
              <button 
                onClick={() => copyLink(venue.id)}
                className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md transition"
              >
                🔗 Copia Link Menù
              </button>

              {/* Toggle Attivo/Disattivo */}
              <button 
                onClick={() => toggleStatus(venue.id, venue.is_active)}
                className={`px-4 py-1 rounded-full text-sm font-bold transition ${
                  venue.is_active 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {venue.is_active ? '✅ Attivo' : '❌ Disattivato'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}