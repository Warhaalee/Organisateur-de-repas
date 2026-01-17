
import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle2, Circle, Trash2, Plus } from 'lucide-react';

interface ShopItem {
  id: string;
  name: string;
  checked: boolean;
}

const ShoppingList: React.FC = () => {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('miam_shopping');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  const save = (newItems: ShopItem[]) => {
    setItems(newItems);
    localStorage.setItem('miam_shopping', JSON.stringify(newItems));
  };

  const addItem = () => {
    if (!input.trim()) return;
    save([...items, { id: Date.now().toString(), name: input.trim(), checked: false }]);
    setInput('');
  };

  const toggleItem = (id: string) => {
    save(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  const removeItem = (id: string) => {
    save(items.filter(i => i.id !== id));
  };

  const clearChecked = () => {
    save(items.filter(i => !i.checked));
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-gray-900 mb-2">Liste de Courses</h2>
          <p className="text-gray-500">N'oubliez plus rien au supermarché.</p>
        </div>
        <button 
          onClick={clearChecked}
          className="text-xs font-bold uppercase text-red-500 hover:text-red-600 p-2"
        >
          Nettoyer
        </button>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex gap-2">
           <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="Ajouter un article..."
            className="flex-1 p-4 bg-white rounded-2xl border-none focus:ring-2 focus:ring-orange-200 outline-none font-bold"
          />
          <button 
            onClick={addItem}
            className="w-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto no-scrollbar">
          {items.length === 0 ? (
            <div className="p-20 text-center">
              <ShoppingBag className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Liste vide</p>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.id}
                className="flex items-center gap-4 p-5 hover:bg-orange-50/30 transition-colors group"
              >
                <button 
                  onClick={() => toggleItem(item.id)}
                  className={`transition-colors ${item.checked ? 'text-green-500' : 'text-gray-300 hover:text-orange-400'}`}
                >
                  {item.checked ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
                <span className={`flex-1 font-semibold text-lg ${item.checked ? 'line-through text-gray-300' : 'text-gray-700'}`}>
                  {item.name}
                </span>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;
