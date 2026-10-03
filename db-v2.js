const DB={
  name:'autopilot-fit',version:2,store:'state',key:'main',
  defaults:{
    profile:{calTarget:2200,proteinTarget:150,stepsTarget:8000,minCalTarget:1600,loadIncrement:1,autopilotEnabled:true},
    weights:[],days:{},workouts:[],foods:[],weeklyReviews:[],planHistory:[],quotes:[],settings:{notifications:false,reminderTimes:['18:00','19:30','21:00']}
  },
  clone(v){return JSON.parse(JSON.stringify(v))},
  merge(base,extra){for(const [k,v] of Object.entries(extra||{})){if(v&&typeof v==='object'&&!Array.isArray(v)&&base[k]&&typeof base[k]==='object'&&!Array.isArray(base[k]))this.merge(base[k],v);else base[k]=v}return base},
  open(){return new Promise((resolve,reject)=>{const r=indexedDB.open(this.name,this.version);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(this.store))db.createObjectStore(this.store)};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})},
  async load(){const fallback=this.clone(this.defaults);try{const db=await this.open();const stored=await new Promise((resolve,reject)=>{const tx=db.transaction(this.store,'readonly');const r=tx.objectStore(this.store).get(this.key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});if(stored)return this.merge(fallback,stored);const legacy=localStorage.getItem('autopilot-fit-v1');if(legacy){const migrated=this.merge(fallback,JSON.parse(legacy));await this.save(migrated);return migrated}return fallback}catch{return fallback}},
  async save(data){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction(this.store,'readwrite');tx.objectStore(this.store).put(data,this.key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})},
  async clear(){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction(this.store,'readwrite');tx.objectStore(this.store).delete(this.key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})},
  export(data){return JSON.stringify({version:2,exportedAt:new Date().toISOString(),data},null,2)}
};
