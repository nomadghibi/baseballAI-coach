#!/usr/bin/env python3
"""
BaseballAI Coach — CV pipeline CLI.

Run from apps/api/ with CV dependencies installed:

    pip install -r requirements-cv.txt
    python scripts/analyze.py path/to/pitch.mp4
    python scripts/analyze.py path/to/pitch.mp4 --hand left --output result.json

Exit codes:
    0 — analysis completed (check "status" field in JSON)
    1 — argument or file error
    2 — import error (missing CV dependencies)
"""

import argparse
import json
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Analyze a pitching video and print mechanics JSON.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("video", help="Path to MP4 or MOV pitching video")
    parser.add_argument(
        "--hand",
        choices=["right", "left"],
        default="right",
        help="Pitcher's throwing hand (default: right)",
    )
    parser.add_argument(
        "--output",
        "-o",
        help="Write JSON to this file instead of stdout",
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        default=True,
        help="Pretty-print JSON output (default: true)",
    )
    parser.add_argument(
        "--no-keypoints",
        action="store_true",
        help="Omit keypoints_sample from output (smaller JSON)",
    )
    args = parser.parse_args()

    video_path = Path(args.video)
    if not video_path.exists():
        print(f"Error: file not found: {video_path}", file=sys.stderr)
        return 1

    if video_path.suffix.lower() not in (".mp4", ".mov", ".m4v"):
        print(
            f"Warning: unexpected file extension '{video_path.suffix}'. "
            "Continuing anyway.",
            file=sys.stderr,
        )

    try:
        from app.analysis.pipeline import analyze_video
    except ImportError as e:
        print(
            f"Import error: {e}\n"
            "Install CV dependencies first:\n"
            "  pip install -r requirements-cv.txt",
            file=sys.stderr,
        )
        return 2

    print(f"Analyzing: {video_path}", file=sys.stderr)
    print(f"Throwing hand: {args.hand}", file=sys.stderr)

    try:
        result = analyze_video(str(video_path), throwing_hand=args.hand)
    except Exception as e:
        print(f"Pipeline error: {e}", file=sys.stderr)
        return 1

    if args.no_keypoints:
        result.pop("keypoints_sample", None)

    indent = 2 if args.pretty else None
    json_str = json.dumps(result, indent=indent)

    if args.output:
        out_path = Path(args.output)
        out_path.write_text(json_str, encoding="utf-8")
        print(f"Result written to: {out_path}", file=sys.stderr)
    else:
        print(json_str)

    # Print summary to stderr for quick readout
    status = result.get("status", "?")
    overall = result.get("overall_score", 0)
    scores = result.get("scores", {})
    print(f"\n── Summary ──────────────────────", file=sys.stderr)
    print(f"Status:  {status}", file=sys.stderr)
    print(f"Overall: {overall}/100", file=sys.stderr)
    for k, v in scores.items():
        print(f"  {k:<20} {v}", file=sys.stderr)
    fb = result.get("feedback", [])
    if fb:
        print(f"\nFeedback ({len(fb)} items):", file=sys.stderr)
        for item in fb:
            sev = item.get("severity", "")
            msg = item.get("message", "")
            print(f"  [{sev}] {msg}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(main())
