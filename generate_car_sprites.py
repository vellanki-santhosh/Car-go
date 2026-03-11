"""Generate a set of simple 2D car sprite PNGs for use in games.

This script uses Pillow to draw a small top-down car shape with wheels.
Each output image is saved as a transparent PNG in the `sprites/` folder.

Usage:
    python generate_car_sprites.py

The script will create (or reuse) the `sprites/` directory and generate 10 car sprites.
"""

from pathlib import Path
from random import choice

from PIL import Image, ImageDraw

OUTPUT_DIR = Path(__file__).resolve().parent / "sprites"
OUTPUT_DIR.mkdir(exist_ok=True)

# Choose a set of palette colors that look good together.
CAR_COLORS = [
    "#e74c3c",  # red
    "#3498db",  # blue
    "#2ecc71",  # green
    "#f1c40f",  # yellow
    "#9b59b6",  # purple
    "#e67e22",  # orange
    "#1abc9c",  # turquoise
    "#34495e",  # dark steel
    "#ecf0f1",  # light
    "#7f8c8d",  # grey
]

W = 64
H = 64

def draw_car(draw: ImageDraw.ImageDraw, x: int, y: int, w: int, h: int, color: str, accent: str) -> None:
    """Draw a simple top-down car shape into the given ImageDraw context."""

    # Car body (centered)
    body = [
        (x, y + h * 0.25),
        (x + w, y + h * 0.25),
        (x + w, y + h * 0.75),
        (x, y + h * 0.75),
    ]
    draw.polygon(body, fill=color)

    # Roof section
    roof = [
        (x + w * 0.15, y + h * 0.25),
        (x + w * 0.85, y + h * 0.25),
        (x + w * 0.75, y + h * 0.45),
        (x + w * 0.25, y + h * 0.45),
    ]
    draw.polygon(roof, fill=accent)

    # Windows
    window = [
        (x + w * 0.25, y + h * 0.3),
        (x + w * 0.75, y + h * 0.3),
        (x + w * 0.7, y + h * 0.43),
        (x + w * 0.3, y + h * 0.43),
    ]
    draw.polygon(window, fill="#ffffff")

    # Wheels
    wheel_radius = int(w * 0.12)
    wheel_offset_x = w * 0.15
    wheel_offset_y = h * 0.15

    for cx in (x + wheel_offset_x, x + w - wheel_offset_x):
        for cy in (y + wheel_offset_y, y + h - wheel_offset_y):
            draw.ellipse([
                (cx - wheel_radius, cy - wheel_radius),
                (cx + wheel_radius, cy + wheel_radius),
            ], fill="#111111")

    # Headlights / Taillights
    light_w = w * 0.12
    light_h = h * 0.08
    draw.rectangle([ (x + w*0.1, y + h*0.25 - light_h), (x + w*0.1 + light_w, y + h*0.25)], fill="#f1c40f")
    draw.rectangle([ (x + w*0.9 - light_w, y + h*0.25 - light_h), (x + w*0.9, y + h*0.25)], fill="#f1c40f")


def main():
    print(f"Generating car sprites in: {OUTPUT_DIR}")

    for i, color in enumerate(CAR_COLORS, start=1):
        accent = "#2c3e50" if i % 2 == 0 else "#ecf0f1"
        img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # Draw a simple background shape to help them pop on a variety of backgrounds.
        draw.rectangle((0, 0, W, H), fill=(0, 0, 0, 0))
        draw_car(draw, 0, 0, W, H, color=color, accent=accent)

        out_path = OUTPUT_DIR / f"car_sprite_{i:02d}.png"
        img.save(out_path)
        print(f"  -> {out_path.name}")

    print("Done. Use these sprites in your game (e.g., with drawImage in a canvas).\n")


if __name__ == "__main__":
    main()
