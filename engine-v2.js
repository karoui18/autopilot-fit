const Engine={
  plans:{
    A:[
      {id:'goblet-squat',name:'Goblet squat',min:8,max:12,type:'strength'},
      {id:'db-bench',name:'Développé haltères banc',min:8,max:12,type:'strength'},
      {id:'one-arm-row',name:'Rowing haltère',min:8,max:12,type:'strength',note:'par côté'},
      {id:'rdl',name:'Romanian deadlift',min:8,max:12,type:'strength'},
      {id:'bike',name:'Vélo',type:'cardio',minutes:10}
    ],
    B:[
      {id:'split-squat',name:'Split squat / squat vers banc',min:8,max:12,type:'strength'},
      {id:'shoulder-press',name:'Développé épaules haltères',min:8,max:12,type:'strength'},
      {id:'chest-row',name:'Rowing poitrine sur banc',min:8,max:12,type:'strength'},
      {id:'hip-thrust',name:'Hip thrust sur banc',min:10,max:15,type:'strength'},
      {id:'rower',name:'Rameur',type:'cardio',minutes:10}
    ]
  },
  todayKey(){return new Date().toISOString().slice(0,10)},
  todaysPlan(data){return data.workouts.filter(w=>w.completed&&!w.minimum).length%2===0?'A':'B'},
  fullSessions(data){return data.workouts.filter(w=>w.completed&&!w.minimum).length},
  setCount(data){return this.fullSessions(data)<6?2:3},
  cardioMinutes(data){return this.fullSessions(data)<12?10:15},
  weightAverages(weights){
    const sorted=[...weights].filter(w=>Number(w.value)>0).sort((a,b)=>a.date.localeCompare(b.date));
    const byDate=new Map(sorted.map(w=>[w.date,Number(w.value)]));
    const dates=[...byDate.keys()];if(!dates.length)return {recent:null,previous:null,recentN:0,previousN:0};
    const end=new Date(dates.at(-1)+'T12:00:00');const recent=[],previous=[];
    for(const [date,value] of byDate){const diff=Math.round((end-new Date(date+'T12:00:00'))/86400000);if(diff>=0&&diff<=6)recent.push(value);else if(diff>=7&&diff<=13)previous.push(value)}
    const avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null;return {recent:avg(recent),previous:avg(previous),recentN:recent.length,previousN:previous.length};
  },
  weeklyDelta(weights){const a=this.weightAverages(weights);return a.recent!=null&&a.previous!=null?a.recent-a.previous:null},
  weeklyRate(weights){const a=this.weightAverages(weights);return a.recent!=null&&a.previous?((a.recent-a.previous)/a.previous)*100:null},
  adherence(data){let logged=0,onTarget=0;for(let i=0;i<7;i++){const d=new Date();d.setDate(d.getDate()-i);const k=d.toISOString().slice(0,10),day=data.days[k];if(day&&day.calories>0){logged++;if(Math.abs(day.calories-data.profile.calTarget)<=data.profile.calTarget*.1)onTarget++}}return {logged,score:logged?onTarget/logged:0,coverage:logged/7}},
  subjective(data){let h=[],e=[];for(let i=0;i<7;i++){const d=new Date();d.setDate(d.getDate()-i);const x=data.days[d.toISOString().slice(0,10)];if(x?.hunger)h.push(Number(x.hunger));if(x?.energy)e.push(Number(x.energy))}const avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null;return {hunger:avg(h),energy:avg(e)}},
  isoWeekKey(date=new Date()){const d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));const y=new Date(Date.UTC(d.getUTCFullYear(),0,1));return `${d.getUTCFullYear()}-W${String(Math.ceil((((d-y)/86400000)+1)/7)).padStart(2,'0')}`},
  review(data){
    const av=this.weightAverages(data.weights),rate=this.weeklyRate(data.weights),adh=this.adherence(data),sub=this.subjective(data);
    if(av.recentN<5||av.previousN<5)return {eligible:false,title:'Collecte des données',text:`${av.previousN+av.recentN}/10 pesées utiles. Il faut ≥5 pesées dans chacune des deux dernières semaines.`};
    if(rate===null)return {eligible:false,title:'Collecte des données',text:'Deux semaines de tendance sont nécessaires.'};
    if((sub.hunger!=null&&sub.hunger>=4)||(sub.energy!=null&&sub.energy<=2))return {eligible:true,action:'hold',title:'Maintenir le plan',text:`Tendance ${rate.toFixed(2)}%/sem. Faim/énergie suggèrent de ne pas réduire davantage cette semaine.`,rate,adh};
    if(rate<-1)return {eligible:true,action:'calories_up',amount:150,title:'Ralentir légèrement',text:`Tendance ${rate.toFixed(2)}%/sem : hausse de 150 kcal/j pour rester dans une zone plus durable.`,rate,adh};
    if(rate<=-.3&&rate>=-.8)return {eligible:true,action:'hold',title:'Dans la cible',text:`Tendance ${rate.toFixed(2)}%/sem : aucun changement.`,rate,adh};
    if(rate>-.25&&adh.coverage>=.8&&adh.score>=.7){if(data.profile.calTarget-100>=data.profile.minCalTarget)return {eligible:true,action:'calories_down',amount:100,title:'Petit ajustement',text:`Tendance ${rate.toFixed(2)}%/sem avec bonne adhérence : -100 kcal/j.`,rate,adh};return {eligible:true,action:'steps_up',amount:1000,title:'Bouger un peu plus',text:`Calories déjà au plancher défini : +1 000 pas/j au lieu de réduire davantage.`,rate,adh}}
    return {eligible:true,action:'hold',title:'Maintenir le plan',text:`Tendance ${rate.toFixed(2)}%/sem. L’adhérence n’est pas assez complète pour modifier le plan.`,rate,adh};
  },
  maybeApplyWeekly(data){if(!data.profile.autopilotEnabled)return null;const week=this.isoWeekKey();if(data.weeklyReviews.some(r=>r.week===week))return data.weeklyReviews.find(r=>r.week===week);const r=this.review(data);if(!r.eligible)return r;const record={...r,week,date:this.todayKey(),before:{calTarget:data.profile.calTarget,stepsTarget:data.profile.stepsTarget}};if(r.action==='calories_up')data.profile.calTarget+=r.amount;if(r.action==='calories_down')data.profile.calTarget=Math.max(data.profile.minCalTarget,data.profile.calTarget-r.amount);if(r.action==='steps_up')data.profile.stepsTarget+=r.amount;record.after={calTarget:data.profile.calTarget,stepsTarget:data.profile.stepsTarget};data.weeklyReviews.push(record);return record},
  lastExerciseEntry(data,id){for(let i=data.workouts.length-1;i>=0;i--){const w=data.workouts[i];if(!w.completed||w.minimum)continue;const e=w.exercises?.find(x=>x.id===id);if(e)return e}return null},
  prescription(data,exercise){if(exercise.type==='cardio')return {minutes:this.cardioMinutes(data),text:`${this.cardioMinutes(data)} min facile`};const last=this.lastExerciseEntry(data,exercise.id),sets=this.setCount(data),inc=Number(data.profile.loadIncrement||1);if(!last)return {load:'',sets,reps:exercise.min,text:`${sets} × ${exercise.min}–${exercise.max} • RIR 2–3`};const reps=(last.sets||[]).map(s=>Number(s.reps||0)),rir=Math.min(...(last.sets||[]).map(s=>Number(s.rir??3))),allMax=reps.length&&reps.every(r=>r>=exercise.max);let load=Number(last.load||0),reason='Conserve la charge et ajoute des reps';if(allMax&&rir>=2){load=Math.round((load+inc)*10)/10;reason=`Progression +${inc} kg`}else if(reps.some(r=>r<exercise.min)){reason='Conserve ou baisse légèrement si nécessaire'}return {load,sets,reps:exercise.min,text:`${sets} séries • ${reason}`}},
  volume(workout){return (workout.exercises||[]).reduce((sum,e)=>sum+Number(e.load||0)*(e.sets||[]).reduce((s,x)=>s+Number(x.reps||0),0),0)}
};
