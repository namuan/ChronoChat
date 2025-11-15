#!/usr/bin/env -S uv run --quiet --script
# /// script
# dependencies = [
#   "pillow"
# ]
# ///
"""
Generate favicon, adaptive icon, and splash icon from a source PNG.

Usage:
./generate_icons.py -h
./generate_icons.py --input ./assets/icon.png --output ./assets --favicon-ico -v
"""
import os
import sys
import logging
from argparse import ArgumentParser, RawDescriptionHelpFormatter

try:
    from PIL import Image
except Exception:
    print("Missing dependency: pillow. Install with: pip install pillow", file=sys.stderr)
    sys.exit(1)


def setup_logging(verbosity):
    logging_level = logging.WARNING
    if verbosity == 1:
        logging_level = logging.INFO
    elif verbosity >= 2:
        logging_level = logging.DEBUG

    logging.basicConfig(
        handlers=[logging.StreamHandler()],
        format="%(asctime)s - %(filename)s:%(lineno)d - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        level=logging_level,
    )
    logging.captureWarnings(capture=True)


def ensure_dir(path):
    os.makedirs(path, exist_ok=True)


def load_image(path):
    logging.info(f"Loading image: {path}")
    return Image.open(path).convert("RGBA")


def resize_with_padding(img, size, padding_ratio, background=(0, 0, 0, 0)):
    logging.debug(
        f"Resizing with padding -> size={size}, padding_ratio={padding_ratio}, background={background}"
    )
    canvas = Image.new("RGBA", (size, size), background)
    w, h = img.size
    inner = int(size * (1 - padding_ratio * 2))
    scale = inner / max(w, h)
    nw, nh = int(round(w * scale)), int(round(h * scale))
    resized = img.resize((nw, nh), Image.LANCZOS)
    x = (size - nw) // 2
    y = (size - nh) // 2
    canvas.paste(resized, (x, y), resized)
    return canvas


def save_png(img, path):
    logging.info(f"Writing PNG: {path}")
    img.save(path, format="PNG")


def save_favicon_ico(img, path):
    logging.info(f"Writing ICO: {path}")
    sizes = [(16, 16), (32, 32), (48, 48)]
    img.save(path, sizes=sizes)


def parse_args():
    parser = ArgumentParser(description=__doc__, formatter_class=RawDescriptionHelpFormatter)
    parser.add_argument("--input", default="./assets/icon.png")
    parser.add_argument("--output", default="./assets")
    parser.add_argument("--adaptive-size", type=int, default=1024)
    parser.add_argument("--splash-size", type=int, default=1024)
    parser.add_argument("--favicon-size", type=int, default=48)
    parser.add_argument("--adaptive-padding", type=float, default=0.12)
    parser.add_argument("--splash-padding", type=float, default=0.08)
    parser.add_argument("--favicon-padding", type=float, default=0.0)
    parser.add_argument("--favicon-ico", action="store_true")
    parser.add_argument(
        "-v",
        "--verbose",
        action="count",
        default=0,
        dest="verbose",
        help="Increase verbosity of logging output",
    )
    return parser.parse_args()


def main(args):
    ensure_dir(args.output)
    src = load_image(args.input)

    adaptive = resize_with_padding(src, args.adaptive_size, args.adaptive_padding, (0, 0, 0, 0))
    save_png(adaptive, os.path.join(args.output, "adaptive-icon.png"))

    splash = resize_with_padding(src, args.splash_size, args.splash_padding, (0, 0, 0, 0))
    save_png(splash, os.path.join(args.output, "splash-icon.png"))

    favicon_img = resize_with_padding(src, args.favicon_size, args.favicon_padding, (0, 0, 0, 0))
    save_png(favicon_img, os.path.join(args.output, "favicon.png"))
    if args.favicon_ico:
        save_favicon_ico(favicon_img, os.path.join(args.output, "favicon.ico"))

    logging.info("All assets generated successfully")


if __name__ == "__main__":
    args = parse_args()
    setup_logging(args.verbose)
    main(args)
