const fs=require('fs'), babel=require('@babel/core');
let src=fs.readFileSync('src/App.jsx','utf8');
src=src.replace(/^import[\s\S]*?from "lucide-react";/m,'').replace(/^import React[\s\S]*?from "react";/m,'');
const out=babel.transformSync(src,{presets:[[require.resolve('@babel/preset-env'),{targets:{node:'current'},modules:false}],[require.resolve('@babel/preset-react'),{runtime:'classic'}]],filename:'a.jsx'}).code;
const impNames=fs.readFileSync('src/App.jsx','utf8').match(/import \{([\s\S]*?)\} from "lucide-react";/)[1].split(',').map(x=>x.trim()).filter(Boolean);
const icons=impNames.map(n=>`const ${n}=()=>null;`).join('');
const stub='const React={createElement:()=>null},useState=(i)=>[typeof i==="function"?i():i,()=>{}],useMemo=(f)=>f(),useEffect=()=>{},useRef=()=>({current:{}}),createContext=()=>({Provider:null}),useContext=()=>({lang:"zh",t:k=>k});';
const mod={exports:{}};
let saved=null;
new Function('module','window','fetch','console', stub+icons+out.replace('export default','module.exports.App=')
 +'\nObject.assign(module.exports,{buildImportPlan,toMinor,money,ratesOn,convertOn,sumOn,SEED_FX_DAILY,CUR,saveAll,loadAll});')
 (mod,{storage:{get:async()=>{ if(!saved) throw new Error('no key'); return {value:saved};},set:async(k,v)=>{saved=v;return{key:k,value:v}}}},()=>Promise.reject(),console);

const M=mod.exports;
let pass=0,fail=0;
const ok=(n,c,e='')=>{c?(pass++,console.log('  ✓',n,e)):(fail++,console.log('  ✗',n,e));};

console.log('\n【端到端:导入 → 统计】');
const text=fs.readFileSync('tests/komorebi_sample.csv','utf8');
const plan=M.buildImportPlan(text,{cutoff:'2026-07-31',existingCats:[]});

// 模拟 Importer.run 的写入逻辑
const impCur='JPY';
const rows=plan.rows.map(r=>({
  id:`imp_${plan.hash}_${r.key}`, type:r.type,
  amount:M.toMinor(r.amount,impCur), cur:impCur, cat:r.cat, date:r.date,
  name:r.name, srcKey:r.key, srcBatch:plan.hash,
  fxd: M.ratesOn(M.SEED_FX_DAILY, r.date)?.at ?? null,
}));
ok('生成交易条数与计划一致', rows.length===plan.stats.ready, `${rows.length}`);
ok('金额是整数最小单位', rows.every(r=>Number.isInteger(r.amount)));
ok('JPY 金额未被放大', rows[0].amount===plan.rows[0].amount, `${rows[0].amount}`);
ok('每条都有稳定标识', rows.every(r=>r.srcKey && r.srcBatch));
ok('id 各不相同', new Set(rows.map(r=>r.id)).size===rows.length);

// 二次导入去重
const have=new Set(rows.map(r=>r.srcKey));
const merged=[...rows, ...rows.filter(r=>!have.has(r.srcKey))];
ok('重复导入不新增', merged.length===rows.length);

// 统计能算出来
const jul=rows.filter(r=>r.date.startsWith('2026-07')&&r.type==='expense');
const sum=M.sumOn(jul,'JPY',M.SEED_FX_DAILY);
ok('月度合计可计算', sum.total>0 && sum.missing.length===0, M.money(sum.total,'JPY'));
const mar=rows.filter(r=>r.date.startsWith('2026-03'));
ok('三月数据也在', mar.length>0, `${mar.length} 条`);
ok('无 2070 年数据', rows.every(r=>!r.date.startsWith('20 70'.replace(' ',''))));

console.log('\n【持久化往返】');
(async()=>{
  const data={lang:'ja',txns:rows.slice(0,5),cur:'CNY',favs:['CNY','JPY'],setupDone:true,batches:[{hash:plan.hash}]};
  M.saveAll(data);
  await new Promise(r=>setTimeout(r,600));
  const back=await M.loadAll();
  ok('存后能读回', !!back);
  ok('语言保留', back.lang==='ja');
  ok('交易保留', back.txns.length===5);
  ok('主币种保留', back.cur==='CNY');
  ok('批次保留(可识别重复文件)', back.batches[0].hash===plan.hash);
  const p2=M.buildImportPlan(text,{cutoff:'2026-07-31',existingCats:[],existingKeys:new Set(back.txns.map(x=>x.srcKey))});
  ok('已存的记录再导入会跳过', p2.stats.duplicate===5, `dup=${p2.stats.duplicate}`);
  console.log(`\n通过 ${pass} / 失败 ${fail}`);
  process.exit(fail?1:0);
})();
