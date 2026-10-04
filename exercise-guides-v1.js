(() => {
  const guides = {
    'goblet-squat': {title:'Goblet squat',setup:'Haltère contre la poitrine, pieds légèrement plus larges que les hanches, pointes un peu ouvertes.',steps:['Inspire et gaine le tronc.','Descends les hanches entre les genoux en gardant les talons au sol.','Pousse le sol et remonte sans verrouiller brutalement les genoux.'],tempo:'3 s descente · 1 s pause · montée contrôlée',rest:'75–90 s',focus:'Quadriceps · fessiers · gainage',avoid:'Genoux qui s’effondrent vers l’intérieur; dos qui s’arrondit.'},
    'db-bench': {title:'Développé haltères banc',setup:'Omoplates serrées sur le banc, pieds ancrés, haltères au niveau du bas de poitrine.',steps:['Poignets neutres et avant-bras presque verticaux.','Descends jusqu’à une amplitude confortable.','Pousse les haltères vers le haut et légèrement l’un vers l’autre.'],tempo:'2–3 s descente · montée fluide',rest:'90 s',focus:'Pectoraux · triceps · deltoïdes antérieurs',avoid:'Épaules qui remontent vers les oreilles; coudes très écartés.'},
    'one-arm-row': {title:'Rowing haltère',setup:'Une main et un genou en appui sur le banc; colonne neutre; bras libre vers le sol.',steps:['Gaine sans tourner le bassin.','Tire le coude vers la hanche.','Marque une courte pause puis redescends complètement sous contrôle.'],tempo:'2 s montée · 1 s contraction · 2 s descente',rest:'60–75 s entre côtés',focus:'Grand dorsal · rhomboïdes · biceps',avoid:'Rotation du torse ou haussement d’épaule.'},
    'rdl': {title:'Romanian deadlift',setup:'Haltères devant les cuisses, genoux légèrement fléchis, poitrine ouverte.',steps:['Repousse les hanches vers l’arrière.','Garde les haltères proches des jambes et le dos neutre.','Quand les ischios sont bien étirés, serre les fessiers pour revenir debout.'],tempo:'3 s descente · montée contrôlée',rest:'90 s',focus:'Ischio-jambiers · fessiers · chaîne postérieure',avoid:'Transformer le mouvement en squat; arrondir le bas du dos.'},
    'split-squat': {title:'Split squat / squat vers banc',setup:'Position fendue stable, pieds sur deux rails plutôt que sur une ligne.',steps:['Descends verticalement en contrôlant le genou avant.','Garde le pied avant entièrement en contact avec le sol.','Pousse à travers le pied avant pour remonter.'],tempo:'3 s descente · 1 s pause · montée contrôlée',rest:'60–90 s entre côtés',focus:'Quadriceps · fessiers · stabilité',avoid:'Pas trop court; genou avant qui s’effondre vers l’intérieur.'},
    'shoulder-press': {title:'Développé épaules haltères',setup:'Assis ou debout stable, haltères près des épaules, côtes abaissées.',steps:['Gaine le tronc.','Pousse les haltères au-dessus de la tête sans cambrer.','Redescends jusqu’à une amplitude confortable.'],tempo:'2 s descente · montée fluide',rest:'75–90 s',focus:'Épaules · triceps · gainage',avoid:'Hyperextension lombaire; trajectoire trop en avant.'},
    'chest-row': {title:'Rowing poitrine sur banc',setup:'Banc incliné; poitrine en appui; bras pendants avec haltères.',steps:['Tire les coudes vers l’arrière.','Rapproche les omoplates sans hausser les épaules.','Redescends complètement sous contrôle.'],tempo:'2 s montée · 1 s contraction · 2 s descente',rest:'75–90 s',focus:'Haut du dos · dorsaux · biceps',avoid:'Décoller la poitrine du banc; raccourcir l’amplitude.'},
    'hip-thrust': {title:'Hip thrust sur banc',setup:'Haut du dos contre le banc, pieds à plat, haltère posé sur le bassin avec protection.',steps:['Rentre légèrement le menton et gaine.','Pousse dans les talons jusqu’à aligner épaules–hanches–genoux.','Serre les fessiers en haut sans hypercambrer.'],tempo:'2 s montée · 2 s contraction · 2 s descente',rest:'75–90 s',focus:'Fessiers · ischios',avoid:'Hyperextension lombaire; pieds trop loin ou trop près.'},
    'bike': {title:'Vélo',setup:'Selle réglée pour garder une légère flexion du genou en bas du pédalage.',steps:['Commence 2 min très facile.','Reste à une intensité où tu peux encore parler en phrases.','Termine 1 min très facile.'],tempo:'Cadence régulière',rest:'—',focus:'Cardio facile / récupération active',avoid:'Résistance trop forte ou douleur de selle persistante.'},
    'rower': {title:'Rameur',setup:'Pieds sanglés, dos neutre, poignées détendues.',steps:['Jambes d’abord.','Puis légère ouverture du buste.','Finis avec les bras; au retour: bras, buste, jambes.'],tempo:'Retour plus lent que la traction',rest:'—',focus:'Cardio global · chaîne postérieure',avoid:'Tirer d’abord avec les bras; arrondir le dos.'}
  };
  const BASE='https://exercise-dataset.com/images/flat/';
  const visuals={
    'goblet-squat':['goblet-squat-start.webp','goblet-squat-peak.webp'],
    'db-bench':['db-bench-press-start.webp','db-bench-press-peak.webp'],
    'one-arm-row':['single-arm-db-row-start.webp','single-arm-db-row-peak.webp'],
    'rdl':['dumbbell-romanian-deadlift-start.webp','dumbbell-romanian-deadlift-peak.webp'],
    'split-squat':['split-squat-start.webp','split-squat-peak.webp'],
    'shoulder-press':['dumbbell-shoulder-press-start.webp','dumbbell-shoulder-press-peak.webp'],
    'chest-row':['chest-supported-db-row-start.webp','chest-supported-db-row-peak.webp'],
    'hip-thrust':['dumbbell-hip-thrust-start.webp','dumbbell-hip-thrust-peak.webp'],
    'bike':['stationary-bike-main.webp'],
    'rower':['rowing-machine-start.webp','rowing-machine-peak.webp']
  };
  const nameToId=Object.fromEntries(Object.entries(guides).map(([id,g])=>[g.title.toLowerCase(),id]));
  function visual(id,cls='exercise-visual'){
    const files=visuals[id]||[];if(!files.length)return'';
    const labels=files.length===1?['Mouvement']:['Départ','Fin'];
    return `<figure class="${cls}" aria-label="Positions de ${guides[id]?.title||id}">${files.map((f,i)=>`<div class="visual-frame"><img src="${BASE+f}" alt="${guides[id]?.title||id} — ${labels[i]}" loading="lazy"><span>${labels[i]}</span></div>`).join('')}</figure>`;
  }
  function markup(id){
    const g=guides[id];if(!g)return'';
    return `<div class="exercise-guide" data-guide-panel="${id}">${visual(id)}<div class="guide-meta"><span>Tempo: ${g.tempo}</span><span>Repos: ${g.rest}</span></div><div class="guide-setup"><b>Setup</b><p>${g.setup}</p></div><ol class="guide-steps">${g.steps.map(s=>`<li>${s}</li>`).join('')}</ol><div class="guide-focus"><b>Cible</b><span>${g.focus}</span></div><div class="guide-warning"><b>À éviter</b><span>${g.avoid}</span></div><a class="guide-credit" href="https://exercise-dataset.com/" target="_blank" rel="noreferrer">Exercise visuals by RepDB</a></div>`;
  }
  function augmentList(){
    document.querySelectorAll('#exerciseList .exercise:not(.guide-ready)').forEach(card=>{
      const id=nameToId[card.querySelector('b')?.textContent?.trim().toLowerCase()];if(!id)return;
      card.classList.add('guide-ready');card.insertAdjacentHTML('afterbegin',visual(id,'visual-thumb'));
      const btn=document.createElement('button');btn.type='button';btn.className='guide-toggle';btn.textContent='Visual';
      btn.onclick=()=>{let p=card.querySelector('.exercise-guide');if(!p){card.insertAdjacentHTML('beforeend',markup(id));p=card.querySelector('.exercise-guide')}const open=p.classList.toggle('open');btn.textContent=open?'Hide':'Visual'};card.appendChild(btn);
    });
  }
  function augmentModal(){
    document.querySelectorAll('#workoutForm .workout-ex:not(.guide-ready)').forEach(card=>{
      const id=card.dataset.ex==='mini-cardio'?(card.querySelector('b')?.textContent?.includes('Vélo')?'bike':'rower'):card.dataset.ex;if(!guides[id])return;
      card.classList.add('guide-ready');card.querySelector('.workout-ex-head')?.insertAdjacentHTML('afterend',`<details class="workout-guide-details"><summary>Visual & technique</summary>${markup(id)}</details>`);
    });
  }
  function augment(){augmentList();augmentModal()}
  new MutationObserver(augment).observe(document.documentElement,{subtree:true,childList:true});
  document.addEventListener('DOMContentLoaded',augment);setTimeout(augment,300);
})();
(()=>{const s=document.createElement('script');s.src='/quote-rotation-v1.js';document.head.appendChild(s)})();
