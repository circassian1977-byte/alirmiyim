// Alır mıyım — uygulama mantığı
// Fiyat tahmin formülü, mevcut sitenin bundle'ından (pt3/mt3/lt3/ut3
// fonksiyonları) birebir çıkarılıp okunabilir hale getirildi.

const CURRENT_YEAR = 2026;

// ---------- Arıza ışığı ikonları ----------
// DB_WL9 içindeki 18 ışıkla aynı sırada; ikon şekli, mevcut sitenin
// bundle'ındaki gösterge-ikonu çizim fonksiyonundan (xt2) birebir taşındı.
// Sitede karşılığı olmayan 5 ışık (EPS, DPF, AdBlue, el freni, emniyet
// kemeri) için aynı stile uygun, standart ISO gösterge sembolleri eklendi.
const WL_ICON_TYPES = [
  'oil', 'coolant', 'brake', 'steering', 'airbag', 'engine', 'engine',
  'battery', 'abs', 'tpms', 'dpf', 'adblue', 'handbrake', 'oil',
  'esp', 'glow', 'seatbelt', 'fuel',
];

function svgIcon(type) {
  const x = f => (8 + 84 * f).toFixed(1);
  const y = f => (8 + 84 * f).toFixed(1);
  const s = f => (84 * f).toFixed(1);
  const arc = (cx, cy, r, a0, a1) => {
    const sx = (cx + r * Math.cos(a0)).toFixed(1), sy = (cy + r * Math.sin(a0)).toFixed(1);
    const ex = (cx + r * Math.cos(a1)).toFixed(1), ey = (cy + r * Math.sin(a1)).toFixed(1);
    const large = (a1 - a0) % (2 * Math.PI) > Math.PI ? 1 : 0;
    return `M${sx},${sy} A${r},${r} 0 ${large} 1 ${ex},${ey}`;
  };
  let body = '';
  switch (type) {
    case 'oil':
      body = `<path d="M${x(.15)},${y(.55)} L${x(.55)},${y(.55)} L${x(.72)},${y(.38)} L${x(.85)},${y(.38)} L${x(.85)},${y(.52)} L${x(.72)},${y(.52)} L${x(.58)},${y(.72)} L${x(.15)},${y(.72)} Z"/>
        <circle cx="${x(.28)}" cy="${y(.42)}" r="${s(.08)}"/>`;
      break;
    case 'battery':
      body = `<rect x="${x(.18)}" y="${y(.38)}" width="${s(.64)}" height="${s(.36)}"/>
        <rect x="${x(.28)}" y="${y(.28)}" width="${s(.12)}" height="${s(.12)}" fill="currentColor" stroke="none"/>
        <rect x="${x(.6)}" y="${y(.28)}" width="${s(.12)}" height="${s(.12)}" fill="currentColor" stroke="none"/>
        <rect x="${x(.3)}" y="${y(.52)}" width="${s(.16)}" height="${s(.06)}" fill="currentColor" stroke="none"/>
        <rect x="${x(.56)}" y="${y(.48)}" width="${s(.06)}" height="${s(.16)}" fill="currentColor" stroke="none"/>`;
      break;
    case 'brake':
      body = `<circle cx="${x(.5)}" cy="${y(.5)}" r="${s(.32)}"/><circle cx="${x(.5)}" cy="${y(.5)}" r="${s(.22)}"/>
        <text x="${x(.5)}" y="${y(.52)}" font-size="${s(.34)}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="currentColor" stroke="none">!</text>`;
      break;
    case 'coolant':
      body = `<rect x="${x(.42)}" y="${y(.18)}" width="${s(.16)}" height="${s(.42)}"/>
        <circle cx="${x(.5)}" cy="${y(.68)}" r="${s(.16)}"/>
        <rect x="${x(.46)}" y="${y(.4)}" width="${s(.08)}" height="${s(.28)}" fill="currentColor" stroke="none"/>`;
      break;
    case 'airbag':
      body = `<circle cx="${x(.5)}" cy="${y(.28)}" r="${s(.1)}"/>
        <rect x="${x(.32)}" y="${y(.4)}" width="${s(.36)}" height="${s(.28)}"/>
        <path d="${arc(+x(.72), +y(.42), +s(.16), Math.PI * 0.8, Math.PI * 1.7)}"/>`;
      break;
    case 'engine':
      body = `<rect x="${x(.22)}" y="${y(.36)}" width="${s(.5)}" height="${s(.32)}"/>
        <rect x="${x(.12)}" y="${y(.44)}" width="${s(.1)}" height="${s(.16)}"/>
        <rect x="${x(.72)}" y="${y(.4)}" width="${s(.12)}" height="${s(.12)}"/>
        <path d="M${x(.34)},${y(.36)} L${x(.4)},${y(.22)} L${x(.58)},${y(.22)} L${x(.64)},${y(.36)}"/>`;
      break;
    case 'abs':
      body = `<circle cx="${x(.5)}" cy="${y(.5)}" r="${s(.34)}"/>
        <text x="${x(.5)}" y="${y(.52)}" font-size="${s(.26)}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="currentColor" stroke="none">ABS</text>`;
      break;
    case 'tpms':
      body = `<ellipse cx="${x(.5)}" cy="${y(.52)}" rx="${s(.28)}" ry="${s(.32)}"/>
        <path d="M${x(.5)},${y(.28)} L${x(.5)},${y(.48)}"/>
        <circle cx="${x(.5)}" cy="${y(.58)}" r="${s(.04)}" fill="currentColor" stroke="none"/>`;
      break;
    case 'esp':
      body = `<rect x="${x(.22)}" y="${y(.4)}" width="${s(.46)}" height="${s(.18)}"/>
        <circle cx="${x(.34)}" cy="${y(.64)}" r="${s(.08)}"/>
        <circle cx="${x(.6)}" cy="${y(.64)}" r="${s(.08)}"/>
        <path d="M${x(.18)},${y(.72)} Q${x(.4)},${y(.82)} ${x(.7)},${y(.72)}"/>`;
      break;
    case 'glow':
      body = `<path d="M${x(.5)},${y(.18)} L${x(.5)},${y(.38)}"/>
        <circle cx="${x(.5)}" cy="${y(.55)}" r="${s(.16)}"/>
        <circle cx="${x(.5)}" cy="${y(.55)}" r="${s(.08)}"/>`;
      break;
    case 'fuel':
      body = `<rect x="${x(.28)}" y="${y(.28)}" width="${s(.28)}" height="${s(.44)}"/>
        <path d="M${x(.56)},${y(.36)} L${x(.7)},${y(.28)} L${x(.7)},${y(.62)}"/>`;
      break;
    case 'washer':
      body = `<path d="M${x(.3)},${y(.35)} L${x(.7)},${y(.35)} L${x(.64)},${y(.7)} L${x(.36)},${y(.7)} Z"/>`;
      break;
    case 'ready':
      body = `<circle cx="${x(.5)}" cy="${y(.5)}" r="${s(.28)}"/>
        <path d="M${x(.36)},${y(.5)} L${x(.46)},${y(.62)} L${x(.68)},${y(.38)}"/>`;
      break;
    // --- ek ikonlar (xt2'de yok, aynı stilde eklendi) ---
    case 'steering':
      body = `<circle cx="${x(.5)}" cy="${y(.5)}" r="${s(.34)}"/><circle cx="${x(.5)}" cy="${y(.5)}" r="${s(.08)}"/>
        <path d="M${x(.5)},${y(.16)} L${x(.5)},${y(.42)}"/>
        <path d="M${x(.24)},${y(.64)} L${x(.44)},${y(.54)}"/>
        <path d="M${x(.76)},${y(.64)} L${x(.56)},${y(.54)}"/>`;
      break;
    case 'dpf':
      body = `<rect x="${x(.2)}" y="${y(.38)}" width="${s(.42)}" height="${s(.24)}" rx="${s(.03)}"/>
        <path d="M${x(.62)},${y(.42)} L${x(.78)},${y(.34)} L${x(.78)},${y(.66)} L${x(.62)},${y(.58)}"/>
        <path d="M${x(.28)},${y(.44)} L${x(.28)},${y(.56)} M${x(.36)},${y(.44)} L${x(.36)},${y(.56)} M${x(.44)},${y(.44)} L${x(.44)},${y(.56)} M${x(.52)},${y(.44)} L${x(.52)},${y(.56)}"/>`;
      break;
    case 'adblue':
      body = `<path d="M${x(.5)},${y(.18)} C${x(.66)},${y(.42)} ${x(.72)},${y(.56)} ${x(.72)},${y(.64)} A${s(.22)},${s(.22)} 0 1 1 ${x(.28)},${y(.64)} C${x(.28)},${y(.56)} ${x(.34)},${y(.42)} ${x(.5)},${y(.18)} Z"/>`;
      break;
    case 'handbrake':
      body = `<circle cx="${x(.5)}" cy="${y(.5)}" r="${s(.34)}"/>
        <text x="${x(.5)}" y="${y(.52)}" font-size="${s(.32)}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="currentColor" stroke="none">P</text>
        <path d="M${x(.24)},${y(.76)} L${x(.76)},${y(.24)}"/>`;
      break;
    case 'seatbelt':
      body = `<circle cx="${x(.28)}" cy="${y(.22)}" r="${s(.07)}"/>
        <path d="M${x(.28)},${y(.29)} L${x(.66)},${y(.72)} L${x(.5)},${y(.86)} L${x(.22)},${y(.5)}"/>
        <rect x="${x(.56)}" y="${y(.6)}" width="${s(.2)}" height="${s(.16)}" rx="${s(.02)}"/>`;
      break;
    default:
      body = `<circle cx="${x(.5)}" cy="${y(.5)}" r="${s(.3)}"/>`;
  }
  return `<svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">${body}</svg>`;
}

// Seçilen marka/model/(opsiyonel yıl) için, o araca uygun olmayan ışıkları
// (örn. dizeli olmayan bir modelde DPF/AdBlue/buji kızdırma, tam elektrikte
// motor/yağ/soğutma/yakıt) elemeye yarar. Veri yoksa (varyant bilgisi yoksa)
// hiçbir şey elenmez — tüm 18 ışık gösterilir.
function fuelsForSelection(brandKey, modelKey, year) {
  const model = DB_Z3[brandKey]?.models[modelKey];
  if (!model || !model.variants || !Object.keys(model.variants).length) return null;
  let variants = Object.values(model.variants);
  if (year) {
    const matching = variants.filter(v => (v.years || []).some(y => year >= y.range[0] && year <= y.range[1]));
    if (matching.length) variants = matching;
  }
  const fuels = new Set(variants.map(v => v.fuel).filter(Boolean));
  return fuels.size ? fuels : null;
}

function applicableLights(brandKey, modelKey, year) {
  const fuels = brandKey && modelKey ? fuelsForSelection(brandKey, modelKey, year) : null;
  return DB_WL9.map((w, i) => ({ ...w, idx: i, type: WL_ICON_TYPES[i] })).filter(item => {
    if (!fuels) return true;
    const dieselOnly = ['dpf', 'adblue', 'glow'].includes(item.type);
    if (dieselOnly && !fuels.has('dizel')) return false;
    const iceOnly = ['engine', 'oil', 'coolant', 'fuel'].includes(item.type);
    const electricOnly = [...fuels].every(f => f === 'elektrik');
    if (iceOnly && electricOnly) return false;
    return true;
  });
}

function trNormalize(str) {
  return String(str)
    .toLowerCase()
    .replace(/ı/g, 'i').replace(/İ/g, 'i')
    .replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ş/g, 's').replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sahibindenUrl(brandKey, modelKey) {
  const brand = DB_Z3[brandKey];
  const model = brand && brand.models[modelKey];
  if (!brand || !model) return 'https://www.sahibinden.com/otomobil';
  const slug = trNormalize(brand.name) + '-' + trNormalize(model.name);
  return 'https://www.sahibinden.com/' + slug;
}

// Bir marka/modelin listedeki (2026) sıfır fiyatı.
function newPrice(brandKey, modelKey) {
  const brand = DB_Z3[brandKey];
  const model = brand && brand.models[modelKey];
  if (!brand || !model) return 0;
  const key = brandKey + ':' + modelKey;
  if (DB_FT3[key] != null) return DB_FT3[key];
  return Math.round(2100000 * (brand.factor ?? 1) * (model.factor ?? 1));
}

// Orijinal sitedeki pt3() fonksiyonunun birebir karşılığı.
function estimatePrice(brandKey, modelKey, year, km, variantKey) {
  const brand = DB_Z3[brandKey];
  const model = brand && brand.models[modelKey];
  const variant = variantKey && model && model.variants ? model.variants[variantKey] : undefined;
  const base = newPrice(brandKey, modelKey);
  const age = Math.max(0, CURRENT_YEAR - year);

  let price = base * Math.pow(0.89, Math.min(age, 18));
  price *= (brand?.factor ?? 1) * 0.35 + 0.65;
  price *= variant?.factor ?? model?.factor ?? 1;
  if (age > 18) price *= 0.72;

  if (km) {
    const expectedKm = age * 16000;
    const excessKm = Math.max(0, km - expectedKm);
    price *= 1 - Math.min(0.32, excessKm / 420000);
  }

  price = Math.round(price / 1000) * 1000;
  const low = Math.round(price * 0.88 / 1000) * 1000;
  const high = Math.round(price * 1.12 / 1000) * 1000;
  return { low, mid: price, high, newPrice: base };
}

// O modelin (varsa varyantların) tanımlı yıl aralıklarının tamamı.
function yearsOf(brandKey, modelKey, variantKey) {
  const model = DB_Z3[brandKey]?.models[modelKey];
  if (!model) return [];
  const src = variantKey && model.variants?.[variantKey] ? model.variants[variantKey].years : model.years;
  return src || [];
}

// Bir yıla denk gelen kasa/nesil bilgisini (advice, risk, chronic, ekspertiz) bulur.
function genInfoForYear(brandKey, modelKey, year, variantKey) {
  const years = yearsOf(brandKey, modelKey, variantKey);
  if (!years.length) return null;
  let hit = years.find(y => year >= y.range[0] && year <= y.range[1]);
  if (hit) return hit;
  let best = years[0], bestDist = Infinity;
  for (const y of years) {
    const mid = (y.range[0] + y.range[1]) / 2;
    const d = Math.abs(year - mid);
    if (d < bestDist) { bestDist = d; best = y; }
  }
  return best;
}

// Bir marka+model+varyant için, verilen bütçeye en yakın fiyatı veren yılı bulur.
function bestYearForBudget(brandKey, modelKey, variantKey, budget) {
  const years = yearsOf(brandKey, modelKey, variantKey);
  let best = null;
  for (const gen of years) {
    const [start, end] = gen.range;
    const span = Math.max(1, end - start);
    const step = Math.max(1, Math.round(span / 6));
    for (let y = end; y >= start; y -= step) {
      const est = estimatePrice(brandKey, modelKey, y, null, variantKey);
      const cand = { year: y, gen, est };
      if (!best || Math.abs(est.mid - budget) < Math.abs(best.est.mid - budget)) best = cand;
    }
    // aralığın en yeni yılını da dene (adım atlamasın diye)
    const est = estimatePrice(brandKey, modelKey, Math.min(end, CURRENT_YEAR), null, variantKey);
    if (!best || Math.abs(est.mid - budget) < Math.abs(best.est.mid - budget)) {
      best = { year: Math.min(end, CURRENT_YEAR), gen, est };
    }
  }
  return best;
}

// Kronik arıza listesini (model + Cf9) birleştirir, tekilleştirir.
function chronicFor(brandKey, modelKey, gen) {
  const list = [];
  const seen = new Set();
  const add = (items) => {
    for (const it of items || []) {
      const key = (it.title || '').trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      list.push(it);
    }
  };
  add(gen?.chronic);
  add(DB_CF9[brandKey + '|' + modelKey]);
  // sık önce, sonra orta/nadir; kritik seviyeler üstte
  const freqRank = f => (f === 'sık' ? 0 : f === 'orta' ? 1 : 2);
  const levelRank = l => (l === 'kritik' ? 0 : l === 'dikkat' ? 1 : 2);
  list.sort((a, b) => (levelRank(a.level) - levelRank(b.level)) || (freqRank(a.freq) - freqRank(b.freq)));
  return list;
}

// En sorunsuz (en düşük riskli) kasayı, bütçeye göre bulur.
// modelKey verilmişse sadece o modelin varyant/kasalarına bakar.
// verilmemişse markanın tüm modelleri arasında bütçeye en uygun olanları döner.
function findBestGeneration(brandKey, modelKey, budget) {
  const model = DB_Z3[brandKey]?.models[modelKey];
  if (!model) return null;

  const hasVariants = model.variants && Object.keys(model.variants).length;
  const candidates = [];

  if (hasVariants) {
    for (const [vKey, variant] of Object.entries(model.variants)) {
      const hit = bestYearForBudget(brandKey, modelKey, vKey, budget);
      if (hit) candidates.push({ variantKey: vKey, variantName: variant.name, ...hit });
    }
  } else {
    const hit = bestYearForBudget(brandKey, modelKey, undefined, budget);
    if (hit) candidates.push({ variantKey: null, variantName: model.name, ...hit });
  }

  if (!candidates.length) return null;

  // Skor: fiyat yakınlığı ağırlıklı, risk ikincil kriter.
  for (const c of candidates) {
    const priceDist = Math.abs(c.est.mid - budget) / Math.max(budget, 1);
    const risk = (c.gen.risk ?? 50) / 100;
    c.score = priceDist * 2.2 + risk;
  }
  candidates.sort((a, b) => a.score - b.score);
  return candidates[0];
}

// Sadece bütçe + marka verildiğinde: markanın tüm modelleri içinde en uygunlarını listeler.
function searchBrandByBudget(brandKey, budget) {
  const brand = DB_Z3[brandKey];
  if (!brand || !Number.isFinite(budget) || budget < 80000) return [];
  const results = [];
  for (const modelKey of Object.keys(brand.models)) {
    const best = findBestGeneration(brandKey, modelKey, budget);
    if (best) results.push({ brandKey, modelKey, modelName: brand.models[modelKey].name, ...best });
  }
  // Hem bütçeye yakınlık hem risk (sorunsuzluk) birlikte sıralanır — en az riskli
  // ve bütçeye en yakın olanlar en üstte. (score, findBestGeneration içinde hesaplanır.)
  results.sort((a, b) => a.score - b.score);
  return results.slice(0, 24);
}

function buildResultCard(brandKey, modelKey, pick) {
  const brand = DB_Z3[brandKey];
  const model = brand.models[modelKey];
  const chronic = chronicFor(brandKey, modelKey, pick.gen);
  const label = [model.name, pick.variantName && pick.variantName !== model.name ? pick.variantName : null]
    .filter(Boolean).join(' — ');
  return {
    brandKey, modelKey,
    brandName: brand.name,
    modelName: model.name,
    genLabel: label,
    year: pick.year,
    price: pick.est,
    advice: pick.gen.advice,
    risk: pick.gen.risk,
    chronic,
    ekspertiz: pick.gen.ekspertiz || DB_EXTRA.Qe3,
    sahibinden: sahibindenUrl(brandKey, modelKey),
  };
}
