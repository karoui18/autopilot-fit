const DB={
  key:'autopilot-fit-v1',
  defaults:{profile:{calTarget:2200,proteinTarget:150,stepsTarget:8000},weights:[],days:{},workouts:[],foods:[],settings:{notifications:false}},
  load(){try{return Object.assign(structuredClone(this.defaults),JSON.parse(localStorage.getItem(this.key)||'{}'))}catch{return structuredClone(this.defaults)}},
  save(data){localStorage.setItem(this.key,JSON.stringify(data))},
  export(data){return JSON.stringify({version:1,exportedAt:new Date().toISOString(),data},null,2)}
}
