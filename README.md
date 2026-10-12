# 남은 실 처방전

남은 뜨개실을 입력하면 뜰 수 있는 무늬·작품을 추천하고, 도안과 단수 세기까지 도와주는 앱이에요.
빌드 없이 정적 파일만으로 동작하고, 폰에 앱처럼 설치할 수 있어요(PWA).

## 폰에 설치하기

GitHub Pages가 켜진 주소(`https://<계정>.github.io/siltare/`)를 폰에서 열어요.

- **안드로이드(크롬)**: 메뉴(⋮) → `앱 설치` 또는 `홈 화면에 추가`
- **아이폰(사파리)**: 공유 버튼 → `홈 화면에 추가`

## GitHub Pages 켜기 (한 번만)

저장소 `Settings → Pages → Build and deployment → Source`를 **GitHub Actions**로 바꿔요.
이후 `main`(또는 `claude/zen-pascal-1c1kdm`)에 푸시하면 `.github/workflows/pages.yml`이 자동으로 배포해요.

## 파일 구조

```
index.html              화면 뼈대와 스크립트·CSS 불러오기
manifest.webmanifest    앱 이름·아이콘·색 (설치용)
sw.js                   오프라인 저장 (서비스 워커)
icons/                  앱 아이콘 (흰 여백을 잘라 크기별로 만든 png)
css/
  base.css              변수·레이아웃·상단 바
  basket.css            내 실 · 무늬 선택
  patterns.css          무늬 카드 · 도안 표
  counter.css           단수 세기
  projects.css          작품 목록
  guide.css             기호 사전 · 고양이 도안 블록
  mypat.css             내 도안(등록한 이미지·PDF)
  nav-sheets.css        하단 탭 · 바텀시트 · 알림
js/                     아래 순서대로 불러와요 (index.html 맨 아래)
  data.js               굵기·색·작품·무늬 데이터
  state.js              저장 상태와 추천 계산
  draw.js               무늬 그림(캔버스)
  product.js            완성 미리보기 그림
  recipe.js             도안 · 기호 표
  render.js             내 실 · 무늬 · 작품 화면
  setup.js              뜨기 전 설정(폭→콧수)
  progress.js           편물 진행 그림
  counter.js            단수 세기 화면 · 탭 이동
  guide-data.js         기호 사전 데이터(기호별 뜻·뜨는 방법)
  cat.js                고양이 얼굴 도안(원본 + 따라 그린 벡터)
  guide.js              기호 사전 화면과 기호 그림(GLYPH)
  cchart.js             코바늘 무늬의 기호 도안
  sync.js               계정 저장(claude.ai에서만 동작)
  ui.js                 바텀시트 · 알림
  mypat.js              내 도안 등록·보기·단수 세기
  dotchart.js           도트 도안 그리기·보면서 뜨기
  events.js             클릭·입력 처리
  main.js               시작
  pwa.js                서비스 워커 등록
```

JS 파일은 모듈이 아니라 **순서대로 하나로 이어지는 일반 스크립트**예요. 파일 사이에서 변수와 함수를 그대로 같이 써요. 새 파일을 만들면 `index.html`의 `<script>` 목록에 알맞은 자리로 넣어 주세요.

## 자주 하는 수정

| 하고 싶은 일 | 고칠 곳 |
|---|---|
| 무늬·작품 추가 | `js/data.js` (`PATTERNS`, `PROJECTS`) |
| 기호 설명 추가·수정 | `js/guide-data.js` |
| 코바늘 무늬 기호 도안 수정 | `js/cchart.js` (`CCHART`) |
| 기호 그림 추가 | `js/guide.js`의 `GLYPH` |
| 색·글자 크기 | `css/base.css` 맨 위 변수 |
| 앱 아이콘 교체 | `icons/` 안의 같은 이름 파일 교체 |

앱 파일은 "인터넷 먼저, 안 되면 저장본"으로 불러와서, 고쳐서 푸시하면 따로 버전을 올리지 않아도 새 내용이 떠요.

## 내 도안

`무늬` 탭 → `내 도안`에서 인터넷에서 받은 도안 이미지·PDF를 등록하거나, **도트 도안**(가로×세로 칸에 색을 칠하는 배색 도안)을 직접 그려 저장해요.

- 사진·파일 고르기 / 카메라 / 붙여넣기 / 끌어놓기
- **안드로이드(설치한 앱)**: 크롬 등에서 이미지를 공유 → `남은 실`로 바로 보낼 수 있어요. (앱을 설치한 뒤에 동작해요)
- 파일은 이 기기 브라우저(IndexedDB)에만 저장돼요. 브라우저 데이터를 지우거나 앱을 지우면 사라지니 중요한 도안은 원본도 따로 보관하세요.
- 아이폰은 공유 기능을 못 써서 `사진·파일 고르기`를 써요.

## 데이터 저장

- 브라우저 `localStorage` 키 `leftover-yarn-v1`. **키와 형식을 바꾸면 기존 실 데이터가 사라져요.**
- 기기 간 동기화(`window.claude`)는 claude.ai 안에서만 동작해요. GitHub Pages에서는 자동으로 "이 브라우저에만 저장"으로 동작해요.
- 폰마다·브라우저마다 따로 저장돼요. 홈 화면에 설치한 앱과 브라우저 탭의 데이터도 서로 달라요.

## 로컬에서 보기

```
python3 -m http.server 8000
```
