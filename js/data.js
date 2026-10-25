// ---------- Reference data ----------
const WEIGHTS = {
  thin:  { name: "가는 실", needle: "2~3.5mm", mpg: 3.6, line: 2 },
  mid:   { name: "보통 실", needle: "4~5.5mm", mpg: 2.0, line: 4 },
  thick: { name: "굵은 실", needle: "6mm 이상", mpg: 1.0, line: 8 }
};
const SIZES = {
  scrap: { name: "자투리", sub: "구슬만큼", g: 5, px: 9 },
  ping:  { name: "탁구공", sub: "약 15g", g: 15, px: 15 },
  tang:  { name: "귤", sub: "약 30g", g: 30, px: 21 },
  fist:  { name: "주먹", sub: "약 50g", g: 50, px: 27 },
  full:  { name: "큰 볼", sub: "약 100g", g: 100, px: 34 }
};
const TEXTURES = {
  smooth: { name: "매끈해요", sub: "울·면·아크릴" },
  fluffy: { name: "보송보송해요", sub: "모헤어·부클레·퍼" }
};
const COLORS = [
  ["unknown", "모름", null], ["white", "흰색", "#F1EDE4"], ["ivory", "아이보리", "#EDE0C2"], ["beige", "베이지", "#D9C3A0"],
  ["brown", "갈색", "#8A6446"], ["khaki", "카키", "#7D7A4E"], ["gray", "회색", "#9A9AA2"], ["black", "검정", "#3A3A40"],
  ["red", "빨강", "#C7353A"], ["wine", "와인", "#7A2338"], ["magenta", "자주", "#9E2A6B"], ["pink", "분홍", "#E99AB2"],
  ["coral", "코랄", "#EE8A6E"], ["orange", "주황", "#E07A2F"], ["mustard", "겨자", "#D49A28"], ["yellow", "노랑", "#EED45A"],
  ["lime", "연두", "#A9C46A"], ["green", "초록", "#5E8C5A"], ["mint", "민트", "#9FD8C6"], ["teal", "청록", "#2F8A8A"],
  ["blue", "하늘", "#7DA9D8"], ["cobalt", "파랑", "#3B63B5"], ["navy", "남색", "#34477A"], ["lavender", "라벤더", "#B9A6DB"],
  ["purple", "보라", "#8A6BB3"], ["multi", "여러 색", "#C98BB0"]
];
const COLOR_MAP = Object.fromEntries(COLORS.map(c => [c[0], c]));
const RAINBOW = "conic-gradient(#C7353A,#EED45A,#5E8C5A,#7DA9D8,#8A6BB3,#C7353A)";
function hsl(hex) {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const sat = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, sat, l];
}
function nearestName(hex) {
  const [h1, s1, l1] = hsl(hex);
  let best = "직접 고른 색", bd = Infinity;
  COLORS.forEach(([k, nm, hx]) => {
    if (!hx || k === "multi") return;
    const [h2, s2, l2] = hsl(hx);
    let dh = Math.abs(h1 - h2); dh = Math.min(dh, 360 - dh);
    const chroma = Math.min(s1, s2) > 0.12 ? 3 * (dh / 180) ** 2 : 0;
    const d = chroma + 0.8 * (s1 - s2) ** 2 + 1.5 * (l1 - l2) ** 2;
    if (d < bd) { bd = d; best = nm; }
  });
  return best;
}
// 여러 색이 섞인 실: "mix:pink,blue,#AABBCC" (앞에 고른 색이 대표색, 2~4가지)
const MIX_MAX = 4;
const isMix = k => typeof k === "string" && k.startsWith("mix:");
function mixParts(key) {
  if (!isMix(key)) return [];
  const out = [];
  key.slice(4).split(",").forEach(p => {
    p = p.trim(); if (/^#[0-9a-fA-F]{6}$/.test(p)) p = p.toUpperCase();
    else if (!COLOR_MAP[p] || !COLOR_MAP[p][2] || p === "multi") return;
    if (!out.includes(p) && out.length < MIX_MAX) out.push(p);
  });
  return out;
}
const mixKey = parts => parts.length ? "mix:" + parts.join(",") : "multi";
const partHex = p => p[0] === "#" ? p : COLOR_MAP[p][2];
const partName = p => p[0] === "#" ? nearestName(p) : COLOR_MAP[p][1];
function mixBg(hexes) {   // 실타래에 여러 색이 감긴 느낌으로 조각조각
  const n = hexes.length, seq = [...hexes, ...hexes], st = 100 / seq.length;
  return `conic-gradient(${seq.map((h, i) => `${h} ${(i * st).toFixed(1)}% ${((i + 1) * st).toFixed(1)}%`).join(",")})`;
}
function cinfo(key) {
  if (isMix(key)) {
    const ps = mixParts(key);
    if (ps.length === 1) return cinfo(ps[0]);
    if (!ps.length) return cinfo("multi");
    return { name: ps.map(partName).join("·") + " 섞임", hex: partHex(ps[0]), mix: ps.map(partHex) };
  }
  if (typeof key === "string" && /^#[0-9a-fA-F]{6}$/.test(key)) return { name: nearestName(key) + " 계열", hex: key.toUpperCase(), custom: true };
  const c = COLOR_MAP[key];
  return c && c[2] ? { name: c[1], hex: c[2] } : { name: "색 모름", hex: null };
}
const FALLBACK = ["#CFC3AE", "#7C8FB5", "#D49A28", "#8FB59A"];

// 검은 고양이 배색 칸 도안 (20코 × 18단, 위쪽 줄부터). 0 = 바탕, 1 = 고양이, 2 = 아랫단
const BLACKCAT = [
  "00000000000000000000", "00000000000000000000",
  "00001000000000010000", "00001100000000110000", "00001110000001110000",
  "00001111111111110000", "00001111111111110000",
  "00001100011000110000", "00001101011010110000", "00001100011000110000",
  "00001111111111110000",
  "22222222222222222222", "22222222222222222222", "22222222222222222222", "22222222222222222222",
  "22222222222222222222", "22222222222222222222", "22222222222222222222"
];

const PROJECTS = {
  knit: [
    { id: "coaster", name: "컵 코스터", g: [8, 10, 15], tags: ["flat"] },
    { id: "scrunchie", name: "곱창 머리끈", g: [6, 8, 12], tags: ["stretch"] },
    { id: "sleeve", name: "컵 홀더", g: [10, 15, 20], tags: ["stretch", "bag"] },
    { id: "pouch", name: "작은 파우치", g: [30, 40, 55], tags: ["bag", "flat"] },
    { id: "headband", name: "헤어밴드·이어워머", g: [25, 35, 50], tags: ["stretch", "flat"] },
    { id: "wrist", name: "손목 워머", g: [30, 40, 60], tags: ["stretch"] },
    { id: "babyhat", name: "아기 모자", g: [35, 50, 70], tags: ["stretch"] },
    { id: "cowl", name: "넥워머", g: [70, 90, 130], tags: ["stretch", "flat"] },
    { id: "mitten", name: "벙어리장갑", g: [60, 90, 120], tags: ["stretch"] },
    { id: "beanie", name: "비니", g: [70, 100, 140], tags: ["stretch"] },
    { id: "socks", name: "양말 한 켤레", g: [100, null, null], tags: ["stretch"] },
    { id: "scarf", name: "머플러", g: [150, 200, 280], tags: ["flat"] },
    { id: "shawl", name: "숄", g: [180, 280, null], tags: ["flat"] },
    { id: "vest", name: "조끼", g: [220, 320, 450], tags: ["garment"] },
    { id: "sweater", name: "스웨터", g: [400, 600, 850], tags: ["garment"] },
    { id: "blanket", name: "무릎담요", g: [450, 650, 900], tags: ["flat"] }
  ],
  crochet: [
    { id: "flower", name: "꽃 브로치", g: [4, 5, 8], tags: ["motif"] },
    { id: "catcoaster", name: "고양이 코스터", g: [8, 12, 18], tags: ["cat"] },
    { id: "catround", name: "검은 고양이 원형 가방", g: [90, 130, 180], tags: ["cat"] },
    { id: "catbag", name: "검은 고양이 네모 가방", g: [110, 160, 220], tags: ["cat"] },
    { id: "cardwallet", name: "똑딱이 카드지갑", g: [25, 35, 50], tags: ["wallet"], photo: "images/ref/cardwallet.jpg",
      how: "짧은뜨기로 폭 11cm쯤 되는 긴 판을 떠서, 아래를 두 번 접어 카드 칸 2개를 만들고 남은 부분을 덮개로 접어요. 옆을 짧은뜨기로 잇고 자석 똑딱이 단추를 달아요." },
    { id: "cakewallet", name: "케이크 카드지갑", g: [30, 40, 55], tags: ["wallet"], photo: "images/ref/cakewallet.jpg",
      how: "케이크 색과 크림 색 두 가지로 짧은뜨기 카드 주머니를 떠요. 딸기와 생크림은 작은 아미구루미로 떠서 위에 달고, 눈·코는 단추나 자수로 붙여요." },
    { id: "catpurse", name: "고양이 동전지갑", g: [25, 35, 50], tags: ["wallet", "cat"], photo: "images/ref/catpurse.jpg",
      how: "짧은뜨기 배색(감싸뜨기)으로 고양이 무늬를 넣어 앞·뒤 판을 뜨고, 위쪽에 귀를 떠 붙여요. 지퍼와 꼬리 고리를 달고, 수염과 코는 자수로 놓아요." },
    { id: "calicowallet", name: "얼룩 고양이 카드지갑", g: [25, 35, 50], tags: ["wallet", "cat"], photo: "images/ref/calicowallet.jpg",
      how: "윗부분은 고양이 털 색, 얼굴 가운데 흰 무늬와 아랫단은 흰색으로 짧은뜨기 배색(감싸뜨기)을 해요. 둥근 귀 두 개를 떠서 달고, 눈은 인형 눈을 붙이고 줄무늬와 입은 검정 자수, 볼은 분홍 실로 놓아요." },
    { id: "breadcat", name: "식빵 고양이 카드지갑", g: [25, 35, 50], tags: ["wallet", "cat"], photo: "images/ref/breadcat.png", refs: [["images/ref/breadcat-plan.svg", "구성도"], ["images/ref/breadcat-plan-orig.png", "구성도 원본"]],
      how: "사진은 앞면(닫은 상태)과 뒷면(바깥 주머니)이에요. 구성도: 본체는 긴 판 하나를 가운데 점선에서 접고, 안쪽에 안주머니, 바깥에 바깥 주머니를 달아요. 같은 색 점끼리 똑딱이 한 쌍이에요. 고양이 무늬는 본체 바깥쪽 아래 칸에 넣고, 몸통은 그러데이션 실, 배·발은 흰 실로 떠요." },
    { id: "catbookmark", name: "고양이 필레 책갈피", g: [8, 12, 18], tags: ["cat", "flat"], photo: "images/ref/catbookmark.webp", orig: "images/ref/catbookmark.webp",
      how: "필레 뜨기로 고양이 두 마리를 넣은 책갈피예요. 가는 면사로 떠요. 모눈 도안에서 칠한 칸은 한길긴뜨기로 채우고(3코), 빈 칸은 한길긴뜨기 1코 + 사슬 1코로 비워요. 둘레는 짧은뜨기·피코로 마무리하고 위에 술을 달아요. 원본 이미지의 모눈 도안은 단 번호가 중간에 뒤섞여 있어서, 번호보다 칸 모양을 보고 떠 주세요." },
    { id: "catfiletpouch", name: "고양이 필레 복주머니", g: [35, 50, 70], tags: ["cat", "bag"], photo: "images/ref/catfiletpouch.webp",
      how: "흰 면사로 필레 뜨기 판을 떠서 고양이 무늬를 넣어요. 칠한 칸은 한길긴뜨기로 채우고 빈 칸은 사슬로 비워요. 두 장을 이어 주머니로 만들고, 입구 아래 구멍 단에 끈 두 줄을 꿰어 조이고, 입구는 조개무늬로 마무리해요." },
    { id: "catfiletblanket", name: "고양이 필레 커튼", g: [230, 745, 2770], tags: ["filetcat"], photo: "images/ref/catfiletcurtain.webp", refs: [["images/ref/catfiletblanket.png", "모눈 도안"]],
      how: "사진은 같은 고양이 칸을 3×3(9칸)으로 늘리고 아래에 레이스 단을 단 커튼이에요. 모눈 도안에서 센 크기: 가로 55칸 × 세로 82칸, 고양이 칸 6개(2×3). 한 칸 4코로 뜨면 한 단 221코(55칸×4 + 마지막 1코), 82단이에요. 가는 실 · 3mm 코바늘이면 약 92 × 63~68cm, 25g 실 약 10볼(여유 포함 10~11볼). 도안 기준 빈 칸은 한길긴 1 + 사슬 2(한 칸 4코면 사슬 3), 채운 칸은 한길긴 3(4코면 4)으로 채우고, 두 칸짜리 넓은 빈 칸은 한길긴 1 + 사슬 5, V 표시 칸은 한길긴 1·사슬 3·짧은 1·사슬 3으로 떠요. 실 양은 채운 칸 약 21%로 계산한 어림값이에요." },
    { id: "tomatowallet", name: "토마토 냥이 카드지갑", g: [30, 40, 55], tags: ["wallet"], photo: "images/ref/tomatowallet.jpg",
      how: "빨강 짧은뜨기로 카드 주머니를 뜨고 위 모서리에 고양이 귀를 떠 붙여요. 초록 실로 별 모양 꼭지와 발바닥을 떠서 달고, 눈은 단추로 붙여요." },
    { id: "coaster", name: "코스터", g: [10, 13, 18], tags: ["flat", "motif"] },
    { id: "scrubby", name: "수세미", g: [12, 15, 20], tags: ["flat"] },
    { id: "scrunchie", name: "곱창 머리끈", g: [8, 10, 14], tags: ["stretch"] },
    { id: "granny1", name: "그래니 스퀘어 한 장", g: [8, 15, 25], tags: ["motif"] },
    { id: "keyring", name: "키링 인형", g: [10, 15, 25], tags: ["toy"] },
    { id: "sleeve", name: "컵 홀더", g: [12, 18, 25], tags: ["stretch", "bag"] },
    { id: "headband", name: "헤어밴드", g: [30, 40, 60], tags: ["stretch"] },
    { id: "pouch", name: "파우치", g: [40, 55, 75], tags: ["bag"] },
    { id: "amigurumi", name: "손바닥 인형", g: [35, 60, 90], tags: ["toy"] },
    { id: "beanie", name: "비니", g: [90, 120, 170], tags: ["hat", "stretch"] },
    { id: "bucket", name: "버킷햇", g: [90, 130, null], tags: ["hat"] },
    { id: "netbag", name: "네트백", g: [100, 150, null], tags: ["bag"] },
    { id: "scarf", name: "머플러", g: [180, 260, 350], tags: ["flat"] },
    { id: "shawl", name: "숄", g: [200, 320, null], tags: ["flat", "garment"] },
    { id: "blanket", name: "담요", g: [550, 800, 1100], tags: ["flat"] }
  ]
};

const PATTERNS = {
  knit: [
    { id: "stock", name: "메리야스뜨기", en: "Stockinette", f: 1.0, w: ["thin","mid","thick"], tex: ["smooth","fluffy"], c: 1, d: 1, suits: ["stretch","garment","bag","flat"],
      how: "겉면에서는 <b>겉뜨기</b>, 안면에서는 <b>안뜨기</b>만 반복해요. V자 코가 줄줄이 서는 가장 기본 조직이에요. 평평하게 뜨면 가장자리가 말리니 끝단은 고무뜨기나 가터로 잡아 주세요.", note: "가장 기본" },
    { id: "garter", name: "가터뜨기", en: "Garter", f: 1.1, w: ["thin","mid","thick"], tex: ["smooth","fluffy"], c: 1, d: 1, suits: ["flat","bag","garment"],
      how: "앞뒤 모두 <b>겉뜨기</b>만 해요. 가로로 오돌토돌한 골이 생기고 말리지 않아서 보송한 실이나 처음 뜨는 작품에 좋아요.", note: "말림 없음" },
    { id: "rib", name: "고무뜨기", en: "Ribbing", f: 1.15, w: ["thin","mid","thick"], tex: ["smooth","fluffy"], c: 1, d: 1, suits: ["stretch","flat","garment"],
      how: "<b>겉뜨기 2코, 안뜨기 2코</b>(또는 1코씩)를 번갈아 떠요. 세로 골이 생기고 잘 늘어나서 모자·워머·넥워머에 딱이에요.", note: "신축성" },
    { id: "seed", name: "멍석뜨기", en: "Seed stitch", f: 1.1, w: ["thin","mid","thick"], tex: ["smooth"], c: 1, d: 2, suits: ["flat","bag","garment"],
      how: "겉뜨기와 안뜨기를 한 코씩 번갈아 뜨되, 다음 단에서는 <b>겉코 위에 안뜨기, 안코 위에 겉뜨기</b>를 해서 엇갈리게 놓아요. 오톨도톨한 쌀알 질감이 생겨요.", note: "쌀알 질감" },
    { id: "basket", name: "바스켓위브", en: "Basketweave", f: 1.1, w: ["mid","thick"], tex: ["smooth"], c: 1, d: 2, suits: ["flat","bag"],
      how: "겉뜨기 블록과 안뜨기 블록을 <b>체크판처럼</b> 몇 단마다 바꿔 떠요. 바구니를 엮은 듯한 무늬가 돼요.", note: "체크판" },
    { id: "waffle", name: "와플뜨기", en: "Waffle", f: 1.2, w: ["mid","thick"], tex: ["smooth"], c: 1, d: 2, suits: ["flat","stretch","garment"],
      how: "고무뜨기 몇 단 뒤 <b>한 단을 안뜨기로</b> 넣는 걸 반복해 오목한 칸을 만들어요. 두툼하고 따뜻해요.", note: "두툼" },
    { id: "cable", name: "꽈배기", en: "Cable", f: 1.25, w: ["mid","thick"], tex: ["smooth"], c: 1, d: 3, suits: ["stretch","flat","garment"],
      how: "<b>꽈배기 바늘</b>에 몇 코를 옮겨 앞이나 뒤로 두고 순서를 바꿔 떠요. 실을 꽤 먹지만 가장 겨울다운 무늬예요.", note: "입체 무늬" },
    { id: "lace", name: "비침무늬", en: "Lace", f: 0.9, w: ["thin","mid"], tex: ["smooth","fluffy"], c: 1, d: 3, suits: ["flat","garment"],
      how: "<b>바늘비우기</b>로 구멍을 내고 <b>두 코 모아뜨기</b>로 코 수를 맞춰요. 실이 적게 들어 숄이나 머플러에 좋아요.", note: "구멍 무늬" },
    { id: "brioche", name: "브리오슈", en: "Brioche", f: 1.5, w: ["mid","thick"], tex: ["smooth","fluffy"], c: 1, d: 3, suits: ["stretch","flat"],
      how: "<b>걸러뜨기와 바늘비우기</b>를 짝지어 떠서 아주 폭신한 이중 골을 만들어요. 실은 많이 먹지만 감촉이 최고예요.", note: "아주 폭신" },
    { id: "stripe", name: "줄무늬", en: "Stripes", f: 1.0, w: ["thin","mid","thick"], tex: ["smooth","fluffy"], c: 2, d: 1, suits: ["flat","stretch","garment","bag","wallet"],
      how: "몇 단마다 <b>색을 바꿔</b> 떠요. 남은 실 정리에 가장 좋은 방법이라, 양이 적은 색은 얇은 줄로 쓰면 돼요.", note: "자투리 정리" },
    { id: "slip", name: "걸러뜨기 배색", en: "Slip-stitch", f: 1.1, w: ["thin","mid"], tex: ["smooth"], c: 2, d: 2, suits: ["flat","stretch","bag"],
      how: "한 단에 한 색만 쓰면서 <b>몇 코를 걸러</b> 아래 색을 끌어올려요. 배색처럼 보이지만 한 번에 한 실만 잡아서 쉬워요.", note: "쉬운 배색" },
    { id: "fairisle", name: "페어아일", en: "Fair Isle", f: 1.3, w: ["thin","mid"], tex: ["smooth"], c: 2, d: 3, suits: ["stretch","garment"],
      how: "한 단에서 <b>두 색을 번갈아</b> 뜨고 안 쓰는 실은 뒤로 걸쳐 둬요. 안쪽에 실이 겹쳐 따뜻하고 실을 많이 먹어요.", note: "본격 배색" }
  ],
  crochet: [
    { id: "sc", src: "images/ref/stitch-guide-1.webp", name: "짧은뜨기", en: "Single crochet", f: 1.0, w: ["thin","mid","thick"], tex: ["smooth","fluffy"], c: 1, d: 1, suits: ["flat","stretch","bag","hat","wallet"],
      how: "코바늘의 기본. <b>코에 바늘을 넣고 실을 걸어 빼낸 뒤 두 고리를 한 번에</b> 빼요. 촘촘하고 단단해요.", note: "촘촘·튼튼" },
    { id: "dc", src: "images/ref/stitch-guide-1.webp", name: "한길긴뜨기", en: "Double crochet", f: 0.85, w: ["thin","mid","thick"], tex: ["smooth","fluffy"], c: 1, d: 1, suits: ["flat","garment","hat","stretch"],
      how: "<b>실을 한 번 감고</b> 코에 넣어 두 고리씩 두 번 빼요. 키가 커서 빨리 늘고 실도 덜 들어요.", note: "빨리 늘어요" },
    { id: "hdc", src: "images/ref/stitch-guide-1.webp", name: "긴뜨기", en: "Half double crochet", f: 0.9, w: ["thin","mid","thick"], tex: ["smooth","fluffy"], c: 1, d: 1, suits: ["flat","stretch","bag","hat","wallet"],
      how: "<b>실을 한 번 감고</b> 코에 넣어 실을 빼낸 뒤 <b>바늘의 세 고리를 한 번에</b> 빼요. 짧은뜨기보다 키가 크고 한길긴뜨기보다 촘촘해요.", note: "중간 키" },
    { id: "tr", src: "images/ref/stitch-guide-1.webp", name: "두길긴뜨기", en: "Treble crochet", f: 0.8, w: ["thin","mid","thick"], tex: ["smooth","fluffy"], c: 1, d: 2, suits: ["flat","garment"],
      how: "<b>실을 두 번 감고</b> 코에 넣어 두 고리씩 세 번 빼요. 키가 아주 커서 빨리 늘고, 성글고 부드럽게 늘어져요.", note: "성글고 시원" },
    { id: "blohdc", src: "images/ref/stitch-guide-1.webp", name: "뒷이랑 긴뜨기", en: "BLO half double crochet", f: 0.95, w: ["thin","mid","thick"], tex: ["smooth"], c: 1, d: 1, suits: ["stretch","hat","flat"],
      how: "앞단 코 머리의 <b>뒤쪽 고리에만</b> 바늘을 넣어 긴뜨기를 떠요. 앞쪽 고리가 가로줄로 남아 대바늘 고무단 같은 골이 생겨요.", note: "골지 느낌" },
    { id: "blodc", src: "images/ref/stitch-guide-1.webp", name: "뒷이랑 한길긴뜨기", en: "BLO double crochet", f: 0.9, w: ["thin","mid","thick"], tex: ["smooth"], c: 1, d: 1, suits: ["flat","garment","stretch"],
      how: "앞단 코 머리의 <b>뒤쪽 고리에만</b> 한길긴뜨기를 떠요. 단마다 가로 골이 도드라져 단정한 입체감이 생겨요.", note: "가로 골" },
    { id: "moss", name: "린넨 스티치", en: "Moss stitch", f: 1.0, w: ["thin","mid","thick"], tex: ["smooth"], c: 1, d: 1, suits: ["flat","bag","garment","wallet"],
      how: "<b>짧은뜨기 1코, 사슬 1코</b>를 번갈아, 다음 단은 아래 단 사슬 구멍에 떠요. 직조한 듯 납작하고 단정해요.", note: "직조 느낌" },
    { id: "granny", name: "그래니 스퀘어", en: "Granny square", f: 1.0, w: ["thin","mid","thick"], tex: ["smooth","fluffy"], c: 1, mc: true, d: 2, suits: ["motif","flat","bag","garment"],
      how: "가운데 원에서 시작해 <b>한길긴뜨기 3코 묶음</b>을 둘러 사각형으로 키워요. 한 장씩 떠서 이으면 되니 자투리 실에 딱이에요.", note: "조각 잇기" },
    { id: "shell", src: "images/ref/stitch-guide-1.webp", name: "부채 무늬", en: "Shell stitch", f: 1.0, w: ["thin","mid"], tex: ["smooth"], c: 1, d: 2, suits: ["flat","garment"],
      how: "한 코에 <b>한길긴뜨기 5코</b>를 부채처럼 펼쳐 넣고, 사이는 짧은뜨기로 고정해요. 물결 같은 무늬가 생겨요.", note: "물결" },
    { id: "vst", src: "images/ref/stitch-guide-1.webp", name: "V자 무늬", en: "V-stitch", f: 0.8, w: ["thin","mid"], tex: ["smooth"], c: 1, d: 2, suits: ["flat","garment","bag"],
      how: "한 코에 <b>한길긴 1, 사슬 1, 한길긴 1</b>을 떠서 V자를 만들고, 다음 단은 V자 가운데 사슬 구멍에 다시 V를 떠요. 가볍고 살짝 비쳐서 여름 소품에 좋아요.", note: "가볍게 비침" },
    { id: "cluster", name: "모아뜨기 무늬", en: "Cluster stitch", f: 1.0, w: ["thin","mid"], tex: ["smooth"], c: 1, d: 2, suits: ["flat","garment","bag"],
      how: "한길긴뜨기 3코를 <b>마지막 고리만 남긴 채 떠서 한 번에 모아</b> 빼요. 사이사이 사슬을 넣어 거꾸로 선 부채 같은 무늬가 생겨요.", note: "거꾸로 부채" },
    { id: "grannyst", src: "images/ref/stitch-guide-1.webp", name: "그래니 스티치", en: "Granny stitch", f: 1.0, w: ["thin","mid","thick"], tex: ["smooth","fluffy"], c: 1, mc: true, d: 2, suits: ["flat","bag","garment"],
      how: "그래니 스퀘어의 <b>한길긴 3코 묶음</b>을 줄로 떠요. 단마다 앞단 묶음 사이 틈에 다시 3코씩 넣어요. 조각을 잇지 않아도 그래니 느낌이 나고, 단마다 색을 바꾸기 좋아요.", note: "줄로 뜨는 그래니" },
    { id: "mesh", name: "그물 무늬", en: "Mesh", f: 0.7, w: ["thin","mid"], tex: ["smooth"], c: 1, d: 1, suits: ["bag","garment"],
      how: "<b>사슬 몇 코와 짧은뜨기</b>로 그물 칸을 만들어 가요. 실이 아주 적게 들어 네트백에 좋아요.", note: "실 절약" },
    { id: "popcorn", name: "팝콘 무늬", en: "Popcorn", f: 1.35, w: ["mid","thick"], tex: ["smooth"], c: 1, d: 2, suits: ["flat","bag"],
      how: "한 코에 <b>한길긴뜨기 여러 코</b>를 떠서 오므려 볼록한 방울을 만들어요. 귀엽지만 실을 많이 먹어요.", note: "볼록 방울" },
    { id: "puff", src: "images/ref/stitch-guide-1.webp", name: "퍼프 무늬", en: "Puff stitch", f: 1.25, w: ["mid","thick"], tex: ["smooth"], c: 1, d: 2, suits: ["flat","bag","hat"],
      how: "한 코에 <b>실 감고 고리 빼기를 세 번</b> 해서 고리 7개를 한 번에 빼요. 통통한 방울이 줄지어 생기고, 팝콘보다 부드럽지만 실을 꽤 먹어요.", note: "통통 방울" },
    { id: "waffle", name: "코바늘 와플", en: "Waffle", f: 1.4, w: ["mid","thick"], tex: ["smooth"], c: 1, d: 3, suits: ["flat"],
      how: "<b>앞걸어 한길긴뜨기</b>와 일반 한길긴뜨기를 번갈아 칸을 세워요. 아주 두툼해서 담요나 코스터에 좋아요.", note: "아주 두툼" },
    { id: "c2c", name: "C2C 배색", en: "Corner to corner", f: 1.05, w: ["thin","mid","thick"], tex: ["smooth"], c: 2, d: 2, suits: ["flat"],
      how: "<b>모서리부터 대각선으로</b> 작은 블록을 쌓아요. 블록 단위로 색을 바꿀 수 있어 픽셀 그림을 넣기 좋아요.", note: "픽셀 그림" },
    { id: "stripe", name: "줄무늬", en: "Stripes", f: 1.0, w: ["thin","mid","thick"], tex: ["smooth","fluffy"], c: 2, d: 1, suits: ["flat","bag","hat","stretch"],
      how: "몇 단마다 <b>색을 바꿔</b> 떠요. 양이 적은 색은 한 단짜리 얇은 줄로 쓰면 돼요.", note: "자투리 정리" },
    { id: "flower", name: "꽃 모티브", en: "Flower motif", f: 1.0, w: ["thin","mid","thick"], tex: ["smooth","fluffy"], c: 1, mc: true, d: 2, suits: ["motif","flat"],
      how: "사슬 고리에 <b>꽃잎을 한 장씩</b> 둘러 떠요. 작은 양으로 하나 완성되고, 여러 장을 이으면 담요나 가방이 돼요.", note: "적은 양 OK" },
    { id: "cat", name: "고양이 얼굴 모티브", en: "Cat face motif", f: 1.0, w: ["thin","mid","thick"], tex: ["smooth"], c: 1, mc: true, d: 2, suits: ["motif","flat"],
      how: "<b>매직링에서 부채꼴로 코를 떠서</b> 귀가 달린 고양이 얼굴을 만드는 모티브예요. 9장을 3×3으로 놓고 짧은뜨기로 채워 이어요. 도안은 첨부한 원본 이미지 기준이에요.", note: "고양이 도안" },
    { id: "blackcat", name: "검은 고양이 배색", en: "Peeking black cat", f: 1.15, w: ["thin","mid","thick"], tex: ["smooth"], c: 2, d: 2, suits: ["cat","flat"],
      how: "<b>짧은뜨기로 바탕 · 고양이 · 아랫단 세 가지 색</b>을 칸 도안대로 바꿔 가며 떠요. 안 쓰는 색 실은 코 안에 감싸 넣으며 떠서 뒤에 실이 걸치지 않아요. 네모 가방, 원형 가방, 코스터에 써요.", note: "고양이 배색" },
    { id: "filetcat", src: "images/ref/catfiletblanket.png", name: "고양이 필레 커튼", en: "Filet crochet cats", f: 0.76, w: ["thin"], tex: ["smooth"], c: 1, d: 3, suits: ["filetcat"],
      how: "모눈 도안대로 <b>칸을 한길긴뜨기로 채우거나 사슬로 비워</b> 고양이 6마리를 그려요. 한 칸 4코 기준 한 단 221코, 82단이에요. 가는 실 · 3mm 코바늘이면 약 92 × 63~68cm, 25g 실 10~11볼이 들어요.", note: "큰 작품" },
    { id: "amigu", name: "아미구루미", en: "Amigurumi", f: 1.0, w: ["thin","mid","thick"], tex: ["smooth","fluffy"], c: 1, d: 2, suits: ["toy"],
      how: "<b>매직링에서 짧은뜨기를 나선으로</b> 늘리고 줄여 입체를 만들어요. 솜을 넣으면 인형이 돼요.", note: "입체 인형" },
    { id: "lace", name: "레이스 무늬", en: "Lace", f: 0.8, w: ["thin","mid"], tex: ["smooth"], c: 1, d: 3, suits: ["flat","garment","motif"],
      how: "<b>사슬과 긴뜨기로 큰 구멍</b>을 만들어 부채꼴이나 거미줄 무늬를 떠요. 가는 실이면 더 섬세하고, 보통 실이면 구멍이 크고 시원하게 떠져요.", note: "섬세함" }
  ]
};

const WKEYS = ["thin", "mid", "thick"];
const STORE = "leftover-yarn-v1";
