// ---------- 고양이 얼굴 모티브 도안 (무늬 상세 안에 표시) ----------
// 첨부 원본 이미지(images/cat-chart.png)를 그대로 쓰고, 이미지에서 읽히는 것만 적어요.
// sure: false 인 항목은 해석이 불확실하다는 표시예요.
const CAT = {
  notice: "원본 이미지와, 원본을 그대로 따라 그린 도안을 함께 실었어요. 아래 설명은 이미지에서 읽히는 것만 적었고, 확실하지 않은 해석은 '불확실'로 표시했어요. 코 수나 단 설명이 적힌 원문이 있다면 그쪽을 우선해 주세요.",
  img: "images/cat-chart.png", vec: "images/cat-vector.svg",
  legend: [
    { img: "ring",   name: "매직링", look: "가운데 소용돌이", mean: "얼굴이 시작되는 자리예요. 사방으로 뻗는 기호가 모두 이 고리에서 나와요.", sure: true },
    { img: "spoke",  name: "사방으로 뻗은 긴 선", look: "끝에 가로선(T)이 있고, 사선이 있는 것도 없는 것도 있어요", mean: "매직링에서 뻗는 코예요. 사선이 한 줄 있으면 한길긴뜨기, 사선 없이 가로선만 있으면 중간뜨기로 읽혀요. 옆쪽 코가 더 길게 그려져 있어요.", sure: false },
    { img: "ttt",    name: "얼굴 위쪽 TTT", look: "사선 있는 T 세 개, 맨 위가 한 줄로 이어짐", mean: "얼굴 윗부분(두 귀 사이)에 붙는 한길긴뜨기 3코로 읽혀요. 맨 위 가로선이 이어진 것의 정확한 뜻은 불확실해요.", sure: false },
    { img: "ear",    name: "귀", look: "길쭉한 타원 둘 + 점", mean: "타원은 사슬뜨기예요. 귀 옆의 점(●)은 빼뜨기로 읽히지만 불확실해요.", sure: false },
    { img: "dot",    name: "얼굴 아래 점", look: "검은 점 ●", mean: "빼뜨기로 읽혀요. 단 끝맺음 표시일 수도 있어 불확실해요.", sure: false },
    { img: "x",      name: "짧은뜨기", look: "X", mean: "모티브 사이와 바깥 둘레를 채운 코예요.", sure: true },
    { img: "chain",  name: "사슬", look: "길쭉한 둥근 막대", mean: "모서리를 따라 이어진 사슬뜨기예요.", sure: true },
    { img: "corner", name: "모서리 기호", look: "사선 있는 T 여러 개가 아랫선으로 이어진 모양", mean: "네 모서리에 하나씩 있어요. 정확한 코 종류는 불확실하니 원본을 확대해서 확인해 주세요.", sure: false }
  ],
  // 이미지에서 확인한 구조 (제가 직접 센 값이라 한 번 더 확인해 주세요)
  read: [
    ["모티브 배치", "고양이 얼굴 모티브가 가로 3 × 세로 3, 모두 9개예요."],
    ["얼굴 한 장", "가운데 매직링에서 기호 11개가 부채꼴로 뻗어요 (위쪽 3 · 아래쪽 2 · 왼쪽 3 · 오른쪽 3). 위쪽·아래쪽 기호는 짧고 사선이 있고, 양옆은 길고 끝에 가로선이 있어요."],
    ["얼굴 위", "두 귀 사이 위쪽에 사선 있는 T 3개(TTT)가 붙어요."],
    ["귀", "얼굴 양쪽 위에 타원(사슬) 2개씩과 점이 있어요."],
    ["모티브 사이·바깥", "짧은뜨기(X)로 채워요. 옆 모티브 사이는 X 두 줄 폭이에요."],
    ["모서리", "네 모서리는 사슬(막대) 곡선과 모서리 기호로 마무리해요."]
  ],
  // 단수 세기에서 쓰는 순서 — 코 수는 도안 이미지로 확인하도록 일부러 적지 않았어요.
  rows: [
    ["1 · 매직링", "도안 가운데 소용돌이처럼 매직링을 만들어요."],
    ["2 · 얼굴", "매직링 안에 도안대로 코를 떠요. 이미지에서 센 기호는 11개 (위 3 · 아래 2 · 양옆 3+3)이고, 코 종류는 원본 도안과 맞춰 보세요."],
    ["3 · 얼굴 위", "두 귀 사이 위쪽에 사선 있는 T 3코(TTT)를 떠요."],
    ["4 · 귀", "양쪽 귀 자리에 사슬 타원 2개씩과 점 표시를 도안대로 떠요."],
    ["5 · 이어 붙이기", "9장을 3×3으로 놓고, 사이와 바깥을 짧은뜨기(X)로 채워 이어요. 모서리는 도안의 모서리 기호대로 떠요."]
  ]
};

const catUI = { v: "vec", zoom: false };
function catBlockHTML() {
  const src = catUI.v === "vec" ? CAT.vec : CAT.img;
  return `<section class="cat-block" id="cat-block" aria-labelledby="cat-h">
    <h4 id="cat-h">고양이 얼굴 도안</h4>
    <div class="seg cat-seg" role="group" aria-label="도안 보기">
      <button type="button" data-catv="vec" aria-pressed="${catUI.v === "vec"}">다시 그린 도안</button>
      <button type="button" data-catv="img" aria-pressed="${catUI.v === "img"}">원본 이미지</button>
    </div>
    <figure class="cat-fig"><div class="cat-scroll"><img id="cat-img" class="${catUI.zoom ? "big" : ""}" src="${src}" alt="고양이 얼굴 모티브 9장을 3×3으로 이은 도안 (${catUI.v === "vec" ? "다시 그린 도안" : "원본 이미지"})"></div>
      <figcaption><button type="button" class="ghost-btn" data-cat-zoom>${catUI.zoom ? "작게 보기" : "크게 보기"}</button>
        <span>${catUI.v === "vec" ? "원본을 선 하나하나 따라 그린 벡터예요. 확대해도 깨지지 않아요. 캡처 아이콘에 가려진 부분(오른쪽 X 4개, 오른쪽 아래 모서리)은 대칭으로 복원했어요." : "받은 원본 그대로예요. 오른쪽 아래에 캡처 화면의 확대·돋보기 아이콘이 겹쳐 있어요."}</span></figcaption></figure>
    <div class="notice">${CAT.notice}</div>
    <details class="cat-fold"><summary>도안 속 기호 읽기 (${CAT.legend.length})</summary>
      <ul class="cat-legend">${CAT.legend.map(x => `<li><img class="lg-img" src="images/sym-${x.img}.png" alt="${esc(x.name)} 기호"><span><b>${x.name}</b>${x.sure ? "" : '<em class="unsure">불확실</em>'}<small>${x.look}</small><span class="lg-mean">${x.mean}</span></span></li>`).join("")}</ul></details>
    <details class="cat-fold"><summary>도안에서 확인한 구조</summary>
      <ul class="cat-read">${CAT.read.map(([k, v]) => `<li><b>${k}</b><span>${v}</span></li>`).join("")}</ul></details>
  </section>`;
}
document.addEventListener("click", e => {
  const v = e.target.closest("[data-catv]"), z = e.target.closest("[data-cat-zoom]");
  if (!v && !z) return;
  if (v) catUI.v = v.dataset.catv; else catUI.zoom = !catUI.zoom;
  const box = $("cat-block"); if (box) box.outerHTML = catBlockHTML();
});
