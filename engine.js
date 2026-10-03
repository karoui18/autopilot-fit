const Engine={
  plans:{
    A:[['Goblet squat','2 × 8–12'],['Développé haltères banc','2 × 8–12'],['Rowing haltère','2 × 8–12 / côté'],['Romanian deadlift','2 × 8–12'],['Vélo','10 min facile']],
    B:[['Squat vers banc / split squat','2 × 8–12'],['Développé épaules haltères','2 × 8–12'],['Rowing poitrine sur banc','2 × 8–12'],['Hip thrust sur banc','2 × 10–15'],['Rameur','10 min facile']]
  },
  todaysPlan(data){const done=data.workouts.filter(w=>w.completed).length;return done%2===0?'A':'B'},
  trend(weights){if(!weights.length)return null;const sorted=[...weights].sort((a,b)=>a.date.localeCompare(b.date));const recent=sorted.slice(-7);return recent.reduce((s,w)=>s+Number(w.value),0)/recent.length},
  weeklyDelta(weights){if(weights.length<2)return null;const sorted=[...weights].sort((a,b)=>a.date.localeCompare(b.date));const a=sorted[Math.max(0,sorted.length-8)]?.value,b=sorted.at(-1)?.value;return Number(b)-Number(a)},
  nextPrescription(entry){const reps=entry.reps||[];if(reps.length&&reps.every(r=>r>=12)&&(entry.rir??3)>=2)return 'Augmenter légèrement la charge';if(reps.some(r=>r<8))return 'Conserver ou réduire légèrement';return 'Conserver la charge et ajouter des reps'}
}
