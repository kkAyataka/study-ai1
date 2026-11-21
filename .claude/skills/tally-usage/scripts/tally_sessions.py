"""Claude Code のログ (~/.claude/projects/**/*.jsonl) からセッションごとのトークン量を集計し、CSV に書き込む。

使い方: python3 -I tally_sessions.py CSV_PATH

- CSV にまだないセッションは末尾に追記する。
- CSV にすでにあるセッション（session_id が同じ行）は、最新の値で上書きする。
- ログが消えたセッションの行はそのまま残す。
"""
import csv, glob, json, os, sys
from collections import defaultdict
from datetime import datetime

COLUMNS = ["start", "end", "project", "title", "session_id", "models", "requests",
           "input", "output", "cache_read", "cache_write_5m", "cache_write_1h",
           "api_calls", "total_tokens"]
TOKENS = ["input", "output", "cache_read", "cache_write_5m", "cache_write_1h"]
FMT = "%Y-%m-%d %H:%M"


def local(ts):
    return datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone()


def is_prompt(r):
    if r.get("isSidechain") or r.get("isMeta"):
        return False
    c = (r.get("message") or {}).get("content")
    if isinstance(c, list):
        return not any(isinstance(b, dict) and b.get("type") == "tool_result" for b in c)
    return isinstance(c, str) and bool(c.strip())


def collect():
    root = os.path.expanduser("~/.claude/projects")
    s = defaultdict(lambda: {"models": set(), "prompts": set(), "first": None, "last": None,
                             "title": "", "project": "", "api_calls": 0,
                             **{k: 0 for k in TOKENS}})
    seen = set()
    for path in glob.glob(f"{root}/**/*.jsonl", recursive=True):
        with open(path, encoding="utf-8") as f:
            for line in f:
                try:
                    r = json.loads(line)
                except ValueError:
                    continue
                sid = r.get("sessionId")
                if not sid:
                    continue
                d = s[sid]
                if r.get("cwd") and not d["project"]:
                    d["project"] = os.path.basename(r["cwd"])
                t = r.get("type")
                if t == "custom-title":
                    d["title"] = r.get("customTitle") or d["title"]
                elif t == "user" and is_prompt(r):
                    d["prompts"].add(r.get("uuid"))
                elif t == "assistant" and r.get("timestamp"):
                    m = r.get("message") or {}
                    if "usage" not in m or m.get("model") == "<synthetic>":
                        continue
                    key = (m.get("id"), r.get("requestId"))
                    if key in seen:  # 1つの応答が複数行に記録されることがある
                        continue
                    seen.add(key)
                    u = m["usage"]
                    cc = u.get("cache_creation") or {}
                    w5 = cc.get("ephemeral_5m_input_tokens")
                    w1 = cc.get("ephemeral_1h_input_tokens")
                    if w5 is None and w1 is None:
                        w5, w1 = u.get("cache_creation_input_tokens", 0), 0
                    d["input"] += u.get("input_tokens", 0)
                    d["output"] += u.get("output_tokens", 0)
                    d["cache_read"] += u.get("cache_read_input_tokens", 0)
                    d["cache_write_5m"] += w5 or 0
                    d["cache_write_1h"] += w1 or 0
                    d["api_calls"] += 1
                    d["models"].add(m.get("model", "?").replace("claude-", ""))
                    ts = local(r["timestamp"])
                    d["first"] = min(d["first"] or ts, ts)
                    d["last"] = max(d["last"] or ts, ts)
    rows = {}
    for sid, d in s.items():
        if not d["api_calls"]:
            continue
        rows[sid] = {
            "start": d["first"].strftime(FMT), "end": d["last"].strftime(FMT),
            "project": d["project"], "title": d["title"], "session_id": sid,
            "models": " ".join(sorted(d["models"])), "requests": len(d["prompts"]),
            **{k: d[k] for k in TOKENS}, "api_calls": d["api_calls"],
            "total_tokens": sum(d[k] for k in TOKENS),
        }
    return rows


def main():
    if len(sys.argv) != 2:
        sys.exit("usage: tally_sessions.py CSV_PATH")
    path = os.path.expanduser(sys.argv[1])
    existing = []
    if os.path.exists(path):
        with open(path, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            if reader.fieldnames != COLUMNS:
                sys.exit(f"列が違います。この CSV には書き込みません: {path}\n"
                         f"  期待: {','.join(COLUMNS)}\n  実際: {','.join(reader.fieldnames or [])}")
            existing = list(reader)

    fresh = collect()
    updated, kept, done = [], 0, set()
    out = []
    for row in existing:
        sid = row["session_id"]
        if sid in fresh:
            new = {k: str(v) for k, v in fresh[sid].items()}
            if new != row:
                updated.append(new)
            out.append(new)
            done.add(sid)
        else:
            out.append(row)
            kept += 1
    added = sorted((r for sid, r in fresh.items() if sid not in done), key=lambda r: r["start"])
    out.extend(added)

    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w", newline="", encoding="utf-8-sig") as f:  # BOM 付きで Excel でも文字化けしない
        w = csv.DictWriter(f, fieldnames=COLUMNS)
        w.writeheader()
        w.writerows(out)
    os.replace(tmp, path)

    print(f"file: {path}")
    print(f"added: {len(added)}  updated: {len(updated)}  "
          f"unchanged: {len(done) - len(updated)}  kept (no log): {kept}")
    for label, rows in (("added", added), ("updated", updated)):
        for r in rows:
            print(f"  [{label}] {r['start']} - {r['end']}  {r['title'] or '(no title)'}  "
                  f"total={r['total_tokens']}")


if __name__ == "__main__":
    main()
