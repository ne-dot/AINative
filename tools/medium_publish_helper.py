#!/usr/bin/env python3
"""Prepare Markdown articles for pasting into Medium.

This tool keeps the source of truth in Markdown, replaces local image paths
with public URLs when an uploader is configured, writes a Medium-friendly HTML
file, and copies the result to the macOS clipboard when possible.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import html
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_DIR = ROOT / "dist" / "medium"


@dataclass
class ImageRef:
    alt: str
    source: str
    resolved_path: Path | None
    public_url: str


def slugify(value: str) -> str:
    value = re.sub(r"[^\w\s.-]+", "", value, flags=re.UNICODE).strip().lower()
    value = re.sub(r"[\s_]+", "-", value)
    return value or "medium-article"


def split_inline(text: str) -> str:
    """Render a small Markdown inline subset used by these articles."""
    tokens = re.split(r"(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))", text)
    rendered: list[str] = []
    for token in tokens:
        if not token:
            continue
        link = re.fullmatch(r"\[(.*?)\]\((.*?)\)", token)
        if link:
            label, href = link.groups()
            rendered.append(
                f'<a href="{html.escape(href, quote=True)}">{split_inline(label)}</a>'
            )
        elif token.startswith("**") and token.endswith("**"):
            rendered.append(f"<strong>{split_inline(token[2:-2])}</strong>")
        elif token.startswith("*") and token.endswith("*"):
            rendered.append(f"<em>{split_inline(token[1:-1])}</em>")
        elif token.startswith("`") and token.endswith("`"):
            rendered.append(f"<code>{html.escape(token[1:-1])}</code>")
        else:
            rendered.append(html.escape(token))
    return "".join(rendered)


def read_markdown(path: Path) -> tuple[str, list[str]]:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    title = path.stem
    for line in lines:
        if line.startswith("# "):
            title = line[2:].strip()
            break
    return title, lines


def git_output(args: list[str]) -> str:
    return subprocess.check_output(args, cwd=ROOT, text=True).strip()


def parse_github_owner_repo(remote_url: str) -> str:
    ssh_match = re.match(r"git@github\.com:(.+?)(?:\.git)?$", remote_url)
    if ssh_match:
        return ssh_match.group(1)

    https_match = re.match(r"https://github\.com/(.+?)(?:\.git)?$", remote_url)
    if https_match:
        return https_match.group(1)

    raise RuntimeError(f"Could not parse GitHub remote URL: {remote_url}")


def current_repo_raw_url(path: Path) -> str:
    repo = os.getenv("MEDIUM_IMAGE_GITHUB_REPO")
    if not repo:
        repo = parse_github_owner_repo(git_output(["git", "remote", "get-url", "origin"]))

    branch = os.getenv("MEDIUM_IMAGE_GITHUB_BRANCH")
    if not branch:
        branch = git_output(["git", "branch", "--show-current"]) or "main"

    relative_path = path.resolve().relative_to(ROOT).as_posix()
    encoded_path = urllib.parse.quote(relative_path)
    return f"https://raw.githubusercontent.com/{repo.strip().strip('/')}/{branch}/{encoded_path}"


def github_upload(path: Path, remote_name: str, dry_run: bool) -> str:
    token = os.getenv("GITHUB_TOKEN")
    repo = os.getenv("MEDIUM_IMAGE_GITHUB_REPO")
    branch = os.getenv("MEDIUM_IMAGE_GITHUB_BRANCH", "main")
    directory = os.getenv("MEDIUM_IMAGE_GITHUB_DIR", "medium")

    if not token or not repo:
        raise RuntimeError(
            "GitHub upload needs GITHUB_TOKEN and MEDIUM_IMAGE_GITHUB_REPO."
        )

    owner_repo = repo.strip().strip("/")
    api_path = f"{directory.strip('/')}/{remote_name}"
    api_url = f"https://api.github.com/repos/{owner_repo}/contents/{urllib.parse.quote(api_path)}"
    raw_url = f"https://raw.githubusercontent.com/{owner_repo}/{branch}/{api_path}"

    if dry_run:
        return raw_url

    existing_request = urllib.request.Request(
        f"{api_url}?ref={urllib.parse.quote(branch)}",
        method="GET",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "User-Agent": "ai-native-medium-helper",
        },
    )
    try:
        with urllib.request.urlopen(existing_request, timeout=30) as response:
            payload = json.loads(response.read().decode("utf-8"))
            return payload.get("download_url") or raw_url
    except urllib.error.HTTPError as exc:
        if exc.code != 404:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"GitHub lookup failed for {path}: {exc.code} {detail}") from exc

    body = {
        "message": f"Upload Medium image {remote_name}",
        "content": base64.b64encode(path.read_bytes()).decode("ascii"),
        "branch": branch,
    }
    data = json.dumps(body).encode("utf-8")
    request = urllib.request.Request(
        api_url,
        data=data,
        method="PUT",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
            "User-Agent": "ai-native-medium-helper",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = json.loads(response.read().decode("utf-8"))
            return payload.get("content", {}).get("download_url") or raw_url
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"GitHub upload failed for {path}: {exc.code} {detail}") from exc


def public_image_url(path: Path, uploader: str, dry_run: bool) -> str:
    if uploader == "repo":
        return current_repo_raw_url(path)

    digest = hashlib.sha1(path.read_bytes()).hexdigest()[:10]
    remote_name = f"{path.stem}-{digest}{path.suffix.lower()}"
    if uploader == "github":
        return github_upload(path, remote_name, dry_run)
    raise RuntimeError(f"Unsupported uploader: {uploader}")


def resolve_image(markdown_path: Path, alt: str, src: str, uploader: str, dry_run: bool) -> ImageRef:
    if re.match(r"^https?://", src):
        return ImageRef(alt=alt, source=src, resolved_path=None, public_url=src)

    resolved = (markdown_path.parent / src).resolve()
    if not resolved.exists():
        return ImageRef(alt=alt, source=src, resolved_path=resolved, public_url=src)

    if uploader == "none":
        return ImageRef(alt=alt, source=src, resolved_path=resolved, public_url=resolved.as_uri())

    return ImageRef(
        alt=alt,
        source=src,
        resolved_path=resolved,
        public_url=public_image_url(resolved, uploader, dry_run),
    )


def render_html(markdown_path: Path, lines: list[str], uploader: str, dry_run: bool) -> tuple[str, list[ImageRef]]:
    body: list[str] = []
    images: list[ImageRef] = []
    in_list = False
    in_quote = False
    quote_lines: list[str] = []

    def close_list() -> None:
        nonlocal in_list
        if in_list:
            body.append("</ul>")
            in_list = False

    def close_quote() -> None:
        nonlocal in_quote, quote_lines
        if in_quote:
            paragraphs = "".join(f"<p>{split_inline(line)}</p>" for line in quote_lines if line)
            body.append(f"<blockquote>{paragraphs}</blockquote>")
            quote_lines = []
            in_quote = False

    for raw in lines:
        line = raw.rstrip()

        if line.startswith(">"):
            close_list()
            in_quote = True
            quote_lines.append(line[1:].strip())
            continue

        close_quote()

        if not line:
            close_list()
            continue

        image_match = re.fullmatch(r"!\[(.*?)\]\((.*?)\)", line)
        if image_match:
            close_list()
            alt, src = image_match.groups()
            image_ref = resolve_image(markdown_path, alt, src, uploader, dry_run)
            images.append(image_ref)
            body.append(
                f'<figure><img src="{html.escape(image_ref.public_url, quote=True)}" '
                f'alt="{html.escape(alt, quote=True)}">'
                f"{f'<figcaption>{split_inline(alt)}</figcaption>' if alt else ''}</figure>"
            )
            continue

        if line == "---":
            close_list()
            body.append("<hr>")
            continue

        if line.startswith("# "):
            close_list()
            body.append(f"<h1>{split_inline(line[2:].strip())}</h1>")
        elif line.startswith("## "):
            close_list()
            body.append(f"<h2>{split_inline(line[3:].strip())}</h2>")
        elif line.startswith("### "):
            close_list()
            body.append(f"<h3>{split_inline(line[4:].strip())}</h3>")
        elif line.startswith("- "):
            if not in_list:
                body.append("<ul>")
                in_list = True
            body.append(f"<li>{split_inline(line[2:].strip())}</li>")
        else:
            close_list()
            body.append(f"<p>{split_inline(line)}</p>")

    close_quote()
    close_list()
    return "\n".join(body), images


def html_document(title: str, body: str) -> str:
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(title)}</title>
  <style>
    body {{
      max-width: 720px;
      margin: 48px auto;
      padding: 0 24px;
      color: #242424;
      font: 20px/1.65 Georgia, "Times New Roman", serif;
    }}
    h1, h2, h3 {{ font-family: Arial, Helvetica, sans-serif; line-height: 1.2; }}
    h1 {{ font-size: 42px; margin-bottom: 32px; }}
    h2 {{ font-size: 28px; margin-top: 48px; }}
    blockquote {{ border-left: 4px solid #d9d9d9; margin-left: 0; padding-left: 20px; color: #555; }}
    img {{ display: block; max-width: 100%; height: auto; margin: 28px auto 8px; }}
    figcaption {{ color: #777; font: 14px/1.4 Arial, Helvetica, sans-serif; text-align: center; }}
    hr {{ border: 0; border-top: 1px solid #ddd; margin: 36px 0; }}
    code {{ font-family: Menlo, Consolas, monospace; font-size: 0.9em; }}
  </style>
</head>
<body>
{body}
</body>
</html>
"""


def copy_with_pbcopy(value: str) -> bool:
    try:
        subprocess.run(["pbcopy"], input=value.encode("utf-8"), check=True)
        return True
    except (FileNotFoundError, subprocess.CalledProcessError):
        return False


def copy_html_to_clipboard(html_path: Path, body_html: str, mode: str) -> str:
    if mode == "none":
        return "Clipboard unchanged."

    if mode == "source":
        copied = copy_with_pbcopy(body_html)
        return "Copied HTML source with pbcopy." if copied else "Could not copy HTML source."

    applescript = (
        'set htmlFile to POSIX file "{path}"\n'
        'set the clipboard to (read htmlFile as «class HTML»)'
    ).format(path=str(html_path).replace('"', '\\"'))
    try:
        subprocess.run(["osascript", "-e", applescript], check=True, capture_output=True)
        return "Copied rich HTML to the macOS clipboard."
    except (FileNotFoundError, subprocess.CalledProcessError):
        copied = copy_with_pbcopy(body_html)
        if copied:
            return "Rich HTML copy failed; copied HTML source with pbcopy."
        return "Clipboard copy failed."


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert a Markdown article into Medium-friendly HTML."
    )
    parser.add_argument("markdown", type=Path, help="Markdown article path.")
    parser.add_argument(
        "--uploader",
        choices=["none", "repo", "github"],
        default=os.getenv("MEDIUM_IMAGE_UPLOADER", "none"),
        help="Image mode. none=file URLs, repo=current GitHub repo raw URLs, github=upload through API.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="Output directory. Default: dist/medium.",
    )
    parser.add_argument(
        "--copy",
        choices=["rich", "source", "none"],
        default="rich",
        help="Clipboard mode. Default: rich.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show expected remote URLs without uploading.",
    )
    return parser.parse_args(argv)


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    markdown_path = args.markdown.resolve()
    if not markdown_path.exists():
        print(f"Markdown file not found: {markdown_path}", file=sys.stderr)
        return 1

    title, lines = read_markdown(markdown_path)
    body_html, images = render_html(markdown_path, lines, args.uploader, args.dry_run)
    full_html = html_document(title, body_html)

    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{slugify(markdown_path.stem)}.html"
    output_path.write_text(full_html, encoding="utf-8")

    clipboard_status = copy_html_to_clipboard(output_path, body_html, args.copy)

    print(f"Title: {title}")
    print(f"HTML: {output_path}")
    print(f"Images: {len(images)}")
    for image_ref in images:
        status = "remote" if image_ref.resolved_path is None else "local"
        print(f"- {status}: {image_ref.source} -> {image_ref.public_url}")
    print(clipboard_status)
    if args.uploader == "none" and images:
        print("Note: local images use file:// URLs. Use --uploader github before pasting to Medium.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
