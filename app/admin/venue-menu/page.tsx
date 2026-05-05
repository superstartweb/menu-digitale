"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function VenueMenuPage() {
  // STATI PRINCIPALI
  const [venues, setVenues] = useState<any[]>([]);
  const [masterWines, setMasterWines] = useState<any[]>([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [sections, setSections] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // FORM SEZIONI
  const [secName, setSecName] = useState('');
  const [secType, setSecType] = useState<'food' | 'drink'>('food');

  // FORM PIATTI/DRINK
  const [itemForm, setItemForm] = useState({ 
    name_it: '', 
    name_en: '', 
    price: '', 
    allergens: '', 
    recommended_wine_id: '', 
    position: 0 
  });

  // 1. Caricamento dati iniziali (Locali e Vini Master)
  useEffect(() => { loadInitData(); }, []);

  async function loadInitData() {
    const { data: v } = await supabase.from('sm_venues').select('*').order('name');
    const { data: mw } = await supabase.from('sm_master_wines').select('*').order('name');
    setVenues(v || []);
    setMasterWines(mw || []);
  }

  // 2. Carica le sezioni del locale selezionato
  async function loadMenuData(venueId: string) {
    if (!venueId) return;
    const { data } = await supabase.from('sm_menu_sections').select('*').eq('venue_id', venueId).order('position');
    setSections(data || []);
  }

  // 3. Carica i piatti della sezione selezionata
  async function loadItemsForSection(sectionId: string) {
    if (!sectionId) { setItems([]); return; }
    const { data } = await supabase.from('sm_menu_items').select('*').eq('section_id', sectionId).order('position');
    setItems(data || []);
  }

  // 4. Aggiungi nuova sezione (Primi, Secondi, ecc.)
  async function addSection(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('sm_menu_sections').insert([
      { venue_id: selectedVenue, name: secName, type: secType, position: sections.length + 1 }
    ]);
    if (error) alert('Errore sezione');
    else { 
      setSecName(''); 
      loadMenuData(selectedVenue); 
    }
  }

  // 5. Gestione Salva/Modifica Piatto (Il cuore del fix!)
  async function handleSubmitItem(e: React.FormEvent) {
    e.preventDefault();
    
    // Prepariamo i dati puliti per il database
    const data = { 
      name_it: itemForm.name_it,
      name_en: itemForm.name_en,
      price: parseFloat(itemForm.price.replace(',', '.')),
      allergens: itemForm.allergens,
      position: itemForm.position,
      section_id: selectedSection,
      // FIX: Se il campo è vuoto, inviamo NULL, non una stringa vuota ""
      recommended_wine_id: itemForm.recommended_wine_id === '' ? null : itemForm.recommended_wine_id
    };

    if (editingItemId) {
      // MODIFICA
      const { error } = await supabase.from('sm_menu_items').update(data).eq('id', editingItemId);
      if (error) alert('Errore modifica: ' + error.message);
      else { 
        alert('Piatto aggiornato!'); 
        setEditingItemId(null); 
      }
    } else {
      // NUOVO
      const { error } = await supabase.from('sm_menu_items').insert([data]);
      if (error) alert('Errore inserimento: ' + error.message);
      else alert('Piatto inserito!');
    }
    
    // Reset form
    setItemForm({ name_it: '', name_en: '', price: '', allergens: '', recommended_wine_id: '', position: 0 });
    loadItemsForSection(selectedSection);
  }

  // 6. Carica un piatto nel form per modificarlo
  function startEdit(item: any) {
    setEditingItemId(item.id);
    setItemForm({
      name_it: item.name_it,
      name_en: item.name_en,
      price: item.price.toString(),
      allergens: item.allergens,
      recommended_wine_id: item.recommended_wine_id || '',
      position: item.position
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 7. Aggiorna posizione piatto
  async function updateItemPosition(id: string, pos: number) {
    await supabase.from('sm_menu_items').update({ position: pos }).eq('id', id);
    loadItemsForSection(selectedSection);
  }

  // 8. Elimina piatto
  async function deleteItem(id: string) {
    if (confirm('Eliminare questo piatto?')) {
      await supabase.from('sm_menu_items').delete().eq('id', id);
      loadItemsForSection(selectedSection);
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestione Menù e Drink 🍽️</h1>
        <button onClick={() => window.history.back()} className="text-blue-600 font-bold text-sm">← Torna Dashboard</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* COLONNA 1: LOCALE E SEZIONI */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <label className="block font-bold mb-2">1. Locale</label>
            <select className="w-full border p-2 rounded text-black" value={selectedVenue} onChange={(e) => { setSelectedVenue(e.target.value); loadMenuData(e.target.value); }}>
              <option value="">-- Seleziona --</option>
              {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>

          {selectedVenue && (
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <label className="block font-bold mb-2">2. Sezioni</label>
              <form onSubmit={addSection} className="mb-4 flex flex-col gap-2">
                <input className="border p-2 rounded text-black text-sm" placeholder="Nome Sezione" value={secName} onChange={(e) => setSecName(e.target.value)} required />
                <select className="border p-2 rounded text-black text-sm" value={secType} onChange={(e) => setSecType(e.target.value as any)}>
                  <option value="food">🥘 Cibo</option>
                  <option value="drink">🍹 Drink</option>
                </select>
                <button className="bg-blue-600 text-white p-2 rounded text-sm font-bold">Aggiungi Sezione</button>
              </form>
              <div className="space-y-2">
                {sections.map(s => (
                  <div key={s.id} onClick={() => { setSelectedSection(s.id); loadItemsForSection(s.id); }} className={`p-2 rounded cursor-pointer border transition ${selectedSection === s.id ? 'bg-blue-100 border-blue-500 font-bold' : 'bg-gray-50 hover:bg-gray-100'}`}>
                    {s.type === 'food' ? '🥘' : '🍹'} {s.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COLONNA 2 & 3: GESTIONE PIATTI */}
        <div className="lg:col-span-3">
          {!selectedSection ? (
            <div className="h-full flex items-center justify-center text-gray-400 italic border-2 border-dashed rounded-xl p-20">Seleziona una sezione</div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-xl font-bold mb-4">{editingItemId ? '📝 Modifica Voce' : '➕ Aggiungi Voce'}</h2>
                <form onSubmit={handleSubmitItem} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input className="border p-2 rounded text-black" placeholder="Nome (IT)" value={itemForm.name_it} onChange={(e) => setItemForm({...itemForm, name_it: e.target.value})} required />
                  <input className="border p-2 rounded text-black" placeholder="Nome (EN)" value={itemForm.name_en} onChange={(e) => setItemForm({...itemForm, name_en: e.target.value})} />
                  <input className="border p-2 rounded text-black" type="text" placeholder="Prezzo €" value={itemForm.price} onChange={(e) => setItemForm({...itemForm, price: e.target.value})} required />
                  <input className="border p-2 rounded text-black" placeholder="Allergeni" value={itemForm.allergens} onChange={(e) => setItemForm({...itemForm, allergens: e.target.value})} />
                  <select className="border p-2 rounded text-black" value={itemForm.recommended_wine_id} onChange={(e) => setItemForm({...itemForm, recommended_wine_id: e.target.value})}>
                    <option value="">Vino consigliato (Opzionale)</option>
                    {masterWines.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                  <input className="border p-2 rounded text-black" type="number" placeholder="Posizione" value={itemForm.position} onChange={(e) => setItemForm({...itemForm, position: parseInt(e.target.value)})} />
                  <div className="md:col-span-3 flex gap-2">
                    <button className={`flex-1 p-2 rounded font-bold text-white ${editingItemId ? 'bg-yellow-600' : 'bg-green-600'}`}>
                      {editingItemId ? 'Salva Modifiche' : 'Salva Voce'}
                    </button>
                    {editingItemId && <button type="button" onClick={() => { setEditingItemId(null); setItemForm({ name_it: '', name_en: '', price: '', allergens: '', recommended_wine_id: '', position: 0 }); }} className="bg-gray-400 text-white px-4 py-2 rounded font-bold">Annulla</button>}
                  </div>
                </form>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-xl font-bold mb-4">Voci della sezione</h2>
                <div className="grid gap-4">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-4">
                        <input type="number" className="w-12 border p-1 rounded text-center text-black font-bold" value={item.position} onChange={(e) => updateItemPosition(item.id, parseInt(e.target.value))} />
                        <div>
                          <span className="font-bold block">{item.name_it}</span>
                          <span className="text-sm text-gray-500 italic">{item.name_en} • Allergeni: {item.allergens || 'Nessuno'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">€</span>
                          <input type="text" className="w-20 border p-1 rounded text-center text-black" value={item.price} readOnly />
                        </div>
                        <button onClick={() => startEdit(item)} className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-xs font-bold hover:bg-blue-200">Modifica</button>
                        <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-600">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}