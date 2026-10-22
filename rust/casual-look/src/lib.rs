//! 일상컷 생김새 — 등록된 일상컷(…_f_casualN.webp)의 구도·윤곽·색 배치를 재어 서로 닮은 컷을 찾는다(2026-10-22).
//!
//! 글(선택값)이 달라도 그림은 같은 구도·같은 자세로 수렴할 수 있다 — 계획기(tools/casual-plan.cjs)는 장부의 선택값만 본다.
//! 그래서 그림 쪽 닮음을 두 군데 돌려준다.
//!   index  등록된 일상컷 전부 → data/casual-look.json. 컷마다 다른 캐릭터와 가까운 컷 수(crowd)와 가장 가까운 셋.
//!          계획기가 그 컷의 장면 예시·(방향, 프레이밍)·옷 종류에 crowd 를 벌점으로 준다 — 닮은 그림이 나온 조합을 덜 고른다.
//!   check  생성한 새 그림(올리기 전) → 다른 캐릭터의 일상컷과 거의 같으면 1 로 끝난다. 세 장끼리도 본다.
//!   pairs  가장 닮은 다른 캐릭터 쌍(문턱을 정할 때 눈으로 본다).
//!
//! 셈은 이 라이브러리 한 곳 — 명령줄(src/main.rs)과 wasm(casual-wasm, cargo 없이 node tools/casual-look.cjs)이 같이 쓴다.
//!
//! 특징 셋(모두 256×384 로 줄인 뒤 — 썸네일이든 원본이든 같은 값이 나오게):
//!   윤곽 — 64×96 밝기의 기울기 방향을 4×6 칸 × 8 방향 막대로(색과 상관없이 자세·선의 배치)
//!   배치 — 16×24 밝기를 평균 0·분산 1 로(어디가 밝고 어두운지 — 인물 자리와 배경 덩어리)
//!   색   — art-core 의 닮음(dHash · Lab 색 막대 · 2×3 칸 Lab 서명). 캐릭터마다 색이 달라 무게를 낮게 둔다
use art_core::{features, similarity, Features, Pixels};
use serde_json::{json, Value};

const W: u32 = 256;
const H: u32 = 384;
const GW: usize = 64;
const GH: usize = 96;
const CX: usize = 4;
const CY: usize = 6;
const BINS: usize = 8;
const HOG: usize = CX * CY * BINS;
const LW: usize = 16;
const LH: usize = 24;
const LAY: usize = LW * LH;
/// 무게 — 윤곽 · 배치 · 색. 합 1
pub const WT: [f32; 3] = [0.50, 0.40, 0.10];
/// 이 점수(거리 × 1000)보다 가까우면 "가까운 컷" — crowd 로 센다. 2026-10-22 일상컷 1123장(다른 캐릭터 쌍 62만)을 눈으로 본 문턱:
/// 150~222 는 같은 장면·같은 구도(노을 바위 해변을 정면 전신으로 걷는 수영복 · 부엌 타르트 · 수영장 비키니가 캐릭터만 바뀌어 되풀이),
/// 235~250 은 같은 갈래의 장면이지만 구도가 다르고, 270 위로는 다른 그림이다. 215 미만은 85쌍, 245 미만은 530쌍
pub const CROWD_BELOW: u32 = 245;
/// 이 점수보다 가까우면 거의 같은 그림 — check 가 막는다
pub const DUP_BELOW: u32 = 215;

#[derive(Clone)]
pub struct Look {
    art: Features,
    hog: [u8; HOG],
    lay: [i8; LAY],
}

fn gray(r: u8, g: u8, b: u8) -> f32 {
    0.299 * r as f32 + 0.587 * g as f32 + 0.114 * b as f32
}

pub fn look_of(img: &image::RgbImage) -> Look {
    let small = image::imageops::resize(img, W, H, image::imageops::FilterType::Triangle);
    let px = Pixels::new(small.as_raw(), W as usize, H as usize, 3).expect("화소");
    let art = features(&px);
    // 64×96 밝기 — 4×4 화소 평균
    let mut g = vec![0f32; GW * GH];
    let (sx, sy) = (W as usize / GW, H as usize / GH);
    for y in 0..GH {
        for x in 0..GW {
            let mut s = 0f32;
            for dy in 0..sy {
                for dx in 0..sx {
                    let p = small.get_pixel((x * sx + dx) as u32, (y * sy + dy) as u32);
                    s += gray(p[0], p[1], p[2]);
                }
            }
            g[y * GW + x] = s / (sx * sy) as f32;
        }
    }
    // 윤곽 — 칸마다 기울기 방향 막대(0..180°, 크기로 무게), 칸마다 L2 로 맞춘다
    let mut hog = [0f32; HOG];
    let (cw, ch) = (GW / CX, GH / CY);
    for y in 1..GH - 1 {
        for x in 1..GW - 1 {
            let gx = g[y * GW + x + 1] - g[y * GW + x - 1];
            let gy = g[(y + 1) * GW + x] - g[(y - 1) * GW + x];
            let m = (gx * gx + gy * gy).sqrt();
            if m < 1.0 {
                continue;
            }
            let mut a = gy.atan2(gx);
            if a < 0.0 {
                a += std::f32::consts::PI;
            }
            let b = ((a / std::f32::consts::PI * BINS as f32) as usize).min(BINS - 1);
            let c = (y / ch).min(CY - 1) * CX + (x / cw).min(CX - 1);
            hog[c * BINS + b] += m;
        }
    }
    let mut hq = [0u8; HOG];
    for c in 0..CX * CY {
        let n = hog[c * BINS..(c + 1) * BINS].iter().map(|v| v * v).sum::<f32>().sqrt();
        for b in 0..BINS {
            hq[c * BINS + b] = if n > 0.0 { (hog[c * BINS + b] / n * 255.0).round() as u8 } else { 0 };
        }
    }
    // 배치 — 16×24 밝기, 평균 0 · 분산 1
    let mut l = [0f32; LAY];
    let (bx, by) = (GW / LW, GH / LH);
    for y in 0..LH {
        for x in 0..LW {
            let mut s = 0f32;
            for dy in 0..by {
                for dx in 0..bx {
                    s += g[(y * by + dy) * GW + x * bx + dx];
                }
            }
            l[y * LW + x] = s / (bx * by) as f32;
        }
    }
    let mean = l.iter().sum::<f32>() / LAY as f32;
    let sd = (l.iter().map(|v| (v - mean) * (v - mean)).sum::<f32>() / LAY as f32).sqrt().max(1e-3);
    let mut lq = [0i8; LAY];
    for i in 0..LAY {
        lq[i] = ((l[i] - mean) / sd * 32.0).round().clamp(-127.0, 127.0) as i8;
    }
    Look { art, hog: hq, lay: lq }
}

/// 그림 바이트(webp·png·jpeg) → 생김새. 이름은 실패 글에만 쓴다
pub fn look_of_bytes(name: &str, bytes: &[u8]) -> Result<Look, String> {
    image::load_from_memory(bytes).map(|i| look_of(&i.to_rgb8())).map_err(|e| format!("{name}: {e}"))
}

/// 두 컷의 거리 0..1 — 0 이면 같은 그림
pub fn distance(a: &Look, b: &Look) -> f32 {
    let (mut dot, mut na, mut nb) = (0f32, 0f32, 0f32);
    for i in 0..HOG {
        let (x, y) = (a.hog[i] as f32, b.hog[i] as f32);
        dot += x * y;
        na += x * x;
        nb += y * y;
    }
    let hog = if na > 0.0 && nb > 0.0 { 1.0 - dot / (na.sqrt() * nb.sqrt()) } else { 1.0 };
    let (mut sxy, mut sxx, mut syy) = (0f32, 0f32, 0f32);
    for i in 0..LAY {
        let (x, y) = (a.lay[i] as f32, b.lay[i] as f32);
        sxy += x * y;
        sxx += x * x;
        syy += y * y;
    }
    let r = if sxx > 0.0 && syy > 0.0 { sxy / (sxx.sqrt() * syy.sqrt()) } else { 0.0 };
    let lay = (1.0 - r) / 2.0;
    // 윤곽 거리는 0..0.5 언저리에 몰린다 — 두 배로 펴서 다른 둘과 눈금을 맞춘다
    (WT[0] * (hog * 2.0).min(1.0) + WT[1] * lay + WT[2] * similarity(&a.art, &b.art)).clamp(0.0, 1.0)
}
pub fn score(d: f32) -> u32 {
    (d * 1000.0).round() as u32
}

// ── 적기 — 특징을 base64 한 줄로 ──
const B64: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
fn b64(bytes: &[u8]) -> String {
    let mut s = String::new();
    for c in bytes.chunks(3) {
        let n = (c[0] as u32) << 16 | (*c.get(1).unwrap_or(&0) as u32) << 8 | *c.get(2).unwrap_or(&0) as u32;
        for k in 0..4 {
            if k <= c.len() {
                s.push(B64[(n >> (18 - 6 * k) & 63) as usize] as char);
            } else {
                s.push('=');
            }
        }
    }
    s
}
fn unb64(s: &str) -> Option<Vec<u8>> {
    let mut out = Vec::new();
    let v: Vec<u8> = s.bytes().filter(|&c| c != b'=').map(|c| B64.iter().position(|&x| x == c).map(|p| p as u8)).collect::<Option<_>>()?;
    for c in v.chunks(4) {
        let mut n = 0u32;
        for (i, x) in c.iter().enumerate() {
            n |= (*x as u32) << (18 - 6 * i);
        }
        for k in 0..c.len().saturating_sub(1) {
            out.push((n >> (16 - 8 * k) & 255) as u8);
        }
    }
    Some(out)
}
pub fn pack(l: &Look) -> String {
    let mut v = Vec::with_capacity(8 + 64 + 42 + HOG + LAY);
    v.extend_from_slice(&l.art.dhash.to_le_bytes());
    v.extend_from_slice(&l.art.hist);
    for q in l.art.signature.quantize() {
        v.extend_from_slice(&q.to_le_bytes());
    }
    v.extend_from_slice(&l.hog);
    v.extend(l.lay.iter().map(|&x| x as u8));
    b64(&v)
}
pub fn unpack(s: &str) -> Option<Look> {
    let v = unb64(s)?;
    let hist_len = art_core::HIST_BINS;
    let sig_len = art_core::SIG_LEN;
    if v.len() != 8 + hist_len + sig_len * 2 + HOG + LAY {
        return None;
    }
    let dhash = u64::from_le_bytes(v[0..8].try_into().ok()?);
    let mut hist = [0u8; art_core::HIST_BINS];
    hist.copy_from_slice(&v[8..8 + hist_len]);
    let o = 8 + hist_len;
    let q: Vec<i16> = (0..sig_len).map(|i| i16::from_le_bytes([v[o + 2 * i], v[o + 2 * i + 1]])).collect();
    let signature = art_core::Signature::from_quantized(&q)?;
    let o = o + sig_len * 2;
    let mut hog = [0u8; HOG];
    hog.copy_from_slice(&v[o..o + HOG]);
    let mut lay = [0i8; LAY];
    for i in 0..LAY {
        lay[i] = v[o + HOG + i] as i8;
    }
    Some(Look { art: Features { signature, dhash, hist }, hog, lay })
}

/// 색인 한 컷 — (파일, 카드, 몇 번째 일상컷, 생김새)
pub type Indexed = (String, String, u32, Look);

/// data/casual-look.json 글 → 컷들
pub fn parse_index(text: &str) -> Result<Vec<Indexed>, String> {
    let v: Value = serde_json::from_str(text).map_err(|e| e.to_string())?;
    let mut out = Vec::new();
    for c in v.get("cuts").and_then(|x| x.as_array()).cloned().unwrap_or_default() {
        let look = c.get("look").and_then(|x| x.as_str()).and_then(unpack).ok_or("색인의 look 을 못 읽었다 — 다시 index")?;
        out.push((c["file"].as_str().unwrap_or("").to_string(), c["card"].as_str().unwrap_or("").to_string(), c["cut"].as_u64().unwrap_or(0) as u32, look));
    }
    Ok(out)
}

/// 새 그림(올리기 전)을 등록된 다른 캐릭터 일상컷과 견준다 → (통과, 찍을 글). 거의 같으면 통과가 아니다.
/// names 는 찍을 때 쓰는 그림 이름(명령줄에 준 그대로)
pub fn check(idx: &[Indexed], card: &str, names: &[String], mine: &[Look], as_json: bool) -> (bool, String) {
    let mut out = String::new();
    let mut ok = true;
    let mut rows = Vec::new();
    for (k, l) in mine.iter().enumerate() {
        let mut near: Vec<(u32, &str)> = idx.iter().filter(|x| x.1 != card).map(|x| (score(distance(l, &x.3)), x.0.as_str())).collect();
        near.sort();
        let dup: Vec<_> = near.iter().filter(|x| x.0 < DUP_BELOW).collect();
        let crowd = near.iter().filter(|x| x.0 < CROWD_BELOW).count();
        let mut selfs = Vec::new();
        for (j, o) in mine.iter().enumerate() {
            if j != k {
                let s = score(distance(l, o));
                if s < DUP_BELOW {
                    selfs.push((j, s));
                }
            }
        }
        if !dup.is_empty() || !selfs.is_empty() {
            ok = false;
        }
        rows.push(json!({ "file": names[k], "crowd": crowd, "near": near.iter().take(5).map(|x| json!([x.1, x.0])).collect::<Vec<_>>(),
            "duplicate_of": dup.iter().map(|x| json!([x.1, x.0])).collect::<Vec<_>>(), "same_as_own": selfs.iter().map(|&(j, s)| json!([names[j], s])).collect::<Vec<_>>() }));
        if !as_json {
            out += &format!("{} — 가까운 컷 {crowd}장(점수 {CROWD_BELOW} 미만){}\n", names[k], if dup.is_empty() && selfs.is_empty() { "" } else { " ✗ 거의 같다" });
            for x in near.iter().take(3) {
                out += &format!("    {:>4}  {}\n", x.0, x.1);
            }
            for &(j, s) in &selfs {
                out += &format!("    {:>4}  이번 {}번째 그림과 거의 같다\n", s, j + 1);
            }
        }
    }
    if as_json {
        out += &format!("{}\n", json!({ "ok": ok, "dup_below": DUP_BELOW, "crowd_below": CROWD_BELOW, "cuts": rows }));
    } else {
        out += &format!("{}\n", if ok { "통과 — 거의 같은 일상컷 없음".to_string() } else { format!("✗ 점수 {DUP_BELOW} 미만 — 그 컷은 계획기로 다시 정한다(--avoid)") });
    }
    (ok, out)
}

#[cfg(test)]
mod tests {
    use super::*;
    fn img(f: impl Fn(u32, u32) -> [u8; 3]) -> image::RgbImage {
        image::RgbImage::from_fn(512, 768, |x, y| image::Rgb(f(x, y)))
    }
    #[test]
    fn same_picture_is_zero_and_pack_round_trips() {
        let a = look_of(&img(|x, y| [(x / 4) as u8, (y / 4) as u8, 90]));
        assert!(score(distance(&a, &a)) <= 2);
        let b = unpack(&pack(&a)).expect("되읽기");
        assert!(score(distance(&a, &b)) <= 2);
        assert_eq!(unb64(&b64(&[1, 2, 3, 4, 5])).unwrap(), vec![1, 2, 3, 4, 5]);
    }
    #[test]
    fn recoloured_copy_is_close_but_new_layout_is_far() {
        // 같은 구도(가운데 세로 막대 + 아래 덩어리), 색만 다름 → 가깝다. 막대 자리가 다른 그림 → 멀다
        let shape = |x: u32, y: u32, cx: u32| (x as i32 - cx as i32).abs() < 60 || y > 600;
        let a = look_of(&img(|x, y| if shape(x, y, 256) { [200, 40, 40] } else { [20, 20, 60] }));
        let b = look_of(&img(|x, y| if shape(x, y, 256) { [40, 200, 90] } else { [60, 20, 20] }));
        let c = look_of(&img(|x, y| if shape(x, y, 90) && y < 500 { [200, 40, 40] } else { [20, 20, 60] }));
        let (ab, ac) = (score(distance(&a, &b)), score(distance(&a, &c)));
        assert!(ab < DUP_BELOW, "색만 바꾼 같은 구도 {ab}");
        assert!(ac > CROWD_BELOW, "다른 구도 {ac}");
        assert!(ab < ac);
    }
    #[test]
    fn check_flags_own_duplicates() {
        let a = look_of(&img(|x, y| [(x / 4) as u8, (y / 4) as u8, 90]));
        let names = vec!["a.webp".to_string(), "b.webp".to_string()];
        let (ok, out) = check(&[], "피카츄", &names, &[a.clone(), a], false);
        assert!(!ok);
        assert!(out.contains("이번 2번째 그림과 거의 같다"));
    }
}
