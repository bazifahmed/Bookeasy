const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env','utf8').split(/\r?\n/).reduce((acc,line)=>{ const [k,v]=line.split('='); if(k) acc[k]=v; return acc; },{});
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
(async ()=>{
  const { data, error } = await supabase.from('bookings').select('*').limit(1);
  console.log('bookings sample error', error);
  console.log('bookings sample data', data);
})();
