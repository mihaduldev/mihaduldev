"""Cut the subject out and place on a clean, brand-matched backdrop.
Alpha matting + edge cleanup + silhouette-band despill (white outline halo).
The only interior touch is a TINY fixed box at the very top of the head
(well above the hairline) to darken the leftover crown highlight — it can never
reach the face."""
from rembg import remove, new_session
from PIL import Image, ImageFilter
import numpy as np

SRC = "MihadulIslam.jpg"
OUT = "public/portrait.jpg"

src = Image.open(SRC).convert("RGBA")
W, H = src.size
session = new_session("u2net")

try:
    cut = remove(
        src, session=session, alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=15,
        alpha_matting_erode_size=11,
    )
    print("alpha matting: on")
except Exception as e:
    print("alpha matting unavailable:", e)
    cut = remove(src, session=session)

# --- darken the crown highlight inside a tiny, safe box at the very top ---
arr = np.array(cut)
A = arr[..., 3]
rows = np.where(A.max(1) > 200)[0]
if len(rows):
    y0 = int(rows.min())
    yb = y0 + 80                      # only the top 80px (crown) — above hairline
    xa, xb = int(W * 0.32), int(W * 0.68)  # central band — skips temple edges
    box = arr[y0:yb, xa:xb, :3].astype(np.float32)
    lum = box.mean(2)
    mx = box.max(2); mn = box.min(2)
    sat = (mx - mn) / (mx + 1e-3)
    bright = (lum > 115) & (sat < 0.30)
    box[bright] *= 0.17               # whitish highlight -> dark-hair tone
    arr[y0:yb, xa:xb, :3] = np.clip(box, 0, 255).astype(np.uint8)
    cut = Image.fromarray(arr, "RGBA")

# --- clean the alpha edge: erode ~2px + feather ---
r, g, b, a = cut.split()
a = a.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(0.8))

# --- silhouette-band despill: remove bright low-sat halo on the outline ---
amin = np.array(a.filter(ImageFilter.MinFilter(9))).astype(np.int16)
amax = np.array(a.filter(ImageFilter.MaxFilter(9))).astype(np.int16)
band = (amax - amin) > 22
rgb2 = np.stack([np.array(r), np.array(g), np.array(b)], axis=2).astype(np.float32)
lum2 = rgb2.mean(2)
mx2 = rgb2.max(2); mn2 = rgb2.min(2)
sat2 = (mx2 - mn2) / (mx2 + 1e-3)
halo = band & (lum2 > 170) & (sat2 < 0.22)
af = np.array(a).astype(np.float32)
af[halo] *= 0.06
a = Image.fromarray(np.clip(af, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.5))
cut = Image.merge("RGBA", (r, g, b, a))

# --- brand backdrop: vertical gradient + centered cyan glow ---
top = np.array([14, 23, 38]); bot = np.array([5, 7, 13])
yy = np.linspace(0, 1, H)[:, None, None]
grad = np.repeat((top * (1 - yy) + bot * yy).astype(np.float64), W, axis=1)
cx, cy, rr = W * 0.5, H * 0.42, W * 0.6
X, Y = np.meshgrid(np.arange(W), np.arange(H))
glow = np.clip(1 - np.sqrt((X - cx) ** 2 + (Y - cy) ** 2) / rr, 0, 1) ** 1.6
cyan = np.array([88, 196, 220])
bgnp = np.clip(grad + glow[..., None] * (cyan - grad) * 0.16, 0, 255).astype(np.uint8)
bg_img = Image.fromarray(bgnp, "RGB").convert("RGBA")

# --- composite + professional 4:5 crop ---
comp = Image.alpha_composite(bg_img, cut).convert("RGB")
ratio = 4 / 5
cw = int(H * ratio)
left = (W - cw) // 2
comp = comp.crop((left, 0, left + cw, H)).resize((760, 950), Image.LANCZOS)
comp.save(OUT, quality=89, optimize=True)
print("done", comp.size)
