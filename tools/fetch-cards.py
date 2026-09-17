#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""카드 자료를 받아 data/card.json · data/group.json 을 만든다.

받는 곳은 PokéAPI 가 제 저장소에 올려 둔 CSV 다.
    https://github.com/PokeAPI/pokeapi  →  data/v2/csv/

REST API(pokeapi.co)를 한 마리씩 부르지 않는 까닭: 1,025종이면 호출이 1,025번이다.
CSV 는 아홉 개만 받으면 되고 합쳐서 0.5 MB 다. 게다가 이름·타입·세대가 한 곳에
정리돼 있어 우리가 쓸 꼴로 바로 맞출 수 있다.

만드는 것
    data/card.json   카드 1,025장
    data/group.json  타입 18가지 이름표와 색 (카드를 묶는 축이다)
    data/label.json  종족값·색·알그룹 이름표 (카드에는 열쇠만 넣는다)
    data/chart.json  타입 상성표. chart[공격 타입][방어 타입] = 배율 (0 · 0.5 · 1 · 2)

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
         "generations", "generation_names",
         "stats", "stat_names", "pokemon_stats",
         "pokemon_colors", "pokemon_color_names", "pokemon_shapes",
         "egg_groups", "egg_group_prose", "pokemon_egg_groups",
         "pokemon_species_flavor_text", "type_efficacy")

# 종족값 여섯. 7·8(명중률·회피율)은 개체가 아니라 기술에 붙는 값이라 뺀다
STAT_IDS = ("1", "2", "3", "4", "5", "6")
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

    # 키·무게는 개체(기본 폼)에 붙는다. 자료는 dm·hg 단위라 m·kg 으로 돌린다
    body = {r["species_id"]: r for r in t["pokemon"] if r["is_default"] == "1"}

    # 종족값 여섯. STAT_IDS 차례대로 배열에 담는다 — 열쇠를 카드마다 되풀이하면
    # 파일이 1,025번 두꺼워진다. 이름표는 data/label.json 이 준다
    stat = {}
    for r in t["pokemon_stats"]:
        if r["stat_id"] in STAT_IDS:
            stat.setdefault(r["pokemon_id"], {})[r["stat_id"]] = int(r["base_stat"])

    color = {r["id"]: r["identifier"] for r in t["pokemon_colors"]}
    shape = {r["id"]: r["identifier"] for r in t["pokemon_shapes"]}
    egg = {}
    for r in t["pokemon_egg_groups"]:
        egg.setdefault(r["species_id"], []).append(r["egg_group_id"])
    egg_id = {r["id"]: r["identifier"] for r in t["egg_groups"]}

    # 도감 설명. 한 종에 판본마다 하나씩 있어 여럿이다 — 가장 나중 것을 쓴다
    text = {}
    for r in t["pokemon_species_flavor_text"]:
        if r["language_id"] == KO:
            text[r["species_id"]] = r["flavor_text"].replace("\n", " ").replace("\x0c", " ")

    # 진화. evolves_from 만 있으므로 뒤집어서 "무엇으로 진화하나" 도 만든다
    evo_to = {}
    for r in t["pokemon_species"]:
        prev = r["evolves_from_species_id"]
        if prev:
            evo_to.setdefault(prev, []).append(r["id"])

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

        b = body.get(sid)
        if b:
            c["h"] = round(int(b["height"]) / 10, 1)     # dm → m
            c["w"] = round(int(b["weight"]) / 10, 1)     # hg → kg
            st = stat.get(b["id"])
            if st and all(k in st for k in STAT_IDS):
                c["stats"] = [st[k] for k in STAT_IDS]
        if s["color_id"] in color:
            c["color"] = color[s["color_id"]]
        if s["shape_id"] in shape:
            c["shape"] = shape[s["shape_id"]]
        if sid in egg:
            c["egg"] = [egg_id[g] for g in egg[sid] if g in egg_id]
        if s["is_legendary"] == "1":
            c["rare"] = "legendary"
        elif s["is_mythical"] == "1":
            c["rare"] = "mythical"
        prev = s["evolves_from_species_id"]
        if prev and prev in ko:
            c["from"] = ko[prev]
        nxt = [ko[x] for x in evo_to.get(sid, []) if x in ko]
        if nxt:
            c["to"] = nxt
        if sid in text:
            c["text"] = text[sid]
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
    # 종족값·색·알그룹 이름표. 카드에는 열쇠만 넣고 사람이 읽는 말은 여기 모은다
    stat_ko = {r["stat_id"]: r["name"]
               for r in t["stat_names"] if r["local_language_id"] == KO}
    color_ko = {r["pokemon_color_id"]: r["name"]
                for r in t["pokemon_color_names"] if r["local_language_id"] == KO}
    egg_ko = {r["egg_group_id"]: r["name"]
              for r in t["egg_group_prose"] if r["local_language_id"] == KO}
    label = {
        "version": 1,
        "note": ("카드 값의 이름표. data/card.json 은 열쇠와 숫자만 담고 사람이 읽는 말은 "
                 "여기서 온다. stat 은 card.json 의 stats 배열과 같은 차례다 — 차례가 "
                 "어긋나면 공격이 방어로 뜬다. shape 는 한국어 정본이 없어 영문 열쇠 그대로다. "
                 "tools/fetch-cards.py 가 만든다."),
        "stat": [stat_ko.get(k, k) for k in STAT_IDS],
        "color": {color[k]: color_ko[k] for k in sorted(color, key=int) if k in color_ko},
        "egg": {egg_id[k]: egg_ko[k] for k in sorted(egg_id, key=int) if k in egg_ko},
        "shape": {shape[k]: shape[k] for k in sorted(shape, key=int)},
    }

    # 상성표. 공격 타입 → 방어 타입 → 배율. 18타입만 (unknown·shadow·stellar 은 뺀다)
    chart = {}
    for r in t["type_efficacy"]:
        atk_t, def_t = type_id.get(r["damage_type_id"]), type_id.get(r["target_type_id"])
        if atk_t in TYPE_COLOR and def_t in TYPE_COLOR:
            chart.setdefault(atk_t, {})[def_t] = int(r["damage_factor"]) / 100
    chart_doc = {
        "version": 1,
        "note": ("타입 상성표. chart[공격 타입][방어 타입] = 배율이고 0 · 0.5 · 1 · 2 넷뿐이다. "
                 "두 타입을 가진 쪽이 맞을 때는 둘을 곱한다. 원본 게임의 표 그대로이며 "
                 "이 놀이에서 상성은 '누가 유리한가' 만 정하고 폼이 '그 교환을 할 여력이 "
                 "있는가' 를 정한다. tools/fetch-cards.py 가 만든다."),
        "types": [k for k, _ in used],
        "chart": {x: {y: chart[x][y] for y, _ in used} for x, _ in used},
    }

    grp = roster.read("group")
    grp["name"] = {k: v for k, v in used}
    grp["color"] = {k: TYPE_COLOR[k] for k, _ in used}
    grp["order"] = [k for k, _ in used]

    if not a.check and not missing:
        roster.write("card", doc)
        roster.write("group", grp)
        roster.write("label", label)
        roster.write("chart", chart_doc)

    print("[%s] data/card.json · 카드 %d · 묶음 %d"
          % ("검증 실패·저장 안 함" if missing else ("대조" if a.check else "완료"),
             len(cards), len(used)))
    by_gen = {}
    for c in cards:
        by_gen[c["gen"]] = by_gen.get(c["gen"], 0) + 1
    print("  세대별 " + " · ".join("%d세대 %d" % (g, by_gen[g]) for g in sorted(by_gen)))
    # 다 차야 하는 값과, 빈 것이 정상인 값을 갈라 적는다.
    # 안 가르면 "진화 전 484/1025" 가 늘 경고처럼 보여서 진짜 구멍이 묻힌다
    for k, what in (("stats", "종족값"), ("color", "색"), ("shape", "모양"),
                    ("egg", "알그룹"), ("h", "키·무게")):
        n = sum(1 for c in cards if k in c)
        print("  %-9s %4d / %d%s" % (what, n, len(cards),
                                     "" if n == len(cards) else "  ← 비었다"))
    n = sum(1 for c in cards if "text" in c)
    print("  %-9s %4d / %d%s" % ("도감 설명", n, len(cards),
                                 "" if n == len(cards) else
                                 "  ← 한국어 설명이 아직 없는 종이 있다"))
    n2 = sum(1 for a in chart_doc["chart"].values() for v in a.values() if v == 2)
    n0 = sum(1 for a in chart_doc["chart"].values() for v in a.values() if v == 0)
    print("  상성표 %d×%d · 2배 %d칸 · 무효 %d칸" % (len(chart_doc["types"]), len(chart_doc["types"]), n2, n0))
    print("  없는 것이 정상: 진화 전 %d · 진화 후 %d · 전설·환상 %d · 두 타입 %d"
          % (sum(1 for c in cards if "from" in c), sum(1 for c in cards if "to" in c),
             sum(1 for c in cards if "rare" in c),
             sum(1 for c in cards if "element2" in c)))
    if missing:
        print("  못 만든 카드 %d" % len(missing))
        for sid, why in missing[:10]:
            print("     %-6s %s" % (sid, why))
        raise SystemExit(1)


if __name__ == "__main__":
    main()
