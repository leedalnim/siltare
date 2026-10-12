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
function cinfo(key) {
  if (typeof key === "string" && /^#[0-9a-fA-F]{6}$/.test(key)) return { name: nearestName(key) + " 계열", hex: key.toUpperCase(), custom: true };
  const c = COLOR_MAP[key];
  return c && c[2] ? { name: c[1], hex: c[2] } : { name: "색 모름", hex: null };
}
const FALLBACK = ["#CFC3AE", "#7C8FB5", "#D49A28", "#8FB59A"];

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
    { id: "stripe", name: "줄무늬", en: "Stripes", f: 1.0, w: ["thin","mid","thick"], tex: ["smooth","fluffy"], c: 2, d: 1, suits: ["flat","stretch","garment","bag"],
      how: "몇 단마다 <b>색을 바꿔</b> 떠요. 남은 실 정리에 가장 좋은 방법이라, 양이 적은 색은 얇은 줄로 쓰면 돼요.", note: "자투리 정리" },
    { id: "slip", name: "걸러뜨기 배색", en: "Slip-stitch", f: 1.1, w: ["thin","mid"], tex: ["smooth"], c: 2, d: 2, suits: ["flat","stretch","bag"],
      how: "한 단에 한 색만 쓰면서 <b>몇 코를 걸러</b> 아래 색을 끌어올려요. 배색처럼 보이지만 한 번에 한 실만 잡아서 쉬워요.", note: "쉬운 배색" },
    { id: "fairisle", name: "페어아일", en: "Fair Isle", f: 1.3, w: ["thin","mid"], tex: ["smooth"], c: 2, d: 3, suits: ["stretch","garment"],
      how: "한 단에서 <b>두 색을 번갈아</b> 뜨고 안 쓰는 실은 뒤로 걸쳐 둬요. 안쪽에 실이 겹쳐 따뜻하고 실을 많이 먹어요.", note: "본격 배색" }
  ],
  crochet: [
    { id: "sc", name: "짧은뜨기", en: "Single crochet", f: 1.0, w: ["thin","mid","thick"], tex: ["smooth","fluffy"], c: 1, d: 1, suits: ["flat","stretch","bag","hat"],
      how: "코바늘의 기본. <b>코에 바늘을 넣고 실을 걸어 빼낸 뒤 두 고리를 한 번에</b> 빼요. 촘촘하고 단단해요.", note: "촘촘·튼튼" },
    { id: "dc", name: "한길긴뜨기", en: "Double crochet", f: 0.85, w: ["thin","mid","thick"], tex: ["smooth","fluffy"], c: 1, d: 1, suits: ["flat","garment","hat","stretch"],
      how: "<b>실을 한 번 감고</b> 코에 넣어 두 고리씩 두 번 빼요. 키가 커서 빨리 늘고 실도 덜 들어요.", note: "빨리 늘어요" },
    { id: "moss", name: "린넨 스티치", en: "Moss stitch", f: 1.0, w: ["thin","mid","thick"], tex: ["smooth"], c: 1, d: 1, suits: ["flat","bag","garment"],
      how: "<b>짧은뜨기 1코, 사슬 1코</b>를 번갈아, 다음 단은 아래 단 사슬 구멍에 떠요. 직조한 듯 납작하고 단정해요.", note: "직조 느낌" },
    { id: "granny", name: "그래니 스퀘어", en: "Granny square", f: 1.0, w: ["thin","mid","thick"], tex: ["smooth","fluffy"], c: 1, mc: true, d: 2, suits: ["motif","flat","bag","garment"],
      how: "가운데 원에서 시작해 <b>한길긴뜨기 3코 묶음</b>을 둘러 사각형으로 키워요. 한 장씩 떠서 이으면 되니 자투리 실에 딱이에요.", note: "조각 잇기" },
    { id: "shell", name: "부채 무늬", en: "Shell stitch", f: 1.0, w: ["thin","mid"], tex: ["smooth"], c: 1, d: 2, suits: ["flat","garment"],
      how: "한 코에 <b>한길긴뜨기 5코</b>를 부채처럼 펼쳐 넣고, 사이는 짧은뜨기로 고정해요. 물결 같은 무늬가 생겨요.", note: "물결" },
    { id: "mesh", name: "그물 무늬", en: "Mesh", f: 0.7, w: ["thin","mid"], tex: ["smooth"], c: 1, d: 1, suits: ["bag","garment"],
      how: "<b>사슬 몇 코와 짧은뜨기</b>로 그물 칸을 만들어 가요. 실이 아주 적게 들어 네트백에 좋아요.", note: "실 절약" },
    { id: "popcorn", name: "팝콘 무늬", en: "Popcorn", f: 1.35, w: ["mid","thick"], tex: ["smooth"], c: 1, d: 2, suits: ["flat","bag"],
      how: "한 코에 <b>한길긴뜨기 여러 코</b>를 떠서 오므려 볼록한 방울을 만들어요. 귀엽지만 실을 많이 먹어요.", note: "볼록 방울" },
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
    { id: "amigu", name: "아미구루미", en: "Amigurumi", f: 1.0, w: ["thin","mid","thick"], tex: ["smooth","fluffy"], c: 1, d: 2, suits: ["toy"],
      how: "<b>매직링에서 짧은뜨기를 나선으로</b> 늘리고 줄여 입체를 만들어요. 솜을 넣으면 인형이 돼요.", note: "입체 인형" },
    { id: "lace", name: "레이스 무늬", en: "Lace", f: 0.8, w: ["thin","mid"], tex: ["smooth"], c: 1, d: 3, suits: ["flat","garment","motif"],
      how: "<b>사슬과 긴뜨기로 큰 구멍</b>을 만들어 부채꼴이나 거미줄 무늬를 떠요. 가는 실이면 더 섬세하고, 보통 실이면 구멍이 크고 시원하게 떠져요.", note: "섬세함" }
  ]
};

const WKEYS = ["thin", "mid", "thick"];
const STORE = "leftover-yarn-v1";
