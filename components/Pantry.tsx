
import React, { useState, useEffect } from 'react';
import { Plus, X, Utensils, Hash } from 'lucide-react';
import { PantryItem } from '../types';

const Pantry: React.FC = () => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [nameInput, setNameInput] = useState('');
  const [qtyInput, setQtyInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('miam_pantry');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  const save = (newItems: PantryItem[]) => {
    setItems(newItems);
    localStorage.setItem('miam_pantry', JSON.stringify(newItems));
  };

  const addItem = () => {
    if (!nameInput.trim()) return;
    const newItem: PantryItem = {
      id: Date.now().toString(),
      name: nameInput.trim(),
      quantity: qtyInput.trim() || '1',
    };
    save([...items, newItem]);
    setNameInput('');
    setQtyInput('');
  };

  const removeItem = (id: string) => {
    save(items.filter(item => item.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <header className="mb-8">
        <h2 className="text-4xl font-black text-gray-900 mb-2">Mon Stock</h2>
        <p className="text-gray-500">Gérez vos ingrédients et leurs quantités.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-3 mb-8 bg-white p-4 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
        <div className="flex-1 relative">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Nom (ex: Farine, Oeufs...)"
            className="w-full p-4 pl-6 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-200 outline-none font-bold"
          />
        </div>
        <div className="w-full md:w-32 relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={qtyInput}
            onChange={(e) => setQtyInput(e.target.value)}
            placeholder="Qté"
            className="w-full p-4 pl-10 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-200 outline-none font-bold"
          />
        </div>
        <button
          onClick={addItem}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center transition-transform active:scale-95 font-black uppercase tracking-wider"
        >
          <Plus size={24} className="mr-2" />
          Ajouter
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {items.length === 0 ? (
          <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
            <Utensils className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-400 font-medium">Votre garde-manger est vide.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="group bg-white p-5 rounded-2xl flex justify-between items-center shadow-sm border border-gray-50 hover:border-orange-100 hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2"
            >
              <div className="flex items-center gap-4">
                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg font-black text-sm border border-orange-100 min-w-[3rem] text-center">
                  {item.quantity}
                </span>
                <span className="font-semibold text-gray-700 text-lg">{item.name}</span>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="text-gray-200 hover:text-red-400 p-2 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Pantry;
