// Alır mıyım — uygulama mantığı
// Fiyat tahmin formülü, mevcut sitenin bundle'ından (pt3/mt3/lt3/ut3
// fonksiyonları) birebir çıkarılıp okunabilir hale getirildi.

const CURRENT_YEAR = 2026;

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
  results.sort((a, b) => Math.abs(a.est.mid - budget) - Math.abs(b.est.mid - budget));
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
