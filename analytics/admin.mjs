export const adminHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>KAISH · Visit analytics</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#11191b;color:#e8f1ef;font:15px/1.5 system-ui,sans-serif}main{max-width:1440px;margin:auto;padding:32px 20px}h1{font-size:30px;margin:0}h2{font-size:20px;margin-top:30px}p,small{color:#afc1bd}button,input,select{font:inherit;border:1px solid #53746c;border-radius:6px;background:#20332e;color:#fff;padding:8px 12px}button{cursor:pointer}button:hover{background:#305046}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #e8b56d;outline-offset:2px}label{display:inline-flex;align-items:center;gap:8px;margin:8px 8px 8px 0}input{max-width:100%}form{margin:24px 0}.cards{display:flex;flex-wrap:wrap;gap:12px}.cards article{min-width:160px;flex:1;padding:18px;border:1px solid #3e5c53;border-radius:10px;background:#172523}.cards strong{display:block;font-size:28px;color:#91d5ba}.table{overflow:auto;border:1px solid #3e5c53;border-radius:8px}table{border-collapse:collapse;width:100%;white-space:nowrap}td,th{text-align:left;padding:10px 12px;border-bottom:1px solid #30483f}th{background:#1c3029;font-size:12px;color:#b0cabf}td{font-size:13px}td.wrap{white-space:normal;min-width:180px;max-width:350px;overflow-wrap:anywhere}#message{min-height:24px;color:#edc494}.toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:18px 0}.muted{font-size:12px;color:#afc1bd}#more{margin-top:16px}
</style></head><body><main>
<h1>KAISH · Visit analytics</h1><p>Private dashboard · Raw IP addresses and site activity · Up to 30 days of records</p>
<form id="login"><label>Admin password <input id="password" type="password" autocomplete="off" required minlength="32" maxlength="256"></label><button>Sign in</button></form>
<p id="message" role="status"></p>
<section id="dashboard" hidden>
<div class="toolbar"><label>Period <select id="days"><option value="30">Last 30 days</option><option value="7">Last 7 days</option></select></label><button id="refresh">Refresh</button><button id="logout">Sign out</button></div>
<div class="cards"><article>Browser sessions<strong id="sessions">0</strong></article><article>Page views<strong id="views">0</strong></article><article>Visible tab time<strong id="duration">0</strong></article></div>
<p class="muted">A browser session is a tab session, not a unique person. Visible tab time estimates usage and does not prove attention. Ad blockers, declined permission and lost requests reduce coverage.</p>
<h2>Lesson activity</h2><p class="muted">Started = an exercise opened. Completed = its submit action passed the app's checks. Abandoned = left without submitting, or no lesson activity for 30 minutes. An attempt can later become completed. Rates include ongoing attempts; this is a usage estimate, not an assessment of learning.</p>
<div class="table"><table><thead><tr><th>Lesson / exercise</th><th>Started</th><th>Completed</th><th>Abandoned</th><th>Ongoing</th><th>Completion</th><th>Abandonment</th></tr></thead><tbody id="lessons"></tbody></table></div>
<h2>Activity history</h2><p class="muted">Click a session to inspect its history. Device information is inferred from the browser's user agent; it is not the device's private name.</p>
<div class="toolbar"><span id="filter">All sessions</span><button id="clear">Show all sessions</button></div>
<div class="table"><table><thead><tr><th>Time (your timezone)</th><th>Session</th><th>Event</th><th>Page / screen / lesson</th><th>Button label</th><th>Seconds</th><th>IP address</th><th>Country</th><th>Device / browser</th></tr></thead><tbody id="events"></tbody></table></div><button id="more" hidden>Load older records</button>
</section></main>
<script>
const $ = id => document.getElementById(id);
let token = '', next = null, session = '', busy = false;
function cell(row, value, wrap) { const td = document.createElement('td'); td.textContent = String(value == null ? '' : value); if (wrap) td.className = 'wrap'; row.append(td); return td; }
function device(ua) {
 const type = /iPad|Tablet/i.test(ua) ? 'Tablet' : /Mobile|Android|iPhone/i.test(ua) ? 'Mobile' : 'Desktop / unknown';
 const os = /Windows/i.test(ua) ? 'Windows' : /Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iOS' : /Macintosh/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : 'Unknown OS';
 const browser = /Edg[/]/i.test(ua) ? 'Edge' : /OPR[/]/i.test(ua) ? 'Opera' : /Firefox|FxiOS/i.test(ua) ? 'Firefox' : /Chrome|CriOS/i.test(ua) ? 'Chrome' : /Safari/i.test(ua) ? 'Safari' : 'Unknown browser';
 return type + ' · ' + os + ' · ' + browser;
}
async function load(older) {
 if (busy) return; busy = true; const requestToken = token; $('message').textContent = 'Loading…';
 const query = new URLSearchParams({days:$('days').value}); if (older && next) query.set('before', next); if (session) query.set('session',session);
 try {
  const response = await fetch('/admin/data?' + query, {headers:{Authorization:'Bearer ' + token}, cache:'no-store'});
  const data = await response.json(); if (token !== requestToken) return; if (!response.ok) throw new Error(data.error || 'Could not load records.');
  $('login').hidden = true; $('dashboard').hidden = false; $('password').value = '';
  $('sessions').textContent = data.totals.sessions || 0; $('views').textContent = data.totals.views || 0;
  $('duration').textContent = Math.round((data.totals.visible_seconds || 0) / 60) + ' min';
  $('lessons').replaceChildren();
  for (const item of data.lessons) {const tr = document.createElement('tr'); [item.lesson,item.started,item.completed,item.abandoned,item.started-item.completed-item.abandoned,Math.round(item.completed/item.started*100)+'%',Math.round(item.abandoned/item.started*100)+'%'].forEach((x,i)=>cell(tr,x,i===0)); $('lessons').append(tr);}
  if (!older) $('events').replaceChildren();
  for (const item of data.events) {
   const tr = document.createElement('tr'); cell(tr,new Date(item.received_at).toLocaleString());
   const td = cell(tr,''); const button = document.createElement('button'); button.textContent = item.session_id.slice(0,8); button.title = item.session_id; button.onclick = () => {session=item.session_id; load(false);}; td.append(button);
   cell(tr,item.event); cell(tr,[item.path,item.screen,item.lesson].filter(Boolean).join(' · '),true); cell(tr,item.label,true); cell(tr,item.seconds || ''); cell(tr,item.ip); cell(tr,item.country); const deviceCell=cell(tr,device(item.user_agent)); deviceCell.title=item.user_agent; $('events').append(tr);
  }
  next = data.next; $('more').hidden = !next; $('filter').textContent = session ? 'Session: ' + session : 'All sessions'; $('message').textContent = data.events.length ? 'Records loaded.' : 'No activity in this view.';
 } catch (error) { if (token === requestToken) $('message').textContent = error.message || 'Network error.'; } finally {busy=false;}
}
$('login').onsubmit = event => {event.preventDefault(); token=$('password').value; load(false);};
$('refresh').onclick = () => load(false); $('days').onchange = () => load(false); $('more').onclick = () => load(true);
$('clear').onclick = () => {session=''; load(false);};
$('logout').onclick = () => {token=''; session=''; next=null; $('dashboard').hidden=true; $('login').hidden=false; $('password').value=''; $('events').replaceChildren(); $('lessons').replaceChildren(); $('sessions').textContent='0'; $('views').textContent='0'; $('duration').textContent='0'; $('message').textContent='Signed out.';};
</script></body></html>`;
