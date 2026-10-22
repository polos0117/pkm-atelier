//! 일상컷 생김새 명령줄 — index · check · pairs. 셈은 src/lib.rs(wasm 과 같이 쓴다), 여기는 파일 읽기·스레드·찍기만.
use casual_look::{distance, look_of_bytes, pack, parse_index, score, Indexed, Look, CROWD_BELOW, DUP_BELOW, WT};
use serde_json::{json, Map, Value};
use std::collections::HashMap;
use std::path::{Path, PathBuf};

// ── 등록된 일상컷 — data/img.json 의 그림 가운데 …_f_casualN.webp ──
struct Cut {
    file: String,
    card: String,
    cut: u32,
}
fn collect(v: &Value, out: &mut Vec<String>) {
    match v {
        Value::String(s) => out.push(s.clone()),
        Value::Array(a) => a.iter().for_each(|x| collect(x, out)),
        Value::Object(m) => m.values().for_each(|x| collect(x, out)),
        _ => {}
    }
}
fn casual_no(f: &str) -> Option<u32> {
    let i = f.rfind("_f_casual")?;
    f[i + 9..].strip_suffix(".webp")?.parse().ok()
}
fn registered(root: &Path) -> (Vec<Cut>, Value) {
    let doc: Value = serde_json::from_str(&std::fs::read_to_string(root.join("data/img.json")).expect("data/img.json")).expect("img.json");
    let mut cuts = Vec::new();
    if let Some(img) = doc.get("img").and_then(|v| v.as_object()) {
        for (card, entry) in img {
            let mut files = Vec::new();
            collect(entry, &mut files);
            files.sort();
            files.dedup();
            for f in files {
                if let Some(n) = casual_no(&f) {
                    cuts.push(Cut { file: f, card: card.clone(), cut: n });
                }
            }
        }
    }
    cuts.sort_by(|a, b| a.file.cmp(&b.file));
    (cuts, doc)
}
/// 그림 자리 — img.json 의 where(0 첫 저장소 · 1 둘째). 썸네일이 있으면 그것(256×384 로 줄이니 값이 같다)
fn path_of(root: &Path, doc: &Value, f: &str) -> Option<PathBuf> {
    let n = doc.get("where").and_then(|w| w.get(f)).and_then(|v| v.as_u64()).unwrap_or(0);
    let dir = root.join(if n == 0 { "img".to_string() } else { format!("img-{}", n + 1) });
    [dir.join("thumb").join(f), dir.join(f)].into_iter().find(|p| p.is_file())
}
fn open(p: &Path) -> Result<Look, String> {
    let bytes = std::fs::read(p).map_err(|e| format!("{}: {e}", p.display()))?;
    look_of_bytes(&p.display().to_string(), &bytes)
}
/// 여러 스레드로 읽는다 — 천 장 남짓이라 한 스레드면 오래 걸린다
fn looks(paths: &[PathBuf]) -> Vec<Result<Look, String>> {
    let n = std::thread::available_parallelism().map(|n| n.get()).unwrap_or(4).min(16);
    let chunk = paths.len().div_ceil(n.max(1)).max(1);
    std::thread::scope(|s| {
        let hs: Vec<_> = paths.chunks(chunk).map(|c| s.spawn(move || c.iter().map(|p| open(p)).collect::<Vec<_>>())).collect();
        hs.into_iter().flat_map(|h| h.join().expect("스레드")).collect()
    })
}

fn now() -> String {
    let t = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|d| d.as_secs()).unwrap_or(0);
    let (days, rem) = (t / 86400, t % 86400);
    // 1970-01-01 부터 날짜 — 그레고리력
    let z = days as i64 + 719468;
    let era = z.div_euclid(146097);
    let doe = z - era * 146097;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = yoe + era * 400 + if m <= 2 { 1 } else { 0 };
    format!("{y:04}-{m:02}-{d:02}T{:02}:{:02}:{:02}Z", rem / 3600, rem / 60 % 60, rem % 60)
}

fn index(root: &Path, out: &Path) -> Result<(), String> {
    let (cuts, doc) = registered(root);
    let mut paths = Vec::new();
    let mut have = Vec::new();
    let mut missing = 0;
    for c in &cuts {
        match path_of(root, &doc, &c.file) {
            Some(p) => {
                paths.push(p);
                have.push(c);
            }
            None => missing += 1,
        }
    }
    let got = looks(&paths);
    let mut items: Vec<(&Cut, Look)> = Vec::new();
    for (c, r) in have.into_iter().zip(got) {
        match r {
            Ok(l) => items.push((c, l)),
            Err(e) => {
                eprintln!("못 읽은 그림 {e}");
                missing += 1
            }
        }
    }
    let n = items.len();
    let mut d = vec![0u32; n * n];
    for i in 0..n {
        for j in i + 1..n {
            let s = score(distance(&items[i].1, &items[j].1));
            d[i * n + j] = s;
            d[j * n + i] = s;
        }
    }
    let mut arr = Vec::with_capacity(n);
    for i in 0..n {
        let mut near: Vec<(u32, usize)> = (0..n).filter(|&j| items[j].0.card != items[i].0.card).map(|j| (d[i * n + j], j)).collect();
        near.sort();
        let crowd = near.iter().filter(|x| x.0 < CROWD_BELOW).count();
        arr.push(json!({ "file": items[i].0.file, "card": items[i].0.card, "cut": items[i].0.cut, "crowd": crowd,
            "near": near.iter().take(3).map(|&(s, j)| json!([items[j].0.file, s])).collect::<Vec<_>>(), "look": pack(&items[i].1) }));
    }
    let mut top = Map::new();
    top.insert("note".into(), json!("일상컷 생김새 색인 — rust/casual-look index 가 쓴다. crowd = 다른 캐릭터 일상컷 가운데 점수가 crowd_below 보다 가까운 컷 수. tools/casual-plan.cjs 가 벌점으로, casual-look check 가 올리기 전 문턱으로 쓴다(rust/README.md)."));
    top.insert("built".into(), json!(now()));
    top.insert("weights".into(), json!({ "outline": WT[0], "layout": WT[1], "colour": WT[2] }));
    top.insert("crowd_below".into(), json!(CROWD_BELOW));
    top.insert("dup_below".into(), json!(DUP_BELOW));
    top.insert("count".into(), json!(n));
    top.insert("missing".into(), json!(missing));
    top.insert("cuts".into(), Value::Array(arr));
    std::fs::write(out, serde_json::to_string(&Value::Object(top)).map_err(|e| e.to_string())? + "\n").map_err(|e| e.to_string())?;
    eprintln!("일상컷 {n}장 → {} (못 찾은 그림 {missing})", out.display());
    Ok(())
}

fn load_index(p: &Path) -> Result<Vec<Indexed>, String> {
    parse_index(&std::fs::read_to_string(p).map_err(|e| format!("{}: {e} — 먼저 casual-look index", p.display()))?)
}

/// 새 그림(올리기 전)을 등록된 다른 캐릭터 일상컷과 견준다. 거의 같으면 1 로 끝난다
fn check(index: &Path, card: &str, files: &[PathBuf], as_json: bool) -> Result<bool, String> {
    let idx = load_index(index)?;
    let mine: Vec<Look> = files.iter().map(|p| open(p)).collect::<Result<_, _>>()?;
    let names: Vec<String> = files.iter().map(|p| p.display().to_string()).collect();
    let (ok, out) = casual_look::check(&idx, card, &names, &mine, as_json);
    print!("{out}");
    Ok(ok)
}

fn pairs(index: &Path, top: usize) -> Result<(), String> {
    let idx = load_index(index)?;
    let n = idx.len();
    let mut all = Vec::new();
    for i in 0..n {
        for j in i + 1..n {
            if idx[i].1 != idx[j].1 {
                all.push((score(distance(&idx[i].3, &idx[j].3)), i, j));
            }
        }
    }
    all.sort();
    let mut hist: HashMap<u32, usize> = HashMap::new();
    for x in &all {
        *hist.entry(x.0 / 50 * 50).or_default() += 1;
    }
    let mut keys: Vec<_> = hist.keys().copied().collect();
    keys.sort();
    println!("다른 캐릭터 쌍 {} — 점수 분포: {}", all.len(), keys.iter().take(8).map(|k| format!("{k}~ {}", hist[k])).collect::<Vec<_>>().join(" · "));
    for x in all.iter().take(top) {
        println!("{:>4}  {}  {}", x.0, idx[x.1].0, idx[x.2].0);
    }
    Ok(())
}

fn main() {
    let a: Vec<String> = std::env::args().skip(1).collect();
    let root = std::env::var("PKM_ROOT").map(PathBuf::from).unwrap_or_else(|_| PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../.."));
    let get = |k: &str| a.iter().position(|x| x == k).and_then(|i| a.get(i + 1)).cloned();
    let index_path = get("--index").map(PathBuf::from).unwrap_or_else(|| root.join("data/casual-look.json"));
    let r = match a.first().map(|s| s.as_str()) {
        Some("index") => index(&root, &get("--out").map(PathBuf::from).unwrap_or(index_path)).map(|_| true),
        Some("check") => {
            let card = get("--card").unwrap_or_default();
            let skip: Vec<usize> = a.iter().enumerate().filter(|(_, x)| *x == "--card" || *x == "--index").map(|(i, _)| i + 1).collect();
            let files: Vec<PathBuf> = a.iter().enumerate().skip(1).filter(|(i, x)| !x.starts_with("--") && !skip.contains(i)).map(|(_, x)| PathBuf::from(x)).collect();
            if card.is_empty() || files.is_empty() {
                Err("casual-look check --card <카드> <그림>…".into())
            } else {
                check(&index_path, &card, &files, a.iter().any(|x| x == "--json"))
            }
        }
        Some("pairs") => pairs(&index_path, get("--top").and_then(|s| s.parse().ok()).unwrap_or(30)).map(|_| true),
        _ => Err("casual-look index | check --card <카드> <그림>… [--json] | pairs [--top N]".into()),
    };
    match r {
        Ok(true) => {}
        Ok(false) => std::process::exit(1),
        Err(e) => {
            eprintln!("✗ {e}");
            std::process::exit(2);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn casual_names() {
        assert_eq!(casual_no("피카츄_glossy_promo_f_casual3.webp"), Some(3));
        assert_eq!(casual_no("피카츄_light_glossy_promo_f.webp"), None);
    }
}
