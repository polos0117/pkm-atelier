#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""카드 자료를 받아 data/card.json · data/group.json 을 만든다.

받는 곳은 PokéAPI 가 제 저장소에 올려 둔 CSV 다.
    https://github.com/PokeAPI/pokeapi  →  data/v2/csv/

REST API(pokeapi.co)를 한 마리씩 부르지 않는 까닭: 1,025종이면 호출이 1,025번이다.
CSV 는 아홉 개만 받으면 되고 합쳐서 0.5 MB 다. 게다가 이름·타입·세대가 한 곳에
정리돼 있어 우리가 쓸 꼴로 바로 맞출 수 있다.

만드는 것
    data/card.json   카드 1,025장. {name, en, element, element2?, gen, genus, forms}
    data/group.json  타입 18가지 이름표와 색 (카드를 묶는 축이다)

이름은 한국어 정본을 쓴다. 그림 파일 이름이 카드 이름으로 만들어지므로
(<카드>_<폼>_<화풍>_<성별>.webp) 여기서 한 번 정해 두면 뒤가 흔들리지 않는다.

사용법
    python3 tools/fetch-cards.py            # 받아서 덮어쓴다
    python3 tools/fetch-cards.py --check    # 쓰지 않고 무엇이 달라지는지만 본다
    python3 tools/fetch-cards.py --cache DIR  # 이미 받아 둔 CSV 를 쓴다
"""
import argparse
import csv
import io
import json
import os
import urllib.request

import roster

BASE = "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/"
FILES = ("languages", "pokemon_species", "pokemon_species_names",
         "types", "type_names", "pokemon", "pokemon_types",
         "generations", "generation_names")
KO, EN = "3", "9"          # languages.csv 의 한국어·영어 id

# 폼은 아직 모든 카드가 같다. 카드마다 달라지면 여기가 아니라 card.json 을 손본다
FORMS = ["light", "heavy", "mobility", "overdrive"]

# 타입 색. 화면이 카드 테두리에 쓴다. 포켓몬 타입 색은 널리 쓰이는 값을 따른다
TYPE_COLOR = {
    "normal": "#9FA19F", "fighting": "#FF8000", "flying": "#81B9EF",
    "poison": "#9141CB", "ground": "#915121", "rock": "#AFA981",
    "bug": "#91A119", "ghost": "#704170", "steel": "#60A1B8",
    "fire": "#E62829", "water": "#2980EF", "grass": "#3FA129",
    "electric": "#FAC000", "psychic": "#EF4179", "ice": "#3DCEF3",
    "dragon": "#5060E1", "dark": "#624D4E", "fairy": "#EF70EF",
}


def fetch(name, cache):
    """CSV 한 장. cache 를 주면 거기서 읽는다(같은 자료를 여러 번 안 받게)."""
    if cache:
        path = os.path.join(cache, name + ".csv")
        if os.path.exists(path):
            return list(csv.DictReader(open(path, encoding="utf-8")))
    body = urllib.request.urlopen(BASE + name + ".csv", timeout=60).read()
    text = body.decode("utf-8")
    if cache:
        os.makedirs(cache, exist_ok=True)
        open(os.path.join(cache, name + ".csv"), "w", encoding="utf-8").write(text)
    return list(csv.DictReader(io.StringIO(text)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--cache", help="CSV 를 두고 쓸 폴더")
    a = ap.parse_args()

    t = {f: fetch(f, a.cache) for f in FILES}

    # 한국어 이름이 정본이다. 하나라도 비면 뒤에서 파일 이름이 깨지므로 여기서 선다
    ko = {r["pokemon_species_id"]: r["name"]
          for r in t["pokemon_species_names"] if r["local_language_id"] == KO}
    en = {r["pokemon_species_id"]: r["name"]
          for r in t["pokemon_species_names"] if r["local_language_id"] == EN}
    genus = {r["pokemon_species_id"]: r.get("genus", "")
             for r in t["pokemon_species_names"] if r["local_language_id"] == KO}

    type_id = {r["id"]: r["identifier"] for r in t["types"]}
    type_ko = {r["type_id"]: r["name"]
               for r in t["type_names"] if r["local_language_id"] == KO}

    # pokemon_types 는 종이 아니라 개체(폼 포함) 기준이다. 기본 폼만 본다
    default = {r["species_id"]: r["id"] for r in t["pokemon"] if r["is_default"] == "1"}
    slots = {}
    for r in t["pokemon_types"]:
        slots.setdefault(r["pokemon_id"], []).append((int(r["slot"]), r["type_id"]))

    cards, missing = [], []
    for s in sorted(t["pokemon_species"], key=lambda r: int(r["id"])):
        sid = s["id"]
        if sid not in ko:
            missing.append((sid, "한국어 이름이 없다"))
            continue
        tid = [type_id[x] for _, x in sorted(slots.get(default.get(sid, ""), []))]
        if not tid:
            missing.append((sid, ko[sid] + " 의 타입을 못 찾았다"))
            continue
        c = {"name": ko[sid], "en": en.get(sid, ""), "no": int(sid),
             "element": tid[0], "gen": int(s["generation_id"]),
             "genus": genus.get(sid, ""), "forms": list(FORMS)}
        if len(tid) > 1:
            c["element2"] = tid[1]
        cards.append(c)

    # 이름이 겹치면 그림 파일이 서로를 덮는다. 카드 이름은 파일 이름이기도 하다
    seen = {}
    for c in cards:
        if c["name"] in seen:
            missing.append((c["no"], "이름이 %d번과 겹친다: %s" % (seen[c["name"]], c["name"])))
        seen[c["name"]] = c["no"]

    used = []
    for k in sorted(type_id, key=int):
        ident = type_id[k]
        if ident in TYPE_COLOR and any(c["element"] == ident or c.get("element2") == ident
                                       for c in cards):
            used.append((ident, type_ko.get(k, ident)))

    old = roster.read("card")
    doc = {
        "version": old.get("version", 1),
        "note": ("캐릭터. kinds 가 카드 갈래를 정하고, cards 는 갈래 이름을 열쇠로 하는 객체다. "
                 "카드 한 장은 {name, en, no, element, element2?, gen, genus, forms} 꼴이다. "
                 "name 은 한국어 정본이고 그림 파일 이름이 여기서 만들어진다 — 고치면 "
                 "이미 올린 그림이 미아가 된다. element 는 묶는 축이고 data/group.json 이 "
                 "이름표를 준다. forms 를 적으면 그 캐릭터가 폼을 갈아 쓴다. 폼은 장비 목록이 "
                 "아니라 장갑을 몇 겹 겹쳤나로 가른다 — 그래야 그림이 한 축으로 등급이 매겨지고 "
                 "나란히 놓고 견줄 수 있다. pick:false 인 폼은 플레이어가 고르지 않는다"
                 "(전투가 만든다). 이 파일은 tools/fetch-cards.py 가 만든다 — 손으로 고친 것은 "
                 "다시 돌리면 날아간다."),
        "kinds": old.get("kinds", [{"key": "character", "word": "kind.character", "stats": []}]),
        "forms": old["forms"],
        "count": len(cards),
        "cards": {"character": cards},
    }
    grp = roster.read("group")
    grp["name"] = {k: v for k, v in used}
    grp["color"] = {k: TYPE_COLOR[k] for k, _ in used}
    grp["order"] = [k for k, _ in used]

    if not a.check and not missing:
        roster.write("card", doc)
        roster.write("group", grp)

    print("[%s] data/card.json · 카드 %d · 묶음 %d"
          % ("검증 실패·저장 안 함" if missing else ("대조" if a.check else "완료"),
             len(cards), len(used)))
    by_gen = {}
    for c in cards:
        by_gen[c["gen"]] = by_gen.get(c["gen"], 0) + 1
    print("  세대별 " + " · ".join("%d세대 %d" % (g, by_gen[g]) for g in sorted(by_gen)))
    print("  두 타입 %d · 한 타입 %d"
          % (sum(1 for c in cards if "element2" in c),
             sum(1 for c in cards if "element2" not in c)))
    if missing:
        print("  못 만든 카드 %d" % len(missing))
        for sid, why in missing[:10]:
            print("     %-6s %s" % (sid, why))
        raise SystemExit(1)


if __name__ == "__main__":
    main()
