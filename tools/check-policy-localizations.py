#!/usr/bin/env python3
"""Read-only checks for the five-language public policy and its entry points."""
import argparse
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]


class Policy(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sections = {}
        self.links = []
        self.current = None
        self.kind = None
        self.parts = []
        self.ids = []
        self.document_language = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'html':
            self.document_language = attrs.get('lang')
        if attrs.get('id'):
            self.ids.append(attrs['id'])
        if tag == 'section':
            self.current = attrs.get('id')
            self.sections[self.current] = {'lang': attrs.get('lang', self.document_language), 'h1': [], 'h2': [], 'p': []}
        if tag in ('h1', 'h2', 'p') and self.current:
            self.kind = tag
            self.parts = []
        if tag == 'a':
            self.links.append((self.current, attrs.get('href', '')))

    def handle_data(self, data):
        if self.kind:
            self.parts.append(data)

    def handle_endtag(self, tag):
        if self.current and tag == self.kind:
            self.sections[self.current][tag].append(''.join(self.parts))
            self.kind = None
            self.parts = []
        if tag == 'section':
            self.current = None


def parse(file):
    p = Policy()
    p.feed(file.read_text(encoding='utf-8'))
    return p


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--original-policy', type=Path, help='Optional original EN/zh HTML to check unchanged disclosures')
    args = parser.parse_args()
    policy = parse(ROOT / 'privacy/index.html')
    expected = {'en': 'en', 'zh': 'zh-Hans', 'zh-hant': 'zh-Hant', 'ja': 'ja', 'ko': 'ko'}
    assert set(policy.sections) == set(expected), 'five complete policy sections are required'
    assert all(count == 1 for count in Counter(policy.ids).values()), 'duplicate section ids'
    if args.original_policy:
        original = parse(args.original_policy)
        for language in ('en', 'zh'):
            assert policy.sections[language] == original.sections[language], 'original disclosure must remain unchanged'
    for language, html_language in expected.items():
        section = policy.sections[language]
        assert section['lang'] == html_language
        assert len(section['h1']) == 1 and len(section['h2']) == 6 and len(section['p']) == 8, language
        text = ' '.join(section['p'])
        for item in ('BondSet', 'Yichen Zhu', 'Apple', 'iCloud', 'CloudKit', 'StoreKit', 'AdMob',
                     'Google Analytics', 'Firebase', 'BigQuery', '60', 'zhuyichen716@gmail.com'):
            assert item in text, (language, item)
        assert (None, '#' + language) in policy.links, 'language nav must link to its section'
        assert (language, 'mailto:zhuyichen716@gmail.com') in policy.links
    for _, link in policy.links:
        if link.startswith('#'):
            assert link[1:] in policy.sections, link
        elif link.startswith('http'):
            assert urlparse(link).scheme == 'https', link
    support = parse(ROOT / 'support/index.html')
    for language in expected:
        assert (language, '../privacy/#' + language) in support.links, language
    script = (ROOT / 'assets/site.js').read_text(encoding='utf-8')
    assert 'privacyAnchor: "zh-hant"' in script and 'privacyAnchor: "ja"' in script and 'privacyAnchor: "ko"' in script
    assert '(영어)' not in script and '隱私權政策（簡中）' not in script
    index = (ROOT / 'index.html').read_text(encoding='utf-8')
    assert 'https://easonzz.github.io/Airborne/' in index and 'https://easonzz.github.io/BondSet/' not in index
    assert 'site.js?v=privacy-five-languages' in index
    assert 'available: false' in script, 'do not advertise released availability before launch'
    print('Five policy sections: six topics and eight paragraphs per language')
    if args.original_policy:
        print('Original EN/zh policy disclosures preserved')
    print('Five-language policy nav, homepage mapping, support backlinks and unchanged official URL checked')


if __name__ == '__main__':
    main()
