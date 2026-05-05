"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function MasterWinesPage() {
  const [wineries, setWineries] = useState<any[]>([]);
  const [wines, setWines] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');
  
  const [form, setForm] = useState({
    winery_id: '', name: '', image_url: '', region: '', philosophy: '',
    denomination: '', aging: '', blend: '', alcohol_percentage: '', 
    smell_description: '', taste_description: '', wine_type: ''
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: winData } = await supabase.from('sm_wineries').select('*').order('name');
    const { data: wineData } = await supabase.from('sm_master_wines').select('*').order('name');
    const { data: catData } = await supabase.from('sm_wine_categories').select('*').order('position');
    setWineries(winData || []);
    setWines(wineData || []);
    setCategories(catData || []);
  }

  async function addCategory() {
    if (!newCatName) return;
    const { error } = await supabase.from('sm_wine_categories').insert([
      { name: newCatName, position: categories.length + 1 }
    ]);
    if (error) alert('Errore categoria');
    else { setNewCatName(''); loadData(); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Fix Virgola -> Punto per i decimali
    const dataToSave = {
      ...form,
      alcohol_percentage: form.alcohol_percentage?.toString().replace(',', '.')
    };

    if (editingId) {
      const { error } = await supabase.from('sm_master_wines').update(dataToSave).eq('id', editingId);
      if (error) alert('Errore modifica: ' + error.message);
      else { alert('Vino aggiornato!'); setEditingId(null); }
    } else {
      const { error } = await supabase.from('sm_master_wines').insert([dataToSave]);
      if (error) alert('Errore inserimento: ' + error.message);
    }
    setForm({ winery_id: '', name: '', image_url: '', region: '', philosophy: '', denomination: '', aging: '', blend: '', alcohol_percentage: '', smell_description: '', taste_description: '', wine_type: '' });
    loadData();
  }

  function startEdit(wine: any) {
    setEditingId(wine.id);
    setForm({ ...wine });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteWine(id: string) {
    if (confirm('Eliminare questo vino dal Master?')) {
      const { error } = await supabase.from('sm_master_wines').delete().eq('id', id);
      if (error) alert('Errore!'); else loadData();
    }
  }

  const filteredWines = wines.filter(wine => 
    wine.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    wine.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Enciclopedia dei Vini 📖</h1>
        {editingId && (
          <button onClick={() => { setEditingId(null); setForm({ winery_id: '', name: '', image_url: '', region: '', philosophy: '', denomination: '', aging: '', blend: '', alcohol_percentage: '', smell_description: '', taste_description: '', wine_type: '' }); }}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold">Annulla Modifica</button>
        )}
      </div>

      <div className="mb-8 p-4 bg-slate-100 rounded-xl border flex flex-wrap items-center gap-4">
        <span className="font-bold text-sm">Categorie:</span>
        <div className="flex gap-2">
          {categories.map(cat => (
            <span key={cat.id} className="bg-white px-2 py-1 rounded border text-xs font-medium">{cat.name}</span>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <input className="border p-1 rounded text-sm text-black" placeholder="Nuova categoria" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
          <button onClick={addCategory} className="bg-slate-700 text-white px-3 py-1 rounded text-sm hover:bg-slate-800 transition">Aggiungi</button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className={`mb-12 grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-xl shadow-inner transition ${editingId ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-100'}`}>
        <div className="md:col-span-3">
          <h2 className="text-lg font-bold mb-2">{editingId ? '📝 Modifica Vino' : '➕ Aggiungi Nuovo Vino'}</h2>
        </div>
        <select className="border p-2 rounded text-black" value={form.winery_id ?? ''} onChange={(e) => setForm({...form, winery_id: e.target.value})} required>
          <option value="">Seleziona Cantina</option>
          {wineries.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <input className="border p-2 rounded text-black" placeholder="Nome Vino" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
        <select className="border p-2 rounded text-black" value={form.wine_type ?? ''} onChange={(e) => setForm({...form, wine_type: e.target.value})} required>
          <option value="">Tipologia Vino</option>
          {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
        </select>
        <input className="border p-2 rounded text-black" placeholder="Link Immagine Bottiglia" value={form.image_url} onChange={(e) => setForm({...form, image_url: e.target.value})} />
        <input className="border p-2 rounded text-black" placeholder="Regione" value={form.region} onChange={(e) => setForm({...form, region: e.target.value})} />
        <input className="border p-2 rounded text-black" placeholder="Denominazione" value={form.denomination} onChange={(e) => setForm({...form, denomination: e.target.value})} />
        <input className="border p-2 rounded text-black" placeholder="Affinamento" value={form.aging} onChange={(e) => setForm({...form, aging: e.target.value})} />
        <input className="border p-2 rounded text-black" placeholder="Uvaggio" value={form.blend} onChange={(e) => setForm({...form, blend: e.target.value})} />
        <input className="border p-2 rounded text-black" placeholder="Gradazione" value={form.alcohol_percentage} onChange={(e) => setForm({...form, alcohol_percentage: e.target.value})} />
        <input className="border p-2 rounded text-black" placeholder="Filosofia" value={form.philosophy} onChange={(e) => setForm({...form, philosophy: e.target.value})} />
        <textarea className="border p-2 rounded text-black md:col-span-3" placeholder="Olfatto" value={form.smell_description} onChange={(e) => setForm({...form, smell_description: e.target.value})} />
        <textarea className="border p-2 rounded text-black md:col-span-3" placeholder="Gusto" value={form.taste_description} onChange={(e) => setForm({...form, taste_description: e.target.value})} />
        <button className={`px-6 py-3 rounded-lg font-bold transition md:col-span-3 text-white ${editingId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}>
          {editingId ? 'Aggiorna Vino' : 'Salva Vino'}
        </button>
      </form>

      <div className="mb-6">
        <input type="text" placeholder="🔍 Cerca vino..." className="w-full p-3 border rounded-xl shadow-sm text-black" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="grid gap-4">
        {filteredWines.map(wine => (
          <div key={wine.id} className="border p-4 rounded-lg flex items-center justify-between bg-white shadow-sm">
            <div className="flex items-center gap-4">
              <img src={wine.image_url} className="w-8 h-16 object-contain bg-gray-50 rounded" onError={(e) => { (e.target as any).src = 'https://via.placeholder.com/40x100?text=No+Img' }} />
              <div>
                <span className="text-lg font-semibold block">{wine.name}</span>
                <span className="text-xs text-gray-500">{wine.region} • {wine.wine_type}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(wine)} className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm font-bold">Modifica</button>
              <button onClick={() => deleteWine(wine.id)} className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-sm font-bold">Elimina</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}