"""Dependency-free integrity checks for the buildless portfolio."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import json
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.elements = []
        self.stack = []
        self.ids = set()
        self.feed(source)
        assert not self.stack, f"Unclosed elements: {self.stack}"

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.elements.append((tag, attrs))
        if "id" in attrs:
            assert attrs["id"] not in self.ids, f"Duplicate ID: {attrs['id']}"
            self.ids.add(attrs["id"])
        if tag not in VOID:
            self.stack.append(tag)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        assert self.stack and self.stack[-1] == tag, f"Unexpected </{tag}> after {self.stack[-3:]}"
        self.stack.pop()


pages = {name: Page((ROOT / name).read_text(encoding="utf-8-sig")) for name in ("index.html", "resume.html")}
for name, page in pages.items():
    assert sum(tag == "h1" for tag, _ in page.elements) == 1, f"{name}: expected one h1"
    for tag, attrs in page.elements:
        assert not any(key.startswith("on") for key in attrs), f"{name}: inline event handler"
        if tag == "img":
            assert "alt" in attrs and "width" in attrs and "height" in attrs, f"{name}: image missing accessible/reserved dimensions"
        if attrs.get("target") == "_blank":
            assert "noreferrer" in attrs.get("rel", ""), f"{name}: external link missing noreferrer"
        for reference in (attrs.get("href"), attrs.get("src")):
            if not reference:
                continue
            parsed = urlsplit(reference)
            assert parsed.scheme != "javascript", "Unsafe link scheme"
            if parsed.scheme:
                continue
            destination = (ROOT / parsed.path).resolve() if parsed.path else ROOT / name
            assert destination.is_relative_to(ROOT) and destination.is_file(), f"Missing asset: {reference}"
            if parsed.fragment and destination.suffix == ".html":
                assert parsed.fragment in pages[destination.name].ids, f"Broken anchor: {reference}"
        for attribute in ("aria-controls", "aria-labelledby", "aria-describedby"):
            for identifier in attrs.get(attribute, "").split():
                assert identifier in page.ids, f"Broken {attribute}: {identifier}"

index = pages["index.html"]
projects = [attrs for _, attrs in index.elements if "project" in attrs.get("class", "").split()]
assert len(projects) == 8, f"Expected eight projects, found {len(projects)}"
assert all(project.get("data-category") for project in projects)
source = (ROOT / "index.html").read_text(encoding="utf-8-sig")
assert "Airplane" not in source and "Flappy" not in source, "Removed project returned"
assert "github-readme-activity-graph" not in source, "Failed paid graph service returned"
for expected in ("Digital Triangle Company", "Eskadenia Software", "Optimum Partners", "Leading Point Software", "NASA Space Apps", "IEEExtreme 16.0", "Tahaluf", "JCPC"):
    assert expected in source, f"Professional content lost: {expected}"

baseline = subprocess.check_output(["git", "show", "3094c79:index.html"], cwd=ROOT).decode("utf-8")
original = Page(baseline)
links = lambda page: {attrs["href"] for tag, attrs in page.elements if tag == "a" and attrs.get("href", "").startswith("https:")}
removed = links(original) - links(index)
assert removed == {"https://github.com/ahmed1v0/Airplane-vs-FlappyBirds"}, f"Unexpected removed links: {removed}"
for name in ("script.js", "blueprint.js", "motion.js", "activity.js"):
    subprocess.run(["node", "--check", str(ROOT / name)], check=True)

for path in (ROOT / "assets").rglob("*.svg"):
    tree = ET.parse(path)
    for element in tree.iter():
        assert element.tag.split("}")[-1] not in {"script", "foreignObject"}, f"Unsafe SVG: {path}"
        assert not any(key.startswith("on") for key in element.attrib), f"SVG event handler: {path}"

metadata = {attrs.get("property", attrs.get("name")): attrs.get("content") for tag, attrs in index.elements if tag == "meta"}
for field in ("description", "og:title", "og:description", "og:image", "twitter:card"):
    assert metadata.get(field), f"Missing metadata: {field}"
assert (ROOT / metadata["og:image"]).is_file()
structured_data = source.split('<script type="application/ld+json">')[1].split('</script>')[0]
assert json.loads(structured_data)["name"] == "Ahmed Samer"

styles = (ROOT / "styles.css").read_text(encoding="utf-8-sig")
assert styles.count("{") == styles.count("}"), "Unbalanced CSS braces"
assert "prefers-reduced-motion" in styles and ":focus-visible" in styles
first_party = [ROOT / name for name in ("index.html", "styles.css", "script.js", "blueprint.js", "motion.js", "activity.js", "assets/favicon.svg")]
total_bytes = sum(path.stat().st_size for path in first_party)
assert total_bytes < 200_000, f"Core page exceeds 200 KB budget: {total_bytes}"
print(f"PASS: HTML structure, anchors, assets, metadata, safe SVGs, eight projects, preserved links, and four JS syntax checks. Core files: {total_bytes:,} bytes uncompressed.")
