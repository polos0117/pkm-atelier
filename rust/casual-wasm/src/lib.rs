//! 일상컷 생김새 문턱 — cargo 없는 곳에서 node 로(tools/casual-look.wasm, 싣개는 tools/casual-look.cjs).
//! wasm-bindgen 없이 `extern "C"` 내보내기와 포인터·길이만 쓴다. 셈은 casual-look 라이브러리 그대로라 명령줄과 같은 글이 나온다.
//!
//! 차례
//!   1. `alloc(n)` 자리에 바이트를 써 넣는다. 그림마다 `add(이름, 그림 바이트)` → 0(실패 -1).
//!   2. `check(색인 글, 카드, json 꼴)` → 1 통과 · 0 거의 같은 컷 있음 · -1 실패. 찍을 글은 `out_ptr/out_len`. 받은 그림은 비운다.
//!   `add` 가 실패하면 그때까지 받은 그림이 남는다 — `clear()` 로 비운다. 실패 까닭은 `err_ptr/err_len`(UTF-8).
//!
//! `source_hash` 는 빌드 때 셈에 드는 소스를 셈한 값 — 올려 둔 wasm 이 소스보다 묵었는지 tests/casual-look-wasm.cjs 가 본다(build.rs).

use casual_look::{look_of_bytes, parse_index, Look};
use std::cell::RefCell;

include!(concat!(env!("OUT_DIR"), "/source_hash.rs"));

/// 내보내기 꼴이 바뀌면 올린다 — tools/casual-look.cjs 가 맞춰 본다.
pub const API_VERSION: u32 = 1;

#[derive(Default)]
struct State { names: Vec<String>, looks: Vec<Look>, out: String, err: String }

thread_local! {
    static S: RefCell<State> = RefCell::new(State::default());
}

fn fail(e: String) -> i32 { S.with(|s| s.borrow_mut().err = e); -1 }

#[no_mangle] pub extern "C" fn api_version() -> u32 { API_VERSION }
#[no_mangle] pub extern "C" fn source_hash_ptr() -> *const u8 { SOURCE_HASH.as_ptr() }
#[no_mangle] pub extern "C" fn source_hash_len() -> u32 { SOURCE_HASH.len() as u32 }

fn layout(len: u32) -> Option<std::alloc::Layout> { std::alloc::Layout::from_size_align(len.max(1) as usize, 8).ok() }

/// 바이트 n 개 자리 — 8바이트 맞춤
#[no_mangle]
pub extern "C" fn alloc(len: u32) -> *mut u8 {
    match layout(len) {
        // SAFETY: 크기가 0 이 아니다
        Some(l) => unsafe { std::alloc::alloc(l) },
        None => std::ptr::null_mut(),
    }
}

#[no_mangle]
pub extern "C" fn dealloc(ptr: *mut u8, len: u32) {
    if ptr.is_null() { return; }
    // SAFETY: alloc 이 같은 크기로 준 자리
    if let Some(l) = layout(len) { unsafe { std::alloc::dealloc(ptr, l) } }
}

fn slice<'a>(ptr: *const u8, len: u32) -> &'a [u8] {
    // SAFETY: 부르는 쪽이 alloc 으로 받은 자리에 len 바이트를 써 넣었다
    unsafe { std::slice::from_raw_parts(ptr, len as usize) }
}

fn text(ptr: *const u8, len: u32) -> Result<String, String> {
    String::from_utf8(slice(ptr, len).to_vec()).map_err(|_| "UTF-8 이 아니다".to_string())
}

/// 그림 하나 받기 — 이름(찍을 때 쓴다) · webp/png/jpeg 바이트
#[no_mangle]
pub extern "C" fn add(name_ptr: *const u8, name_len: u32, ptr: *const u8, len: u32) -> i32 {
    let r = text(name_ptr, name_len).and_then(|n| look_of_bytes(&n, slice(ptr, len)).map(|l| (n, l)));
    match r {
        Ok((n, l)) => S.with(|s| { let mut s = s.borrow_mut(); s.names.push(n); s.looks.push(l); 0 }),
        Err(e) => fail(e),
    }
}

/// 받은 그림 비우기
#[no_mangle]
pub extern "C" fn clear() { S.with(|s| { let mut s = s.borrow_mut(); s.names.clear(); s.looks.clear(); }) }

/// 받은 그림들을 색인과 견준다 — 1 통과 · 0 거의 같다 · -1 실패. 끝나면 받은 그림을 비운다
#[no_mangle]
pub extern "C" fn check(index_ptr: *const u8, index_len: u32, card_ptr: *const u8, card_len: u32, as_json: u32) -> i32 {
    let (names, looks) = S.with(|s| { let mut s = s.borrow_mut(); (std::mem::take(&mut s.names), std::mem::take(&mut s.looks)) });
    let r = text(index_ptr, index_len).and_then(|t| parse_index(&t)).and_then(|idx| {
        let card = text(card_ptr, card_len)?;
        Ok(casual_look::check(&idx, &card, &names, &looks, as_json != 0))
    });
    match r {
        Ok((ok, out)) => S.with(|s| { s.borrow_mut().out = out; ok as i32 }),
        Err(e) => fail(e),
    }
}

#[no_mangle] pub extern "C" fn out_ptr() -> *const u8 { S.with(|s| s.borrow().out.as_ptr()) }
#[no_mangle] pub extern "C" fn out_len() -> u32 { S.with(|s| s.borrow().out.len() as u32) }
#[no_mangle] pub extern "C" fn err_ptr() -> *const u8 { S.with(|s| s.borrow().err.as_ptr()) }
#[no_mangle] pub extern "C" fn err_len() -> u32 { S.with(|s| s.borrow().err.len() as u32) }
