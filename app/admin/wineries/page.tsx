"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function WineriesPage() {
  const [wineries, setWineries] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '', description: '', logo_url: '', territory: '', cultivation: '', foundation_year: ''
  });

  useEffect(() => { fetchWineries(); }, []);

  async function fetchWineries() {
    const { data } = await supabase.from('sm_wineries').select('*').order('name');
    setWineries(data || []);
  }

  async function addWinery(e: React.FormEvent) {
    e.preventDefault();
    // Mappiamo 'description' del form al campo 'story' del DB
    const { error } = await supabase.from('sm_wineries').insert([{ 
      name: form.name, 
      logo_url: form.logo_url, 
      story: form.description, 
      territory: form.territory, 
      cultivation: form.cultivation, 
      foundation_year: form.foundation_year 
    }]);
    if (error) alert('Errore!');
    else {
      setForm({ name: '', description: '', logo_url: '', territory: '', cultivation: '', foundation_year: '' });
      fetchWineries();
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Gestione Cantine 🍷</h1>
      <form onSubmit={addWinery} className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-100 p-6 rounded-lg shadow-inner">
        <input className="border p-2 rounded text-black" placeholder="Nome Cantina" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
        <input className="border p-2 rounded text-black" placeholder="Link Logo" value={form.logo_url} onChange={(e) => setForm({...form, logo_url: e.target.value})} />
        <input className="border p-2 rounded text-black" placeholder="Territorio (es. Zagarolo...)" value={form.territory} onChange={(e) => setForm({...form, territory: e.target.value})} />
        <input className="border p-2 rounded text-black" placeholder="Coltura/Filosofia (es. Sostenibile...)" value={form.cultivation} onChange={(e) => setForm({...form, cultivation: e.target.value})} />
        <input className="border p-2 rounded text-black" placeholder="Anno Fondazione" value={form.foundation_year} onChange={(e) => setForm({...form, foundation_year: e.target.value})} />
        <textarea className="border p-2 rounded text-black md:col-span-2" placeholder="Il racconto della cantina..." value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
        <button className="bg-purple-600 text-white px-6 py-2 rounded font-bold hover:bg-purple-700 transition md:col-span-2">Aggiungi Cantina</button>
      </form>
      <div className="grid gap-4">
        {wineries.map(w => (
          <div key={w.id} className="border p-4 rounded-lg flex items-center gap-4 bg-white shadow-sm">
            {w.logo_url && <img src={w.logo_url} className="w-12 h-12 object-contain" />}
            <span className="text-xl font-semibold">{w.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}