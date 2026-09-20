#!/usr/bin/env python3
"""Collect source anatomy (not mecha designs), with resumable public API batches.

Fetch uses stdlib only. Build requires tools/appearance-requirements.txt.
Raw revisions stay in an ignored local cache; output contains <=25 source words
per species, source revision IDs and factual descriptors, never whole articles.
"""
import argparse
import hashlib
import json
import re
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
API = 'https://bulbapedia.bulbagarden.net/w/api.php'
PARTS = set('shell carapace plastron tail wing fin ear antenna horn antler crest mane feather fur scale leaf flower petal bulb seed vine tendril tentacle claw talon fang tusk beak bill snout muzzle whisker spike spine marking spot stripe ring band pattern mask gem crystal jewel orb pouch sac flame neck collar ruff ribbon blade shield arm leg hand foot paw hoof body head eye face mouth nose hair trunk root branch mushroom cap stalk stem wheel gear magnet screw cloud gas slime goo rock boulder stone bone skull lump bump ridge plate segment patch tuft mustache beard frill proboscis lip digit finger toe belly abdomen chest back underside caruncle feeler thorn lobe petiole petal tentacle cup disc disk cone star heart bead chain coat flap curl eyelash pupil iris'.split())
PARTS.update('skin bud frond tooth jaw cannon tube appendage tentacle protrusion nub sclera hexagon line dot orb sphere core diamond torso jawline tentacle sac tip crest antennae eyebrow petal crown balloon lobe mouthpart talon armor mouth rim gill lid beak cape cloth robe dress hood stem spoon pendulum coin needle stinger drill trunk fang root branch sword axe hammer headlight handle disc torus cylinder light bulb trunk bow calyx tower shovel crescent cocoon silk fleece pelt rhombus rhombi hole structure glove shoe headband mane coat limb coating stone salt cube coal notch spike brow mustache moustache fang'.split())
ANIMALS = set('turtle tortoise lizard dragon frog toad dinosaur amphibian reptile rodent mouse rat rabbit hare squirrel fox wolf dog canine feline cat lion tiger leopard bird duck goose swan owl hawk eagle falcon pigeon insect worm caterpillar butterfly moth beetle bee wasp spider scorpion crab lobster shrimp fish eel shark whale dolphin jellyfish octopus squid snake cobra serpent bat bear panda monkey ape gorilla elephant mammoth rhino hippopotamus horse pony deer reindeer elk antelope goat sheep cow bull pig boar seal otter weasel ferret mole shrew hedgehog porcupine snail slug clam mussel oyster coral starfish seahorse penguin tree plant flower mushroom cactus cotton peach apple teapot chandelier sword key balloon bell gear snowman snowflake blob mochi'.split())
PRIORITY = set('shell carapace plastron tail wing fin antenna horn antler crest mane leaf flower petal bulb seed vine tendril tentacle tusk beak whisker spike spine marking stripe mask gem crystal jewel pouch sac flame collar ruff ribbon blade shield trunk root branch mushroom cap stalk wheel gear magnet cloud slime rock skull frill proboscis chain'.split())
COLORS = re.compile(r'\b(?:black|white|red|orange|yellow|green|blue|purple|pink|brown|gray|grey|cream|cyan|teal|turquoise|violet|magenta|gold|silver|beige|indigo|maroon|lavender)\b', re.I)
VARIANT = re.compile(r'\b(?:Mega |Gigantamax|Alolan|Galarian|Hisuian|Paldean|Primal |Origin Forme|Shiny|Terastal|Stellar Form|Eternamax)', re.I)
VISUAL_VERBS = set('be have resemble consist cover surround adorn form extend protrude grow sprout possess sport contain decorate end run line attach point curve curl mark reach compose emerge flow fan bear shape encase connect split comprise support border top feature taper develop divide look'.split())


def biology(wikitext, name=''):
    import mwparserfromhell as mw
    found = re.search(r'^==\s*Biology\s*==\s*\n(.*?)(?=^==[^=]|\Z)', wikitext, re.M | re.S)
    if not found:
        return ''
    # Species overview only. Never mix later regional/Mega/form subsections.
    source = re.split(r'^===', found[1], maxsplit=1, flags=re.M)[0]
    # A handful of species describe every form in subsections. Select only the
    # default, named base form, never blend all form descriptions together.
    base_forms = {'Zygarde': '50% Forme', 'Lycanroc': 'Midday Form', 'Wishiwashi': 'Solo Form',
        'Oricorio': 'Baile Style', 'Toxtricity': 'Amped Form', 'Eiscue': 'Ice Face',
        'Indeedee': 'Male', 'Basculegion': 'Male', 'Meowstic': 'Male',
        'Urshifu': 'Single Strike Style', 'Ogerpon': 'Teal Mask', 'Terapagos': 'Normal Form',
        'Minior': 'Meteor Form', 'Palafin': 'Zero Form'}
    heading = base_forms.get(name)
    if heading:
        match = re.search(r'^={3,4}\s*' + re.escape(heading) + r'\s*={3,4}\s*\n(.*?)(?=^===|\Z)', found[1], re.M | re.S)
        if match:
            source = match[1] + '\n\n' + source
    source = re.sub(r'<ref\b[^>]*/>|<ref\b[^>]*>.*?</ref>', '', source, flags=re.S)
    code = mw.parse(source)
    for link in list(code.filter_wikilinks()):
        if str(link.title).lower().startswith(('file:', 'image:')):
            code.remove(link)
    # Resolve visible words in common encyclopaedia link templates.
    for template in reversed(code.filter_templates()):
        key = str(template.name).strip().lower()
        parts = [str(p.value) for p in template.params if str(p.name).strip().isdigit()]
        value = ''
        if key in ('p', 'm', 'a', 'i', 't', 'type', 'tt', 'wp', 'w') and parts:
            value = parts[-1] if key in ('wp', 'w') else parts[0]
        elif key == 'pkmn':
            value = 'Pokémon'
        elif key == 'pokemon':
            value = 'Pokémon'
        elif key == 'obp' and parts:
            value = parts[0]
        elif key in ('color', 'color2') and len(parts) > 1:
            value = parts[-1]
        try:
            code.replace(template, value)
        except ValueError:
            pass
    plain = code.strip_code(normalize=True, collapse=True)
    paras = [re.sub(r'\s+', ' ', p).strip() for p in plain.split('\n\n')]
    paras = [p for p in paras if len(p.split()) > 12 and not p.startswith(('*', '|'))]
    return '\n'.join(paras[:2])


def extract(text, nlp, name):
    """Short, traceable noun descriptors, not a generated design or article copy."""
    doc = nlp(text)
    candidates = []
    for chunk in doc.noun_chunks:
        root = chunk.root
        sent = root.sent
        governing = next((t for t in root.ancestors if t.pos_ in ('VERB', 'AUX')), None)
        if governing is None or governing.lemma_ not in VISUAL_VERBS:
            continue
        if VARIANT.search(sent.text) or root.lemma_.lower() not in PARTS | ANIMALS:
            continue
        if re.search(r'\b(?:when|whenever|if|during|sometimes|temporarily|becomes|become|turns into|occasion|stronger flame)\b', sent.text, re.I):
            continue
        if re.search(r'\b(?:no|not|lacks?|lacking|without|neither|females?)\b', sent.text, re.I):
            continue
        # Only physical description; skip narrative/history and hypothetical anatomy.
        if re.search(r'\b(?:prey|opponent|enemy|victim|Trainer|humans|people|said to|believed to|feeds|eats|eat|eating|diet|food|nutrient|ready|blooming|research|researcher|transforming|transformed|transformation|Generation|anime|episode|manga|Pokémon Sleep|Pokémon Snap)\b', sent.text, re.I):
            continue
        tokens = [t for t in chunk if t.dep_ not in ('det', 'poss') and t.pos_ not in ('PRON', 'DET')]
        phrase = ' '.join(t.text for t in tokens if t.text not in ('"', "'", '“', '”')).strip(' ,:;')
        phrase = re.sub(r'\s*-\s*', '-', phrase)
        phrase = re.sub(r'\s+,', ',', phrase)
        phrase = re.sub(r"^.*?'s\s+", '', phrase)
        # Predicate adjectives: "Its tail is long" -> "long tail".
        if len(tokens) == 1 and root.dep_ in ('nsubj', 'nsubjpass'):
            attrs = [c for c in root.head.children if c.dep_ in ('acomp', 'attr') and c.pos_ == 'ADJ']
            if attrs:
                phrase = attrs[0].text + ' ' + phrase
        count = len(phrase.split())
        if root.lemma_.lower() == 'curl' and 'tail' in phrase:
            phrase = re.sub(r'\s+curls?$', '', phrase) + ' curled inward'
        if count < 2 or count > 7 or not re.search('[a-zA-Z]', phrase):
            continue
        if any(x in phrase.lower() for x in ('other pok', 'own ', 'same ', 'such ', 'these ', 'those ', 'either ', 'left ', 'right ', 'upper ', 'lower ')) and not COLORS.search(phrase):
            continue
        if any(x in phrase.lower() for x in ('tree branches', 'tree trunks', 'river rocks', 'evolution stone', 'solar blade', 'shell armor', 'compressed gas', 'blinding light', 'red chain', 'slither wing', 'wind shield')):
            continue
        key = root.lemma_.lower()
        if key == 'curl' and 'tail' in phrase:
            key = 'tail'
        score = (8 if key in PRIORITY else 0) + (3 if COLORS.search(phrase) else 0)
        if key in ANIMALS:
            score += 5
        if key in ('bud', 'frond', 'cannon', 'tube', 'appendage', 'hexagon', 'stinger', 'drill', 'sword', 'hammer', 'bow', 'feeler'):
            score += 10
        if key in ('skin', 'patch', 'pattern'):
            score += 4
        if key in ('eye', 'pupil', 'mouth', 'finger', 'toe', 'digit'):
            score -= 6
        score += 4 if any(t.dep_ in ('amod', 'nummod', 'compound') for t in tokens) else 0
        score += max(0, 4 - sent.start / 55)
        candidates.append((score, root.i, key, phrase.lower()))
    selected, used, words = [], set(), 0
    for _, index, key, phrase in sorted(candidates, key=lambda x: (-x[0], x[1])):
        count = len(phrase.split())
        if key in used or words + count > 24:
            continue
        selected.append({'part': key, 'detail': phrase})
        used.add(key)
        words += count
        if len(selected) >= 6:
            break
    return selected


def build(args):
    import spacy
    nlp = spacy.load('en_core_web_sm', disable=['ner'])
    by_title, retrieved = {}, {}
    for file in sorted(args.cache.glob('batch-*.json')):
        data = json.loads(file.read_text())
        for page in data['query']['pages']:
            by_title[page['title']] = page
            retrieved[page['title']] = datetime.fromtimestamp(file.stat().st_mtime, timezone.utc).date().isoformat()
        for redirect in data['query'].get('redirects', []):
            if redirect['to'] in by_title:
                by_title[redirect['from']] = by_title[redirect['to']]
    corrections = json.loads((ROOT / 'data/source-appearance-corrections.json').read_text())['entries']
    entries, missing, sparse = {}, [], []
    for card in roster():
        page = by_title.get(title(card))
        if not page or not page.get('revisions'):
            missing.append({'no': card['no'], 'name': card['name'], 'reason': 'missing source'})
            continue
        rev = page['revisions'][0]
        raw = rev['slots']['main']['content']
        text = biology(raw, card['en'])
        features = extract(text, nlp, card['en'])
        correction = corrections.get(str(card['no']))
        if correction:
            features = [{'part': part, 'detail': detail} for part, detail in correction['features']]
        if len(features) < 3:
            sparse.append({'no': card['no'], 'name': card['name'], 'count': len(features)})
        entries[str(card['no'])] = {
            'name': card['name'], 'en': card['en'], 'color': card.get('color', ''),
            'shape': card.get('shape', ''), 'features': features,
            'source': 'https://bulbapedia.bulbagarden.net/wiki/' + urllib.parse.quote(page['title'].replace(' ', '_')),
            'revision': rev['revid'], 'retrieved': retrieved.get(page['title']),
            'sourceTextHash': hashlib.sha256(text.encode()).hexdigest(),
            'method': 'source-checked-correction' if correction else 'text-descriptor-extraction-v1',
            'formScope': correction.get('form', 'base/species overview') if correction else 'base/species overview',
            'status': 'extracted' if len(features) >= 3 else 'sparse',
        }
    result = {'version': 1,
        'note': 'Species appearance, not mecha blueprints. entries: National Dex ID -> {name,en,color,shape,features:[{part,detail}],source,revision,retrieved,method,status}. Features are short source-backed descriptors, <=24 source words/species. Automated extraction; not image-verified. Regional/Mega subsection descriptions excluded. No runtime network/AI or required manual input.',
        'sources': {'base': 'https://github.com/PokeAPI/pokeapi',
                    'details': 'https://bulbapedia.bulbagarden.net',
                    'attribution': 'Bulbapedia contributors; extracted and abridged by PKM Atelier',
                    'license': 'CC-BY-NC-SA-2.5',
                    'licenseUrl': 'https://creativecommons.org/licenses/by-nc-sa/2.5/'},
        'entries': entries}
    report = {'expected': 1025, 'collected': len(entries), 'missing': missing, 'sparse': sparse}
    (args.cache / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'collected': len(entries), 'missing': missing, 'sparse': sparse}, ensure_ascii=False), flush=True)
    if missing or sparse or len(entries) != 1025:
        raise SystemExit('Incomplete extraction: published dataset unchanged; inspect cache/report.json.')
    (ROOT / 'data/source-appearance.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')


def roster():
    return json.loads((ROOT / 'data/card.json').read_text())['cards']['character']


def title(card):
    # Canonical English species titles use straight apostrophes.
    return card['en'].replace('’', "'") + ' (Pokémon)'


def fetch(args):
    cards = roster()
    args.cache.mkdir(parents=True, exist_ok=True)
    last_request = 0
    for offset in range(0, len(cards), 50):
        dest = args.cache / f'batch-{offset + 1:04d}.json'
        if dest.exists():
            print(f'cached {offset + 1}-{min(offset + 50, len(cards))}', flush=True)
            continue
        time.sleep(max(0, 5 - (time.monotonic() - last_request)))
        params = dict(action='query', format='json', formatversion='2',
                      prop='revisions', rvprop='ids|timestamp|content', rvslots='main',
                      redirects='1', titles='|'.join(title(c) for c in cards[offset:offset + 50]))
        req = urllib.request.Request(API + '?' + urllib.parse.urlencode(params),
            headers={'User-Agent': 'PKMAtelierAppearance/1.0 (source metadata research; cached requests)'})
        last_request = time.monotonic()
        with urllib.request.urlopen(req, timeout=90) as response:
            data = json.load(response)
        if 'error' in data or 'query' not in data:
            raise RuntimeError(data)
        dest.write_text(json.dumps(data, ensure_ascii=False), encoding='utf-8')
        pages = data['query']['pages']
        print(f'fetched {offset + 1}-{min(offset + 50, len(cards))}: {len(pages)} pages', flush=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--cache', type=Path, default=ROOT / '.cache/source-appearance')
    ap.add_argument('--fetch', action='store_true')
    ap.add_argument('--build', action='store_true')
    args = ap.parse_args()
    if args.fetch:
        fetch(args)
    if args.build:
        build(args)


if __name__ == '__main__':
    main()
