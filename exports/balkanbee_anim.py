import cv2, numpy as np, subprocess, sys
src = cv2.imread(sys.argv[1]).astype(np.float32)
H, W = src.shape[:2]
R, G, B = src[...,2], src[...,1], src[...,0]

# --- clean background: inpaint text + logo
ink = (src.min(2) < 235)
mask = np.zeros((H, W), np.uint8)
mask[100:210, 380:700][ink[100:210, 380:700]] = 255
mask[330:690, 290:790][ink[330:690, 290:790]] = 255
mask = cv2.dilate(mask, np.ones((7,7), np.uint8))
mask = cv2.dilate(mask, np.ones((9,9), np.uint8))
ok = (mask == 0).astype(np.float32)
num = cv2.GaussianBlur(src * ok[...,None], (0,0), 25)
den = cv2.GaussianBlur(ok, (0,0), 25)[...,None]
fill = num / np.maximum(den, 1e-4)
soft = cv2.GaussianBlur((mask>0).astype(np.float32), (0,0), 3)[...,None]
bg = src * (1 - soft) + fill * soft
bgR, bgB = bg[...,2], bg[...,0]

# --- alpha: black ink from R channel, yellow ink from B channel
ak = np.clip((bgR - R) / np.maximum(bgR, 1), 0, 1)
ay = np.clip((bgB - B) / np.maximum(bgB, 1) - ak, 0, 1)
yel = src[(ay > 0.95) & (ak < 0.05)].mean(0)
print('yellow BGR', yel)
def region(y0, y1, x0, x1):
    m = np.zeros((H, W), np.float32); m[y0:y1, x0:x1] = 1; return m
def layer(a_k, a_y):
    a = np.clip(a_k + a_y, 0, 1)
    col = (a_y[...,None] * yel) / np.maximum(a, 1e-4)[...,None]   # black contributes 0
    return col, a
logo  = layer(ak*region(100,210,380,700), ay*region(100,210,380,700))
line1 = layer(ak*0,                        ay*region(330,582,290,790))   # "Shite" (yellow)
line2 = layer(ak*region(330,582,290,790),  ay*0)                         # "veturën" (black)
line3 = layer(ak*region(582,690,290,790),  ay*region(582,690,290,790))   # "më lehtë"

# --- car + road scene with soft top edge
ys = np.arange(H, dtype=np.float32)[:, None]
sm = np.clip((ys - 690) / 60, 0, 1) * np.ones((1, W), np.float32)
white = np.full_like(bg, 254)
base = bg * (1 - sm[...,None]) + white * sm[...,None]

def warp(img, s, tx, ty, cx, cy):
    M = np.float32([[s, 0, cx - s*cx + tx], [0, s, cy - s*cy + ty]])
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE if img.ndim==3 else cv2.BORDER_CONSTANT)

def clamp(x): return min(max(x, 0.0), 1.0)
def out_cubic(t): t = clamp(t); return 1 - (1 - t)**3
def out_back(t, k=1.6): t = clamp(t); return 1 + (k+1)*(t-1)**3 + k*(t-1)**2
def prog(t, start, dur): return clamp((t - start) / dur)

FPS, DUR = 30, 6.0
out = sys.argv[2]
ff = subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','bgr24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
    '-c:v','libx264','-pix_fmt','yuv420p','-crf','16','-preset','slow','-movflags','+faststart',out], stdin=subprocess.PIPE)

def comp(frame, lay, op, s=1.0, tx=0, ty=0, cx=540, cy=675):
    col, a = lay
    if op <= 0: return frame
    if s != 1 or tx or ty:
        col = warp(col, s, tx, ty, cx, cy); a = warp(a, s, tx, ty, cx, cy)
    a = (a * op)[...,None]
    return frame * (1 - a) + col * a

for i in range(int(FPS*DUR)):
    t = i / FPS
    f = base.copy()
    # 1) car + road: fade in and settle from a slight zoom
    p = prog(t, 0.1, 1.6); e = out_cubic(p)
    f = comp(f, (src, sm), out_cubic(prog(t, 0.1, 0.7)), s=1.18 - 0.18*e, ty=50*(1-e), cx=540, cy=900)
    # 2) text lines rise in, staggered
    for lay, st in ((line1, 1.25), (line2, 1.5), (line3, 1.75)):
        q = out_cubic(prog(t, st, 0.6))
        f = comp(f, lay, q, ty=40*(1-q))
    # 3) logo pops in last
    q = prog(t, 2.5, 0.6)
    f = comp(f, logo, out_cubic(q), s=0.75 + 0.25*out_back(q), cx=540, cy=155)
    ff.stdin.write(np.clip(f + 0.5, 0, 255).astype(np.uint8).tobytes())
ff.stdin.close(); ff.wait()
cv2.imwrite('bg_check.png', bg.astype(np.uint8))
