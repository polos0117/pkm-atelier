"""Run with appearance-requirements installed; no live web calls."""
import importlib.util
import unittest
from pathlib import Path

spec=importlib.util.spec_from_file_location('appearance', Path(__file__).resolve().parents[1]/'tools/fetch-appearance.py')
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class ExtractorTests(unittest.TestCase):
    def test_self_closing_reference_preserves_description(self):
        text='==Biology==\nCreature has blue skin.<ref name="x"/> It has a yellow horn and three red fins.\n\nIt lives nearby.<ref name="x">citation</ref>\n===Forms===\nMega Creature has green wings.'
        out=mod.biology(text)
        self.assertIn('yellow horn',out)
        self.assertNotIn('Mega',out)
        self.assertNotIn('citation',out)

    def test_variant_subsections_excluded(self):
        text='==Biology==\nCreature is a small blue turtle with a brown shell and a white rim.\n===Alolan Form===\nIt has purple horns.\n==Game data==\nanything'
        out=mod.biology(text)
        self.assertIn('brown shell',out)
        self.assertNotIn('purple horns',out)

    def test_extraction_excludes_food_and_conditional_colors(self):
        import spacy
        nlp=spacy.load('en_core_web_sm',disable=['ner'])
        text='It has a brown shell and a curled tail. It eats green leaves. When angry, it has a blue flame. It has no visible arms. It is strong enough to break thick tree trunks.'
        out=mod.extract(text,nlp,'Test')
        flat=' '.join(x['detail'] for x in out)
        self.assertIn('brown shell',flat)
        self.assertNotIn('leaves',flat)
        self.assertNotIn('blue flame',flat)
        self.assertNotIn('arms',flat)
        self.assertNotIn('trunks',flat)
        self.assertLessEqual(len(flat.split()),24)

if __name__=='__main__':
    unittest.main()
