import React, { useState, useMemo, useEffect, useRef, createContext, useContext } from "react";
import {
  Utensils, Coffee, Pizza, IceCream, Beef, Fish, Salad, Soup,
  Sandwich, Croissant, Egg, Cake, Cookie, Candy, Popcorn, Apple,
  Carrot, Cherry, Grape, Banana, Milk, CupSoda, Wine, Beer,
  Martini, ShoppingBasket, ShoppingCart, ShoppingBag, Store, Package, Tag, Receipt,
  Gift, Shirt, Footprints, Watch, Glasses, Crown, Backpack, Luggage,
  Scissors, Home, Bed, Sofa, Armchair, Lamp, Bath, ShowerHead,
  Refrigerator, WashingMachine, Plug, Lightbulb, Key, Wrench, Hammer, Fence,
  Warehouse, Hotel, TrainFront, TramFront, Car, CarTaxiFront, Bus, Bike,
  Plane, Ship, Truck, Fuel, Rocket, Anchor, Tent, Mountain,
  MapPin, Globe, Pill, HeartPulse, Stethoscope, Syringe, Cross, Dumbbell,
  Activity, Waves, Baby, PawPrint, Dog, Cat, Bird, Flower,
  Leaf, TreePine, Sprout, Recycle, Gamepad2, Music, Headphones, Guitar,
  Piano, Film, Tv, Camera, Ticket, PartyPopper, Palette, Drama,
  Dices, Trophy, Medal, Puzzle, Podcast, Newspaper, BookOpen, GraduationCap,
  Pencil, Calculator, Microscope, Languages, Briefcase, Building2, Laptop, Printer,
  Mail, Users, Factory, Landmark, Wallet, Banknote, Coins, PiggyBank,
  CreditCard, TrendingUp, Droplet, Zap, Flame, Wifi, Smartphone, Phone,
  Heart, Star, Sparkles, Smile, Sun, Moon, Snowflake, Umbrella,
  Shield, Cigarette, Bone, Church, Hourglass, Bell, Calendar, Clock,
  MoreHorizontal, Repeat, SlidersHorizontal, ChevronLeft, ChevronRight, ChevronDown, Plus, ArrowLeft,
  Check, X, Trash2, NotebookText, BarChart3, Settings2, Upload, AlertTriangle,
  GripVertical, RefreshCw, PieChart,
} from "lucide-react";

/* toISOString() 返回 UTC 日期,在东九区会整体差一天,所以一律用本地年月日拼 */
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (iso, n) => { const x = new Date(iso + "T00:00:00"); x.setDate(x.getDate() + n); return ymd(x); };
const TODAY = ymd(new Date());
const THIS_MONTH = TODAY.slice(0, 7);
const DIM = +TODAY.slice(8);                       // 当月已过天数

/* ═════════════════════════════════════════════════════════
   令牌
   ═════════════════════════════════════════════════════════ */
const C = {
  page: "#F4F6F8", surface: "#FFFFFF",
  ink: "#1F2933", ink2: "#66707A", ink3: "#A3ACB6",
  hair: "#EDF0F3", soft: "#F4F6F8", line: "#DDE2E8",
  out: "#E85D50", inn: "#3BA776",
  outSoft: "#FDEEEC", innSoft: "#E9F6F0",
  warn: "#FFF6E0", warnInk: "#B0812A",
  brand: "#3BA776",
  R: 14,            // 卡片圆角
  r: 10,            // 小件圆角
};
const F_UI = "'Inter', system-ui, -apple-system, 'PingFang SC', 'Hiragino Sans', 'Malgun Gothic', sans-serif";
const F_NUM = "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace";
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
*{-webkit-tap-highlight-color:transparent}
.num{font-family:${F_NUM};font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.lab{font-size:11px;font-weight:600;letter-spacing:.06em;color:${C.ink3}}
.card{background:${C.surface};border-radius:${C.R}px;box-shadow:0 1px 2px rgba(31,41,51,.05),0 4px 12px rgba(31,41,51,.04)}
.tile{display:flex;align-items:center;justify-content:center;border-radius:11px;flex-shrink:0}
@keyframes nudge{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
@keyframes up{from{transform:translateY(100%)}to{transform:translateY(0)}}
.nudge{animation:nudge .32s ease}.up{animation:up .22s cubic-bezier(.2,.8,.2,1)}
@media (prefers-reduced-motion:reduce){.nudge,.up{animation:none}}
button:focus-visible,input:focus-visible{outline:2px solid ${C.ink};outline-offset:1px}
input::placeholder{color:#C0C5CC}
`;

/* ═════════════════════════════════════════════════════════
   多语言
   ═════════════════════════════════════════════════════════ */
const LANGS = [
  { c: "zh", native: "简体中文" },
  { c: "ja", native: "日本語" },
  { c: "en", native: "English" },
  { c: "ko", native: "한국어" },
];

const DICT = {
  zh: {
    "nav.record":"记账","nav.ledger":"账本","nav.stat":"分析","nav.set":"设置",
    "t.expense":"支出","t.income":"收入","t.balance":"结余",
    "r.date":"日期","r.note":"记录","r.category":"分类","r.notePh":"添加备注",
    "r.rowExpense":"支出","r.rowIncome":"收入","r.rowCategory":"分类",
    "r.quick":"快捷输入","r.editQuick":"编辑快捷输入","r.save":"记一笔",
    "r.pickCat":"选择分类","r.future":"未来","r.pickCur":"结算币种","r.month":"月","r.editCat":"编辑",
    "r.saved":"已记","r.needAmount":"请输入金额","r.needAmountFirst":"先输入金额，再点",
    "l.less":"少","l.more":"多","l.only":"只看","l.noDay":"这一天没有记录",
    "a.vs":"较上月","a.nodata":"无数据","a.budget":"预算","a.pace":"竖线＝当月进度",
    "a.setBudget":"设置预算","a.total":"总预算","a.noMonth":"本月还没有记录",
    "a.budgetPrompt":"设置预算（留空清除）",
    "q.title":"快捷输入","q.new":"新建快捷按钮","q.edit":"编辑快捷按钮",
    "q.name":"名称","q.namePh":"便利店 / 游泳 / 定期券","q.type":"类型",
    "q.amount":"金额","q.varies":"每次不同","q.variesD":"先输金额再点，比如便利店",
    "q.fixed":"固定金额","q.fixedD":"点一下直接记账，比如游泳","q.empty":"还没有快捷按钮",
    "f.title":"固定支出","f.new":"新建固定支出","f.edit":"编辑固定支出",
    "f.monthly":"每月合计","f.enabled":"项启用","f.pending":"笔尚未记入","f.catchUp":"补记",
    "f.namePh":"房租 / WiFi / 保险","f.day":"每月扣款日",
    "f.dayHint":"该月没有这一天时（比如 31 号遇到 2 月），自动落在当月最后一天。",
    "f.start":"开始月份","f.startHint":"从这个月起补记到今天为止，不会生成未来的账目。",
    "f.foot":"固定支出只会补记到今天为止。停用后已经记入的账目仍然保留，只是不再继续生成。",
    "f.empty":"还没有固定支出","f.every":"每月","f.day2":"日","f.badge":"待记",
    "c.title":"分类","c.new":"新建分类","c.namePh":"分类名称","c.icon":"图标","g.food":"饮食","g.shop":"购物","g.home":"居家","g.move":"出行","g.life":"生活","g.fun":"娱乐","g.work":"学习工作","g.money":"账务","g.other":"其他","c.color":"颜色",
    "s.groupRecord":"记账","s.groupData":"数据","s.groupGeneral":"通用",
    "s.quick":"常用消费一键记账","s.fixedSub":"项","s.cats":"增删、排序、图标与颜色",
    "s.import":"导入旧账目","s.importSub":"从其它记账软件的 CSV 导入","s.export":"导出 CSV",
    "s.currency":"主币种","s.language":"语言",
    "i.title":"导入预览","i.pick":"选择 CSV 文件","i.reading":"读取中","i.badFile":"这个文件解析不了,请确认是旧记账软件导出的 CSV","i.dupFile":"这份文件已经导入过了","i.dupRows":"重复跳过","i.errRows":"格式错误","i.keepAll":"保持原样","i.toExpense":"改为支出","i.skipOdd":"跳过","i.done":"导入完成","i.imported":"已导入","i.newCats":"新建分类","i.oddAction":"这些记录怎么处理","i.rollback":"导入失败,已全部撤回","i.preview":"前 10 条","i.again":"重新选择","i.warn":"界面骨架，数字为示意值，实际应由 CSV 解析器动态计算。",
    "i.total":"账目总数","i.ready":"准备导入","i.future":"排除未来","i.cats":"分类",
    "i.rules":"固定支出规则","i.odd":"可能异常","i.defCur":"默认币种",
    "i.oddHint":"账目类型与所属分类的类型不一致，默认按原样导入。",
    "i.oddNote":"原始为收入，分类「工资」","i.cancel":"取消","i.start":"开始导入",
    "x.title":"汇率","x.sub":"用于跨币种的参考合计","x.refresh":"获取最新汇率",
    "x.current":"当前设置汇率","x.manual":"手动","x.api":"自动","x.seed":"初始值",
    "x.updated":"更新","x.failed":"获取失败,请手动输入汇率","x.done":"汇率已更新",
    "x.overwrite":"手动设置的汇率已被覆盖","x.undo":"撤销","x.edit":"手动输入",
    "x.all":"全部","x.approx":"约","x.mixed":"含多种币种,按当前设置汇率折算",
    "x.noRate":"缺少汇率,未计入","x.anchorHint":"以下汇率均相对主币种",
    "rp.title":"报告","rp.month":"月度","rp.year":"年度","rp.byMonth":"按月支出",
    "rp.total":"支出合计","rp.empty":"这段时间没有支出记录","rp.peak":"最高",
    "x.byDay":"按各笔账目当天的汇率折算","x.oneLine":"支出均按当天汇率折算","x.carried":"沿用上一个交易日","x.history":"汇率记录",
    "x.already":"当天汇率已存在,未覆盖","x.immutable":"每天的汇率写入后不再修改,所以历史统计不会变动。缺失的日子沿用最近一个有值的交易日。",
    "x.strip":"记账用汇率","x.update":"更新","x.updating":"获取中","x.pinNote":"更新只影响之后记的账,已记录的不会变动",
    "x.panel":"汇率","x.amt":"金额","x.favs":"常用货币","x.favsView":"当前常用货币","x.editFavs":"修改","x.confirmTitle":"确认修改常用货币","x.confirmBody":"常用货币只影响选择器里显示哪几种。已记录的账目和历史统计不会改变。","x.confirmBodyNew":"其中有币种缺少历史汇率,它只对此后记录的账目生效。","x.confirm":"确认修改","x.backfill":"正在补齐历史汇率","x.backfillOk":"已补齐 {n} 天的历史汇率","x.backfillFail":"历史汇率补齐失败,可稍后在汇率页重试","x.newCur":"新增","x.willBackfill":"新增的币种会自动补齐历史汇率,过去的账目按当时的真实汇率显示。","x.min1":"至少保留一种","x.mainLocked":"主要货币不能移除","x.cancel":"取消","x.min":"至少选两种","x.favsHint":"只决定选择器里显示哪几种,不影响已记录的数据","x.pickMain":"主要货币","x.setupTitle":"先选货币","x.setupSub":"之后随时可以在设置里改","x.start":"开始使用","x.needMain":"主要货币必须在常用货币之内","x.noHistory":"该币种没有历史汇率,只影响此后的记录","rp.byCur":"按货币","rp.all":"全部","rp.allHint":"各币种按当日汇率折算为主要货币","x.addPair":"添加汇率","x.removePair":"移除","x.search":"搜索币种","x.base":"主货币","x.mainNow":"当前主货币","x.tapUpdate":"点「更新」获取最新汇率","x.asOf":"汇率日期",
    "e.title":"编辑账目","e.delete":"删除这笔","e.confirm":"确定删除这笔账目吗？","e.saved":"已修改","e.deleted":"已删除","e.fromFixed":"由固定支出生成,修改只影响这一笔",
    "g.save":"保存","g.back":"返回","g.close":"关闭","g.new":"新建","g.edit":"编辑",
    "w0":"周日","w1":"周一","w2":"周二","w3":"周三","w4":"周四","w5":"周五","w6":"周六",
    "cat.food":"餐饮","cat.daily":"日用","cat.cloth":"服饰","cat.beauty":"美容","cat.social":"社交",
    "cat.med":"医疗","cat.edu":"学习","cat.util":"水电","cat.trans":"交通","cat.house":"居住",
    "cat.phone":"通信","cat.fun":"娱乐","cat.sport":"运动","cat.misc":"其他",
    "cat.salary":"工资","cat.pocket":"零花","cat.bonus":"奖金","cat.side":"副业","cat.invest":"投资","cat.etc":"其他",
    "cur.JPY":"日元","cur.CNY":"人民币","cur.USD":"美元","cur.EUR":"欧元","cur.KRW":"韩元","cur.HKD":"港币","cur.SGD":"新加坡元","cur.THB":"泰铢","cur.PHP":"菲律宾比索","cur.MYR":"马来西亚林吉特","cur.IDR":"印尼盾","cur.INR":"印度卢比","cur.AUD":"澳元","cur.CAD":"加元","cur.CHF":"瑞士法郎","cur.NZD":"新西兰元","cur.MOP":"澳门币","cur.TWD":"新台币","cur.GBP":"英镑",
    "n.conv":"便利店","n.market":"超市","n.drug":"药妆店","n.eatout":"外食","n.phone":"手机费",
    "n.wifi":"WiFi","n.ins":"保险","n.hair":"理发","n.party":"聚餐","n.book":"参考书",
    "n.lunch":"午饭","n.water":"水费","n.elec":"电费","n.pass":"定期券","n.stock":"囤货",
    "n.butcher":"肉铺","n.points":"积分返现","n.swim":"游泳","n.gym":"健身房",
  },
  ja: {
    "nav.record":"入力","nav.ledger":"家計簿","nav.stat":"分析","nav.set":"設定",
    "t.expense":"支出","t.income":"収入","t.balance":"収支",
    "r.date":"日付","r.note":"メモ","r.category":"分類","r.notePh":"メモを追加",
    "r.rowExpense":"支出","r.rowIncome":"収入","r.rowCategory":"分類",
    "r.quick":"クイック入力","r.editQuick":"クイック入力を編集","r.save":"記録する",
    "r.pickCat":"分類を選ぶ","r.future":"未来","r.pickCur":"決済通貨","r.month":"月","r.editCat":"編集",
    "r.saved":"記録しました","r.needAmount":"金額を入力してください","r.needAmountFirst":"先に金額を入力してから",
    "l.less":"少","l.more":"多","l.only":"表示","l.noDay":"この日の記録はありません",
    "a.vs":"前月比","a.nodata":"データなし","a.budget":"予算","a.pace":"縦線＝今月の進捗",
    "a.setBudget":"予算を設定","a.total":"総予算","a.noMonth":"今月の記録はまだありません",
    "a.budgetPrompt":"予算を設定（空欄で解除）",
    "q.title":"クイック入力","q.new":"クイックボタンを作成","q.edit":"クイックボタンを編集",
    "q.name":"名前","q.namePh":"コンビニ / 水泳 / 定期券","q.type":"種類",
    "q.amount":"金額","q.varies":"毎回変わる","q.variesD":"先に金額を入れてから押す（例：コンビニ）",
    "q.fixed":"固定金額","q.fixedD":"押すだけで記録（例：水泳）","q.empty":"クイックボタンがありません",
    "f.title":"固定費","f.new":"固定費を作成","f.edit":"固定費を編集",
    "f.monthly":"毎月の合計","f.enabled":"件が有効","f.pending":"件が未記録","f.catchUp":"記録する",
    "f.namePh":"家賃 / WiFi / 保険","f.day":"毎月の引落日",
    "f.dayHint":"その月に無い日（2月の31日など）は月末に繰り上げます。",
    "f.start":"開始月","f.startHint":"この月から今日までを記録します。未来の記録は作りません。",
    "f.foot":"固定費は今日までしか記録しません。無効にしても記録済みの分は残ります。",
    "f.empty":"固定費がありません","f.every":"毎月","f.day2":"日","f.badge":"未記録",
    "c.title":"分類","c.new":"分類を作成","c.namePh":"分類名","c.icon":"アイコン","g.food":"食事","g.shop":"買い物","g.home":"住まい","g.move":"移動","g.life":"暮らし","g.fun":"娯楽","g.work":"学習・仕事","g.money":"お金","g.other":"その他","c.color":"色",
    "s.groupRecord":"入力","s.groupData":"データ","s.groupGeneral":"一般",
    "s.quick":"よく使う支出をワンタップで","s.fixedSub":"件","s.cats":"追加・並べ替え・アイコンと色",
    "s.import":"旧データを取り込む","s.importSub":"他アプリの CSV から取り込み","s.export":"CSV を書き出す",
    "s.currency":"主な通貨","s.language":"言語",
    "i.title":"取り込みプレビュー","i.pick":"CSV ファイルを選ぶ","i.reading":"読み込み中","i.badFile":"解析できません。旧アプリの CSV か確認してください","i.dupFile":"このファイルは取り込み済みです","i.dupRows":"重複でスキップ","i.errRows":"形式エラー","i.keepAll":"そのまま","i.toExpense":"支出に変更","i.skipOdd":"スキップ","i.done":"取り込み完了","i.imported":"取り込み済み","i.newCats":"新規分類","i.oddAction":"これらの扱い","i.rollback":"失敗したため全て取り消しました","i.preview":"先頭10件","i.again":"選び直す","i.warn":"画面の骨組みです。数値は仮のもので、実際は CSV から計算します。",
    "i.total":"総件数","i.ready":"取り込む","i.future":"未来を除外","i.cats":"分類",
    "i.rules":"固定費ルール","i.odd":"要確認","i.defCur":"既定の通貨",
    "i.oddHint":"種類と分類が一致しません。既定ではそのまま取り込みます。",
    "i.oddNote":"元は収入・分類「給与」","i.cancel":"キャンセル","i.start":"取り込む",
    "x.title":"為替レート","x.sub":"通貨をまたぐ合計の参考値に使います","x.refresh":"最新レートを取得",
    "x.current":"現在のレート","x.manual":"手動","x.api":"自動","x.seed":"初期値",
    "x.updated":"更新","x.failed":"取得できません。手動で入力してください","x.done":"レートを更新しました",
    "x.overwrite":"手動で設定したレートを上書きしました","x.undo":"元に戻す","x.edit":"手動入力",
    "x.all":"すべて","x.approx":"約","x.mixed":"複数通貨を現在のレートで換算",
    "x.noRate":"レート不明のため未計上","x.anchorHint":"主な通貨に対するレートです",
    "rp.title":"レポート","rp.month":"月次","rp.year":"年次","rp.byMonth":"月別支出",
    "rp.total":"支出合計","rp.empty":"この期間の支出はありません","rp.peak":"最高",
    "x.byDay":"各記録の当日レートで換算","x.oneLine":"支出は当日のレートで換算","x.carried":"直近の営業日を適用","x.history":"レート履歴",
    "x.already":"その日のレートは既にあります","x.immutable":"日ごとのレートは一度書き込むと変更しません。過去の集計はぶれません。無い日は直近の営業日を使います。",
    "x.strip":"記録に使うレート","x.update":"更新","x.updating":"取得中","x.pinNote":"更新は以降の記録にのみ反映され、記録済みの分は変わりません",
    "x.panel":"為替レート","x.amt":"金額","x.favs":"よく使う通貨","x.favsView":"現在の設定","x.editFavs":"変更","x.confirmTitle":"よく使う通貨を変更","x.confirmBody":"よく使う通貨は選択リストの表示だけを変えます。記録済みの家計簿と過去の集計は変わりません。","x.confirmBodyNew":"過去レートが無い通貨が含まれます。今後の記録にのみ反映されます。","x.confirm":"変更する","x.backfill":"過去レートを取得中","x.backfillOk":"{n}日分の過去レートを補完しました","x.backfillFail":"過去レートの補完に失敗しました。後でレート画面から再試行できます","x.newCur":"追加","x.willBackfill":"追加した通貨は過去レートを自動で補完し、当時の実レートで表示します。","x.min1":"最低1つ必要です","x.mainLocked":"主な通貨は外せません","x.cancel":"キャンセル","x.min":"2つ以上選んでください","x.favsHint":"選択リストの表示だけを決めます。記録済みのデータには影響しません","x.pickMain":"主な通貨","x.setupTitle":"まず通貨を選ぶ","x.setupSub":"あとで設定から変更できます","x.start":"はじめる","x.needMain":"主な通貨はよく使う通貨に含めてください","x.noHistory":"この通貨の過去レートはありません。今後の記録にのみ反映されます","rp.byCur":"通貨別","rp.all":"すべて","rp.allHint":"各通貨をその日のレートで主な通貨に換算","x.addPair":"レートを追加","x.removePair":"削除","x.search":"通貨を検索","x.base":"基準通貨","x.mainNow":"現在の基準通貨","x.tapUpdate":"「更新」で最新レートを取得","x.asOf":"レート日付",
    "e.title":"記録を編集","e.delete":"この記録を削除","e.confirm":"この記録を削除しますか？","e.saved":"変更しました","e.deleted":"削除しました","e.fromFixed":"固定費から作成されました。変更はこの記録だけに反映されます",
    "g.save":"保存","g.back":"戻る","g.close":"閉じる","g.new":"新規","g.edit":"編集",
    "w0":"日","w1":"月","w2":"火","w3":"水","w4":"木","w5":"金","w6":"土",
    "cat.food":"食費","cat.daily":"日用品","cat.cloth":"衣服","cat.beauty":"美容","cat.social":"交際費",
    "cat.med":"医療費","cat.edu":"教育費","cat.util":"水道光熱","cat.trans":"交通費","cat.house":"住居",
    "cat.phone":"通信費","cat.fun":"娯楽","cat.sport":"運動","cat.misc":"その他",
    "cat.salary":"給与","cat.pocket":"小遣い","cat.bonus":"賞与","cat.side":"副業","cat.invest":"投資","cat.etc":"その他",
    "cur.JPY":"日本円","cur.CNY":"人民元","cur.USD":"米ドル","cur.EUR":"ユーロ","cur.KRW":"韓国ウォン","cur.HKD":"香港ドル","cur.SGD":"シンガポールドル","cur.THB":"タイバーツ","cur.PHP":"フィリピンペソ","cur.MYR":"マレーシアリンギット","cur.IDR":"インドネシアルピア","cur.INR":"インドルピー","cur.AUD":"豪ドル","cur.CAD":"カナダドル","cur.CHF":"スイスフラン","cur.NZD":"ニュージーランドドル","cur.MOP":"マカオパタカ","cur.TWD":"台湾ドル","cur.GBP":"英ポンド",
    "n.conv":"コンビニ","n.market":"スーパー","n.drug":"ドラッグストア","n.eatout":"外食","n.phone":"携帯料金",
    "n.wifi":"WiFi","n.ins":"保険","n.hair":"美容院","n.party":"飲み会","n.book":"参考書",
    "n.lunch":"ランチ","n.water":"水道代","n.elec":"電気代","n.pass":"定期券","n.stock":"まとめ買い",
    "n.butcher":"精肉店","n.points":"ポイント還元","n.swim":"水泳","n.gym":"ジム",
  },
  en: {
    "nav.record":"Add","nav.ledger":"Ledger","nav.stat":"Insights","nav.set":"Settings",
    "t.expense":"Expense","t.income":"Income","t.balance":"Net",
    "r.date":"Date","r.note":"Note","r.category":"Category","r.notePh":"Add a note",
    "r.rowExpense":"Spent","r.rowIncome":"Got","r.rowCategory":"Category",
    "r.quick":"Quick entry","r.editQuick":"Set up quick entry","r.save":"Add entry",
    "r.pickCat":"Choose a category","r.future":"future","r.pickCur":"Settlement currency","r.month":"/","r.editCat":"Edit",
    "r.saved":"Added","r.needAmount":"Enter an amount","r.needAmountFirst":"Enter an amount first, then tap",
    "l.less":"Less","l.more":"More","l.only":"Only","l.noDay":"Nothing on this day",
    "a.vs":"vs last month","a.nodata":"No data","a.budget":"Budget","a.pace":"Line marks month progress",
    "a.setBudget":"Set a budget","a.total":"Total budget","a.noMonth":"Nothing recorded this month",
    "a.budgetPrompt":"Set a budget (leave blank to clear)",
    "q.title":"Quick entry","q.new":"New quick button","q.edit":"Edit quick button",
    "q.name":"Name","q.namePh":"Corner shop / Swim / Transit pass","q.type":"Type",
    "q.amount":"Amount","q.varies":"Varies each time","q.variesD":"Type the amount, then tap — like a corner shop",
    "q.fixed":"Fixed amount","q.fixedD":"One tap records it — like a swim","q.empty":"No quick buttons yet",
    "f.title":"Recurring","f.new":"New recurring cost","f.edit":"Edit recurring cost",
    "f.monthly":"Monthly total","f.enabled":"active","f.pending":"not yet recorded","f.catchUp":"Record now",
    "f.namePh":"Rent / WiFi / Insurance","f.day":"Day of month",
    "f.dayHint":"If a month is shorter — the 31st in February — it lands on the last day.",
    "f.start":"Starting month","f.startHint":"Fills in from this month up to today. Never creates future entries.",
    "f.foot":"Recurring costs only fill in up to today. Turning one off keeps what's already recorded.",
    "f.empty":"No recurring costs yet","f.every":"Every","f.day2":"","f.badge":"pending",
    "c.title":"Categories","c.new":"New category","c.namePh":"Category name","c.icon":"Icon","g.food":"Food","g.shop":"Shopping","g.home":"Home","g.move":"Getting around","g.life":"Life","g.fun":"Fun","g.work":"Work & study","g.money":"Money","g.other":"Other","c.color":"Color",
    "s.groupRecord":"Recording","s.groupData":"Data","s.groupGeneral":"General",
    "s.quick":"One tap for what you buy often","s.fixedSub":"items","s.cats":"Add, reorder, icons and colors",
    "s.import":"Import old entries","s.importSub":"From another app's CSV","s.export":"Export CSV",
    "s.currency":"Main currency","s.language":"Language",
    "i.title":"Import preview","i.pick":"Choose a CSV file","i.reading":"Reading","i.badFile":"Could not read this file — check it is the CSV your old app exported","i.dupFile":"This file has already been imported","i.dupRows":"Skipped as duplicates","i.errRows":"Malformed","i.keepAll":"Keep as is","i.toExpense":"Make expense","i.skipOdd":"Skip","i.done":"Import finished","i.imported":"Imported","i.newCats":"New categories","i.oddAction":"What to do with these","i.preview":"First 10","i.rollback":"Import failed — nothing was saved","i.again":"Choose another","i.warn":"Layout only — these numbers are placeholders. The parser fills them in.",
    "i.total":"Rows in file","i.ready":"Will import","i.future":"Future skipped","i.cats":"Categories",
    "i.rules":"Recurring rules","i.odd":"Needs a look","i.defCur":"Default currency",
    "i.oddHint":"Type and category disagree. Imported as-is by default.",
    "i.oddNote":"Marked income, category Salary","i.cancel":"Cancel","i.start":"Import",
    "x.title":"Exchange rates","x.sub":"Used for cross-currency totals","x.refresh":"Fetch latest rates",
    "x.current":"Rate in use","x.manual":"Manual","x.api":"Fetched","x.seed":"Initial",
    "x.updated":"updated","x.failed":"Couldn't fetch. Enter a rate manually","x.done":"Rates updated",
    "x.overwrite":"A rate you set manually was overwritten","x.undo":"Undo","x.edit":"Enter manually",
    "x.all":"All","x.approx":"approx.","x.mixed":"Mixed currencies, converted at the rates in use",
    "x.noRate":"No rate, left out","x.anchorHint":"Rates are against your main currency",
    "rp.title":"Reports","rp.month":"Monthly","rp.year":"Yearly","rp.byMonth":"Spending by month",
    "rp.total":"Total spent","rp.empty":"No spending in this period","rp.peak":"Peak",
    "x.byDay":"Converted at each entry's rate for that day","x.oneLine":"Converted at each day's rate","x.carried":"carried from the last trading day","x.history":"Rate history",
    "x.already":"That day's rate already exists, not overwritten","x.immutable":"Once a day's rate is written it never changes, so past totals stay put. Missing days carry forward from the last trading day.",
    "x.strip":"Rate for new entries","x.update":"Update","x.updating":"Fetching","x.pinNote":"Updating affects new entries only — what you already recorded stays put",
    "x.panel":"Exchange rates","x.amt":"Amount","x.favs":"Favourites","x.favsView":"Current favourites","x.editFavs":"Edit","x.confirmTitle":"Change favourites","x.confirmBody":"Favourites only change what appears in pickers. Your recorded entries and past totals stay exactly as they are.","x.confirmBodyNew":"One of these has no past rates, so it applies to new entries only.","x.confirm":"Change","x.backfill":"Filling in past rates","x.backfillOk":"Filled in {n} days of past rates","x.backfillFail":"Could not fill past rates — retry later from the rates screen","x.newCur":"New","x.willBackfill":"Added currencies get their past rates filled in, so older entries show at the rate that actually applied.","x.min1":"Keep at least one","x.mainLocked":"The main currency stays","x.cancel":"Cancel","x.min":"Pick at least two","x.favsHint":"Controls what shows in pickers — recorded data is untouched","x.pickMain":"Main currency","x.setupTitle":"Pick your currencies","x.setupSub":"You can change these later in Settings","x.start":"Get started","x.needMain":"The main currency must be one of your favourites","x.noHistory":"No past rates for this one — applies to new entries only","rp.byCur":"By currency","rp.all":"All","rp.allHint":"Each currency converted at its own day rate","x.addPair":"Add a rate","x.removePair":"Remove","x.search":"Search currencies","x.base":"Main currency","x.mainNow":"Main currency","x.tapUpdate":"Tap Update to fetch the latest","x.asOf":"as of",
    "e.title":"Edit entry","e.delete":"Delete this entry","e.confirm":"Delete this entry?","e.saved":"Saved","e.deleted":"Deleted","e.fromFixed":"Created by a recurring cost — editing changes only this entry",
    "g.save":"Save","g.back":"Back","g.close":"Close","g.new":"New","g.edit":"Edit",
    "w0":"Sun","w1":"Mon","w2":"Tue","w3":"Wed","w4":"Thu","w5":"Fri","w6":"Sat",
    "cat.food":"Food","cat.daily":"Household","cat.cloth":"Clothing","cat.beauty":"Beauty","cat.social":"Social",
    "cat.med":"Health","cat.edu":"Learning","cat.util":"Utilities","cat.trans":"Transit","cat.house":"Housing",
    "cat.phone":"Phone","cat.fun":"Fun","cat.sport":"Sport","cat.misc":"Other",
    "cat.salary":"Salary","cat.pocket":"Allowance","cat.bonus":"Bonus","cat.side":"Side work","cat.invest":"Investment","cat.etc":"Other",
    "cur.JPY":"Japanese yen","cur.CNY":"Chinese yuan","cur.USD":"US dollar","cur.EUR":"Euro","cur.KRW":"Korean won","cur.HKD":"Hong Kong dollar","cur.SGD":"Singapore dollar","cur.THB":"Thai baht","cur.PHP":"Philippine peso","cur.MYR":"Malaysian ringgit","cur.IDR":"Indonesian rupiah","cur.INR":"Indian rupee","cur.AUD":"Australian dollar","cur.CAD":"Canadian dollar","cur.CHF":"Swiss franc","cur.NZD":"New Zealand dollar","cur.MOP":"Macanese pataca","cur.TWD":"New Taiwan dollar","cur.GBP":"British pound",
    "n.conv":"Corner shop","n.market":"Groceries","n.drug":"Pharmacy","n.eatout":"Eating out","n.phone":"Phone bill",
    "n.wifi":"WiFi","n.ins":"Insurance","n.hair":"Haircut","n.party":"Dinner out","n.book":"Textbook",
    "n.lunch":"Lunch","n.water":"Water bill","n.elec":"Electricity","n.pass":"Transit pass","n.stock":"Big shop",
    "n.butcher":"Butcher","n.points":"Cashback","n.swim":"Swim","n.gym":"Gym",
  },
  ko: {
    "nav.record":"기록","nav.ledger":"장부","nav.stat":"분석","nav.set":"설정",
    "t.expense":"지출","t.income":"수입","t.balance":"잔액",
    "r.date":"날짜","r.note":"메모","r.category":"분류","r.notePh":"메모 추가",
    "r.rowExpense":"지출","r.rowIncome":"수입","r.rowCategory":"분류",
    "r.quick":"빠른 입력","r.editQuick":"빠른 입력 설정","r.save":"기록하기",
    "r.pickCat":"분류 선택","r.future":"미래","r.pickCur":"결제 통화","r.month":"월","r.editCat":"편집",
    "r.saved":"기록됨","r.needAmount":"금액을 입력하세요","r.needAmountFirst":"금액을 먼저 입력한 뒤 누르세요",
    "l.less":"적음","l.more":"많음","l.only":"보기","l.noDay":"이 날의 기록이 없습니다",
    "a.vs":"지난달 대비","a.nodata":"데이터 없음","a.budget":"예산","a.pace":"세로선＝이번 달 진행",
    "a.setBudget":"예산 설정","a.total":"총 예산","a.noMonth":"이번 달 기록이 없습니다",
    "a.budgetPrompt":"예산 설정 (비우면 해제)",
    "q.title":"빠른 입력","q.new":"빠른 버튼 만들기","q.edit":"빠른 버튼 편집",
    "q.name":"이름","q.namePh":"편의점 / 수영 / 정기권","q.type":"종류",
    "q.amount":"금액","q.varies":"매번 다름","q.variesD":"금액을 먼저 입력하고 누르세요 (예: 편의점)",
    "q.fixed":"고정 금액","q.fixedD":"누르면 바로 기록 (예: 수영)","q.empty":"빠른 버튼이 없습니다",
    "f.title":"고정 지출","f.new":"고정 지출 만들기","f.edit":"고정 지출 편집",
    "f.monthly":"월 합계","f.enabled":"개 사용 중","f.pending":"건 미기록","f.catchUp":"기록하기",
    "f.namePh":"월세 / WiFi / 보험","f.day":"매월 출금일",
    "f.dayHint":"그 달에 없는 날(2월 31일 등)은 말일로 처리합니다.",
    "f.start":"시작 월","f.startHint":"이 달부터 오늘까지 채웁니다. 미래 기록은 만들지 않습니다.",
    "f.foot":"고정 지출은 오늘까지만 기록합니다. 꺼도 이미 기록된 내역은 남습니다.",
    "f.empty":"고정 지출이 없습니다","f.every":"매월","f.day2":"일","f.badge":"대기",
    "c.title":"분류","c.new":"분류 만들기","c.namePh":"분류 이름","c.icon":"아이콘","g.food":"음식","g.shop":"쇼핑","g.home":"집","g.move":"이동","g.life":"생활","g.fun":"여가","g.work":"공부·일","g.money":"돈","g.other":"기타","c.color":"색상",
    "s.groupRecord":"기록","s.groupData":"데이터","s.groupGeneral":"일반",
    "s.quick":"자주 쓰는 지출을 한 번에","s.fixedSub":"개","s.cats":"추가·정렬·아이콘과 색상",
    "s.import":"기존 내역 가져오기","s.importSub":"다른 앱의 CSV에서","s.export":"CSV 내보내기",
    "s.currency":"주 통화","s.language":"언어",
    "i.title":"가져오기 미리보기","i.pick":"CSV 파일 선택","i.reading":"읽는 중","i.badFile":"읽을 수 없습니다. 이전 앱이 내보낸 CSV인지 확인하세요","i.dupFile":"이미 가져온 파일입니다","i.dupRows":"중복 건너뜀","i.errRows":"형식 오류","i.keepAll":"그대로","i.toExpense":"지출로 변경","i.skipOdd":"건너뛰기","i.done":"가져오기 완료","i.imported":"가져옴","i.newCats":"새 분류","i.oddAction":"이 항목들의 처리","i.preview":"처음 10건","i.rollback":"실패하여 아무것도 저장되지 않았습니다","i.again":"다시 선택","i.warn":"화면 뼈대입니다. 숫자는 예시이며 실제로는 CSV에서 계산합니다.",
    "i.total":"전체 건수","i.ready":"가져올 건수","i.future":"미래 제외","i.cats":"분류",
    "i.rules":"고정 지출 규칙","i.odd":"확인 필요","i.defCur":"기본 통화",
    "i.oddHint":"종류와 분류가 맞지 않습니다. 기본은 그대로 가져옵니다.",
    "i.oddNote":"원래 수입, 분류 「급여」","i.cancel":"취소","i.start":"가져오기",
    "x.title":"환율","x.sub":"통화가 섞인 합계의 참고값","x.refresh":"최신 환율 가져오기",
    "x.current":"현재 환율","x.manual":"수동","x.api":"자동","x.seed":"초기값",
    "x.updated":"갱신","x.failed":"가져오지 못했습니다. 환율을 직접 입력하세요","x.done":"환율을 갱신했습니다",
    "x.overwrite":"직접 설정한 환율이 덮어써졌습니다","x.undo":"실행 취소","x.edit":"직접 입력",
    "x.all":"전체","x.approx":"약","x.mixed":"여러 통화를 현재 환율로 환산",
    "x.noRate":"환율이 없어 제외","x.anchorHint":"주 통화 기준 환율입니다",
    "rp.title":"리포트","rp.month":"월간","rp.year":"연간","rp.byMonth":"월별 지출",
    "rp.total":"지출 합계","rp.empty":"이 기간의 지출이 없습니다","rp.peak":"최고",
    "x.byDay":"각 항목의 당일 환율로 환산","x.oneLine":"지출은 당일 환율로 환산","x.carried":"직전 영업일 적용","x.history":"환율 기록",
    "x.already":"그 날의 환율이 이미 있어 덮어쓰지 않았습니다","x.immutable":"하루치 환율은 한 번 기록되면 바뀌지 않아 과거 통계가 흔들리지 않습니다. 없는 날은 직전 영업일을 사용합니다.",
    "x.strip":"기록에 쓰는 환율","x.update":"갱신","x.updating":"가져오는 중","x.pinNote":"갱신은 이후 기록에만 적용되며 이미 기록된 내역은 변하지 않습니다",
    "x.panel":"환율","x.amt":"금액","x.favs":"자주 쓰는 통화","x.favsView":"현재 설정","x.editFavs":"변경","x.confirmTitle":"자주 쓰는 통화 변경","x.confirmBody":"선택 목록의 표시만 바뀝니다. 기록된 내역과 과거 통계는 그대로입니다.","x.confirmBodyNew":"과거 환율이 없는 통화가 포함되어 이후 기록에만 적용됩니다.","x.confirm":"변경","x.backfill":"과거 환율 보완 중","x.backfillOk":"{n}일치 과거 환율을 채웠습니다","x.backfillFail":"과거 환율 보완에 실패했습니다. 나중에 환율 화면에서 다시 시도하세요","x.newCur":"추가","x.willBackfill":"추가한 통화는 과거 환율을 자동으로 채워 당시 실제 환율로 표시합니다.","x.min1":"최소 한 개는 남겨야 합니다","x.mainLocked":"주 통화는 유지됩니다","x.cancel":"취소","x.min":"두 개 이상 선택하세요","x.favsHint":"선택 목록 표시만 정합니다. 기록된 데이터는 그대로입니다","x.pickMain":"주 통화","x.setupTitle":"통화를 먼저 고르세요","x.setupSub":"나중에 설정에서 바꿀 수 있습니다","x.start":"시작하기","x.needMain":"주 통화는 자주 쓰는 통화에 포함되어야 합니다","x.noHistory":"이 통화의 과거 환율이 없어 이후 기록에만 적용됩니다","rp.byCur":"통화별","rp.all":"전체","rp.allHint":"각 통화를 해당일 환율로 주 통화에 환산","x.addPair":"환율 추가","x.removePair":"삭제","x.search":"통화 검색","x.base":"주 통화","x.mainNow":"현재 주 통화","x.tapUpdate":"「갱신」으로 최신 환율 가져오기","x.asOf":"환율 날짜",
    "e.title":"기록 편집","e.delete":"이 기록 삭제","e.confirm":"이 기록을 삭제할까요?","e.saved":"수정했습니다","e.deleted":"삭제했습니다","e.fromFixed":"고정 지출로 생성됨 — 수정은 이 기록에만 반영됩니다",
    "g.save":"저장","g.back":"뒤로","g.close":"닫기","g.new":"새로","g.edit":"편집",
    "w0":"일","w1":"월","w2":"화","w3":"수","w4":"목","w5":"금","w6":"토",
    "cat.food":"식비","cat.daily":"생활용품","cat.cloth":"의류","cat.beauty":"미용","cat.social":"교제비",
    "cat.med":"의료","cat.edu":"교육","cat.util":"공과금","cat.trans":"교통","cat.house":"주거",
    "cat.phone":"통신","cat.fun":"여가","cat.sport":"운동","cat.misc":"기타",
    "cat.salary":"급여","cat.pocket":"용돈","cat.bonus":"상여","cat.side":"부업","cat.invest":"투자","cat.etc":"기타",
    "cur.JPY":"엔","cur.CNY":"위안","cur.USD":"달러","cur.EUR":"유로","cur.KRW":"원","cur.HKD":"홍콩 달러","cur.SGD":"싱가포르 달러","cur.THB":"바트","cur.PHP":"필리핀 페소","cur.MYR":"링깃","cur.IDR":"루피아","cur.INR":"루피","cur.AUD":"호주 달러","cur.CAD":"캐나다 달러","cur.CHF":"스위스 프랑","cur.NZD":"뉴질랜드 달러","cur.MOP":"파타카","cur.TWD":"대만 달러","cur.GBP":"파운드",
    "n.conv":"편의점","n.market":"마트","n.drug":"드럭스토어","n.eatout":"외식","n.phone":"휴대폰 요금",
    "n.wifi":"WiFi","n.ins":"보험","n.hair":"미용실","n.party":"회식","n.book":"참고서",
    "n.lunch":"점심","n.water":"수도요금","n.elec":"전기요금","n.pass":"정기권","n.stock":"장보기",
    "n.butcher":"정육점","n.points":"포인트 적립","n.swim":"수영","n.gym":"헬스장",
  },
};

const LangCtx = createContext({ lang: "zh", t: (k) => k });
const useT = () => useContext(LangCtx);
/* 用户自己输入的名字保持原样，只有种子数据带 i18n key 才翻译 */
const useLabel = () => {
  const { t } = useT();
  return (o) => (o?.i18n ? t(o.i18n) : o?.name || "");
};

/* ═════════════════════════════════════════════════════════
   币种 —— 金额一律以最小货币单位的整数存储
   ═════════════════════════════════════════════════════════ */
/* src: api = 欧洲央行覆盖 / peg = 由挂钩币种推算 / manual = 只能手动填
   pegTo/pegRate: 1 本币 = pegRate 个 pegTo */
const CUR = {
  JPY: { dec: 0, sign: "¥",  cc: "JP", src: "api" },
  CNY: { dec: 2, sign: "¥",  cc: "CN", src: "api" },
  USD: { dec: 2, sign: "$",  cc: "US", src: "api" },
  EUR: { dec: 2, sign: "€",  cc: "EU", src: "api" },
  KRW: { dec: 0, sign: "₩",  cc: "KR", src: "api" },
  GBP: { dec: 2, sign: "£",  cc: "GB", src: "api" },
  HKD: { dec: 2, sign: "HK$", cc: "HK", src: "api" },
  SGD: { dec: 2, sign: "S$", cc: "SG", src: "api" },
  THB: { dec: 2, sign: "฿",  cc: "TH", src: "api" },
  PHP: { dec: 2, sign: "₱",  cc: "PH", src: "api" },
  MYR: { dec: 2, sign: "RM", cc: "MY", src: "api" },
  IDR: { dec: 0, sign: "Rp", cc: "ID", src: "api" },
  INR: { dec: 2, sign: "₹",  cc: "IN", src: "api" },
  AUD: { dec: 2, sign: "A$", cc: "AU", src: "api" },
  CAD: { dec: 2, sign: "C$", cc: "CA", src: "api" },
  CHF: { dec: 2, sign: "Fr", cc: "CH", src: "api" },
  NZD: { dec: 2, sign: "NZ$", cc: "NZ", src: "api" },
  /* 澳门币钉住港币,由 HKD 推算 */
  MOP: { dec: 2, sign: "MOP$", cc: "MO", src: "peg", pegTo: "HKD", pegRate: 1 / 1.03 },
  TWD: { dec: 2, sign: "NT$", cc: null, src: "api" },
};

/* 币种 → 国旗 emoji。EUR 用欧盟旗 */
const flag = (code) => {
  const cc = CUR[code]?.cc;
  if (!cc) return "";
  return String.fromCodePoint(...[...cc].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));
};

/* 系统语言 → 默认币种 */
const LANG_CUR = { zh: "CNY", ja: "JPY", en: "USD", ko: "KRW" };
const DEFAULT_FAVS = ["CNY", "JPY", "USD", "EUR", "KRW", "AUD"];
const money = (m, c = "JPY", sign = true) => {
  const k = CUR[c] || CUR.JPY, neg = m < 0, a = Math.abs(m);
  let s;
  if (k.dec === 0) s = a.toLocaleString("en-US");
  else { const p = 10 ** k.dec; s = `${Math.floor(a / p).toLocaleString("en-US")}.${String(a % p).padStart(k.dec, "0")}`; }
  return `${neg ? "−" : ""}${sign ? k.sign : ""}${s}`;
};
const toMinor = (v, c) => Math.round(v * 10 ** (CUR[c]?.dec ?? 0));
/* 热力格背景是 rgba(20,22,26,a) 叠白底,按真实亮度决定黑字还是白字。
   翻转点实测 a≈0.58;临近该点两者对比都偏弱,加一点描边补足。 */
const HEAT_FLIP = 0.58;
const heatInk = (a) => (a >= HEAT_FLIP ? "#FFFFFF" : "#2B3138");
const heatEdge = (a) =>
  Math.abs(a - HEAT_FLIP) < 0.12
    ? (a >= HEAT_FLIP ? "0 0 2px rgba(0,0,0,.55)" : "0 0 2px rgba(255,255,255,.75)")
    : "none";

/* 日历格里位置窄,大数缩写成 k */
const compact = (minor, code) => {
  const v = minor / 10 ** (CUR[code]?.dec ?? 0);
  if (v >= 10000) return Math.round(v / 1000) + "k";
  if (v >= 1000) return (v / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(Math.round(v));
};
const fromMinor = (m, c) => m / 10 ** (CUR[c]?.dec ?? 0);
const cleanDecimal = (v) => String(v || "").replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
const fxNum = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};
const fxFmt = (v) => {
  if (!Number.isFinite(v)) return "";
  if (v === 0) return "0";
  const s = v < 1 ? v.toFixed(4) : v.toFixed(2);
  return s.replace(/\.?0+$/, "");
};
const csvCell = (v) => {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csvLine = (cells) => cells.map(csvCell).join(",");
const downloadText = (name, text) => {
  const blob = new Blob([`\uFEFF${text}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

/* ═════════════════════════════════════════════════════════
   汇率
   内部一律以 JPY 为锚:rate[X] = 1 单位 X 值多少 JPY,定点整数 ×10^8。
   任意两币种的换算走交叉汇率,所以切换主币种不用重算。
   汇率只影响「参考性」的合计(热力图、全部视图),不进交易表。
   ═════════════════════════════════════════════════════════ */
const FX_SCALE = 1e8;
const ANCHOR = "JPY";

/* 按天存一组汇率,写入后永不修改——历史统计才不会漂。
   rate[X] = 1 单位 X 值多少 ANCHOR,定点整数 ×10^8。 */
const SEED_FX_DAILY = {
  [TODAY]: {
    JPY: Math.round(1 * FX_SCALE),
    CNY: Math.round(23.60 * FX_SCALE),
    USD: Math.round(160.00 * FX_SCALE),
    EUR: Math.round(183.80 * FX_SCALE),
    KRW: Math.round(0.1127 * FX_SCALE),
    GBP: Math.round(214.20 * FX_SCALE),
    HKD: Math.round(20.30 * FX_SCALE),
    SGD: Math.round(124.00 * FX_SCALE),
    THB: Math.round(4.87 * FX_SCALE),
    PHP: Math.round(2.75 * FX_SCALE),
    MYR: Math.round(37.50 * FX_SCALE),
    IDR: Math.round(0.0098 * FX_SCALE),
    INR: Math.round(1.85 * FX_SCALE),
    AUD: Math.round(105.00 * FX_SCALE),
    CAD: Math.round(116.00 * FX_SCALE),
    CHF: Math.round(198.00 * FX_SCALE),
    NZD: Math.round(96.00 * FX_SCALE),
    TWD: Math.round(5.20 * FX_SCALE),
    __src: "seed",
  },
};

/* 从一组汇率里取某币种对锚定币的值;挂钩币种由挂钩对象推算 */
const rateOf = (rates, code) => {
  if (!rates) return null;
  if (rates[code]) return rates[code];
  const def = CUR[code];
  if (def?.src === "peg" && rates[def.pegTo]) return rates[def.pegTo] * def.pegRate;
  return null;
};

/* 取某天的汇率。当天没有(周末、节假日、离线)就沿用最近一个有值的日子 */
const ratesOn = (daily, date) => {
  if (daily[date]) return { rates: daily[date], at: date, carried: false };
  let best = null;
  for (const k of Object.keys(daily)) if (k <= date && (best === null || k > best)) best = k;
  return best ? { rates: daily[best], at: best, carried: true } : null;
};

/* 换算。date 应传账目钉住的汇率日(x.fxd),没有才退回账目日期 */
const convertOn = (minor, from, to, date, daily) => {
  if (from === to) return minor;
  const r = ratesOn(daily, date);
  if (!r) return null;
  const a = rateOf(r.rates, from), b = rateOf(r.rates, to);
  if (!a || !b) return null;
  const dF = CUR[from]?.dec ?? 0, dT = CUR[to]?.dec ?? 0;
  return Math.round((minor * a * 10 ** dT) / (b * 10 ** dF));
};

/* 合计;换不出来的单独返回,绝不静默丢弃 */
const sumOn = (rows, to, daily) => {
  let total = 0; const missing = [];
  rows.forEach((x) => {
    const v = convertOn(x.amount, x.cur, to, x.fxd || x.date, daily);
    if (v == null) missing.push(x); else total += v;
  });
  return { total, missing };
};

/* 一段时间内某币种对目标币种的汇率区间,用来在统计里注明 */
const rateSpan = (daily, from, to, dates) => {
  const vals = [];
  dates.forEach((d) => {
    const r = ratesOn(daily, d);
    const a = rateOf(r?.rates, from), b = rateOf(r?.rates, to);
    if (a && b) vals.push(a / b);
  });
  if (!vals.length) return null;
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const f = (v) => (v < 1 ? v.toFixed(4) : v.toFixed(2));
  return lo === hi ? `1 ${from} = ${f(lo)} ${to}` : `1 ${from} = ${f(lo)}–${f(hi)} ${to}`;
};

const latestDate = (daily) => Object.keys(daily).sort().pop() || null;
const earliestDate = (rows) => rows.map((r) => r.date).filter(Boolean).sort()[0] || null;
const mergeDay = (daily, date, rates, src = "api") => ({
  ...daily,
  [date]: { ...(daily[date] || {}), ...rates, __src: src },
});
const mergeSeries = (daily, byDay, src = "api") =>
  Object.entries(byDay || {}).reduce((acc, [date, rates]) => mergeDay(acc, date, rates, src), daily);

async function fetchRates(codes) {
  const wanted = [...new Set(["JPY", ...codes])].filter((c) => CUR[c]?.src !== "manual");
  const to = wanted.filter((c) => c !== "JPY").join(",");
  const fromOpenApi = async () => {
    const res = await fetch("https://open.er-api.com/v6/latest/JPY", { cache: "no-store" });
    if (!res.ok) throw new Error("rate api failed");
    const data = await res.json();
    if (data.result && data.result !== "success") throw new Error("rate api returned failure");
    return { date: data.time_last_update_utc ? ymd(new Date(data.time_last_update_utc)) : TODAY, rates: data.rates || {} };
  };
  const fromFrankfurter = async () => {
    const res = await fetch(`https://api.frankfurter.app/latest?from=JPY${to ? `&to=${encodeURIComponent(to)}` : ""}`, { cache: "no-store" });
    if (!res.ok) throw new Error("fallback rate api failed");
    const data = await res.json();
    return { date: data.date || TODAY, rates: data.rates || {} };
  };

  const got = await fromOpenApi().catch(fromFrankfurter);
  const rates = { JPY: Math.round(FX_SCALE) };
  wanted.forEach((code) => {
    if (code === "JPY") return;
    const perJpy = got.rates[code];
    if (perJpy) rates[code] = Math.round((1 / perJpy) * FX_SCALE);
  });
  if (Object.keys(rates).length <= 1 && wanted.length > 1) throw new Error("no usable rates");
  return { date: got.date, rates };
}

async function fetchSeries(codes) {
  const got = await fetchRates(codes);
  return { [got.date]: got.rates };
}

/* ═════════════════════════════════════════════════════════
   种子数据
   ═════════════════════════════════════════════════════════ */
const ICONS = {
  Utensils, Coffee, Pizza, IceCream, Beef, Fish, Salad, Soup,
  Sandwich, Croissant, Egg, Cake, Cookie, Candy, Popcorn, Apple,
  Carrot, Cherry, Grape, Banana, Milk, CupSoda, Wine, Beer,
  Martini, ShoppingBasket, ShoppingCart, ShoppingBag, Store, Package, Tag, Receipt,
  Gift, Shirt, Footprints, Watch, Glasses, Crown, Backpack, Luggage,
  Scissors, Home, Bed, Sofa, Armchair, Lamp, Bath, ShowerHead,
  Refrigerator, WashingMachine, Plug, Lightbulb, Key, Wrench, Hammer, Fence,
  Warehouse, Hotel, TrainFront, TramFront, Car, CarTaxiFront, Bus, Bike,
  Plane, Ship, Truck, Fuel, Rocket, Anchor, Tent, Mountain,
  MapPin, Globe, Pill, HeartPulse, Stethoscope, Syringe, Cross, Dumbbell,
  Activity, Waves, Baby, PawPrint, Dog, Cat, Bird, Flower,
  Leaf, TreePine, Sprout, Recycle, Gamepad2, Music, Headphones, Guitar,
  Piano, Film, Tv, Camera, Ticket, PartyPopper, Palette, Drama,
  Dices, Trophy, Medal, Puzzle, Podcast, Newspaper, BookOpen, GraduationCap,
  Pencil, Calculator, Microscope, Languages, Briefcase, Building2, Laptop, Printer,
  Mail, Users, Factory, Landmark, Wallet, Banknote, Coins, PiggyBank,
  CreditCard, TrendingUp, Droplet, Zap, Flame, Wifi, Smartphone, Phone,
  Heart, Star, Sparkles, Smile, Sun, Moon, Snowflake, Umbrella,
  Shield, Cigarette, Bone, Church, Hourglass, Bell, Calendar, Clock,
  MoreHorizontal,
};

/* 图标按主题分组,选择器分段展示 */
const ICON_GROUPS = [
  { key: "g.food", icons: ["Utensils", "Coffee", "Pizza", "IceCream", "Beef", "Fish", "Salad", "Soup", "Sandwich", "Croissant", "Egg", "Cake", "Cookie", "Candy", "Popcorn", "Apple", "Carrot", "Cherry", "Grape", "Banana", "Milk", "CupSoda", "Wine", "Beer", "Martini"] },
  { key: "g.shop", icons: ["ShoppingBasket", "ShoppingCart", "ShoppingBag", "Store", "Package", "Tag", "Receipt", "Gift", "Shirt", "Footprints", "Watch", "Glasses", "Crown", "Backpack", "Luggage", "Scissors"] },
  { key: "g.home", icons: ["Home", "Bed", "Sofa", "Armchair", "Lamp", "Bath", "ShowerHead", "Refrigerator", "WashingMachine", "Plug", "Lightbulb", "Key", "Wrench", "Hammer", "Fence", "Warehouse", "Hotel"] },
  { key: "g.move", icons: ["TrainFront", "TramFront", "Car", "CarTaxiFront", "Bus", "Bike", "Plane", "Ship", "Truck", "Fuel", "Rocket", "Anchor", "Tent", "Mountain", "MapPin", "Globe"] },
  { key: "g.life", icons: ["Pill", "HeartPulse", "Stethoscope", "Syringe", "Cross", "Dumbbell", "Activity", "Waves", "Baby", "PawPrint", "Dog", "Cat", "Bird", "Flower", "Leaf", "TreePine", "Sprout", "Recycle"] },
  { key: "g.fun", icons: ["Gamepad2", "Music", "Headphones", "Guitar", "Piano", "Film", "Tv", "Camera", "Ticket", "PartyPopper", "Palette", "Drama", "Dices", "Trophy", "Medal", "Puzzle", "Podcast", "Newspaper"] },
  { key: "g.work", icons: ["BookOpen", "GraduationCap", "Pencil", "Calculator", "Microscope", "Languages", "Briefcase", "Building2", "Laptop", "Printer", "Mail", "Users", "Factory", "Landmark"] },
  { key: "g.money", icons: ["Wallet", "Banknote", "Coins", "PiggyBank", "CreditCard", "TrendingUp", "Receipt"] },
  { key: "g.other", icons: ["Droplet", "Zap", "Flame", "Wifi", "Smartphone", "Phone", "Heart", "Star", "Sparkles", "Smile", "Sun", "Moon", "Snowflake", "Umbrella", "Shield", "Cigarette", "Bone", "Church", "Hourglass", "Bell", "Calendar", "Clock", "MoreHorizontal"] },
];
const SEED_CATS = [
  { id: 1,  k: "food",   i18n: "cat.food",   icon: "Utensils",       color: "#D4644A", type: "expense", order: 1 },
  { id: 2,  k: "daily",  i18n: "cat.daily",  icon: "ShoppingBasket", color: "#5B9E6F", type: "expense", order: 2 },
  { id: 3,  k: "cloth",  i18n: "cat.cloth",  icon: "Shirt",          color: "#4A6FA5", type: "expense", order: 3 },
  { id: 4,  k: "beauty", i18n: "cat.beauty", icon: "Sparkles",       color: "#C2668E", type: "expense", order: 4 },
  { id: 5,  k: "social", i18n: "cat.social", icon: "Martini",        color: "#C99A2E", type: "expense", order: 5 },
  { id: 6,  k: "med",    i18n: "cat.med",    icon: "Pill",           color: "#4FA3A3", type: "expense", order: 6 },
  { id: 7,  k: "edu",    i18n: "cat.edu",    icon: "BookOpen",       color: "#A05C9E", type: "expense", order: 7 },
  { id: 8,  k: "util",   i18n: "cat.util",   icon: "Droplet",        color: "#5B8FC7", type: "expense", order: 8 },
  { id: 9,  k: "trans",  i18n: "cat.trans",  icon: "TrainFront",     color: "#8C6E52", type: "expense", order: 9 },
  { id: 10, k: "house",  i18n: "cat.house",  icon: "Home",           color: "#B5716B", type: "expense", order: 10 },
  { id: 11, k: "phone",  i18n: "cat.phone",  icon: "Smartphone",     color: "#6E7A8A", type: "expense", order: 11 },
  { id: 12, k: "fun",    i18n: "cat.fun",    icon: "Gamepad2",       color: "#7B6BB5", type: "expense", order: 12 },
  { id: 13, k: "sport",  i18n: "cat.sport",  icon: "Waves",          color: "#3F8FA8", type: "expense", order: 13 },
  { id: 14, k: "misc",   i18n: "cat.misc",   icon: "MoreHorizontal", color: "#9AA0A8", type: "expense", order: 14 },
  { id: 21, k: "salary", i18n: "cat.salary", icon: "Wallet",     color: "#3E8E5A", type: "income", order: 1 },
  { id: 22, k: "pocket", i18n: "cat.pocket", icon: "PiggyBank",  color: "#C9772E", type: "income", order: 2 },
  { id: 23, k: "bonus",  i18n: "cat.bonus",  icon: "Gift",       color: "#B5648E", type: "income", order: 3 },
  { id: 24, k: "side",   i18n: "cat.side",   icon: "Banknote",   color: "#4A7FB5", type: "income", order: 4 },
  { id: 25, k: "invest", i18n: "cat.invest", icon: "Coins",      color: "#4F9E9E", type: "income", order: 5 },
  { id: 26, k: "etc",    i18n: "cat.etc",    icon: "TrendingUp", color: "#8A8F98", type: "income", order: 6 },
];
const byK = (k) => SEED_CATS.find((c) => c.k === k);

const SEED_QUICK = [];

const SEED_FIXED = [];

const monthsBetween = (start, end) => {
  const out = []; let [y, m] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  while (y < ey || (y === ey && m <= em)) { out.push(`${y}-${String(m).padStart(2, "0")}`); m === 12 ? ((y += 1), (m = 1)) : (m += 1); }
  return out;
};
const occurrenceDate = (ym, day) => {
  const [y, m] = ym.split("-").map(Number);
  return `${ym}-${String(Math.min(day, new Date(y, m, 0).getDate())).padStart(2, "0")}`;
};
/* 只返回「日期 <= 今天」且尚未落账的固定支出 */
const pendingFixed = (fixed, txns, today = TODAY) => {
  const have = new Set(txns.filter((t) => t.fx).map((t) => t.fx));
  const out = [];
  fixed.filter((f) => f.on).forEach((f) => {
    monthsBetween(f.start, today.slice(0, 7)).forEach((ym) => {
      const d = occurrenceDate(ym, f.day);
      if (d > today) return;
      const key = `${f.id}:${ym}`;
      if (have.has(key)) return;
      out.push({ fx: key, type: "expense", amount: f.amount, cur: f.cur || "JPY", cat: f.cat, date: d, name: f.name, i18n: f.i18n || null });
    });
  });
  return out;
};

const seedTxns = () => [];




/* ═════════════════════════════════════════════════════════
   旧账本 CSV 解析
   文件里有多个 #SECTION 区块,不能整份 CSV.parse。
   流程:按行切区块 → 每块单独解析 → 校验 → 分类映射 → 生成导入计划。
   ═════════════════════════════════════════════════════════ */

/* 一行 CSV → 字段数组。处理引号包裹、字段内逗号、双写转义引号 */
function parseCsvLine(line) {
  const out = [];
  let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else q = false;
      } else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

/* 整份文件 → { 区块名: [{列:值}] } + 未知区块警告 */
function parseSections(text) {
  const clean = text.replace(/^\uFEFF/, "");            // 去 BOM
  const lines = clean.split(/\r\n|\r|\n/);
  const known = new Set(["DAILY_DATAS", "CATEGORIES", "FIXED_COST_SETTINGS", "ACCOUNT_BOOKINGS", "BUDGET_SETTINGS"]);
  const sections = {}, warnings = [];
  let name = null, header = null;

  for (const raw of lines) {
    if (raw.trim() === "") continue;
    if (raw.startsWith("#")) {
      name = raw.slice(1).trim();
      header = null;
      if (!known.has(name)) warnings.push(`未知区块 ${name},已跳过`);
      sections[name] = sections[name] || [];
      continue;
    }
    if (!name) continue;                                 // 区块头之前的内容忽略
    const cells = parseCsvLine(raw);
    if (!header) { header = cells.map((h) => h.trim()); continue; }
    const row = {};
    header.forEach((h, i) => { row[h] = cells[i] ?? ""; });
    sections[name].push(row);
  }
  return { sections, warnings };
}

/* 旧软件的日期是 2026/3/15 这种,补零成 ISO;非法返回 null */
function normalizeDate(str) {
  const m = String(str || "").trim().match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (!m) return null;
  const [, y, mo, d] = m.map(Number);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  if (d > new Date(y, mo, 0).getDate()) return null;     // 2月30日之类
  return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/* 旧图标编号 → 本应用图标;认不出就给默认值,绝不因此让导入失败 */
const OLD_ICON_MAP = {
  categoryDefault0: "Utensils", categoryDefault1: "ShoppingBasket", categoryDefault2: "Shirt",
  categoryDefault3: "Sparkles", categoryDefault4: "TrainFront", categoryDefault5: "BookOpen",
  categoryDefault6: "Pill", categoryDefault7: "Martini", categoryDefault8: "Droplet",
  categoryDefault9: "Smartphone", categoryDefault10: "Home", categoryDefault11: "Wallet",
  categoryDefault12: "PiggyBank", categoryDefault13: "Gift", categoryDefault14: "Banknote",
  categoryDefault15: "Coins", categoryDefault16: "TrendingUp", category32: "PawPrint",
  category35: "Gamepad2", category75: "Pencil", category139: "Plane",
  category42: "Shield", category88: "Smartphone", category101: "Gamepad2",
};
const mapIcon = (old) => OLD_ICON_MAP[old] || "MoreHorizontal";

const IMPORT_CAT_ALIASES = {
  expense: {
    "餐饮": "food", "餐饮费": "food", "饮食": "food", "饮食费": "food", "食費": "food", "food": "food",
    "日用": "daily", "日用品": "daily", "生活用品": "daily", "household": "daily",
    "服饰": "cloth", "衣服": "cloth", "衣物": "cloth", "clothing": "cloth",
    "美容": "beauty", "beauty": "beauty",
    "社交": "social", "交际费": "social", "交際費": "social", "social": "social",
    "医疗": "med", "医疗费": "med", "医療費": "med", "health": "med",
    "学习": "edu", "教育费": "edu", "教育費": "edu", "learning": "edu",
    "水电": "util", "水电费": "util", "水道光熱": "util", "utilities": "util",
    "交通": "trans", "交通费": "trans", "交通費": "trans", "transit": "trans",
    "居住": "house", "房费": "house", "住居": "house", "housing": "house",
    "通信": "phone", "电话费": "phone", "通信費": "phone", "phone": "phone",
    "娱乐": "fun", "娯楽": "fun", "fun": "fun",
    "运动": "sport", "運動": "sport", "sport": "sport",
    "其他": "misc", "その他": "misc", "other": "misc",
  },
  income: {
    "工资": "salary", "給与": "salary", "salary": "salary",
    "零花": "pocket", "零花钱": "pocket", "小遣い": "pocket", "allowance": "pocket",
    "奖金": "bonus", "賞与": "bonus", "bonus": "bonus",
    "副业": "side", "副業": "side", "side work": "side",
    "投资": "invest", "投資": "invest", "investment": "invest",
    "临时收入": "etc", "その他": "etc", "other": "etc",
  },
};
const normalizeImportColor = (color) => {
  const raw = String(color || "").trim();
  if (/^#[0-9a-f]{6}$/i.test(raw)) return raw;
  if (/^[0-9a-f]{6}$/i.test(raw)) return `#${raw}`;
  return "#9AA0A8";
};
const findImportCategory = (existingCats, type, name) => {
  const trimmed = String(name || "").trim();
  const exact = existingCats.find((c) => c.type === type && !c.i18n && c.name === trimmed);
  if (exact) return exact;
  const key = IMPORT_CAT_ALIASES[type]?.[trimmed] || IMPORT_CAT_ALIASES[type]?.[trimmed.toLowerCase()];
  if (!key) return null;
  return existingCats.find((c) => c.type === type && c.k === key) || null;
};

/* 内容哈希:文件名变了但内容相同也要认得出是同一份 */
function hashText(text) {
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = Math.imul(h2 + c, 2246822519) >>> 0;
  }
  return (h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0"));
}

/* 每条记录的稳定标识,用于防重复 */
const recordKey = (r) =>
  [r.inputDateString, r.amount, r.memo, r.categoryId, r.type, r.createdAt, r.accountingId].join("|");

/* 把解析结果变成一份导入计划。cutoff 之后的记录一律排除 */
function buildImportPlan(text, { cutoff = TODAY, existingCats = [], existingKeys = new Set() } = {}) {
  const { sections, warnings } = parseSections(text);
  const daily = sections.DAILY_DATAS || [];
  const rawCats = sections.CATEGORIES || [];
  const fixedRules = sections.FIXED_COST_SETTINGS || [];

  /* 分类:名称 + 收支类型 作为匹配键,已有的复用 */
  const catByOldId = {};
  const newCats = [];
  let nextId = Math.max(0, ...existingCats.map((c) => c.id)) + 1;
  rawCats.forEach((r) => {
    const type = String(r.type) === "1" ? "income" : "expense";
    const name = (r.name || "").trim();
    if (!name) return;
    const hit = findImportCategory(existingCats, type, name);
    if (hit) { catByOldId[r.id] = hit.id; return; }
    const made = {
      id: nextId++, k: `imp${r.id}`, i18n: null, name, type,
      icon: mapIcon(r.icon), color: normalizeImportColor(r.color),
      order: Number(r.index) || newCats.length + 1,
    };
    newCats.push(made);
    catByOldId[r.id] = made.id;
  });

  /* 「未分类」兜底,只在真的用到时才创建 */
  let fallbackId = null;
  const ensureFallback = () => {
    if (fallbackId) return fallbackId;
    const hit = existingCats.find((c) => c.type === "expense" && c.k === "misc");
    if (hit) { fallbackId = hit.id; return fallbackId; }
    const made = { id: nextId++, k: "imported_misc", i18n: "cat.misc", name: "", type: "expense",
      icon: "MoreHorizontal", color: "#9AA0A8", order: 999 };
    newCats.push(made);
    fallbackId = made.id;
    return fallbackId;
  };

  /* 备注用法统计:同一个备注在支出里出现多少次、在收入里出现多少次。
     用来发现「备注像支出、却记成了收入」这类矛盾,而不是写死关键词。 */
  const memoUse = {};
  daily.forEach((r) => {
    const memo = (r.memo || "").trim();
    if (!memo) return;
    const t = String(r.type) === "1" ? "inc" : "exp";
    memoUse[memo] = memoUse[memo] || { exp: 0, inc: 0 };
    memoUse[memo][t]++;
  });

  const rows = [], future = [], errors = [], suspicious = [];
  let duplicate = 0;

  daily.forEach((r, i) => {
    const line = i + 1;
    const date = normalizeDate(r.inputDateString);
    if (!date) { errors.push({ line, why: "date", raw: r.inputDateString }); return; }

    const amt = Number(String(r.amount).trim());
    if (!Number.isFinite(amt) || amt <= 0) { errors.push({ line, why: "amount", raw: r.amount }); return; }

    if (date > cutoff) { future.push({ date, amount: amt }); return; }

    const key = recordKey(r);
    if (existingKeys.has(key)) { duplicate++; return; }

    let catId = catByOldId[r.categoryId];
    let warnedCat = false;
    if (!catId) { catId = ensureFallback(); warnedCat = true; }

    const type = String(r.type) === "1" ? "income" : "expense";
    const srcCat = rawCats.find((c) => String(c.id) === String(r.categoryId));
    const catType = srcCat ? (String(srcCat.type) === "1" ? "income" : "expense") : type;

    /* 规则一:账目类型与所属分类的类型不一致 */
    const typeClash = srcCat && catType !== type;
    /* 规则二:这条是收入,但同样的备注在文件里绝大多数是支出 */
    const memo = (r.memo || "").trim();
    const use = memoUse[memo];
    const memoClash = type === "income" && use && use.exp >= 3 && use.exp > use.inc;
    const odd = typeClash || memoClash;

    const item = {
      key, line, type, amount: Math.round(amt), cur: null,   // 币种由导入页选定
      cat: catId, date, name: r.memo || "", i18n: null,
      createdAt: r.createdAt || null, updatedAt: r.updatedAt || null,
      fromFixed: String(r.fixedCostSettingId || "0") !== "0",
      catFallback: warnedCat,
    };
    rows.push(item);
    if (odd) suspicious.push({
      ...item, catName: srcCat?.name || "",
      why: typeClash ? "typeClash" : "memoClash",
      memoExp: use?.exp || 0,
    });
  });

  return {
    hash: hashText(text),
    warnings,
    catsToCreate: newCats,
    catMap: catByOldId,
    rows, future, errors, suspicious, duplicate,
    stats: {
      total: daily.length,
      ready: rows.length,
      future: future.length,
      cats: rawCats.length,
      rules: fixedRules.length,
      suspicious: suspicious.length,
      errors: errors.length,
      duplicate,
    },
  };
}

/* ═════════════════════════════════════════════════════════
   拖拽排序
   用 Pointer Events,手机和桌面同一套。按住手柄才拖,
   避免和列表本身的点击、页面滚动打架。
   ═════════════════════════════════════════════════════════ */
function useDragSort(ids, onReorder) {
  const [drag, setDrag] = useState(null);   // { id, y, overIdx }
  const rowsRef = useRef({});

  const start = (id, e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ id, y: e.clientY, overIdx: ids.indexOf(id) });
  };
  const move = (e) => {
    if (!drag) return;
    let idx = ids.indexOf(drag.id);
    Object.entries(rowsRef.current).forEach(([id, el]) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (e.clientY > r.top && e.clientY < r.bottom) idx = ids.indexOf(id);
    });
    if (idx !== drag.overIdx) setDrag({ ...drag, y: e.clientY, overIdx: idx });
    else setDrag({ ...drag, y: e.clientY });
  };
  const end = () => {
    if (drag) {
      const from = ids.indexOf(drag.id);
      if (from !== drag.overIdx && drag.overIdx >= 0) {
        const next = [...ids];
        next.splice(drag.overIdx, 0, next.splice(from, 1)[0]);
        onReorder(next);
      }
    }
    setDrag(null);
  };

  return {
    drag,
    bindRow: (id) => ({
      ref: (el) => { rowsRef.current[id] = el; },
      style: {
        opacity: drag?.id === id ? 0.4 : 1,
        background: drag && ids[drag.overIdx] === id && drag.id !== id ? C.innSoft : undefined,
      },
    }),
    bindHandle: (id) => ({
      onPointerDown: (e) => start(id, e),
      onPointerMove: move,
      onPointerUp: end,
      onPointerCancel: end,
      style: { touchAction: "none", cursor: "grab" },
    }),
  };
}

/* ═════════════════════════════════════════════════════════
   持久化
   这里用 artifact 的 window.storage(异步 KV)。
   换到 React Native 时把 load/save 换成 AsyncStorage 或 SQLite 即可,
   其余代码不用动——所有状态都从 usePersisted 出去。
   ═════════════════════════════════════════════════════════ */
const STORE_KEY = "kakeibo:v3";

async function loadAll() {
  try {
    const r = await window.storage.get(STORE_KEY);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }        // 键不存在时会抛,视作首次启动
}

let saveTimer = null;
function saveAll(data) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try { await window.storage.set(STORE_KEY, JSON.stringify(data)); }
    catch (e) { console.error("保存失败", e); }
  }, 400);                        // 合并连续写入,避免每次改动都打一次存储
}

/* ═════════════════════════════════════════════════════════
   基础件
   ═════════════════════════════════════════════════════════ */
const Ico = ({ n, c, s = 18, w = 2 }) => {
  const K = ICONS[n] || MoreHorizontal;
  return <K size={s} color={c} strokeWidth={w} />;
};

/* 彩色实心图标块 —— 卡通风的主要载体 */
const Tile = ({ icon, color, size = 32, ico = 17 }) => (
  <span className="tile" style={{ width: size, height: size, background: color }}>
    <Ico n={icon} c="#fff" s={ico} w={2.1} />
  </span>
);

/* 彩色分类标签 */
const CatTag = ({ color, children }) => (
  <span className="shrink-0 rounded-full px-2 py-0.5"
    style={{ background: `${color}1F`, color, fontSize: 10.5, fontWeight: 600 }}>{children}</span>
);
const Bar = ({ title, left, right }) => (
  <div className="flex items-center gap-2 px-4 shrink-0" style={{ height: 50, borderBottom: `1px solid ${C.hair}`, background: C.surface }}>
    {left}<span style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{title}</span>
    <div className="ml-auto flex items-center gap-1">{right}</div>
  </div>
);
const Back = ({ on }) => { const { t } = useT(); return (
  <button onClick={on} className="-ml-1 p-1" aria-label={t("g.back")}><ArrowLeft size={19} color={C.ink} strokeWidth={2} /></button>
); };
const Seg = ({ value, onChange, items, sm }) => (
  <div className="flex rounded-full" style={{ background: C.soft, padding: 3 }}>
    {items.map((it) => (
      <button key={it.v} onClick={() => onChange(it.v)} className="rounded-full whitespace-nowrap"
        style={{ padding: sm ? "3px 11px" : "5px 16px", fontSize: sm ? 11 : 12.5, fontWeight: 600,
          background: value === it.v ? C.surface : "transparent", color: value === it.v ? C.ink : C.ink3,
          boxShadow: value === it.v ? "0 1px 3px rgba(31,41,51,.12)" : "none" }}>{it.t}</button>
    ))}
  </div>
);
/* 标签宽度按语言自适应:中日韩两三个字,英文单词更长 */
/* 各统计页顶部的「当前主货币」提示 */
const MainHint = ({ code, cls = "" }) => {
  const { t } = useT();
  return (
    <div className={`flex items-center gap-1 ${cls}`}>
      <span style={{ fontSize: 10.5, color: C.ink3 }}>{t("x.mainNow")}</span>
      <span style={{ fontSize: 12 }}>{flag(code)}</span>
      <span className="num" style={{ fontSize: 10.5, fontWeight: 700, color: C.ink2 }}>{code}</span>
    </div>
  );
};

const Row = ({ label, children, last }) => {
  const { lang } = useT();
  const w = lang === "en" ? 62 : 34;
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-3"
      style={{ borderBottom: last ? "none" : `1px solid ${C.hair}`, background: C.surface }}>
      <span className="shrink-0" style={{ width: w, fontSize: 11.5, fontWeight: 500, color: C.ink3, lineHeight: 1.25 }}>{label}</span>
      {children}
    </div>
  );
};
const Sheet = ({ title, onClose, children }) => { const { t } = useT(); return (
  <div className="absolute inset-0 z-20 flex flex-col justify-end" style={{ background: "rgba(20,22,26,.32)" }} onClick={onClose}>
    <div className="up" style={{ background: C.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: "76%" }} onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center px-4 py-3" style={{ borderBottom: `1px solid ${C.soft}` }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{title}</span>
        <button onClick={onClose} className="ml-auto p-1" aria-label={t("g.close")}><X size={18} color={C.ink2} /></button>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: "62vh" }}>{children}</div>
    </div>
  </div>
); };

const CurrencySheet = ({ value, onPick, onClose, title, favs }) => {
  const { t } = useT();
  const [q, setQ] = useState("");
  const key = q.trim().toUpperCase();
  /* 有常用货币时把它们排前面,其余仍可搜到 */
  const all = favs?.length ? [...favs, ...Object.keys(CUR).filter((c) => !favs.includes(c))] : Object.keys(CUR);
  const list = all.filter((c) => !key || c.includes(key) || t(`cur.${c}`).toUpperCase().includes(key));
  return (
    <Sheet title={title || t("r.pickCur")} onClose={onClose}>
      <div className="px-3 pt-2 pb-1">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("x.search")}
          className="w-full px-3 py-2 outline-none"
          style={{ background: C.soft, borderRadius: C.r, fontSize: 13.5, color: C.ink }} />
      </div>
      {list.map((code) => (
        <button key={code} onClick={() => { onPick(code); onClose(); }} className="w-full flex items-center gap-3 px-4 py-3 text-left"
          style={{ borderBottom: `1px solid ${C.soft}` }}>
          <span style={{ fontSize: 22 }}>{flag(code)}</span>
          <span className="num shrink-0" style={{ fontSize: 12, fontWeight: 700, color: C.ink2, width: 34 }}>{code}</span>
          <span className="flex-1 truncate" style={{ fontSize: 14, color: C.ink }}>{t(`cur.${code}`)}</span>
          <span className="num shrink-0" style={{ fontSize: 12, color: C.ink3 }}>{CUR[code].sign}</span>
          {value === code && <Check size={16} color={C.brand} strokeWidth={2.6} />}
        </button>
      ))}
      {list.length === 0 && <div className="text-center py-10" style={{ fontSize: 13, color: C.ink3 }}>—</div>}
    </Sheet>
  );
};


/* ═════════════════════════════════════════════════════════
   首次设置:主要货币 + 常用货币
   常用货币只决定选择器显示哪几种,汇率仍按天整组存,
   所以以后增删常用货币不需要重算任何历史。
   ═════════════════════════════════════════════════════════ */
function CurrencySetup({ lang, onDone }) {
  const { t } = useT();
  const [main, setMain] = useState(() => LANG_CUR[lang] || "JPY");
  /* 默认只选主要货币,常用货币由用户按需添加 */
  const [favs, setFavs] = useState(() => [LANG_CUR[lang] || "JPY"]);
  const [sheet, setSheet] = useState(null);

  const toggle = (c) => setFavs((f) => (f.includes(c) ? f.filter((x) => x !== c) : [...f, c]));
  const ok = favs.length >= 1 && favs.includes(main);

  return (
    <div className="flex flex-col h-full relative" style={{ background: C.page }}>
      <div className="px-5 pt-8 pb-4 shrink-0" style={{ background: C.surface }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>{t("x.setupTitle")}</div>
        <div style={{ fontSize: 12.5, color: C.ink3, marginTop: 4, lineHeight: 1.6 }}>{t("x.setupSub")}</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-5 pb-2"><span className="lab">{t("x.pickMain")}</span></div>
        <button onClick={() => setSheet("main")} className="w-full flex items-center gap-3 px-5 py-3.5"
          style={{ background: C.surface, borderTop: `1px solid ${C.hair}`, borderBottom: `1px solid ${C.hair}` }}>
          <span style={{ fontSize: 24 }}>{flag(main)}</span>
          <span className="num shrink-0" style={{ fontSize: 13, fontWeight: 700, color: C.ink2 }}>{main}</span>
          <span className="flex-1 text-left truncate" style={{ fontSize: 15, color: C.ink }}>{t(`cur.${main}`)}</span>
          <ChevronDown size={16} color={C.ink3} />
        </button>

        <div className="px-5 pt-5 pb-1 flex items-baseline gap-2">
          <span className="lab">{t("x.favs")}</span>
          <span className="num" style={{ fontSize: 11, color: C.ink3 }}>{favs.length}</span>
        </div>
        <div className="px-5 pb-2" style={{ fontSize: 11, color: C.ink3, lineHeight: 1.6 }}>{t("x.favsHint")}</div>
        <div className="grid grid-cols-3 gap-2 px-5 pb-3">
          {[...new Set([...DEFAULT_FAVS, ...favs, ...Object.keys(CUR)])].map((c) => {
            const on = favs.includes(c);
            return (
              <button key={c} disabled={c === main} onClick={() => toggle(c)}
                className="flex items-center gap-1.5 px-2 py-2"
                style={{ borderRadius: C.r, background: on ? C.innSoft : C.surface, opacity: c === main ? 0.65 : 1,
                  boxShadow: `inset 0 0 0 ${on ? 1.5 : 1}px ${on ? C.brand : C.hair}` }}>
                <span style={{ fontSize: 15 }}>{flag(c)}</span>
                <span className="num truncate" style={{ fontSize: 11.5, fontWeight: on ? 700 : 500, color: on ? C.brand : C.ink2 }}>{c}</span>
                {on && <Check size={12} color={C.brand} strokeWidth={3} className="ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>

        {!favs.includes(main) && (
          <div className="mx-5 mb-3 rounded-lg px-3 py-2" style={{ background: C.warn }}>
            <span style={{ fontSize: 11.5, color: C.warnInk }}>{t("x.needMain")}</span>
          </div>
        )}

        <div className="p-5">
          <button onClick={() => ok && onDone({ main, favs })} disabled={!ok} className="w-full py-3.5"
            style={{ background: ok ? C.brand : C.line, color: "#fff", fontSize: 15, fontWeight: 600, borderRadius: C.R }}>
            {t("x.start")}
          </button>
        </div>
      </div>

      {sheet === "main" && (
        <CurrencySheet title={t("x.pickMain")} value={main}
          onPick={(v) => {
            setFavs((f) => {
              const next = f.filter((c) => c !== main);   // 换主币时不把旧的强行留下
              return next.includes(v) ? next : [v, ...next];
            });
            setMain(v);
          }}
          onClose={() => setSheet(null)} />
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   记账页
   ═════════════════════════════════════════════════════════ */
function Record({ cats, quicks, txns, onSave, cur, setCur, goQuick, goCats, fx, setFx, main, goFx, favs }) {
  const { t, lang } = useT(); const L = useLabel();
  const [type, setType] = useState("expense");
  const [date, setDate] = useState(TODAY);
  const [note, setNote] = useState("");
  const [amt, setAmt] = useState("");
  const [cat, setCat] = useState(1);
  const [sheet, setSheet] = useState(null);
  /* 汇率对:初始一行,系统语言对应的币种换主币种 */
  const [pairs, setPairs] = useState(() => [{ from: LANG_CUR[lang] || main, to: main }]);
  const [fxCalc, setFxCalc] = useState({ side: "from", value: "1" });
  const [toast, setToast] = useState(null);
  const [shake, setShake] = useState(false);
  const [fxBusy, setFxBusy] = useState(false);

  const snap = ratesOn(fx, TODAY);


  const dec = CUR[cur].dec;
  const minor = toMinor(Math.abs(parseFloat(amt) || 0), cur);
  const cObj = cats.find((c) => c.id === cat);
  const monthSpent = txns.filter((x) => x.date.startsWith(date.slice(0, 7)) && x.type === "expense").reduce((s, x) => s + x.amount, 0);

  const flash = (m, bad) => { setToast({ m, bad }); setTimeout(() => setToast(null), 1700); };
  const reject = (m) => { setShake(true); setTimeout(() => setShake(false), 340); flash(m, true); };

  /* 点一下才更新。不点就一直沿用上次的汇率——只影响之后记的账 */
  const updateFx = async () => {
    setFxBusy(true);
    try {
      const codes = [...new Set([...favs, main])];
      const got = await fetchRates(codes);
      const prev = ratesOn(fx, TODAY)?.rates || {};
      const merged = { ...prev, ...got.rates };
      setFx((f) => mergeDay(f, got.date, merged, "api"));
      flash(`${t("x.done")} · ${got.date}`);
    } catch { flash(t("x.failed"), true); }
    setFxBusy(false);
  };
  const commit = (p) => { onSave(p); setAmt(""); setNote(""); flash(`${t("r.saved")} ${money(p.amount, p.cur)} · ${L(cats.find((c) => c.id === p.cat))}`); };

  const tapQuick = (q) => {
    if (q.amount != null) { const qc = q.cur || cur; return commit({ type: q.type, amount: toMinor(q.amount, qc), cur: qc, cat: q.cat, date, name: q.name, i18n: q.i18n }); }
    if (minor <= 0) return reject(`${t("r.needAmountFirst")}「${L(q)}」`);
    commit({ type: q.type, amount: minor, cur, cat: q.cat, date, name: q.name, i18n: q.i18n });
  };
  const manual = () => {
    if (minor <= 0) return reject(t("r.needAmount"));
    commit({ type, amount: minor, cur, cat, date, name: note.trim(), i18n: null });
  };
  /* 可以记未来的账:预约、下月房租等 */
  const future = date > TODAY;
  const shift = (d) => setDate(addDays(date, d));
  const qs = quicks.filter((q) => q.type === type);

  return (
    <div className="flex flex-col h-full relative" style={{ background: C.page }}>
      <div className="flex items-center gap-2 px-3.5 shrink-0" style={{ height: 50, background: C.surface }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{t("nav.record")}</span>
        <span className="num truncate rounded-full px-2 py-0.5"
          style={{ fontSize: 11, color: C.out, background: C.outSoft, fontWeight: 600 }}>
          {+date.slice(5, 7)}{t("r.month")} {money(monthSpent, cur)}
        </span>
        <div className="ml-auto shrink-0">
          <Seg sm value={type} onChange={(v) => { setType(v); setCat(cats.find((c) => c.type === v).id); }}
            items={[{ v: "expense", t: t("t.expense") }, { v: "income", t: t("t.income") }]} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Row label={t("r.date")}>
          <button onClick={() => shift(-1)} className="p-1 -ml-1" aria-label="−1"><ChevronLeft size={16} color={C.line} /></button>
          <span className="num" style={{ fontSize: 14, color: C.ink }}>{date}</span>
          <span style={{ fontSize: 11, color: future ? C.warnInk : C.ink3 }}>
            {t(`w${new Date(date + "T00:00:00").getDay()}`)}{future ? ` · ${t("r.future")}` : ""}
          </span>
          <button onClick={() => shift(1)} className="p-1" aria-label="+1">
            <ChevronRight size={16} color={C.line} />
          </button>
          <label className="ml-auto p-1 cursor-pointer relative" aria-label={t("r.date")}>
            <Calendar size={16} color={C.ink3} />
            <input type="date" value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%" }} />
          </label>
        </Row>

        <Row label={t("r.note")}>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("r.notePh")}
            className="flex-1 min-w-0 bg-transparent outline-none" style={{ fontSize: 14, color: C.ink }} />
        </Row>

        <div className={shake ? "nudge" : ""}>
          <Row label={t(type === "expense" ? "r.rowExpense" : "r.rowIncome")}>
            <button onClick={() => setSheet("cur")} className="flex items-center gap-1 rounded-md px-2 py-1 shrink-0" style={{ background: C.soft }}>
              <span className="num" style={{ fontSize: 11, fontWeight: 600, color: C.ink2 }}>{cur}</span>
              <span className="whitespace-nowrap" style={{ fontSize: 12, color: C.ink }}>{t(`cur.${cur}`)}</span>
              <ChevronDown size={13} color={C.ink3} />
            </button>
            <input value={amt} onChange={(e) => setAmt(e.target.value.replace(dec === 0 ? /[^\d]/g : /[^\d.]/g, ""))}
              inputMode={dec === 0 ? "numeric" : "decimal"} placeholder="0"
              className="num flex-1 min-w-0 bg-transparent outline-none text-right"
              style={{ fontSize: 28, fontWeight: 600, color: amt ? (type === "expense" ? C.out : C.inn) : "#CBD2D9" }} />
          </Row>
        </div>

        <Row label={t("r.rowCategory")} last>
          <button onClick={() => setSheet("cat")} className="min-w-0 flex items-center gap-2 px-2 py-1.5"
            style={{ borderRadius: C.r, background: C.soft }}>
            <Tile icon={cObj?.icon} color={cObj?.color} size={26} ico={14} />
            <span className="truncate" style={{ fontSize: 13.5, fontWeight: 500, color: C.ink }}>{L(cObj)}</span>
            <ChevronDown size={15} color={C.ink3} className="shrink-0" />
          </button>
          <button onClick={manual} className="ml-auto shrink-0 rounded-lg px-6 py-2.5"
            style={{ background: C.brand, color: "#fff", fontSize: 14.5, fontWeight: 600, borderRadius: C.R }}>
            {t("r.save")}
          </button>
        </Row>

        <div className="px-3.5 pt-3 pb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="lab shrink-0 whitespace-nowrap mr-1">{t("r.quick")}</span>
            {qs.map((q) => {
              const c = cats.find((x) => x.id === q.cat), fxd = q.amount != null;
              return (
                <button key={q.id} onClick={() => tapQuick(q)} className="shrink-0 flex items-center gap-1.5 rounded-full pl-1 pr-3 py-1"
                  style={{ background: fxd ? `${c?.color}16` : C.surface,
                    boxShadow: `inset 0 0 0 ${fxd ? 1.5 : 1}px ${fxd ? c?.color : C.hair}` }}>
                  <Tile icon={c?.icon} color={c?.color} size={22} ico={12} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{L(q)}</span>
                  {fxd && <span className="num" style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>
                    {q.amount.toLocaleString("en-US")}{q.cur && q.cur !== cur ? ` ${q.cur}` : ""}</span>}
                </button>
              );
            })}
            <button onClick={goQuick} className="shrink-0 flex items-center justify-center rounded-full"
              style={{ width: 36, height: 28, boxShadow: `inset 0 0 0 1px ${C.line}`, color: C.ink3, background: C.surface }}
              aria-label={t("r.editQuick")}>
              <Plus size={16} />
            </button>
          </div>
        </div>
        <div style={{ height: 10 }} />
        <div className="px-3.5 pt-3 pb-2 flex items-center gap-1.5">
          <span className="lab shrink-0">{t("x.panel")}</span>
          <span className="num truncate" style={{ fontSize: 10.5, color: C.ink3 }}>{snap?.at || "—"}</span>
          <button onClick={updateFx} disabled={fxBusy} className="ml-auto shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1"
            style={{ background: fxBusy ? C.soft : C.ink, color: fxBusy ? C.ink3 : "#fff", fontSize: 11, fontWeight: 600 }}>
            <RefreshCw size={11} strokeWidth={2.3} /> {fxBusy ? t("x.updating") : t("x.update")}
          </button>
        </div>

        <div className="mx-3.5 overflow-hidden" style={{ borderRadius: C.R, background: C.surface, boxShadow: `inset 0 0 0 1px ${C.hair}` }}>
          {pairs.map((pr, i) => {
            const r = snap?.rates;
            const a = rateOf(r, pr.from), b = rateOf(r, pr.to);
            const v = a && b ? a / b : null;
            const same = pr.from === pr.to;
            const edited = fxNum(fxCalc.value);
            const fromVal = fxCalc.side === "from" ? fxCalc.value : (v ? fxFmt(edited / v) : "");
            const toVal = fxCalc.side === "to" ? fxCalc.value : (v ? fxFmt(edited * v) : "");
            const inputStyle = (side) => ({
              width: "100%", fontSize: 14, fontWeight: 600, color: C.ink,
              borderBottom: `1.5px solid ${fxCalc.side === side ? C.ink : C.line}`,
              paddingBottom: 1,
            });
            const boxStyle = {
              minWidth: 0,
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              alignItems: "center",
              columnGap: 6,
            };
            return (
              <div key={i} className="px-2.5 py-2.5"
                style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)", alignItems: "center", gap: 8,
                  borderTop: i ? `1px solid ${C.hair}` : "none" }}>
                <div style={boxStyle}>
                  <input value={fromVal} inputMode="decimal" placeholder="1"
                    onChange={(e) => setFxCalc({ side: "from", value: cleanDecimal(e.target.value) })}
                    className="num bg-transparent outline-none text-right"
                    style={inputStyle("from")} />
                  <button onClick={() => setSheet({ k: "pair", i, side: "from" })}
                    className="shrink-0 flex items-center gap-1 rounded-full pl-1 pr-1.5 py-0.5" style={{ background: C.soft }}>
                    <span style={{ fontSize: 13 }}>{flag(pr.from)}</span>
                    <span className="num" style={{ fontSize: 11, fontWeight: 700, color: C.ink }}>{pr.from}</span>
                  </button>
                </div>
                <span className="num shrink-0" style={{ fontSize: 11, color: C.ink3 }}>=</span>
                <div style={boxStyle}>
                  <input value={toVal} inputMode="decimal" placeholder={v == null ? "—" : "0"}
                    onChange={(e) => setFxCalc({ side: "to", value: cleanDecimal(e.target.value) })}
                    className="num bg-transparent outline-none text-right"
                    style={{ ...inputStyle("to"), color: same ? C.ink3 : C.ink }} />
                  <button onClick={() => setSheet({ k: "pair", i, side: "to" })}
                    className="shrink-0 flex items-center gap-1 rounded-full pl-1 pr-1.5 py-0.5" style={{ background: C.soft }}>
                    <span style={{ fontSize: 13 }}>{flag(pr.to)}</span>
                    <span className="num" style={{ fontSize: 11, fontWeight: 700, color: C.ink }}>{pr.to}</span>
                  </button>
                </div>
                {pairs.length > 1 && (
                  <button onClick={() => setPairs(pairs.filter((_, z) => z !== i))} className="shrink-0 p-0.5 -mr-0.5"
                    aria-label={t("x.removePair")}>
                    <X size={13} color={C.hair} />
                  </button>
                )}
              </div>
            );
          })}
          <button onClick={() => setPairs([...pairs, { from: pairs[pairs.length - 1]?.to || main, to: main }])}
            className="w-full flex items-center justify-center gap-1 py-2.5"
            style={{ borderTop: `1px solid ${C.hair}`, color: C.ink3, fontSize: 12 }}>
            <Plus size={13} /> {t("x.addPair")}
          </button>
        </div>

        <div className="px-3.5 pt-1.5 pb-1" style={{ fontSize: 10, color: C.ink3, lineHeight: 1.5 }}>
          {t("x.pinNote")}
        </div>

        <div style={{ height: 12 }} />
      </div>

      {sheet === "cur" && <CurrencySheet favs={favs} value={cur} onPick={setCur} onClose={() => setSheet(null)} />}
      {sheet?.k === "pair" && (
        <CurrencySheet favs={favs} title={t("x.panel")} value={pairs[sheet.i][sheet.side]}
          onPick={(v) => setPairs(pairs.map((p, z) => (z === sheet.i ? { ...p, [sheet.side]: v } : p)))}
          onClose={() => setSheet(null)} />
      )}
      {sheet === "cat" && (
        <Sheet title={t("r.pickCat")} onClose={() => setSheet(null)}>
          <div className="grid grid-cols-4 gap-2 p-3">
            {cats.filter((c) => c.type === type).sort((a, b) => a.order - b.order).map((c) => (
              <button key={c.id} onClick={() => { setCat(c.id); setSheet(null); }} className="flex flex-col items-center gap-1.5 py-2.5 px-1"
                style={{ borderRadius: C.R, background: c.id === cat ? `${c.color}14` : C.surface,
                  boxShadow: c.id === cat ? `inset 0 0 0 2px ${c.color}` : `inset 0 0 0 1px ${C.hair}` }}>
                <Tile icon={c.icon} color={c.color} size={34} ico={18} />
                <span className="truncate w-full text-center" style={{ fontSize: 11, fontWeight: 500, color: C.ink }}>{L(c)}</span>
              </button>
            ))}
            <button onClick={() => { setSheet(null); goCats(); }}
              className="flex flex-col items-center gap-1.5 rounded-lg py-2.5 px-1"
              style={{ border: `1px dashed ${C.line}`, background: C.page }}>
              <span className="tile" style={{ width: 34, height: 34, background: "transparent" }}>
                <SlidersHorizontal size={19} color={C.ink3} />
              </span>
              <span className="truncate w-full text-center" style={{ fontSize: 11, color: C.ink3 }}>{t("g.edit")}</span>
            </button>
          </div>
        </Sheet>
      )}

      {toast && (
        <div className="absolute left-1/2 rounded-lg px-3.5 py-2.5" style={{ bottom: 18, transform: "translateX(-50%)", whiteSpace: "nowrap", zIndex: 30,
          background: toast.bad ? C.out : C.ink, color: "#fff", fontSize: 13, fontWeight: 500, boxShadow: "0 6px 20px rgba(0,0,0,.22)" }}>
          {toast.m}
        </div>
      )}
    </div>
  );
}

function FxScreen({ fx, setFx, cur, favs, onBack }) {
  const { t, lang } = useT();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const snap = ratesOn(fx, TODAY);
  const codes = [...new Set([cur, ...(favs || DEFAULT_FAVS)])];
  const copy = {
    zh: [
      "汇率来自 ExchangeRate-API 的公开参考汇率，并非银行实时成交汇率。实际刷卡、换汇、转账时，请以银行、发卡组织或支付平台的最终汇率为准。",
      "这里的汇率只用于多币种账目的参考合计、账本热力图和统计折算，不适合用于交易、结算或投资判断。",
      "点「更新」时，应用会尝试获取最新公开参考汇率。公开接口通常有延迟，所以请把它当作记账统计用的参考值。",
      "更新只会影响之后的参考统计。已经记录的账目会保留当时钉住的汇率日期，不会因为之后更新而改变。",
    ],
    ja: [
      "為替レートは ExchangeRate-API の公開参考レートです。銀行のリアルタイム取引レートではありません。カード、両替、送金の実際のレートは銀行、カード会社、決済サービスの最終レートを確認してください。",
      "このレートは複数通貨の参考合計、ヒートマップ、統計換算にだけ使います。取引、決済、投資判断には向いていません。",
      "更新すると最新の公開参考レートを取得します。公開 API には遅延があるため、記帳統計用の参考値として扱ってください。",
      "更新しても記録済みの明細は当時固定されたレート日付を保持し、後から変わりません。",
    ],
    en: [
      "Rates come from ExchangeRate-API's public reference feed. They are not real-time bank rates. For card payments, currency exchange, or transfers, use the final rate from your bank, card network, or payment provider.",
      "These rates are only for reference totals, heatmaps, and analytics across currencies. They are not suitable for trading, settlement, or investment decisions.",
      "Update tries to fetch the latest public reference rates. Public feeds can lag, so treat them as bookkeeping estimates.",
      "Updating does not change entries already recorded. Existing entries keep the rate date they were saved with.",
    ],
    ko: [
      "환율은 ExchangeRate-API의 공개 참고 환율입니다. 은행의 실시간 거래 환율이 아닙니다. 카드 결제, 환전, 송금의 실제 환율은 은행, 카드사, 결제 서비스의 최종 환율을 확인하세요.",
      "이 환율은 여러 통화의 참고 합계, 히트맵, 통계 환산에만 사용됩니다. 거래, 정산, 투자 판단에는 적합하지 않습니다.",
      "업데이트를 누르면 최신 공개 참고 환율을 가져옵니다. 공개 API는 지연될 수 있으므로 가계부 통계용 참고값으로 봐 주세요.",
      "업데이트해도 이미 기록된 항목은 당시 저장된 환율 날짜를 유지하며 나중에 바뀌지 않습니다.",
    ],
  }[lang] || [];

  const flash = (text, warn = false) => {
    setToast({ text, warn });
    setTimeout(() => setToast(null), 1800);
  };
  const update = async () => {
    setBusy(true);
    try {
      const got = await fetchRates(codes);
      const prev = ratesOn(fx, got.date)?.rates || {};
      setFx((f) => mergeDay(f, got.date, { ...prev, ...got.rates }, "api"));
      flash(`${t("x.done")} · ${got.date}`);
    } catch {
      flash(t("x.failed"), true);
    }
    setBusy(false);
  };

  return (
    <div className="flex flex-col h-full relative" style={{ background: C.page }}>
      <Bar title={t("x.title")} left={<Back on={onBack} />} />
      <div className="flex-1 overflow-y-auto">
        <div className="m-3.5 p-3.5" style={{ background: C.surface, borderRadius: C.R, boxShadow: `inset 0 0 0 1px ${C.hair}` }}>
          <div className="flex items-center gap-2">
            <span className="lab">{t("x.asOf")}</span>
            <span className="num" style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{snap?.at || "—"}</span>
            <button onClick={update} disabled={busy} className="ml-auto flex items-center gap-1 rounded-full px-2.5 py-1"
              style={{ background: busy ? C.soft : C.ink, color: busy ? C.ink3 : "#fff", fontSize: 11, fontWeight: 600 }}>
              <RefreshCw size={11} strokeWidth={2.3} /> {busy ? t("x.updating") : t("x.update")}
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {copy.map((line, i) => (
              <p key={i} style={{ margin: 0, fontSize: 12.5, color: C.ink2, lineHeight: 1.65 }}>{line}</p>
            ))}
          </div>
        </div>
      </div>
      {toast && (
        <div className="absolute left-1/2 rounded-lg px-3.5 py-2.5" style={{ bottom: 18, transform: "translateX(-50%)", whiteSpace: "nowrap", zIndex: 30,
          background: toast.warn ? C.out : C.ink, color: "#fff", fontSize: 13, fontWeight: 500, boxShadow: "0 6px 20px rgba(0,0,0,.22)" }}>
          {toast.text}
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   账本页
   ═════════════════════════════════════════════════════════ */
function Ledger({ txns, cats, y, m, setYm, cur, fx, main, onEdit, onDelete }) {
  const { t } = useT(); const L = useLabel();
  const [pick, setPick] = useState(null);
  const [showAll, setShowAll] = useState(false);   // 支出以外的数字默认收起
  const [editing, setEditing] = useState(null);
  const key = `${y}-${String(m).padStart(2, "0")}`;
  const rows = txns.filter((x) => x.date.startsWith(key));
  /* 热力图和月度汇总都是参考值,按当前设置汇率把各币种折算到主币种 */
  const day = {};
  rows.forEach((x) => {
    const d = +x.date.slice(8), v = convertOn(x.amount, x.cur, main, x.fxd || x.date, fx);
    if (v == null) return;
    day[d] = day[d] || { e: 0, i: 0 };
    day[d][x.type === "expense" ? "e" : "i"] += v;
  });
  const max = Math.max(1, ...Object.values(day).map((v) => v.e));
  const exp = sumOn(rows.filter((x) => x.type === "expense"), main, fx);
  const inc = sumOn(rows.filter((x) => x.type === "income"), main, fx);
  const mixed = new Set(rows.map((x) => x.cur)).size > 1;
  const first = new Date(y, m - 1, 1), n = new Date(y, m, 0).getDate();
  const cells = [...Array(first.getDay()).fill(null), ...Array.from({ length: n }, (_, i) => i + 1)];
  const shown = pick ? rows.filter((x) => +x.date.slice(8) === pick) : rows;
  const days = [...new Set(shown.map((x) => x.date))].sort().reverse();

  return (
    <div className="flex flex-col h-full relative" style={{ background: C.page }}>
      <Bar title={t("nav.ledger")} right={
        <div className="flex items-center">
          <button onClick={() => setYm(m === 1 ? [y - 1, 12] : [y, m - 1])} className="p-1.5" aria-label="−"><ChevronLeft size={17} color={C.ink2} /></button>
          <span className="num" style={{ fontSize: 13.5, fontWeight: 600, minWidth: 58, textAlign: "center" }}>{y}.{String(m).padStart(2, "0")}</span>
          <button onClick={() => setYm(m === 12 ? [y + 1, 1] : [y, m + 1])} className="p-1.5" aria-label="+"><ChevronRight size={17} color={C.ink2} /></button>
        </div>} />
      <div className="flex-1 overflow-y-auto">
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.hair}` }}>
          <div className="flex items-end gap-5 px-4 pt-2 pb-3">
            <button onClick={() => setShowAll((v) => !v)} className="flex items-end gap-1.5 text-left">
              <div>
                <div className="lab">{t("t.expense")}</div>
                <div className="num" style={{ fontSize: 16, fontWeight: 600, color: C.out }}>{money(exp.total, main)}</div>
              </div>
              <span style={{ paddingBottom: 3, mainlay: "inline-flex", transform: showAll ? "rotate(90deg)" : "none", transition: "transform .16s" }}>
                <ChevronRight size={15} color={C.ink3} />
              </span>
            </button>
            {showAll && (
              <>
                <div>
                  <div className="lab">{t("t.income")}</div>
                  <div className="num" style={{ fontSize: 16, fontWeight: 600, color: C.inn }}>{money(inc.total, main)}</div>
                </div>
                <div>
                  <div className="lab">{t("t.balance")}</div>
                  <div className="num" style={{ fontSize: 16, fontWeight: 600, color: inc.total - exp.total < 0 ? C.out : C.inn }}>
                    {money(inc.total - exp.total, main)}
                  </div>
                </div>
              </>
            )}
          </div>
          <MainHint code={main} cls="px-4 pb-2" />
          <div className="grid grid-cols-7 gap-1 px-4 pb-2">
            {[0,1,2,3,4,5,6].map((i) => <div key={i} className="text-center truncate" style={{ fontSize: 10, color: C.ink3, paddingBottom: 2 }}>{t(`w${i}`)}</div>)}
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const v = day[d], r = v ? v.e / max : 0, on = pick === d;
              const alpha = v?.e ? 0.06 + r * 0.86 : 0;
              const ink = v?.e ? heatInk(alpha) : C.ink2;
              const edge = v?.e ? heatEdge(alpha) : "none";
              return (
                <button key={i} onClick={() => setPick(on ? null : d)} className="rounded-md relative flex flex-col p-1"
                  style={{ aspectRatio: "1", background: v?.e ? `rgba(20,22,26,${alpha})` : C.soft,
                    outline: on ? `2px solid ${C.ink}` : "none", outlineOffset: 1 }}>
                  <span className="num self-start leading-none"
                    style={{ fontSize: 10, fontWeight: 600, color: ink, textShadow: edge }}>{d}</span>
                  {v?.i > 0 && (
                    <span className="absolute" style={{ top: 3, right: 3, width: 4, height: 4, borderRadius: 4, background: C.inn }} />
                  )}
                  {v?.e > 0 && (
                    <span className="num mt-auto self-end leading-none truncate w-full text-right"
                      style={{ fontSize: 9, fontWeight: 600, color: ink, textShadow: edge, opacity: 0.92 }}>
                      {compact(v.e, main)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5 px-4 pb-3">
            <span style={{ fontSize: 10.5, color: C.ink3 }}>{t("l.less")}</span>
            {[0.06, 0.3, 0.5, 0.7, 0.92].map((o) => <span key={o} style={{ width: 13, height: 9, borderRadius: 2, background: `rgba(20,22,26,${o})` }} />)}
            <span style={{ fontSize: 10.5, color: C.ink3 }}>{t("l.more")}</span>
            {pick && <button onClick={() => setPick(null)} className="ml-auto flex items-center gap-1" style={{ fontSize: 12, color: C.ink2 }}>
              {t("l.only")} {m}/{pick} <X size={12} /></button>}
          </div>
        </div>
        {days.length === 0 && <div className="text-center py-16" style={{ fontSize: 13, color: C.ink3 }}>{t("l.noDay")}</div>}
        {days.map((d) => {
          const rs = shown.filter((x) => x.date === d);
          const net = rs.reduce((s, x) => { const v = convertOn(x.amount, x.cur, main, x.fxd || x.date, fx); return v == null ? s : s + (x.type === "expense" ? -v : v); }, 0);
          return (
            <div key={d} className="mt-2" style={{ background: C.surface, borderTop: `1px solid ${C.hair}`, borderBottom: `1px solid ${C.hair}` }}>
              <div className="flex items-baseline gap-2 px-4 pt-2.5 pb-1.5">
                <span className="num" style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{+d.slice(8)}</span>
                <span style={{ fontSize: 11.5, color: C.ink3 }}>{t(`w${new Date(d + "T00:00:00").getDay()}`)}</span>
                <span className="num ml-auto" style={{ fontSize: 13, fontWeight: 600, color: net < 0 ? C.ink2 : C.inn }}>{money(net, cur)}</span>
              </div>
              {rs.map((x) => {
                const c = cats.find((z) => z.id === x.cat);
                return (
                  <button key={x.id} onClick={() => setEditing(x)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left" style={{ borderTop: `1px solid ${C.soft}` }}>
                    <Tile icon={c?.icon} color={c?.color} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate" style={{ fontSize: 14, color: C.ink }}>{L(x) || L(c)}</span>
                        {x.fx && <Repeat size={11} color={C.ink3} className="shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1.5 truncate" style={{ fontSize: 11.5, color: C.ink3 }}>
                        <CatTag color={c?.color}>{L(c)}</CatTag>
                        {x.cur !== main && (
                          <span className="num truncate" style={{ color: C.ink3 }}>{money(x.amount, x.cur)}</span>
                        )}
                      </div>
                    </div>
                    <span className="num shrink-0" style={{ fontSize: 15, color: x.type === "expense" ? C.ink : C.inn }}>
                      {x.type === "expense" ? "" : "+"}
                      {money(convertOn(x.amount, x.cur, main, x.fxd || x.date, fx) ?? x.amount, main)}</span>
                    <ChevronRight size={14} color={C.hair} className="shrink-0 -mr-1" />
                  </button>
                );
              })}
            </div>
          );
        })}
        <div style={{ height: 16 }} />
      </div>
      {editing && (
        <EntryEditor entry={editing} cats={cats} fx={fx} onSave={onEdit} onDelete={onDelete} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   账目编辑
   改金额不重钉汇率(改的是「当时花了多少」);改日期才重新钉。
   ═════════════════════════════════════════════════════════ */
function EntryEditor({ entry, cats, fx, onSave, onDelete, onClose }) {
  const { t } = useT(); const L = useLabel();
  const [d, setD] = useState(() => ({
    ...entry,
    amountStr: String(fromMinor(entry.amount, entry.cur)),
    noteStr: entry.i18n ? "" : (entry.name || ""),
  }));
  const [sheet, setSheet] = useState(null);
  const dec = CUR[d.cur]?.dec ?? 0;
  const list = cats.filter((c) => c.type === d.type).sort((a, b) => a.order - b.order);
  const cObj = cats.find((c) => c.id === d.cat);

  const save = () => {
    const a = toMinor(Math.abs(parseFloat(d.amountStr) || 0), d.cur);
    if (a <= 0) return;
    /* 日期变了就按新日期重新钉汇率,否则保留原来那天 */
    const fxd = d.date !== entry.date ? (ratesOn(fx, d.date)?.at ?? null) : entry.fxd;
    const keepI18n = d.noteStr === "" && entry.i18n ? entry.i18n : null;
    onSave({ ...entry, type: d.type, amount: a, cur: d.cur, cat: d.cat, date: d.date,
      name: keepI18n ? entry.name : d.noteStr.trim(), i18n: keepI18n, fxd });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end" style={{ background: "rgba(31,41,51,.34)" }} onClick={onClose}>
      <div className="up flex flex-col" style={{ background: C.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: "92%" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center px-4 py-3 shrink-0" style={{ borderBottom: `1px solid ${C.hair}` }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{t("e.title")}</span>
          <button onClick={onClose} className="ml-auto p-1" aria-label={t("g.close")}><X size={18} color={C.ink2} /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {entry.fx && (
            <div className="flex items-center gap-1.5 px-4 py-2" style={{ background: C.warn }}>
              <Repeat size={12} color={C.warnInk} className="shrink-0" />
              <span style={{ fontSize: 11, color: C.warnInk, lineHeight: 1.5 }}>{t("e.fromFixed")}</span>
            </div>
          )}

          <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.hair}` }}>
            <Seg value={d.type} onChange={(v) => setD({ ...d, type: v, cat: cats.find((c) => c.type === v).id })}
              items={[{ v: "expense", t: t("t.expense") }, { v: "income", t: t("t.income") }]} />
          </div>

          <Row label={t("r.date")}>
            <button onClick={() => setD({ ...d, date: addDays(d.date, -1) })} className="p-1 -ml-1" aria-label="−1">
              <ChevronLeft size={16} color={C.line} /></button>
            <span className="num" style={{ fontSize: 14, color: C.ink }}>{d.date}</span>
            <span style={{ fontSize: 11, color: C.ink3 }}>{t(`w${new Date(d.date + "T00:00:00").getDay()}`)}</span>
            <button onClick={() => setD({ ...d, date: addDays(d.date, 1) })} className="p-1" aria-label="+1">
              <ChevronRight size={16} color={C.line} /></button>
            <label className="ml-auto p-1 cursor-pointer relative">
              <Calendar size={16} color={C.ink3} />
              <input type="date" value={d.date} onChange={(e) => e.target.value && setD({ ...d, date: e.target.value })}
                style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%" }} />
            </label>
          </Row>

          <Row label={t("r.note")}>
            <input value={d.noteStr} onChange={(e) => setD({ ...d, noteStr: e.target.value })} placeholder={L(entry) || t("r.notePh")}
              className="flex-1 min-w-0 bg-transparent outline-none" style={{ fontSize: 14, color: C.ink }} />
          </Row>

          <Row label={t(d.type === "expense" ? "r.rowExpense" : "r.rowIncome")}>
            <button onClick={() => setSheet("cur")} className="flex items-center gap-1 rounded-md px-2 py-1 shrink-0" style={{ background: C.soft }}>
              <span className="num" style={{ fontSize: 11, fontWeight: 600, color: C.ink2 }}>{d.cur}</span>
              <ChevronDown size={13} color={C.ink3} />
            </button>
            <input value={d.amountStr} inputMode={dec === 0 ? "numeric" : "decimal"}
              onChange={(e) => setD({ ...d, amountStr: e.target.value.replace(dec === 0 ? /[^\d]/g : /[^\d.]/g, "") })}
              className="num flex-1 min-w-0 bg-transparent outline-none text-right"
              style={{ fontSize: 26, fontWeight: 600, color: d.type === "expense" ? C.out : C.inn }} />
          </Row>

          <Row label={t("r.rowCategory")} last>
            <button onClick={() => setSheet("cat")} className="flex-1 min-w-0 flex items-center gap-2 px-2 py-1.5"
              style={{ borderRadius: C.r, background: C.soft }}>
              <Tile icon={cObj?.icon} color={cObj?.color} size={26} ico={14} />
              <span className="truncate" style={{ fontSize: 13.5, fontWeight: 500, color: C.ink }}>{L(cObj)}</span>
              <ChevronDown size={15} color={C.ink3} className="ml-auto shrink-0" />
            </button>
          </Row>

          <div className="p-4 flex gap-2">
            <button onClick={() => { if (window.confirm(t("e.confirm"))) { onDelete(entry.id); onClose(); } }}
              className="px-4 py-3" style={{ borderRadius: C.R, background: C.outSoft, color: C.out }} aria-label={t("e.delete")}>
              <Trash2 size={17} />
            </button>
            <button onClick={save} className="flex-1 py-3"
              style={{ background: C.brand, color: "#fff", fontSize: 15, fontWeight: 600, borderRadius: C.R }}>{t("g.save")}</button>
          </div>
        </div>

        {sheet === "cur" && <CurrencySheet value={d.cur} onPick={(v) => setD({ ...d, cur: v })} onClose={() => setSheet(null)} />}
        {sheet === "cat" && (
          <Sheet title={t("r.pickCat")} onClose={() => setSheet(null)}>
            <div className="grid grid-cols-4 gap-2 p-3">
              {list.map((c) => (
                <button key={c.id} onClick={() => { setD({ ...d, cat: c.id }); setSheet(null); }}
                  className="flex flex-col items-center gap-1.5 py-2.5 px-1"
                  style={{ borderRadius: C.R, background: c.id === d.cat ? `${c.color}14` : C.surface,
                    boxShadow: c.id === d.cat ? `inset 0 0 0 2px ${c.color}` : `inset 0 0 0 1px ${C.hair}` }}>
                  <Tile icon={c.icon} color={c.color} size={34} ico={18} />
                  <span className="truncate w-full text-center" style={{ fontSize: 11, fontWeight: 500, color: C.ink }}>{L(c)}</span>
                </button>
              ))}
            </div>
          </Sheet>
        )}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   分析页
   ═════════════════════════════════════════════════════════ */
function Analysis({ txns, cats, budgets, setBudgets, y, m, setYm, cur, fx, goFx, main }) {
  const { t } = useT(); const L = useLabel();
  const [side, setSide] = useState("expense");
  const key = `${y}-${String(m).padStart(2, "0")}`;
  const pm = m === 1 ? [y - 1, 12] : [y, m - 1];
  const pkey = `${pm[0]}-${String(pm[1]).padStart(2, "0")}`;
  const unit = main;

  const pick = (k, ty) => txns.filter((x) => x.date.startsWith(k) && x.type === ty);
  const sum = (k, ty) => sumOn(pick(k, ty), main, fx).total;
  const val = (x) => convertOn(x.amount, x.cur, main, x.fxd || x.date, fx);

  const now = sum(key, side), prev = sum(pkey, side), diff = now - prev;
  const pct = prev > 0 ? (diff / prev) * 100 : null;
  const missing = sumOn(pick(key, side), main, fx).missing.length;
  const others = [...new Set(pick(key, side).map((x) => x.cur))].filter((k) => k !== main);
  const dates = [...new Set(pick(key, side).map((x) => x.fxd || x.date))];

  const rows = useMemo(() => {
    const map = {};
    pick(key, side).forEach((x) => { const v = val(x); if (v != null) map[x.cat] = (map[x.cat] || 0) + v; });
    const tot = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(map).map(([id, v]) => ({ c: cats.find((z) => z.id === +id), v, p: (v / tot) * 100 })).sort((a, b) => b.v - a.v);
  }, [txns, key, side, cats, main, fx]);

  const spentOf = (id) => pick(key, "expense").filter((x) => x.cat === id).reduce((s, x) => s + (val(x) ?? 0), 0);
  const totalSpent = sum(key, "expense");
  const pace = key === THIS_MONTH ? DIM / new Date(y, m, 0).getDate() : 1;

  const edit = (k, v) => {
    const s = window.prompt(t("a.budgetPrompt"), v ? String(fromMinor(v, unit)) : "");
    if (s === null) return;
    setBudgets((b) => { const n = { ...b }; if (!s.trim() || Number.isNaN(+s)) delete n[k]; else n[k] = toMinor(+s, unit); return n; });
  };

  const BRow = ({ label, color, icon, budget, spent, onEdit }) => {
    const set = budget > 0, r = set ? spent / budget : 0, over = r > 1;
    return (
      <div className="px-4 py-3" style={{ borderTop: `1px solid ${C.soft}` }}>
        <div className="flex items-center gap-2">
          {icon && <Ico n={icon} c={color} s={15} />}
          <span className="truncate" style={{ fontSize: 14, color: C.ink }}>{label}</span>
          {set ? <span className="num ml-auto shrink-0" style={{ fontSize: 13, fontWeight: 600, color: over ? C.out : C.ink2 }}>{money(budget - spent, unit)}</span>
               : <button onClick={onEdit} className="ml-auto shrink-0" style={{ fontSize: 12, color: C.ink3 }}>{t("a.setBudget")} →</button>}
        </div>
        {set && (<>
          <div className="relative mt-2 rounded-full overflow-hidden" style={{ height: 6, background: C.soft }}>
            <div style={{ width: `${Math.min(r, 1) * 100}%`, height: "100%", background: over ? C.out : color || C.ink }} />
            <div style={{ position: "absolute", left: `${pace * 100}%`, top: -2, width: 1.5, height: 10, background: C.ink3 }} />
          </div>
          <button onClick={onEdit} className="num mt-1.5 block" style={{ fontSize: 11, color: C.ink3 }}>
            {money(spent, unit)} / {money(budget, unit)} · {Math.round(r * 100)}%</button>
        </>)}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full relative" style={{ background: C.page }}>
      <Bar title={t("nav.stat")} right={
        <div className="flex items-center">
          <button onClick={() => setYm(pm)} className="p-1.5" aria-label="−"><ChevronLeft size={17} color={C.ink2} /></button>
          <span className="num" style={{ fontSize: 13.5, fontWeight: 600, minWidth: 58, textAlign: "center" }}>{y}.{String(m).padStart(2, "0")}</span>
          <button onClick={() => setYm(m === 12 ? [y + 1, 1] : [y, m + 1])} className="p-1.5" aria-label="+"><ChevronRight size={17} color={C.ink2} /></button>
        </div>} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3" style={{ background: C.surface, borderBottom: `1px solid ${C.hair}` }}>
          <div className="flex items-center gap-2">
            <Seg value={side} onChange={setSide} items={[{ v: "expense", t: t("t.expense") }, { v: "income", t: t("t.income") }]} />
          </div>
          <div className="num" style={{ fontSize: 28, fontWeight: 600, color: C.ink, marginTop: 10 }}>{money(now, unit)}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span style={{ fontSize: 12, color: C.ink3 }}>{t("a.vs")}</span>
            {pct === null ? <span style={{ fontSize: 12, color: C.ink3 }}>{t("a.nodata")}</span>
              : <span className="num" style={{ fontSize: 12, fontWeight: 600, color: diff > 0 ? C.out : C.inn }}>
                  {diff > 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(0)}% ({money(Math.abs(diff), unit)})</span>}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <MainHint code={main} />
            {others.length > 0 && (
              <span className="truncate" style={{ fontSize: 10.5, color: C.ink3 }}>· {t("x.oneLine")}</span>
            )}
          </div>
          {rows.length > 0 && (
            <div className="flex mt-3.5 rounded-md overflow-hidden" style={{ height: 12 }}>
              {rows.map((r) => <div key={r.c.id} style={{ width: `${r.p}%`, background: r.c.color }} title={`${L(r.c)} ${r.p.toFixed(1)}%`} />)}
            </div>
          )}
        </div>
        {rows.length === 0 ? <div className="text-center py-16" style={{ fontSize: 13, color: C.ink3 }}>{t("a.noMonth")}</div> : (
          <div style={{ background: C.surface, borderBottom: `1px solid ${C.hair}` }}>
            {rows.map((r) => (
              <div key={r.c.id} className="px-4 py-3" style={{ borderTop: `1px solid ${C.soft}` }}>
                <div className="flex items-center gap-2.5">
                  <Ico n={r.c.icon} c={r.c.color} s={16} />
                  <span className="truncate" style={{ fontSize: 14, color: C.ink }}>{L(r.c)}</span>
                  <span className="num ml-auto shrink-0" style={{ fontSize: 15, fontWeight: 600 }}>{money(r.v, unit)}</span>
                  <span className="num shrink-0" style={{ fontSize: 12, color: C.ink3, width: 40, textAlign: "right" }}>{r.p.toFixed(1)}%</span>
                </div>
                <div className="mt-2 rounded-full overflow-hidden" style={{ height: 4, background: C.soft }}>
                  <div style={{ width: `${r.p}%`, height: "100%", background: r.c.color }} /></div>
              </div>
            ))}
          </div>
        )}
        <div className="px-4 pt-5 pb-2 flex items-center gap-2">
          <span className="lab shrink-0">{t("a.budget")}</span>
          <span className="ml-auto truncate text-right" style={{ fontSize: 11, color: C.ink3 }}>{t("a.pace")}</span>
        </div>
        <div style={{ background: C.surface, borderTop: `1px solid ${C.hair}`, borderBottom: `1px solid ${C.hair}` }}>
          <BRow label={t("a.total")} budget={budgets.__t} spent={totalSpent} onEdit={() => edit("__t", budgets.__t)} />
          {cats.filter((c) => c.type === "expense").sort((a, b) => a.order - b.order).map((c) => (
            <BRow key={c.id} label={L(c)} color={c.color} icon={c.icon} budget={budgets[c.id]} spent={spentOf(c.id)} onEdit={() => edit(c.id, budgets[c.id])} />
          ))}
        </div>
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   报告页
   月度:当月支出占比。年度:全年占比 + 按月柱状。
   混币时按当前设置汇率折算到主币种,并标注 ≈。
   ═════════════════════════════════════════════════════════ */
function Donut({ slices, total, cur, approx, label }) {
  const R = 58, SW = 26, CIRC = 2 * Math.PI * R;
  let acc = 0;
  return (
    <svg width="190" height="190" viewBox="0 0 190 190" role="img" aria-label={label}>
      <circle cx="95" cy="95" r={R} fill="none" stroke={C.soft} strokeWidth={SW} />
      {slices.map((sl) => {
        const len = (sl.v / (total || 1)) * CIRC;
        const el = (
          <circle key={sl.c.id} cx="95" cy="95" r={R} fill="none" stroke={sl.c.color} strokeWidth={SW}
            strokeDasharray={`${len} ${CIRC - len}`} strokeDashoffset={-acc} transform="rotate(-90 95 95)" />
        );
        acc += len;
        return el;
      })}
      <text x="95" y="90" textAnchor="middle" style={{ fontSize: 10.5, fill: C.ink3 }}>{label}</text>
      <text x="95" y="110" textAnchor="middle" className="num" style={{ fontSize: 17, fontWeight: 600, fill: C.ink }}>
        {approx ? "≈" : ""}{money(total, cur)}
      </text>
    </svg>
  );
}

function Report({ txns, cats, cur, fx, y, m, setYm, main, favs }) {
  const { t } = useT(); const L = useLabel();
  const [mode, setMode] = useState("month");
  const [curSheet, setCurSheet] = useState(false);
  const [only, setOnly] = useState(null);        // null = 全部折算;否则只看该币种
  const yearly = mode === "year";

  const period = txns.filter((x) => x.type === "expense" &&
    (yearly ? x.date.startsWith(`${y}-`) : x.date.startsWith(`${y}-${String(m).padStart(2, "0")}`)));
  const used = [...new Set(period.map((x) => x.cur))];
  const multi = used.length > 1;
  const scope = only ? period.filter((x) => x.cur === only) : period;
  const unit = only || main;
  const { total, missing } = only ? { total: scope.reduce((a, x) => a + x.amount, 0), missing: [] } : sumOn(scope, main, fx);
  /* 出现过、且不是显示币种的那些币种,要在下面注明用了哪天的汇率 */
  const others = [...new Set(scope.map((x) => x.cur))].filter((k) => k !== unit);
  const dates = [...new Set(scope.map((x) => x.fxd || x.date))];
  /* 各币种原币小计 + 折算值,用于「全部」模式下的明细 */
  const allTotal = sumOn(period, main, fx).total;
  const perCur = used.map((k) => {
    const rows = period.filter((x) => x.cur === k);
    const raw = rows.reduce((a, x) => a + x.amount, 0);
    return { code: k, raw, conv: sumOn(rows, main, fx).total, n: rows.length };
  }).sort((a, b) => b.conv - a.conv);

  const slices = useMemo(() => {
    const map = {};
    scope.forEach((x) => { const v = only ? x.amount : convertOn(x.amount, x.cur, main, x.fxd || x.date, fx); if (v != null) map[x.cat] = (map[x.cat] || 0) + v; });
    return Object.entries(map)
      .map(([id, v]) => ({ c: cats.find((z) => z.id === +id), v, p: (v / (total || 1)) * 100 }))
      .filter((r) => r.c).sort((a, b) => b.v - a.v);
  }, [txns, y, m, mode, cats, main, fx, only]);

  const bars = useMemo(() => {
    if (!yearly) return [];
    return Array.from({ length: 12 }, (_, i) => {
      const k = `${y}-${String(i + 1).padStart(2, "0")}`;
      const rows = txns.filter((x) => x.type === "expense" && x.date.startsWith(k) && (!only || x.cur === only));
      return { m: i + 1, v: only ? rows.reduce((a, x) => a + x.amount, 0) : sumOn(rows, main, fx).total };
    });
  }, [txns, y, mode, main, fx, only]);
  const barMax = Math.max(1, ...bars.map((b) => b.v));

  const step = (d) => {
    if (yearly) return setYm([y + d, m]);
    const nm = m + d;
    setYm(nm < 1 ? [y - 1, 12] : nm > 12 ? [y + 1, 1] : [y, nm]);
  };

  return (
    <div className="flex flex-col h-full relative" style={{ background: C.page }}>
      <Bar title={t("rp.title")} right={
        <div className="flex items-center">
          <button onClick={() => step(-1)} className="p-1.5" aria-label="−"><ChevronLeft size={17} color={C.ink2} /></button>
          <span className="num" style={{ fontSize: 13.5, fontWeight: 600, minWidth: 58, textAlign: "center" }}>
            {yearly ? y : `${y}.${String(m).padStart(2, "0")}`}
          </span>
          <button onClick={() => step(1)} className="p-1.5" aria-label="+"><ChevronRight size={17} color={C.ink2} /></button>
        </div>} />

      <div className="px-4 py-3 flex items-center gap-2" style={{ background: C.surface, borderBottom: `1px solid ${C.hair}` }}>
        <Seg value={mode} onChange={setMode} items={[{ v: "month", t: t("rp.month") }, { v: "year", t: t("rp.year") }]} />
        {!only && <MainHint code={main} cls="ml-2" />}
        {only ? (
          <button onClick={() => setOnly(null)} className="ml-auto flex items-center gap-1 rounded-full px-2.5 py-1.5"
            style={{ background: C.ink, color: "#fff" }}>
            <span style={{ fontSize: 12 }}>{flag(only)}</span>
            <span className="num" style={{ fontSize: 11, fontWeight: 700 }}>{only}</span>
            <X size={12} />
          </button>
        ) : (
          <button onClick={() => setCurSheet(true)} disabled={used.length === 0}
            className="ml-auto flex items-center gap-1 rounded-full px-2.5 py-1.5" style={{ background: C.soft }}>
            <span style={{ fontSize: 11.5, color: used.length ? C.ink2 : C.ink3, fontWeight: 600 }}>{t("rp.byCur")}</span>
            <ChevronDown size={12} color={C.ink3} />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {slices.length === 0 ? (
          <div className="text-center py-20" style={{ fontSize: 13, color: C.ink3 }}>{t("rp.empty")}</div>
        ) : (
          <>
            <div className="flex justify-center py-5" style={{ background: C.surface, borderBottom: `1px solid ${C.hair}` }}>
              <Donut slices={slices} total={total} cur={unit} approx={false}
                label={only ? `${only} ${t("rp.total")}` : t("rp.total")} />
            </div>

            {missing.length > 0 && (
              <div className="px-4 py-2" style={{ fontSize: 11, color: C.out }}>{missing.length} · {t("x.noRate")}</div>
            )}

            <div style={{ background: C.surface, borderTop: `1px solid ${C.hair}`, borderBottom: `1px solid ${C.hair}` }}>
              {slices.map((r) => (
                <div key={r.c.id} className="flex items-center gap-2.5 px-4 py-3" style={{ borderTop: `1px solid ${C.soft}` }}>
                  <span style={{ width: 8, height: 8, borderRadius: 8, background: r.c.color }} />
                  <Ico n={r.c.icon} c={r.c.color} s={16} />
                  <span className="truncate" style={{ fontSize: 14, color: C.ink }}>{L(r.c)}</span>
                  <span className="num ml-auto shrink-0" style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{money(r.v, unit)}</span>
                  <span className="num shrink-0" style={{ fontSize: 12, color: C.ink3, width: 40, textAlign: "right" }}>{r.p.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </>
        )}

        {yearly && (
          <>
            <div className="px-4 pt-5 pb-2"><span className="lab">{t("rp.byMonth")}</span></div>
            <div className="px-4 pb-4" style={{ background: C.surface, borderTop: `1px solid ${C.hair}`, borderBottom: `1px solid ${C.hair}`, paddingTop: 14 }}>
              <div className="flex items-end gap-1" style={{ height: 132 }}>
                {bars.map((b) => {
                  const on = b.m === m, peak = b.v === barMax && b.v > 0;
                  return (
                    <button key={b.m} onClick={() => { setYm([y, b.m]); setMode("month"); }}
                      className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                      {b.v > 0 && (
                        <span className="num" style={{ fontSize: 8.5, color: peak ? C.ink : C.ink3 }}>
                          {Math.round(fromMinor(b.v, unit) / (fromMinor(barMax, unit) >= 10000 ? 1000 : 1))}
                          {fromMinor(barMax, unit) >= 10000 ? "k" : ""}
                        </span>
                      )}
                      <span className="w-full rounded-t" style={{
                        height: `${Math.max(b.v > 0 ? 3 : 1, (b.v / barMax) * 100)}%`,
                        background: on ? C.ink : b.v > 0 ? `rgba(20,22,26,${0.22 + (b.v / barMax) * 0.5})` : C.hair,
                      }} />
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-1 mt-1.5">
                {bars.map((b) => (
                  <span key={b.m} className="num flex-1 text-center" style={{ fontSize: 9.5, color: b.m === m ? C.ink : C.ink3 }}>{b.m}</span>
                ))}
              </div>
            </div>
          </>
        )}
        <div style={{ height: 16 }} />
      </div>

      {curSheet && (
        <Sheet title={t("rp.byCur")} onClose={() => setCurSheet(false)}>
          <button onClick={() => { setOnly(null); setCurSheet(false); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left" style={{ borderBottom: `1px solid ${C.soft}` }}>
            <span className="rounded-full flex items-center justify-center shrink-0"
              style={{ width: 26, height: 26, background: C.innSoft, color: C.brand, fontSize: 12, fontWeight: 700 }}>Σ</span>
            <span className="flex-1" style={{ fontSize: 14, color: C.ink }}>{t("rp.all")}</span>
            <span className="num shrink-0" style={{ fontSize: 13, color: C.ink }}>{money(allTotal, main)}</span>
            {!only && <Check size={16} color={C.brand} strokeWidth={2.6} />}
          </button>
          {used.map((k) => {
            const r = perCur.find((z) => z.code === k);
            return (
              <button key={k} onClick={() => { setOnly(k); setCurSheet(false); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left" style={{ borderBottom: `1px solid ${C.soft}` }}>
                <span style={{ fontSize: 22 }}>{flag(k)}</span>
                <span className="num shrink-0" style={{ fontSize: 12, fontWeight: 700, color: C.ink2, width: 34 }}>{k}</span>
                <span className="flex-1 truncate" style={{ fontSize: 14, color: C.ink }}>{t(`cur.${k}`)}</span>
                <span className="num shrink-0" style={{ fontSize: 13, color: C.ink }}>{money(r?.raw ?? 0, k)}</span>
                {only === k && <Check size={16} color={C.brand} strokeWidth={2.6} />}
              </button>
            );
          })}
          {used.length === 0 && <div className="text-center py-10" style={{ fontSize: 13, color: C.ink3 }}>—</div>}
        </Sheet>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   固定支出
   ═════════════════════════════════════════════════════════ */
function FixedCosts({ fixed, setFixed, cats, txns, onCatchUp, onBack, cur, fx }) {
  const { t } = useT(); const L = useLabel();
  const [draft, setDraft] = useState(null);
  const [curSheet, setCurSheet] = useState(false);
  const pending = pendingFixed(fixed, txns);
  const monthly = sumOn(fixed.filter((f) => f.on).map((f) => ({ amount: f.amount, cur: f.cur || cur, date: TODAY })), cur, fx).total;
  const expCats = cats.filter((c) => c.type === "expense").sort((a, b) => a.order - b.order);

  if (draft) {
    const isNew = draft.id == null;
    const save = () => {
      const a = Math.abs(+draft.amountStr || 0);
      if (!draft.name.trim() || a <= 0) return;
      const item = { id: draft.id, i18n: draft.i18n || null, name: draft.name.trim(), cat: draft.cat, amount: a,
        cur: draft.cur || cur, day: draft.day, start: draft.start, on: draft.on };
      setFixed((fs) => isNew ? [...fs, { ...item, id: Math.max(0, ...fs.map((f) => f.id)) + 1 }] : fs.map((f) => (f.id === item.id ? item : f)));
      setDraft(null);
    };
    return (
      <div className="flex flex-col h-full relative" style={{ background: C.page }}>
        <Bar title={isNew ? t("f.new") : t("f.edit")} left={<Back on={() => setDraft(null)} />} />
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-4 pb-2"><span className="lab">{t("q.name")}</span></div>
          <input autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value, i18n: null })} placeholder={t("f.namePh")}
            className="w-full px-4 py-3 outline-none" style={{ background: C.surface, borderTop: `1px solid ${C.hair}`, borderBottom: `1px solid ${C.hair}`, fontSize: 16, color: C.ink }} />

          <div className="px-4 pt-4 pb-2"><span className="lab">{t("q.amount")}</span></div>
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: C.surface, borderTop: `1px solid ${C.hair}`, borderBottom: `1px solid ${C.hair}` }}>
            <button onClick={() => setCurSheet(true)} className="flex items-center gap-1 rounded-md px-2 py-1 shrink-0" style={{ background: C.soft }}>
              <span className="num" style={{ fontSize: 11, fontWeight: 600, color: C.ink2 }}>{draft.cur || cur}</span>
              <span className="whitespace-nowrap" style={{ fontSize: 12, color: C.ink }}>{t(`cur.${draft.cur || cur}`)}</span>
              <ChevronDown size={13} color={C.ink3} />
            </button>
            <input value={draft.amountStr} inputMode="numeric" placeholder="5060"
              onChange={(e) => setDraft({ ...draft, amountStr: e.target.value.replace(/[^\d.]/g, "") })}
              className="num flex-1 min-w-0 outline-none text-right bg-transparent" style={{ fontSize: 24, fontWeight: 600, color: C.ink }} />
          </div>

          <div className="px-4 pt-4 pb-2"><span className="lab">{t("f.day")}</span></div>
          <div className="grid grid-cols-8 gap-1.5 px-4">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <button key={d} onClick={() => setDraft({ ...draft, day: d })} className="num rounded-md py-2"
                style={{ background: draft.day === d ? C.ink : C.surface, color: draft.day === d ? "#fff" : C.ink2,
                  border: `0.5px solid ${draft.day === d ? C.ink : C.hair}`, fontSize: 12 }}>{d}</button>
            ))}
          </div>
          <div className="px-4 pt-2" style={{ fontSize: 11, color: C.ink3, lineHeight: 1.6 }}>{t("f.dayHint")}</div>

          <div className="px-4 pt-4 pb-2"><span className="lab">{t("r.category")}</span></div>
          <div className="grid grid-cols-5 gap-2 px-4">
            {expCats.map((c) => (
              <button key={c.id} onClick={() => setDraft({ ...draft, cat: c.id })} className="flex flex-col items-center gap-1 rounded-lg py-2.5 px-1"
                style={{ background: C.surface, border: `1px solid ${draft.cat === c.id ? C.ink : C.hair}` }}>
                <Ico n={c.icon} c={c.color} s={17} />
                <span className="truncate w-full text-center" style={{ fontSize: 10.5, color: C.ink }}>{L(c)}</span>
              </button>
            ))}
          </div>

          <div className="px-4 pt-4 pb-2"><span className="lab">{t("f.start")}</span></div>
          <div className="flex items-center px-4 py-3" style={{ background: C.surface, borderTop: `1px solid ${C.hair}`, borderBottom: `1px solid ${C.hair}` }}>
            <input type="month" value={draft.start} onChange={(e) => e.target.value && setDraft({ ...draft, start: e.target.value })}
              className="num flex-1 outline-none bg-transparent" style={{ fontSize: 14, color: C.ink }} />
          </div>
          <div className="px-4 pt-2" style={{ fontSize: 11, color: C.ink3, lineHeight: 1.6 }}>{t("f.startHint")}</div>

          <div className="p-4 flex gap-2">
            {!isNew && (
              <button onClick={() => { setFixed((fs) => fs.filter((f) => f.id !== draft.id)); setDraft(null); }}
                className="rounded-lg px-4 py-3" style={{ background: C.surface, border: `1px solid ${C.hair}`, color: C.out }}><Trash2 size={17} /></button>
            )}
            <button onClick={save} className="flex-1 rounded-lg py-3" style={{ background: C.brand, color: "#fff", fontSize: 15, fontWeight: 600, borderRadius: C.R }}>{t("g.save")}</button>
          </div>
        </div>
        {curSheet && <CurrencySheet value={draft.cur || cur} onPick={(v) => setDraft({ ...draft, cur: v })} onClose={() => setCurSheet(false)} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: C.page }}>
      <Bar title={t("f.title")} left={<Back on={onBack} />} right={
        <button onClick={() => setDraft({ id: null, i18n: null, name: "", cat: 10, amountStr: "", cur, day: 1, start: TODAY.slice(0, 7), on: true })}
          className="p-1" aria-label={t("g.new")}><Plus size={20} color={C.ink} /></button>} />
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-baseline gap-2 px-4 py-3.5" style={{ background: C.surface, borderBottom: `1px solid ${C.hair}` }}>
          <div className="min-w-0">
            <div className="lab">{t("f.monthly")}</div>
            <div className="num" style={{ fontSize: 22, fontWeight: 600, color: C.ink }}>{money(monthly, cur)}</div>
          </div>
          <span className="num ml-auto shrink-0" style={{ fontSize: 11.5, color: C.ink3 }}>{fixed.filter((f) => f.on).length} {t("f.enabled")}</span>
        </div>

        {pending.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#FFF8E6", borderBottom: `1px solid ${C.hair}` }}>
            <AlertTriangle size={15} color="#8A6D3B" className="shrink-0" />
            <span className="truncate" style={{ fontSize: 12.5, color: "#8A6D3B" }}>{pending.length} {t("f.pending")}</span>
            <button onClick={onCatchUp} className="ml-auto shrink-0 rounded-md px-2.5 py-1" style={{ background: C.ink, color: "#fff", fontSize: 12, fontWeight: 600 }}>
              {t("f.catchUp")}</button>
          </div>
        )}

        <div style={{ background: C.surface, borderTop: `1px solid ${C.hair}` }}>
          {fixed.map((f) => {
            const c = cats.find((z) => z.id === f.cat);
            return (
              <div key={f.id} className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: `1px solid ${C.soft}`, opacity: f.on ? 1 : 0.45 }}>
                <button onClick={() => setDraft({ ...f, name: L(f), cur: f.cur || cur, amountStr: String(f.amount) })} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                  <Tile icon={c?.icon} color={c?.color} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate" style={{ fontSize: 14.5, color: C.ink }}>{L(f)}</div>
                    <div className="truncate" style={{ fontSize: 11.5, color: C.ink3 }}>{t("f.every")} {f.day}{t("f.day2")} · {L(c)}</div>
                  </div>
                  <span className="num shrink-0" style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{money(f.amount, f.cur || cur)}</span>
                </button>
                <button onClick={() => setFixed((fs) => fs.map((z) => (z.id === f.id ? { ...z, on: !z.on } : z)))} className="rounded-full shrink-0"
                  aria-label={L(f)} style={{ width: 36, height: 21, background: f.on ? C.ink : C.line, padding: 2, display: "flex", justifyContent: f.on ? "flex-end" : "flex-start" }}>
                  <span style={{ width: 17, height: 17, borderRadius: 17, background: "#fff", display: "block" }} />
                </button>
              </div>
            );
          })}
        </div>
        {fixed.length === 0 && <div className="text-center py-16" style={{ fontSize: 13, color: C.ink3 }}>{t("f.empty")}</div>}
        <div className="px-4 py-4" style={{ fontSize: 11.5, color: C.ink3, lineHeight: 1.7 }}>{t("f.foot")}</div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   快捷输入管理
   ═════════════════════════════════════════════════════════ */
function QuickEditor({ quicks, setQuicks, cats, onBack, cur }) {
  const { t } = useT(); const L = useLabel();
  const [draft, setDraft] = useState(null);
  const [curSheet, setCurSheet] = useState(false);
  const dnd = useDragSort(quicks.map((q) => q.id), (ids) =>
    setQuicks((qs) => ids.map((id) => qs.find((q) => q.id === id)).filter(Boolean)));
  if (draft) {
    const isNew = draft.id == null;
    const list = cats.filter((c) => c.type === draft.type).sort((a, b) => a.order - b.order);
    const save = () => {
      if (!draft.name.trim()) return;
      const item = { id: draft.id, i18n: draft.i18n || null, name: draft.name.trim(), cat: draft.cat, type: draft.type,
        cur: draft.cur || cur, amount: draft.fixed ? Math.abs(+draft.amountStr || 0) : null };
      setQuicks((qs) => isNew ? [...qs, { ...item, id: Math.max(0, ...qs.map((q) => q.id)) + 1 }] : qs.map((q) => (q.id === item.id ? item : q)));
      setDraft(null);
    };
    return (
      <div className="flex flex-col h-full relative" style={{ background: C.page }}>
        <Bar title={isNew ? t("q.new") : t("q.edit")} left={<Back on={() => setDraft(null)} />} />
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-4 pb-2"><span className="lab">{t("q.name")}</span></div>
          <input autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value, i18n: null })} placeholder={t("q.namePh")}
            className="w-full px-4 py-3 outline-none" style={{ background: C.surface, borderTop: `1px solid ${C.hair}`, borderBottom: `1px solid ${C.hair}`, fontSize: 16, color: C.ink }} />
          <div className="px-4 pt-4 pb-2"><span className="lab">{t("q.type")}</span></div>
          <div className="px-4 pb-2 flex">
            <Seg value={draft.type} onChange={(v) => setDraft({ ...draft, type: v, cat: cats.find((c) => c.type === v).id })}
              items={[{ v: "expense", t: t("t.expense") }, { v: "income", t: t("t.income") }]} />
          </div>
          <div className="px-4 pt-3 pb-2"><span className="lab">{t("r.category")}</span></div>
          <div className="grid grid-cols-5 gap-2 px-4">
            {list.map((c) => (
              <button key={c.id} onClick={() => setDraft({ ...draft, cat: c.id })} className="flex flex-col items-center gap-1 rounded-lg py-2.5 px-1"
                style={{ background: C.surface, border: `1px solid ${draft.cat === c.id ? C.ink : C.hair}` }}>
                <Ico n={c.icon} c={c.color} s={17} />
                <span className="truncate w-full text-center" style={{ fontSize: 10.5, color: C.ink }}>{L(c)}</span>
              </button>
            ))}
          </div>
          <div className="px-4 pt-4 pb-2"><span className="lab">{t("q.amount")}</span></div>
          <div style={{ background: C.surface, borderTop: `1px solid ${C.hair}`, borderBottom: `1px solid ${C.hair}` }}>
            {[[false, t("q.varies"), t("q.variesD")], [true, t("q.fixed"), t("q.fixedD")]].map(([v, ti, d]) => (
              <button key={String(v)} onClick={() => setDraft({ ...draft, fixed: v })} className="w-full flex items-start gap-3 px-4 py-3 text-left"
                style={{ borderTop: v ? `1px solid ${C.soft}` : "none" }}>
                <span className="shrink-0 rounded-full flex items-center justify-center"
                  style={{ width: 18, height: 18, marginTop: 1, border: `1.5px solid ${draft.fixed === v ? C.ink : C.hair}`, background: draft.fixed === v ? C.ink : "transparent" }}>
                  {draft.fixed === v && <Check size={11} color="#fff" strokeWidth={3} />}</span>
                <div><div style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{ti}</div>
                  <div style={{ fontSize: 11.5, color: C.ink3, marginTop: 1 }}>{d}</div></div>
              </button>
            ))}
            {draft.fixed && (
              <div className="flex items-center gap-2 px-4 py-3" style={{ borderTop: `1px solid ${C.soft}` }}>
                <button onClick={() => setCurSheet(true)} className="flex items-center gap-1 rounded-md px-2 py-1 shrink-0" style={{ background: C.soft }}>
                  <span className="num" style={{ fontSize: 11, fontWeight: 600, color: C.ink2 }}>{draft.cur || cur}</span>
                  <span className="whitespace-nowrap" style={{ fontSize: 12, color: C.ink }}>{t(`cur.${draft.cur || cur}`)}</span>
                  <ChevronDown size={13} color={C.ink3} />
                </button>
                <input value={draft.amountStr} inputMode="numeric" placeholder="230"
                  onChange={(e) => setDraft({ ...draft, amountStr: e.target.value.replace(/[^\d.]/g, "") })}
                  className="num flex-1 min-w-0 outline-none text-right bg-transparent" style={{ fontSize: 20, fontWeight: 600, color: C.ink }} />
              </div>
            )}
          </div>
          <div className="p-4 flex gap-2">
            {!isNew && (
              <button onClick={() => { setQuicks((qs) => qs.filter((q) => q.id !== draft.id)); setDraft(null); }}
                className="rounded-lg px-4 py-3" style={{ background: C.surface, border: `1px solid ${C.hair}`, color: C.out }}><Trash2 size={17} /></button>
            )}
            <button onClick={save} className="flex-1 rounded-lg py-3" style={{ background: C.brand, color: "#fff", fontSize: 15, fontWeight: 600, borderRadius: C.R }}>{t("g.save")}</button>
          </div>
        </div>
        {curSheet && <CurrencySheet value={draft.cur || cur} onPick={(v) => setDraft({ ...draft, cur: v })} onClose={() => setCurSheet(false)} />}
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full" style={{ background: C.page }}>
      <Bar title={t("q.title")} left={<Back on={onBack} />} right={
        <button onClick={() => setDraft({ id: null, i18n: null, name: "", cat: 1, type: "expense", cur, fixed: false, amountStr: "" })} className="p-1" aria-label={t("g.new")}>
          <Plus size={20} color={C.ink} /></button>} />
      <div className="flex-1 overflow-y-auto">
        <div style={{ background: C.surface, borderTop: `1px solid ${C.hair}` }}>
          {quicks.map((q) => {
            const c = cats.find((z) => z.id === q.cat);
            return (
              <div key={q.id} ref={dnd.bindRow(q.id).ref}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                style={{ borderBottom: `1px solid ${C.soft}`, ...dnd.bindRow(q.id).style }}>
                <span {...dnd.bindHandle(q.id)} className="shrink-0 -ml-1 p-1">
                  <GripVertical size={16} color={dnd.drag?.id === q.id ? C.ink : C.line} />
                </span>
                <Tile icon={c?.icon} color={c?.color} />
                <button onClick={() => setDraft({ ...q, name: L(q), cur: q.cur || cur, fixed: q.amount != null, amountStr: q.amount != null ? String(q.amount) : "" })}
                  className="min-w-0 flex-1 text-left">
                  <div className="truncate" style={{ fontSize: 14.5, color: C.ink }}>{L(q)}</div>
                  <div className="truncate" style={{ fontSize: 11.5, color: C.ink3 }}>{L(c)} · {q.amount != null ? `${t("q.fixed")} · ${q.cur || cur}` : t("q.varies")}</div>
                </button>
                {q.amount != null && <span className="num shrink-0" style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{q.amount.toLocaleString("en-US")}</span>}
                <button onClick={() => setDraft({ ...q, name: L(q), cur: q.cur || cur, fixed: q.amount != null, amountStr: q.amount != null ? String(q.amount) : "" })}
                  className="shrink-0 p-1" aria-label={t("q.edit")}>
                  <ChevronRight size={15} color={C.line} />
                </button>
              </div>
            );
          })}
        </div>
        {quicks.length === 0 && <div className="text-center py-16" style={{ fontSize: 13, color: C.ink3 }}>{t("q.empty")}</div>}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   分类管理
   ═════════════════════════════════════════════════════════ */
const PICK_COLORS = ["#D4644A","#C99A2E","#5B9E6F","#4FA3A3","#5B8FC7","#4A6FA5","#7B6BB5","#A05C9E","#C2668E","#B5716B","#8C6E52","#6E7A8A","#3F8FA8","#3E8E5A","#9AA0A8"];

function CatEditor({ cats, setCats, onBack }) {
  const { t } = useT(); const L = useLabel();
  const [side, setSide] = useState("expense");
  const [draft, setDraft] = useState(null);
  const list = cats.filter((c) => c.type === side).sort((a, b) => a.order - b.order);
  const dnd = useDragSort(list.map((c) => c.id), (ids) =>
    setCats((cs) => cs.map((c) => {
      const i = ids.indexOf(c.id);
      return i < 0 ? c : { ...c, order: i + 1 };
    })));
  if (draft) return (
    <div className="flex flex-col h-full" style={{ background: C.page }}>
      <Bar title={t("c.new")} left={<Back on={() => setDraft(null)} />} />
      <div className="flex-1 overflow-y-auto">
        <input autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder={t("c.namePh")}
          className="w-full px-4 py-3.5 outline-none" style={{ background: C.surface, borderTop: `1px solid ${C.hair}`, borderBottom: `1px solid ${C.hair}`, fontSize: 16 }} />
        <div className="px-4 pt-4 pb-2"><span className="lab">{t("c.icon")}</span></div>
        {ICON_GROUPS.map((g) => (
          <div key={g.key}>
            <div className="px-4 pt-2 pb-1.5" style={{ fontSize: 11, color: C.ink3 }}>{t(g.key)}</div>
            <div className="grid grid-cols-6 gap-2 px-4">
              {g.icons.map((n) => {
                const on = draft.icon === n;
                return (
                  <button key={n} onClick={() => setDraft({ ...draft, icon: n })}
                    className="flex justify-center rounded-lg py-3"
                    style={{ background: on ? `${draft.color}16` : C.surface,
                      boxShadow: `inset 0 0 0 ${on ? 2 : 1}px ${on ? draft.color : C.hair}` }}>
                    <Ico n={n} c={on ? draft.color : C.ink2} s={18} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div className="px-4 pt-4 pb-2"><span className="lab">{t("c.color")}</span></div>
        <div className="grid grid-cols-8 gap-2 px-4">
          {PICK_COLORS.map((c) => (
            <button key={c} onClick={() => setDraft({ ...draft, color: c })} className="rounded-lg"
              style={{ aspectRatio: "1", background: c, outline: draft.color === c ? `2px solid ${C.ink}` : "none", outlineOffset: 2 }} />
          ))}
        </div>
        <div className="p-4">
          <button onClick={() => {
            if (!draft.name.trim()) return;
            setCats((cs) => [...cs, { ...draft, id: Math.max(...cs.map((c) => c.id)) + 1, k: `c${Date.now()}`, i18n: null,
              name: draft.name.trim(), order: cs.filter((c) => c.type === draft.type).length + 1 }]);
            setDraft(null);
          }} className="w-full rounded-lg py-3" style={{ background: C.brand, color: "#fff", fontSize: 15, fontWeight: 600, borderRadius: C.R }}>{t("g.save")}</button>
        </div>
      </div>
    </div>
  );
  return (
    <div className="flex flex-col h-full" style={{ background: C.page }}>
      <Bar title={t("c.title")} left={<Back on={onBack} />} right={
        <button onClick={() => setDraft({ name: "", icon: "Utensils", color: PICK_COLORS[0], type: side })} className="p-1" aria-label={t("g.new")}>
          <Plus size={20} color={C.ink} /></button>} />
      <div className="px-4 py-3 flex"><Seg value={side} onChange={setSide} items={[{ v: "expense", t: t("t.expense") }, { v: "income", t: t("t.income") }]} /></div>
      <div className="flex-1 overflow-y-auto">
        <div style={{ background: C.surface, borderTop: `1px solid ${C.hair}` }}>
          {list.map((c) => {
            const row = dnd.bindRow(c.id);
            return (
              <div key={c.id} ref={row.ref} className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: `1px solid ${C.soft}`, ...row.style }}>
                <span {...dnd.bindHandle(c.id)} className="shrink-0 -ml-1 p-1">
                  <GripVertical size={16} color={dnd.drag?.id === c.id ? C.ink : C.line} />
                </span>
                <Tile icon={c.icon} color={c.color} />
                <span className="truncate" style={{ fontSize: 14.5, color: C.ink }}>{L(c)}</span>
                <ChevronRight size={15} color={C.hair} className="ml-auto shrink-0" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   导入（界面骨架）
   ═════════════════════════════════════════════════════════ */
function Importer({ onBack, cur, favs, cats, setCats, txns, onImport, batches, addBatch, fx }) {
  const { t } = useT(); const L = useLabel();
  const [stage, setStage] = useState("pick");        // pick | preview | done
  const [file, setFile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [impCur, setImpCur] = useState(cur);
  const [oddMode, setOddMode] = useState("keep");    // keep | expense | skip
  const [curSheet, setCurSheet] = useState(false);
  const [err, setErr] = useState(null);
  const [result, setResult] = useState(null);

  const existingKeys = useMemo(() => new Set(txns.filter((x) => x.srcKey).map((x) => x.srcKey)), [txns]);

  const onFile = async (f) => {
    if (!f) return;
    setErr(null); setFile(f); setStage("reading");
    try {
      const text = await f.text();
      const p = buildImportPlan(text, { cutoff: TODAY, existingCats: cats, existingKeys });
      if (!p.stats.total) { setErr(t("i.badFile")); setStage("pick"); return; }
      if (batches.some((b) => b.hash === p.hash)) setErr(t("i.dupFile"));
      setPlan(p); setStage("preview");
    } catch {
      setErr(t("i.badFile")); setStage("pick");
    }
  };

  /* 一次性写入。任一步抛错就整批放弃,不留半套数据 */
  const run = () => {
    try {
      const oddKeys = new Set(plan.suspicious.map((x) => x.key));
      const rows = plan.rows
        .filter((r) => !(oddMode === "skip" && oddKeys.has(r.key)))
        .map((r) => ({
          id: `imp_${plan.hash}_${r.key}`,
          type: oddMode === "expense" && oddKeys.has(r.key) ? "expense" : r.type,
          amount: toMinor(r.amount, impCur), cur: impCur, cat: r.cat, date: r.date,
          name: r.name, i18n: null, fx: null, fxd: ratesOn(fx, r.date)?.at ?? null,
          srcKey: r.key, srcBatch: plan.hash,
        }));
      if (plan.catsToCreate.length) setCats((cs) => [...cs, ...plan.catsToCreate]);
      onImport(rows);
      addBatch({
        hash: plan.hash, file: file?.name || "", cur: impCur, at: TODAY,
        total: plan.stats.total, imported: rows.length,
        future: plan.stats.future, errors: plan.stats.errors, duplicate: plan.stats.duplicate,
      });
      setResult({ n: rows.length, cats: plan.catsToCreate.length });
      setStage("done");
    } catch {
      setErr(t("i.rollback")); setStage("preview");
    }
  };

  const Stat = ({ k, v, warn }) => (
    <div className="px-4 py-3 min-w-0" style={{ background: C.surface }}>
      <div className="lab truncate">{k}</div>
      <div className="num" style={{ fontSize: 20, fontWeight: 700, color: warn ? C.out : C.ink, marginTop: 2 }}>{v}</div>
    </div>
  );

  return (
    <div className="flex flex-col h-full relative" style={{ background: C.page }}>
      <Bar title={t("s.import")} left={<Back on={onBack} />} />

      {err && (
        <div className="mx-4 mt-3 rounded-lg px-3 py-2.5" style={{ background: C.warn }}>
          <span style={{ fontSize: 12, color: C.warnInk, lineHeight: 1.6 }}>{err}</span>
        </div>
      )}

      {stage === "pick" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <Upload size={34} color={C.line} strokeWidth={1.6} />
          <div className="mt-3 text-center" style={{ fontSize: 12.5, color: C.ink3, lineHeight: 1.7 }}>{t("s.importSub")}</div>
          <label className="mt-5 px-5 py-3 cursor-pointer"
            style={{ background: C.brand, color: "#fff", fontSize: 14.5, fontWeight: 600, borderRadius: C.R }}>
            {t("i.pick")}
            <input type="file" accept=".csv,text/csv" className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
        </div>
      )}

      {stage === "reading" && (
        <div className="flex-1 flex items-center justify-center" style={{ fontSize: 13, color: C.ink3 }}>{t("i.reading")}…</div>
      )}

      {stage === "preview" && plan && (
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: C.surface, borderBottom: `1px solid ${C.hair}` }}>
            <Upload size={16} color={C.ink2} className="shrink-0" />
            <span className="truncate num" style={{ fontSize: 12.5, color: C.ink }}>{file?.name}</span>
            <label className="ml-auto shrink-0 cursor-pointer" style={{ fontSize: 11.5, color: C.brand }}>
              {t("i.again")}
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-px mt-3" style={{ background: C.hair, borderTop: `1px solid ${C.hair}`, borderBottom: `1px solid ${C.hair}` }}>
            <Stat k={t("i.total")} v={plan.stats.total.toLocaleString("en-US")} />
            <Stat k={t("i.ready")} v={plan.stats.ready.toLocaleString("en-US")} />
            <Stat k={t("i.future")} v={plan.stats.future.toLocaleString("en-US")} />
            <Stat k={t("i.cats")} v={plan.stats.cats} />
            <Stat k={t("i.rules")} v={plan.stats.rules} />
            <Stat k={t("i.odd")} v={plan.stats.suspicious} warn={plan.stats.suspicious > 0} />
            {plan.stats.duplicate > 0 && <Stat k={t("i.dupRows")} v={plan.stats.duplicate} />}
            {plan.stats.errors > 0 && <Stat k={t("i.errRows")} v={plan.stats.errors} warn />}
          </div>

          <div className="flex items-center gap-2 px-4 py-3.5 mt-3" style={{ background: C.surface, borderTop: `1px solid ${C.hair}`, borderBottom: `1px solid ${C.hair}` }}>
            <span className="flex-1 min-w-0 truncate" style={{ fontSize: 14, color: C.ink }}>{t("i.defCur")}</span>
            <button onClick={() => setCurSheet(true)} className="flex items-center gap-1 rounded-full px-2.5 py-1 shrink-0" style={{ background: C.soft }}>
              <span style={{ fontSize: 13 }}>{flag(impCur)}</span>
              <span className="num" style={{ fontSize: 11, fontWeight: 700, color: C.ink2 }}>{impCur}</span>
              <ChevronDown size={12} color={C.ink3} />
            </button>
          </div>

          {plan.suspicious.length > 0 && (
            <>
              <div className="flex items-center gap-1.5 px-4 pt-5 pb-1.5">
                <AlertTriangle size={14} color={C.out} />
                <span className="lab" style={{ color: C.out }}>{t("i.odd")}</span>
              </div>
              <div className="px-4 pb-2" style={{ fontSize: 11.5, color: C.ink3, lineHeight: 1.6 }}>{t("i.oddHint")}</div>
              <div style={{ background: C.surface, borderTop: `1px solid ${C.hair}`, borderBottom: `1px solid ${C.hair}` }}>
                {plan.suspicious.slice(0, 6).map((x, i) => (
                  <div key={x.key} className="flex items-center gap-2 px-4 py-2.5" style={{ borderTop: i ? `1px solid ${C.soft}` : "none" }}>
                    <div className="flex-1 min-w-0">
                      <div className="num truncate" style={{ fontSize: 12.5, color: C.ink }}>{x.date} · {x.name}</div>
                      <div className="truncate" style={{ fontSize: 11, color: C.ink3 }}>
                        {x.why === "typeClash" ? t("i.oddNote") : `${t("t.income")} · ${x.catName}`}
                      </div>
                    </div>
                    <span className="num shrink-0" style={{ fontSize: 13, color: C.inn }}>+{x.amount.toLocaleString("en-US")}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 pt-3 pb-1"><span className="lab">{t("i.oddAction")}</span></div>
              <div className="px-4 pb-2 flex gap-1.5">
                {[["keep", t("i.keepAll")], ["expense", t("i.toExpense")], ["skip", t("i.skipOdd")]].map(([v, label]) => (
                  <button key={v} onClick={() => setOddMode(v)} className="flex-1 rounded-full py-2"
                    style={{ background: oddMode === v ? C.ink : C.surface, color: oddMode === v ? "#fff" : C.ink2,
                      boxShadow: oddMode === v ? "none" : `inset 0 0 0 1px ${C.hair}`, fontSize: 12, fontWeight: 600 }}>
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="px-4 pt-4 pb-1.5"><span className="lab">{t("i.preview")}</span></div>
          <div style={{ background: C.surface, borderTop: `1px solid ${C.hair}`, borderBottom: `1px solid ${C.hair}` }}>
            {plan.rows.slice(0, 10).map((r, i) => {
              const c = [...cats, ...plan.catsToCreate].find((z) => z.id === r.cat);
              return (
                <div key={r.key} className="flex items-center gap-2.5 px-4 py-2.5" style={{ borderTop: i ? `1px solid ${C.soft}` : "none" }}>
                  <Tile icon={c?.icon} color={c?.color} size={26} ico={14} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate" style={{ fontSize: 13, color: C.ink }}>{r.name || L(c)}</div>
                    <div className="num truncate" style={{ fontSize: 11, color: C.ink3 }}>{r.date} · {L(c)}</div>
                  </div>
                  <span className="num shrink-0" style={{ fontSize: 13.5, color: r.type === "expense" ? C.ink : C.inn }}>
                    {r.type === "expense" ? "" : "+"}{money(toMinor(r.amount, impCur), impCur)}
                  </span>
                </div>
              );
            })}
          </div>

          {plan.warnings.length > 0 && (
            <div className="px-4 pt-3" style={{ fontSize: 10.5, color: C.ink3, lineHeight: 1.6 }}>
              {plan.warnings.join(" · ")}
            </div>
          )}

          <div className="p-4 flex gap-2">
            <button onClick={onBack} className="flex-1 py-3"
              style={{ background: C.surface, boxShadow: `inset 0 0 0 1px ${C.hair}`, fontSize: 15, color: C.ink, borderRadius: C.R }}>
              {t("i.cancel")}
            </button>
            <button onClick={run} disabled={plan.stats.ready === 0} className="flex-1 py-3"
              style={{ background: plan.stats.ready ? C.brand : C.line, color: "#fff", fontSize: 15, fontWeight: 600, borderRadius: C.R }}>
              {t("i.start")}
            </button>
          </div>
        </div>
      )}

      {stage === "done" && result && (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <span className="rounded-full flex items-center justify-center" style={{ width: 52, height: 52, background: C.innSoft }}>
            <Check size={26} color={C.brand} strokeWidth={2.6} />
          </span>
          <div className="mt-3" style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{t("i.done")}</div>
          <div className="num mt-1" style={{ fontSize: 13, color: C.ink2 }}>
            {t("i.imported")} {result.n.toLocaleString("en-US")}
            {result.cats > 0 ? ` · ${t("i.newCats")} ${result.cats}` : ""}
          </div>
          <button onClick={onBack} className="mt-5 px-6 py-3"
            style={{ background: C.ink, color: "#fff", fontSize: 14, fontWeight: 600, borderRadius: C.R }}>
            {t("g.back")}
          </button>
        </div>
      )}

      {curSheet && <CurrencySheet favs={favs} value={impCur} onPick={setImpCur} onClose={() => setCurSheet(false)} />}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   设置
   ═════════════════════════════════════════════════════════ */
function SettingsScreen({ go, cur, setCur, lang, setLang, fixed, pendingCount, fx, setFx, favs, setFavs, txns, cats }) {
  const { t } = useT();
  const L = useLabel();
  const [sheet, setSheet] = useState(null);
  const [draftFavs, setDraftFavs] = useState(() => [...(favs || [])]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);
  const added = (draftFavs || []).filter((c) => !(favs || []).includes(c));
  const exportCsv = () => {
    const catById = new Map((cats || []).map((c) => [c.id, c]));
    const out = [];
    out.push("#TRANSACTIONS");
    out.push(csvLine(["id", "date", "type", "amount", "currency", "categoryId", "category", "note", "rateDate"]));
    [...txns].sort((a, b) => `${a.date}-${a.id}`.localeCompare(`${b.date}-${b.id}`)).forEach((x) => {
      out.push(csvLine([x.id, x.date, x.type, fromMinor(x.amount, x.cur), x.cur, x.cat, L(catById.get(x.cat)), x.name || "", x.fxd || ""]));
    });
    out.push("");
    out.push("#CATEGORIES");
    out.push(csvLine(["id", "name", "type", "icon", "color", "order"]));
    [...(cats || [])].sort((a, b) => a.type.localeCompare(b.type) || a.order - b.order).forEach((c) => {
      out.push(csvLine([c.id, L(c), c.type, c.icon, c.color, c.order]));
    });
    out.push("");
    out.push("#FIXED_COSTS");
    out.push(csvLine(["id", "name", "type", "amount", "currency", "categoryId", "category", "enabled", "startDate"]));
    [...fixed].forEach((f) => {
      out.push(csvLine([f.id, L(f), f.type || "expense", fromMinor(f.amount, f.cur || cur), f.cur || cur, f.cat, L(catById.get(f.cat)), f.on ? "1" : "0", f.start || ""]));
    });
    out.push("");
    out.push("#EXCHANGE_RATES");
    out.push(csvLine(["date", "currency", "rateToJPY", "source"]));
    Object.entries(fx || {}).sort(([a], [b]) => a.localeCompare(b)).forEach(([date, rates]) => {
      Object.entries(rates).filter(([code]) => !code.startsWith("__")).sort(([a], [b]) => a.localeCompare(b)).forEach(([code, val]) => {
        out.push(csvLine([date, code, fxFmt(val / FX_SCALE), rates.__src || ""]));
      });
    });
    downloadText(`komorebi_kakeibo_${TODAY}.csv`, out.join("\n"));
  };

  /* 确认修改:新增的币种去补齐历史汇率,补的是【当时】的真实汇率,
     不是拿今天的汇率重算。已有的日期与币种一概不覆盖。 */
  const applyFavs = async () => {
    setFavs(draftFavs);
    const need = added.filter((c) => CUR[c]?.src === "api");
    if (!need.length) { setSheet("favs"); return; }
    setBusy(true);
    try {
      const from = earliestDate(txns) || TODAY;
      const byDay = await fetchSeries(need, from);
      const n = Object.keys(byDay).length;
      setFx((f) => mergeSeries(f, byDay, "api"));
      setNote({ text: t("x.backfillOk").replace("{n}", n) });
    } catch {
      setNote({ text: t("x.backfillFail"), warn: true });
    }
    setBusy(false);
    setSheet("favs");
  };
  const monthly = sumOn(fixed.filter((f) => f.on).map((f) => ({ amount: f.amount, cur: f.cur || cur, date: TODAY })), cur, fx).total;
  const Item = ({ ti, s, on, tail }) => (
    <button onClick={on} className="w-full flex items-center gap-2 px-4 py-3.5 text-left" style={{ borderBottom: `1px solid ${C.soft}` }}>
      <div className="flex-1 min-w-0">
        <div className="truncate" style={{ fontSize: 14.5, color: C.ink }}>{ti}</div>
        {s && <div className="truncate" style={{ fontSize: 11.5, color: C.ink3, marginTop: 1 }}>{s}</div>}
      </div>
      {tail}<ChevronRight size={15} color={C.hair} className="shrink-0" />
    </button>
  );
  return (
    <div className="flex flex-col h-full relative" style={{ background: C.page }}>
      <Bar title={t("nav.set")} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-2"><span className="lab">{t("s.groupRecord")}</span></div>
        <div style={{ background: C.surface, borderTop: `1px solid ${C.hair}` }}>
          <Item ti={t("q.title")} s={t("s.quick")} on={() => go("quick")} />
          <Item ti={t("f.title")} s={`${money(monthly, cur)} · ${fixed.filter((f) => f.on).length} ${t("s.fixedSub")}`} on={() => go("fixed")}
            tail={pendingCount > 0 && (
              <span className="num rounded-full px-2 py-0.5 shrink-0" style={{ background: "#FFF0CC", color: "#8A6D3B", fontSize: 11, fontWeight: 600 }}>
                {pendingCount} {t("f.badge")}</span>)} />
          <Item ti={t("c.title")} s={t("s.cats")} on={() => go("cats")} />
        </div>
        <div className="px-4 pt-5 pb-2"><span className="lab">{t("s.groupData")}</span></div>
        <div style={{ background: C.surface, borderTop: `1px solid ${C.hair}` }}>
          <Item ti={t("x.title")} s={t("x.sub")} on={() => go("fx")} />
          <Item ti={t("s.import")} s={t("s.importSub")} on={() => go("import")} />
          <Item ti={t("s.export")} on={exportCsv} />
        </div>
        <div className="px-4 pt-5 pb-2"><span className="lab">{t("s.groupGeneral")}</span></div>
        <div style={{ background: C.surface, borderTop: `1px solid ${C.hair}`, borderBottom: `1px solid ${C.hair}` }}>
          <button onClick={() => setSheet("cur")} className="w-full flex items-center gap-2 px-4 py-3.5 text-left" style={{ borderBottom: `1px solid ${C.soft}` }}>
            <span className="flex-1 min-w-0 truncate" style={{ fontSize: 14.5, color: C.ink }}>{t("s.currency")}</span>
            <span className="num shrink-0" style={{ fontSize: 11.5, fontWeight: 600, color: C.ink3 }}>{cur}</span>
            <span className="shrink-0 truncate" style={{ fontSize: 13.5, color: C.ink2, maxWidth: 110 }}>{t(`cur.${cur}`)}</span>
            <ChevronRight size={15} color={C.hair} className="shrink-0" />
          </button>
          <button onClick={() => setSheet("favs")} className="w-full flex items-center gap-2 px-4 py-3.5 text-left"
            style={{ borderBottom: `1px solid ${C.soft}` }}>
            <span className="flex-1 min-w-0 truncate" style={{ fontSize: 14.5, color: C.ink }}>{t("x.favs")}</span>
            <span className="truncate" style={{ fontSize: 13 }}>{favs.slice(0, 5).map((c) => flag(c)).join("")}</span>
            <ChevronRight size={15} color={C.hair} className="shrink-0" />
          </button>
          <button onClick={() => setSheet("lang")} className="w-full flex items-center gap-2 px-4 py-3.5 text-left">
            <Languages size={17} color={C.ink2} className="shrink-0" />
            <span className="flex-1 min-w-0 truncate" style={{ fontSize: 14.5, color: C.ink }}>{t("s.language")}</span>
            <span className="shrink-0" style={{ fontSize: 13.5, color: C.ink2 }}>{LANGS.find((l) => l.c === lang)?.native}</span>
            <ChevronRight size={15} color={C.hair} className="shrink-0" />
          </button>
        </div>
        <div style={{ height: 16 }} />
      </div>

      {sheet === "cur" && <CurrencySheet favs={favs} value={cur} onPick={setCur} onClose={() => setSheet(null)} />}
      {sheet === "favs" && (
        <Sheet title={t("x.favs")} onClose={() => setSheet(null)}>
          <div className="px-4 py-2" style={{ fontSize: 11.5, color: C.ink3, lineHeight: 1.6 }}>{t("x.favsHint")}</div>
          {note && (
            <div className="mx-3 mb-2 rounded-lg px-3 py-2" style={{ background: note.warn ? C.warn : C.innSoft }}>
              <span style={{ fontSize: 11.5, color: note.warn ? C.warnInk : C.brand, lineHeight: 1.5 }}>{note.text}</span>
            </div>
          )}
          <div className="px-3 pb-2"><span className="lab">{t("x.favsView")}</span></div>
          <div className="px-3 pb-3">
            {favs.map((c) => (
              <div key={c} className="flex items-center gap-3 px-2 py-2.5" style={{ borderBottom: `1px solid ${C.soft}` }}>
                <span style={{ fontSize: 20 }}>{flag(c)}</span>
                <span className="num shrink-0" style={{ fontSize: 12, fontWeight: 700, color: C.ink2, width: 34 }}>{c}</span>
                <span className="flex-1 truncate" style={{ fontSize: 14, color: C.ink }}>{t(`cur.${c}`)}</span>
              </div>
            ))}
          </div>
          <div className="px-3 pb-4">
            <button onClick={() => { setDraftFavs([...favs]); setSheet("favsEdit"); }}
              className="w-full py-3" style={{ background: C.ink, color: "#fff", fontSize: 14, fontWeight: 600, borderRadius: C.R }}>
              {t("x.editFavs")}
            </button>
          </div>
        </Sheet>
      )}

      {sheet === "favsEdit" && (
        <Sheet title={t("x.editFavs")} onClose={() => setSheet("favs")}>
          <div className="px-4 py-2" style={{ fontSize: 11.5, color: C.ink3 }}>{t("x.favsHint")}</div>
          <div className="grid grid-cols-3 gap-2 px-3 pb-3">
            {Object.keys(CUR).map((c) => {
              const on = draftFavs.includes(c);
              return (
                <button key={c} disabled={c === cur}
                  onClick={() => setDraftFavs(on ? draftFavs.filter((x) => x !== c) : [...draftFavs, c])}
                  className="flex items-center gap-1.5 px-2 py-2"
                  style={{ borderRadius: C.r, background: on ? C.innSoft : C.surface, opacity: c === cur ? 0.6 : 1,
                    boxShadow: `inset 0 0 0 ${on ? 1.5 : 1}px ${on ? C.brand : C.hair}` }}>
                  <span style={{ fontSize: 15 }}>{flag(c)}</span>
                  <span className="num truncate" style={{ fontSize: 11.5, fontWeight: on ? 700 : 500, color: on ? C.brand : C.ink2 }}>{c}</span>
                  {!favs.includes(c) && draftFavs.includes(c) && (
                    <span className="ml-auto shrink-0 rounded-full px-1 py-0.5"
                      style={{ background: C.brand, color: "#fff", fontSize: 8.5, fontWeight: 700 }}>{t("x.newCur")}</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="px-3 pb-4 flex gap-2">
            <button onClick={() => setSheet("favs")} className="flex-1 py-3"
              style={{ background: C.surface, boxShadow: `inset 0 0 0 1px ${C.hair}`, fontSize: 14, color: C.ink, borderRadius: C.R }}>
              {t("x.cancel")}
            </button>
            <button onClick={() => draftFavs.length >= 1 && setSheet("favsConfirm")} disabled={draftFavs.length < 1}
              className="flex-1 py-3" style={{ background: draftFavs.length >= 1 ? C.brand : C.line, color: "#fff", fontSize: 14, fontWeight: 600, borderRadius: C.R }}>
              {draftFavs.length >= 1 ? t("x.confirm") : t("x.min1")}
            </button>
          </div>
        </Sheet>
      )}

      {sheet === "favsConfirm" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center px-8" style={{ background: "rgba(31,41,51,.4)" }}>
          <div className="w-full p-4" style={{ background: C.surface, borderRadius: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{t("x.confirmTitle")}</div>
            <div className="mt-2" style={{ fontSize: 12.5, color: C.ink2, lineHeight: 1.7 }}>{t("x.confirmBody")}</div>
            {added.length > 0 && (
              <div className="mt-2 rounded-lg px-2.5 py-2" style={{ background: C.innSoft }}>
                <div className="num" style={{ fontSize: 11.5, fontWeight: 700, color: C.brand }}>
                  {added.map((c) => `${flag(c)} ${c}`).join("  ")}
                </div>
                <div style={{ fontSize: 11.5, color: C.ink2, lineHeight: 1.6, marginTop: 3 }}>{t("x.willBackfill")}</div>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setSheet("favsEdit")} disabled={busy} className="flex-1 py-2.5"
                style={{ background: C.soft, fontSize: 13.5, color: C.ink, borderRadius: C.r }}>{t("x.cancel")}</button>
              <button onClick={applyFavs} disabled={busy} className="flex-1 py-2.5"
                style={{ background: busy ? C.line : C.brand, color: "#fff", fontSize: 13.5, fontWeight: 600, borderRadius: C.r }}>
                {busy ? t("x.backfill") : t("x.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {sheet === "lang" && (
        <Sheet title={t("s.language")} onClose={() => setSheet(null)}>
          {LANGS.map((l) => (
            <button key={l.c} onClick={() => { setLang(l.c); setSheet(null); }} className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              style={{ borderBottom: `1px solid ${C.soft}` }}>
              <span className="num rounded-md flex items-center justify-center shrink-0"
                style={{ width: 46, height: 30, background: C.soft, fontSize: 11.5, fontWeight: 600, color: C.ink, textTransform: "uppercase" }}>{l.c}</span>
              <span className="flex-1" style={{ fontSize: 15, color: C.ink }}>{l.native}</span>
              {lang === l.c && <Check size={17} color={C.ink} strokeWidth={2.4} />}
            </button>
          ))}
        </Sheet>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   主壳
   ═════════════════════════════════════════════════════════ */
export default function App() {
  const [ready, setReady] = useState(false);           // 读盘完成前不渲染,避免闪一下空数据
  const [lang, setLang] = useState("zh");
  const [tab, setTab] = useState("record");
  const [sub, setSub] = useState(null);
  const [txns, setTxns] = useState([]);
  const [cats, setCats] = useState(SEED_CATS);
  const [quicks, setQuicks] = useState(SEED_QUICK);
  const [fixed, setFixed] = useState(SEED_FIXED);
  const [budgets, setBudgets] = useState({});
  const [fx, setFx] = useState(SEED_FX_DAILY);
  const [favs, setFavs] = useState(DEFAULT_FAVS);
  const [setupDone, setSetupDone] = useState(false);
  const [batches, setBatches] = useState([]);          // 导入批次,用于识别重复文件
  const [[y, m], setYm] = useState([+TODAY.slice(0, 4), +TODAY.slice(5, 7)]);
  const [cur, setCur] = useState("JPY");

  /* 启动读盘。没有存档就保持空账本。 */
  useEffect(() => {
    let alive = true;
    loadAll().then((d) => {
      if (!alive) return;
      if (d) {
        if (d.lang) setLang(d.lang);
        setTxns(d.txns || []);
        if (d.cats?.length) setCats(d.cats);
        if (d.quicks) setQuicks(d.quicks);
        if (d.fixed) setFixed(d.fixed);
        setBudgets(d.budgets || {});
        if (d.fx) setFx(d.fx);
        if (d.favs?.length) setFavs(d.favs);
        if (d.cur) setCur(d.cur);
        setBatches(d.batches || []);
        setSetupDone(!!d.setupDone);
      } else {
        setTxns(seedTxns());
        setBudgets({});
      }
      setReady(true);
    });
    return () => { alive = false; };
  }, []);

  /* 任何一处状态变化就存盘(内部有 400ms 合并) */
  useEffect(() => {
    if (!ready) return;
    saveAll({ lang, txns, cats, quicks, fixed, budgets, fx, favs, cur, setupDone, batches });
  }, [ready, lang, txns, cats, quicks, fixed, budgets, fx, favs, cur, setupDone, batches]);

  const t = useMemo(() => (k) => DICT[lang]?.[k] ?? DICT.zh[k] ?? k, [lang]);
  const ctx = useMemo(() => ({ lang, t }), [lang, t]);

  /* 记账时就钉住用哪一天的汇率,之后回填新汇率也不会改动这笔账 */
  const add = (x) => setTxns((xs) => {
    const r = ratesOn(fx, x.date);
    return [...xs, { ...x, id: Date.now() + Math.random(), fx: null, fxd: r ? r.at : null }];
  });
  const editTxn = (x) => setTxns((xs) => xs.map((z) => (z.id === x.id ? x : z)));
  /* 批量导入:先按 srcKey 去重,再一次性并入 */
  const importTxns = (rows) => setTxns((xs) => {
    const have = new Set(xs.filter((z) => z.srcKey).map((z) => z.srcKey));
    return [...xs, ...rows.filter((r) => !have.has(r.srcKey))];
  });
  const delTxn = (id) => setTxns((xs) => xs.filter((z) => z.id !== id));
  const catchUp = () => setTxns((xs) => {
    const a = pendingFixed(fixed, xs);
    return a.length ? [...xs, ...a.map((z, i) => ({ ...z, id: Date.now() + i, fxd: ratesOn(fx, z.date)?.at ?? null }))] : xs;
  });
  useEffect(() => { catchUp(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [fixed]);

  const pendingCount = pendingFixed(fixed, txns).length;

  const TABS = [
    { k: "record", i18n: "nav.record", I: Plus },
    { k: "ledger", i18n: "nav.ledger", I: NotebookText },
    { k: "report", i18n: "rp.title",   I: PieChart },
    { k: "stat",   i18n: "nav.stat",   I: BarChart3 },
    { k: "set",    i18n: "nav.set",    I: Settings2 },
  ];

  if (!ready) {
    return (
      <>
        <style>{CSS}</style>
        <div className="w-full flex justify-center" style={{ background: "#DCDEE3", minHeight: "100vh", fontFamily: F_UI }}>
          <div className="flex items-center justify-center w-full" style={{ maxWidth: 400, height: "100vh", background: C.page }}>
            <span style={{ fontSize: 13, color: C.ink3 }}>…</span>
          </div>
        </div>
      </>
    );
  }

  if (!setupDone) {
    return (
      <LangCtx.Provider value={ctx}>
        <style>{CSS}</style>
        <div className="w-full flex justify-center" style={{ background: "#DCDEE3", minHeight: "100vh", fontFamily: F_UI }}>
          <div className="relative flex flex-col w-full" style={{ maxWidth: 400, height: "100vh", background: C.page }}>
            <CurrencySetup lang={lang} onDone={({ main, favs: f }) => { setCur(main); setFavs(f); setSetupDone(true); }} />
          </div>
        </div>
      </LangCtx.Provider>
    );
  }

  const view =
    sub === "quick"  ? <QuickEditor quicks={quicks} setQuicks={setQuicks} cats={cats} onBack={() => setSub(null)} cur={cur} /> :
    sub === "fixed"  ? <FixedCosts fixed={fixed} setFixed={setFixed} cats={cats} txns={txns} onCatchUp={catchUp} onBack={() => setSub(null)} cur={cur} fx={fx} /> :
    sub === "cats"   ? <CatEditor cats={cats} setCats={setCats} onBack={() => setSub(null)} /> :
    sub === "fx"     ? <FxScreen fx={fx} setFx={setFx} cur={cur} favs={favs} onBack={() => setSub(null)} /> :
    sub === "import" ? <Importer onBack={() => setSub(null)} cur={cur} favs={favs} cats={cats} setCats={setCats}
                         txns={txns} onImport={importTxns} fx={fx}
                         batches={batches} addBatch={(b) => setBatches((bs) => [...bs, b])} /> :
    tab === "record" ? <Record cats={cats} quicks={quicks} txns={txns} onSave={add} cur={cur} setCur={setCur}
                         goQuick={() => setSub("quick")} goCats={() => setSub("cats")}
                         fx={fx} setFx={setFx} main={cur} goFx={() => setSub("fx")} favs={favs} /> :
    tab === "ledger" ? <Ledger txns={txns} cats={cats} y={y} m={m} setYm={setYm} cur={cur} fx={fx} main={cur} onEdit={editTxn} onDelete={delTxn} /> :
    tab === "report" ? <Report txns={txns} cats={cats} cur={cur} fx={fx} y={y} m={m} setYm={setYm} main={cur} favs={favs} /> :
    tab === "stat"   ? <Analysis txns={txns} cats={cats} budgets={budgets} setBudgets={setBudgets} y={y} m={m} setYm={setYm}
                         cur={cur} fx={fx} goFx={() => setSub("fx")} main={cur} /> :
                       <SettingsScreen go={setSub} cur={cur} setCur={setCur} lang={lang} setLang={setLang}
                         fixed={fixed} pendingCount={pendingCount} fx={fx} setFx={setFx}
                         favs={favs} setFavs={setFavs} txns={txns} cats={cats} />;

  return (
    <LangCtx.Provider value={ctx}>
      <style>{CSS}</style>
      <div className="w-full flex justify-center" style={{ background: "#DCDEE3", minHeight: "100vh", fontFamily: F_UI }}>
        <div className="relative flex flex-col w-full" style={{ maxWidth: 400, height: "100vh", background: C.page }}>
          <div className="flex-1 overflow-hidden relative">{view}</div>
          <div className="flex shrink-0" style={{ background: C.surface, borderTop: `1px solid ${C.hair}` }}>
            {TABS.map(({ k, i18n, I }) => {
              const on = !sub && tab === k;
              return (
                <button key={k} onClick={() => { setSub(null); setTab(k); }} className="flex-1 min-w-0 flex flex-col items-center gap-0.5 py-2 relative">
                  <I size={19} color={on ? C.brand : "#B4BCC4"} strokeWidth={on ? 2.3 : 1.8} />
                  <span className="truncate max-w-full px-0.5" style={{ fontSize: 10, fontWeight: on ? 600 : 400, color: on ? C.brand : "#B4BCC4" }}>{t(i18n)}</span>
                  {k === "set" && pendingCount > 0 && (
                    <span style={{ position: "absolute", top: 6, right: "30%", width: 6, height: 6, borderRadius: 6, background: "#C0392B" }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </LangCtx.Provider>
  );
}
