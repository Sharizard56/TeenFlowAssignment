import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';

type Task = {id:string,title:string,description:string|null,subject:string|null,priority:'LOW'|'MEDIUM'|'HIGH',status:'PENDING'|'COMPLETED',dueAt:string|null,estimatedMinutes:number};
type Plan = {message:string,recommendations:{taskId:string,title:string,score:number,suggestedMinutes:number,reason:string}[]};
const api = async <T,>(path:string,options?:RequestInit):Promise<T> => {
 const response = await fetch(path,{...options,headers:{'Content-Type':'application/json',...options?.headers}});
 if(!response.ok) throw new Error(`${response.status}: ${await response.text()}`);
 return response.status===204 ? undefined as T : response.json() as Promise<T>;
};
function App(){
 const [tasks,setTasks]=useState<Task[]>([]),[plan,setPlan]=useState<Plan|null>(null);
 const [title,setTitle]=useState(''),[subject,setSubject]=useState(''),[priority,setPriority]=useState<Task['priority']>('MEDIUM');
 const [dueAt,setDueAt]=useState(''),[minutes,setMinutes]=useState(30),[available,setAvailable]=useState(90);
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 const load=async()=>{setTasks(await api<Task[]>('/api/tasks'));};
 useEffect(()=>{load().catch(e=>setError(String(e)));},[]);
 async function add(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{
  await api('/api/tasks',{method:'POST',body:JSON.stringify({title,subject,priority,description:null,dueAt:dueAt?new Date(dueAt).toISOString():null,estimatedMinutes:minutes})});
  setTitle('');setDueAt('');await load();
 }catch(e){setError(String(e));}finally{setBusy(false);}}
 
 async function complete(id:string){try{await api(`/api/tasks/${id}/complete`,{method:'PATCH'});await load();}catch(e){setError(String(e));}}

 async function remove(id:string){try{await api(`/api/tasks/${id}`,{method:'DELETE'});await load();}catch(e){setError(String(e));}}
 
 async function generate(){setBusy(true);setError('');try{setPlan(await api<Plan>(`/api/planner/today?availableMinutes=${available}`));}catch(e){setError(String(e));}finally{setBusy(false);}}
 
 const completed=tasks.filter(t=>t.status==='COMPLETED').length;
 return <main className="shell"><header><div className="logo">✦ TeenFlow</div><span className="tag">Your day, your pace</span></header>
  <section className="hero"><div><p className="eyebrow">YOUR STUDENT COMPANION</p><h1>Make room for what matters.</h1><p>Keep homework organized, make a simple plan, and enjoy time offline.</p></div><div className="progress"><strong>{completed}/{tasks.length}</strong><span>tasks completed</span></div></section>
  {error&&<div className="error" role="alert">{error}<button onClick={()=>setError('')}>Dismiss</button></div>}
  <div className="columns"><section className="panel"><h2>Add a task</h2><form onSubmit={add}><label>What needs doing?<input required maxLength={120} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Finish science project"/></label><label>Subject<input maxLength={60} value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Science"/></label><div className="pair"><label>Priority<select value={priority} onChange={e=>setPriority(e.target.value as Task['priority'])}><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></label><label>Minutes<input type="number" min="1" max="480" value={minutes} onChange={e=>setMinutes(Number(e.target.value))}/></label></div><label>Deadline (optional)<input type="datetime-local" value={dueAt} onChange={e=>setDueAt(e.target.value)}/></label><button className="primary" disabled={busy}>Add task</button></form></section>
  <section className="panel"><div className="section-head"><h2>My tasks</h2><span>{tasks.length} total</span></div><div className="task-list">{tasks.length===0?<p className="muted">No tasks yet. Add your first one.</p>:tasks.map(t=><article className="task" key={t.id}><button aria-label={`Complete ${t.title}`} className={'check '+(t.status==='COMPLETED'?'done':'')} disabled={t.status==='COMPLETED'} onClick={()=>complete(t.id)}>{t.status==='COMPLETED'?'✓':'○'}</button><div><strong className={t.status==='COMPLETED'?'struck':''}>{t.title}</strong><p>{t.subject||'Personal'} · {t.priority.toLowerCase()} · {t.estimatedMinutes} min{t.dueAt?` · ${new Date(t.dueAt).toLocaleDateString()}`:''}</p></div><button className="remove" aria-label={`Delete ${t.title}`} onClick={()=>remove(t.id)}>×</button></article>)}</div></section></div>
  <section className="panel planner"><div><p className="eyebrow">A LITTLE HELP GETTING STARTED</p><h2>Plan my day</h2><p className="muted">We'll suggest what to tackle first, based on deadlines and priorities.</p></div><div className="planner-actions"><label>Available minutes<input type="number" min="1" max="480" value={available} onChange={e=>setAvailable(Number(e.target.value))}/></label><button className="primary" disabled={busy} onClick={generate}>Make a plan →</button></div>{plan&&<div className="plan"><p>{plan.message}</p>{plan.recommendations.map(r=><article key={r.taskId}><strong>{r.title}</strong><span>{r.suggestedMinutes} min · {r.reason}</span></article>)}</div>}</section>
  <footer>TeenFlow demo · Fictional data only · Built for learning Kubernetes</footer>
 </main>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
