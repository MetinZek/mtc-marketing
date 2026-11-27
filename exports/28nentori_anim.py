"""Animate the 28 Nentori post: waving flag, optional text reveal.
usage: python3 make_flag.py SRC OUT_WAVE.mp4 OUT_TEXT.mp4"""
import cv2, numpy as np, subprocess, sys
src = cv2.imread(sys.argv[1]).astype(np.float32)
H, W = src.shape[:2]
fi = src.astype(int); B, G, R = fi[...,0], fi[...,1], fi[...,2]
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

# ---------- text layer (white) ----------
mn = src.min(2)
tbox = np.zeros((H, W), bool); tbox[795:1145, 215:845] = True
tink = ((mn > 110) & tbox).astype(np.uint8)
n, lab, st, cen = cv2.connectedComponentsWithStats(tink, 8)
urime = np.zeros((H, W), bool); nent = np.zeros((H, W), bool)
for i in range(1, n):
    if st[i, 4] < 3: continue
    (urime if cen[i, 1] < 1040 else nent)[lab == i] = True
# drop the lit windows that sit inside the box (warm, low blue)
warm = (R - B > 60)
urime &= ~warm; nent &= ~warm
tmask = cv2.dilate((urime | nent).astype(np.uint8) * 255, np.ones((7, 7), np.uint8))

# ---------- logo (white, static) ----------
lbox = np.zeros((H, W), bool); lbox[105:210, 480:590] = True
lmask = cv2.dilate(((mn > 90) & lbox).astype(np.uint8) * 255, np.ones((7, 7), np.uint8))

# ---------- flag mask: red cloth + eagle ----------
red = (R > G*1.8 + 10) & (R > B*1.8 + 10) & (R > 45)
eagle_c = (~red) & (R >= B - 2) & (src.max(2) < 90) & (yy < 668) & (xx > 240) & (xx < 830)
n, lab, st, _ = cv2.connectedComponentsWithStats(eagle_c.astype(np.uint8), 8)
eagle = lab == lab[450, 540]
flag = red | eagle | (lmask > 0)
# close tiny holes, keep it to the upper part
flag = cv2.morphologyEx(flag.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8)).astype(bool)
flag &= yy < 860
fmask = cv2.GaussianBlur(flag.astype(np.float32), (0, 0), 0.8)          # soft edge vs houses

# ---------- clean plates ----------
base8 = src.astype(np.uint8)
# flag plate: extend the cloth under the houses (band) and under the logo
band = cv2.dilate(flag.astype(np.uint8), np.ones((41, 41), np.uint8)) & (~flag).astype(np.uint8)
plate = cv2.inpaint(base8, ((band > 0) | (lmask > 0)).astype(np.uint8) * 255, 7, cv2.INPAINT_TELEA).astype(np.float32)
# scene plate without text
notext = cv2.inpaint(base8, tmask, 7, cv2.INPAINT_TELEA).astype(np.float32)

def white_layer(m, bgimg):
    m = cv2.dilate(m.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    bmn = bgimg.min(2)
    a = np.clip((mn - bmn) / np.maximum(255 - bmn, 1), 0, 1) * m
    return a.astype(np.float32)
a_urime = white_layer(urime, notext)
a_nent = white_layer(nent, notext)
logo_bg = plate
a_logo = (np.clip((mn - logo_bg.min(2)) / np.maximum(255 - logo_bg.min(2), 1), 0, 1) * (lmask > 0)).astype(np.float32)

cv2.imwrite('chk_mask.png', (fmask * 255).astype(np.uint8))
cv2.imwrite('chk_notext.png', notext.astype(np.uint8))

# ---------- wave ----------
T = 4.0                      # loop period (s)
u, v = xx / W, yy / H
amp = 0.35 + 0.65 * u        # pinned-ish on the left, freer on the right
def flag_frame(t):
    w = 2 * np.pi * t / T
    p1 = 2*np.pi*(1.2*u + 0.55*v) - w
    p2 = 2*np.pi*(2.3*u - 0.35*v) - 2*w
    dy = amp * (10*np.sin(p1) + 4*np.sin(p2))
    dx = amp * (5*np.cos(p1) + 2*np.cos(p2))
    warped = cv2.remap(plate, xx + dx, yy + dy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    shade = 1 + amp * (0.13*np.cos(p1) + 0.06*np.cos(p2))
    return warped * shade[..., None]

def clamp(x): return min(max(x, 0.0), 1.0)
def out_cubic(t): t = clamp(t); return 1 - (1 - t)**3
def smooth(t): t = clamp(t); return t*t*(3 - 2*t)

def render(out, dur, with_text_anim):
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24',
        '-s', f'{W}x{H}', '-r', '30', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16',
        '-preset', 'slow', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    scene = notext if with_text_anim else src
    fm = fmask[..., None]
    for i in range(int(30 * dur)):
        t = i / 30
        fr = flag_frame(t) * fm + scene * (1 - fm)
        a = a_logo[..., None]; fr = fr * (1 - a) + 255 * a
        if with_text_anim:
            # "Urime": left-to-right handwriting wipe with a soft edge
            p = smooth((t - 1.0) / 1.8)
            edge = 215 + p * (845 - 215 + 80)
            wipe = np.clip((edge - xx) / 80, 0, 1)
            a = (a_urime * wipe)[..., None]; fr = fr * (1 - a) + 255 * a
            # "28 Nentori": fade + rise
            q = out_cubic((t - 2.4) / 0.8)
            if q > 0:
                M = np.float32([[1, 0, 0], [0, 1, 30 * (1 - q)]])
                an = cv2.warpAffine(a_nent, M, (W, H)) * q
                a = an[..., None]; fr = fr * (1 - a) + 255 * a
        ff.stdin.write(np.clip(fr + 0.5, 0, 255).astype(np.uint8).tobytes())
    ff.stdin.close(); ff.wait()

render(sys.argv[2], 8.0, False)   # 2 full loops, seamless
render(sys.argv[3], 8.0, True)
