"""Place the portrait on a brand-matched backdrop and crop to 4:5.
If the source is already a transparent cutout (e.g. Mehadul Islam.png) it is
used as-is; otherwise the subject is removed with isnet + alpha matting."""
from PIL import Image, ImageFilter
import numpy as np
import os

# Prefer a pre-cut transparent PNG if present, else the raw photo.
SRC = "Mehadul Islam.png" if os.path.exists("Mehadul Islam.png") else "MihadulIslam.jpg"
OUT = "public/portrait.jpg"

img = Image.open(SRC).convert("RGBA")
W, H = img.size

alpha = img.split()[3]
has_transparency = alpha.getextrema()[0] < 250

if has_transparency:
    print(f"using pre-cut transparent source: {SRC}")
    cut = img
else:
    print(f"removing background from: {SRC}")
    from rembg import remove, new_session
    try:
        session = new_session("isnet-general-use")
    except Exception:
        session = new_session("u2net")
    cut = remove(img, session=session, alpha_matting=True,
                 alpha_matting_foreground_threshold=240,
                 alpha_matting_background_threshold=10,
                 alpha_matting_erode_size=11)

# tiny feather so the cutout seats cleanly on the dark backdrop
r, g, b, a = cut.split()
a = a.filter(ImageFilter.GaussianBlur(0.5))
cut = Image.merge("RGBA", (r, g, b, a))

# brand backdrop: vertical gradient + soft cyan glow
top = np.array([14, 23, 38]); bot = np.array([5, 7, 13])
yy = np.linspace(0, 1, H)[:, None, None]
grad = np.repeat((top * (1 - yy) + bot * yy).astype(np.float64), W, axis=1)
cx, cy, rr = W * 0.5, H * 0.42, W * 0.62
X, Y = np.meshgrid(np.arange(W), np.arange(H))
glow = np.clip(1 - np.sqrt((X - cx) ** 2 + (Y - cy) ** 2) / rr, 0, 1) ** 1.6
cyan = np.array([88, 196, 220])
bgnp = np.clip(grad + glow[..., None] * (cyan - grad) * 0.16, 0, 255).astype(np.uint8)
bg_img = Image.fromarray(bgnp, "RGB").convert("RGBA")

comp = Image.alpha_composite(bg_img, cut).convert("RGB")

# professional 4:5 crop, centred
ratio = 4 / 5
cw = int(H * ratio)
if cw > W:
    cw = W
left = (W - cw) // 2
comp = comp.crop((left, 0, left + cw, H)).resize((760, 950), Image.LANCZOS)
comp.save(OUT, quality=92, optimize=True)
print("done", comp.size)
