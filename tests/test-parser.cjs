const fs=require('fs'), babel=require('@babel/core');
let src=fs.readFileSync('src/App.jsx','utf8');
src=src.replace(/^import[\s\S]*?from "lucide-react";/m,'').replace(/^import React[\s\S]*?from "react";/m,'');
const out=babel.transformSync(src,{presets:[[require.resolve('@babel/preset-env'),{targets:{node:'current'},modules:false}],[require.resolve('@babel/preset-react'),{runtime:'classic'}]],filename:'a.jsx'}).code;
const impNames=fs.readFileSync('src/App.jsx','utf8').match(/import \{([\s\S]*?)\} from "lucide-react";/)[1].split(',').map(x=>x.trim()).filter(Boolean);
const icons=impNames.map(n=>`const ${n}=()=>null;`).join('');
const stub='const React={createElement:()=>null,useRef:()=>({current:{}})},useState=(i)=>[typeof i==="function"?i():i,()=>{}],useMemo=(f)=>f(),useEffect=()=>{},useRef=()=>({current:{}}),createContext=()=>({Provider:null}),useContext=()=>({lang:"zh",t:k=>k});';
const mod={exports:{}};
new Function('module','window','fetch', stub+icons+out
  .replace('export default','module.exports.App=')
  +'\nmodule.exports.buildImportPlan=buildImportPlan;module.exports.parseSections=parseSections;module.exports.parseCsvLine=parseCsvLine;module.exports.normalizeDate=normalizeDate;module.exports.hashText=hashText;module.exports.recordKey=recordKey;module.exports.SEED_CATS=SEED_CATS;'
)(mod,{storage:{get:async()=>null,set:async()=>null}},()=>Promise.reject());

const {buildImportPlan,parseSections,parseCsvLine,normalizeDate,hashText,SEED_CATS}=mod.exports;
const text=fs.readFileSync('tests/komorebi_sample.csv','utf8');

let pass=0,fail=0;
const ok=(name,cond,extra='')=>{ if(cond){pass++;console.log('  ✓',name,extra);}else{fail++;console.log('  ✗',name,extra);} };

console.log('\n【1】区块识别');
const {sections,warnings}=parseSections(text);
const names=Object.keys(sections);
ok('识别出 5 个已知区块', ['DAILY_DATAS','CATEGORIES','FIXED_COST_SETTINGS','ACCOUNT_BOOKINGS','BUDGET_SETTINGS'].every(n=>names.includes(n)), names.join(','));
ok('未知区块被记录警告但未中断', warnings.length===1, warnings[0]||'');

console.log('\n【2】行数');
ok('DAILY_DATAS 解析条数 = 1850', sections.DAILY_DATAS.length===1850, String(sections.DAILY_DATAS.length));
ok('CATEGORIES 解析 21 个', sections.CATEGORIES.length===21, String(sections.CATEGORIES.length));
ok('FIXED_COST_SETTINGS 3 条', sections.FIXED_COST_SETTINGS.length===3);

console.log('\n【3】CSV 边界');
ok('引号内逗号', JSON.stringify(parseCsvLine('a,"b,c",d'))==='["a","b,c","d"]');
ok('双写转义引号', JSON.stringify(parseCsvLine('a,"say ""hi""",b'))==='["a","say \\"hi\\"","b"]');
ok('空字段', JSON.stringify(parseCsvLine('a,,c'))==='["a","","c"]');
ok('BOM 已去除', !Object.keys(sections)[0].startsWith('\uFEFF'));

console.log('\n【4】日期');
ok('2026/3/15 → 2026-03-15', normalizeDate('2026/3/15')==='2026-03-15');
ok('非法月份返回 null', normalizeDate('2026/13/45')===null);
ok('2月30日返回 null', normalizeDate('2026/2/30')===null);

console.log('\n【5】导入计划(截止 2026-07-31)');
const plan=buildImportPlan(text,{cutoff:'2026-07-31',existingCats:[]});
const st=plan.stats;
console.log('   ',JSON.stringify(st));
ok('总数 1850', st.total===1850);
ok('排除未来记录', st.future>1400, String(st.future));
ok('准备导入 = 总数 - 未来 - 错误', st.ready===st.total-st.future-st.errors, `${st.ready}`);
ok('分类 21 个', st.cats===21);
ok('固定支出规则 3 条', st.rules===3);
ok('检出 4 条异常', st.suspicious===4, String(st.suspicious));
ok('捕获格式错误(金额+日期)', st.errors===2 && plan.errors.map(e=>e.why).sort().join()==='amount,date', JSON.stringify(plan.errors.map(e=>e.why)));

console.log('\n【6】异常记录内容');
const sus=plan.suspicious;
ok('异常都是收入型', sus.every(x=>x.type==='income'));
ok('异常备注都是コンビニ', sus.every(x=>x.name==='コンビニ'), sus.map(x=>x.name).join(','));
ok('未自动修改类型', sus.every(x=>x.type==='income'));

console.log('\n【7】未来记录一条都不进');
ok('rows 里无晚于截止日的', plan.rows.every(r=>r.date<='2026-07-31'));
ok('2070 年的固定支出被排除', plan.rows.every(r=>!r.date.startsWith('2070')));

console.log('\n【8】中日文与引号备注');
const quoted=plan.rows.find(r=>r.name.includes('特売'));
ok('带逗号的备注完整保留', quoted && quoted.name.includes(',') && quoted.name.includes('スーパー'), quoted?.name);
const dq=plan.rows.find(r=>r.name.includes('有料'));
ok('带引号的备注完整保留', dq && dq.name==='レジ袋 "有料"', dq?.name);

console.log('\n【9】分类兜底与图标');
const fb=plan.rows.filter(r=>r.catFallback);
ok('找不到分类时走兜底', fb.length===1, `${fb.length} 条`);
ok('未知图标编号有默认值', plan.catsToCreate.every(c=>typeof c.icon==='string'&&c.icon.length>0));
ok('保留原始颜色', plan.catsToCreate.some(c=>c.color==='#FF8C00'));
ok('保留排列顺序', plan.catsToCreate[0].order===1);

console.log('\n【10】重复导入');
const h1=hashText(text);
const h2=hashText(text.slice());
ok('同内容哈希一致(改文件名不影响)', h1===h2, h1);
ok('改一个字符哈希就变', hashText(text+' ')!==h1);
const keys=new Set(plan.rows.map(r=>r.key));
const plan2=buildImportPlan(text,{cutoff:'2026-07-31',existingCats:[],existingKeys:keys});
ok('已导入过的记录被跳过', plan2.stats.ready===0 && plan2.stats.duplicate===plan.stats.ready, `dup=${plan2.stats.duplicate}`);

console.log('\n【11】已有同名同类型分类时复用');
const existing=[{id:1,type:'expense',name:'食費',k:'x',icon:'Utensils',color:'#000',order:1}];
const plan3=buildImportPlan(text,{cutoff:'2026-07-31',existingCats:existing});
ok('复用而不新建', plan3.catsToCreate.every(c=>c.name!=='食費'));
ok('旧ID映射到已有分类', plan3.catMap['1']===1, String(plan3.catMap['1']));

console.log('\n【12】本应用导出备份再导入');
const backupText=`#TRANSACTIONS
id,date,type,amount,currency,categoryId,category,note,rateDate
abc,2026-08-07,expense,123.45,CNY,1,餐饮,测试午饭,2026-08-07
def,2026-08-08,income,5000,JPY,21,工资,工资,2026-08-07

#CATEGORIES
id,name,type,icon,color,order
1,餐饮,expense,Utensils,#D4644A,1
21,工资,income,Wallet,#3E8E5A,1

#FIXED_COSTS
id,name,type,amount,currency,categoryId,category,day,enabled,startDate
f1,房租,expense,80000,JPY,10,居住,25,1,2026-08

#EXCHANGE_RATES
date,currency,rateToJPY,source
2026-08-07,CNY,23.6,api
2026-08-07,JPY,1,api`;
const backupPlan=buildImportPlan(backupText,{existingCats:SEED_CATS,existingKeys:new Set()});
ok('识别为本应用备份格式', backupPlan.kind==='backup', backupPlan.kind);
ok('备份交易可导入', backupPlan.stats.ready===2 && backupPlan.rows.length===2, String(backupPlan.stats.ready));
ok('保留每条交易自己的币种', backupPlan.rows.map(r=>r.cur).join(',')==='CNY,JPY', backupPlan.rows.map(r=>r.cur).join(','));
ok('内置分类不会重复创建', backupPlan.catsToCreate.length===0, String(backupPlan.catsToCreate.length));
ok('固定支出和汇率也读出', backupPlan.fixedToCreate.length===1 && Object.keys(backupPlan.fxToMerge).length===1,
  `fixed=${backupPlan.fixedToCreate.length},fx=${Object.keys(backupPlan.fxToMerge).length}`);

console.log(`\n通过 ${pass} / 失败 ${fail}`);
process.exit(fail?1:0);
