
import React, { useState, useEffect } from 'react';
import { DayOfWeek, WeeklyPlan, MealType } from '../types';

const DAYS: DayOfWeek[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const Planning: React.FC = () => {
  const [plan, setPlan] = useState<WeeklyPlan>({});

  useEffect(() => {
    const saved = localStorage.getItem('miam_plan');
    if (saved) setPlan(JSON.parse(saved));
  }, []);

  const updateMeal = (day: DayOfWeek, type: MealType, val: string) => {
    const newPlan = { ...plan, [day]: { ...plan[day], [type]: val } };
    setPlan(newPlan);
    localStorage.setItem('miam_plan', JSON.stringify(newPlan));
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <header className="mb-8">
        <h2 className="text-4xl font-black text-gray-900 mb-2">Menu Semaine</h2>
        <p className="text-gray-500">Planifiez vos déjeuners et dîners en un clin d'œil.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {DAYS.map((day) => (
          <div key={day} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col gap-4">
            <h3 className="font-black text-lg text-gray-900 border-b border-gray-50 pb-2">{day}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 block mb-1">Midi</label>
                <input
                  type="text"
                  value={plan[day]?.lunch || ''}
                  onChange={(e) => updateMeal(day, 'lunch', e.target.value)}
                  placeholder="Ex: Salade César"
                  className="w-full bg-gray-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-orange-100 outline-none text-sm font-medium"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 block mb-1">Soir</label>
                <input
                  type="text"
                  value={plan[day]?.dinner || ''}
                  onChange={(e) => updateMeal(day, 'dinner', e.target.value)}
                  placeholder="Ex: Soupe Potiron"
                  className="w-full bg-gray-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-orange-100 outline-none text-sm font-medium"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Planning;
