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
    claim_topics = {
        'en': ('In-game announcements and reward claims', 'November 25, 2026',
               'same iCloud account', 'announcement is withdrawn', 'another device or a new installation', 'does not delete'),
        'zh': ('游戏内公告与奖励领取', '2026 年 11 月 25 日',
               '同一 iCloud 账号', '公告被撤回后', '其他设备或新的安装', '不会删除'),
        'zh-hant': ('遊戲內公告與獎勵領取', '2026 年 11 月 25 日',
                    '同一 iCloud 帳號', '公告被撤回後', '其他裝置或新的安裝', '不會刪除'),
        'ja': ('ゲーム内のお知らせと報酬の受け取り', '2026年11月25日',
               '同じ iCloud アカウント', '公開取り下げ後', '別の端末や新しいインストール', '削除されません'),
        'ko': ('게임 내 공지와 보상 수령', '2026년 11월 25일',
               '같은 iCloud 계정', '공지가 철회된 후', '다른 기기나 새 설치', '삭제되지 않습니다'),
    }
    for language, html_language in expected.items():
        section = policy.sections[language]
        assert section['lang'] == html_language
        assert len(section['h1']) == 1 and len(section['h2']) == 7 and len(section['p']) == 11, language
        text = ' '.join(section['p'])
        title, date, account, withdrawn, installation, retained = claim_topics[language]
        assert section['h2'][4] == title, (language, 'reward disclosure topic missing or reordered')
        assert date in section['p'][0], (language, 'policy date')
        claims = ' '.join(section['p'][6:9])
        for term in ('Firebase Remote Config', 'HTTPS', 'IP', 'CloudKit', account, withdrawn, installation, retained):
            assert term in claims, (language, 'claim or image disclosure missing', term)
        assert text.count('zhuyichen716@gmail.com') == 1, (language, 'contact changed or duplicated')
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
    print('Five policy sections: seven topics and eleven paragraphs per language')
    if args.original_policy:
        print('Original EN/zh policy disclosures preserved')
    print('Five-language policy nav, homepage mapping, support backlinks and unchanged official URL checked')


if __name__ == '__main__':
    main()
