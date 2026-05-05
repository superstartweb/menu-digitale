"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function WineriesPage() {
  const [wineries, setWineries] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');

  async function fetchWineries() {
    const { data } = await supabase.from('sm_wineries').select('*').order('name');
    setWineries(data || []);
  }

  useEffect(() => { fetchWineries(); }, []);

  async function addWinery(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('sm_wineries').insert([{ name, description, logo_url: logo }]);
    if (error) alert('Errore!');
    else {
      setName(''); setDescription(''); setLogo('');
      fetchWineries();
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Gestione Cantine 🍷</h1>
      <form onSubmit={addWinery} className="mb-12 flex flex-col gap-4 bg-gray-100 p-6 rounded-lg shadow-inner">
        <input className="border p-2 rounded text-black" placeholder="Nome Cantina" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="border p-2 rounded text-black" placeholder="Link Logo Cantina" value={logo} onChange={(e) => setLogo(e.target.value)} />
        <textarea className="border p-2 rounded text-black" placeholder="Racconto/Filosofia della Cantina" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button className="bg-purple-600 text-white px-6 py-2 rounded font-bold hover:bg-purple-700 transition">Aggiungi Cantina</button>
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