// ---------- 도안: 코 잡기, 단별 방법, 기호 도안 ----------
const GPA = { thin: 4, mid: 6, thick: 8.5 }; // g per 100cm² of plain fabric (knit); crochet ×1.3
function labelsFor(cols) { return ["A", "B", "C", "D"].map((L, i) => cols[i] ? `${L}(${cols[i].name})` : `${L}색`); }
function rle(row, cn) {
  const parts = []; let i = 0;
  while (i < row.length) { let j = i; while (j < row.length && row[j] === row[i]) j++; parts.push(`${cn[row[i]].charAt(0)}${j - i}`); i = j; }
  return parts.length === 1 ? `모두 ${cn[row[0]]}` : `*${parts.join(", ")}* 반복`;
}
function fiColors(r, n3) {
  const out = [];
  for (let i = 0; i < 8; i++) {
    let c;
    if (r === 0 || r === 10 || r === 2 || r === 8) c = 0;
    else if (r === 1 || r === 9) c = (i + (r === 9 ? 1 : 0)) % 2 ? 1 : 0;
    else { const d = Math.abs(i - 4) + Math.abs(r - 5); c = d <= 1 ? 2 : d === 3 ? 1 : 0; }
    out.push(c === 2 && !n3 ? 1 : c);
  }
  return out;
}
function recipe(craft, pid, cols, mode) {
  const cn = labelsFor(cols), n = Math.max(1, Math.min(4, cols.length));
  const R = (t, d) => ({ t, d });
  const K = {
    stock: () => ({ m: [1, 0], rm: [1, 0], cast: "아무 콧수나 괜찮아요.", rows: [R("1단 (겉면)", "모두 겉뜨기"), R("2단 (안면)", "모두 안뜨기")],
      rcast: "아무 콧수나 괜찮아요. 코를 잡은 뒤 꼬이지 않게 이어 원통으로 떠요.", rr: [R("매 단", "모두 겉뜨기")],
      round: "원통으로 뜰 때(모자·넥워머)는 모든 단을 겉뜨기만 해요.", chart: { rows: ["kkkkkkkk", "kkkkkkkk"] } }),
    garter: () => ({ m: [1, 0], rm: [1, 0], cast: "아무 콧수나 괜찮아요.", rows: [R("1단 (겉면)", "모두 겉뜨기"), R("2단 (안면)", "모두 겉뜨기")],
      rcast: "아무 콧수나 괜찮아요. 원통으로 이어 떠요.", rr: [R("1단", "모두 겉뜨기"), R("2단", "모두 안뜨기")],
      round: "원통으로 뜰 때는 겉뜨기 1단, 안뜨기 1단을 번갈아요.", chart: { rows: ["kkkkkkkk", "pppppppp"] } }),
    rib: () => ({ m: [4, 2], rm: [4, 0], cast: "4의 배수 + 2코 (예: 22코, 42코)", rows: [R("1단 (겉면)", "*겉2, 안2* 반복, 마지막 2코는 겉2"), R("2단 (안면)", "*안2, 겉2* 반복, 마지막 2코는 안2")],
      rcast: "4의 배수 (예: 모자 88코)", rr: [R("매 단", "*겉2, 안2* 반복")],
      tip: "안면에서는 보이는 대로 떠요. V자 코는 안뜨기, 오돌토돌한 코는 겉뜨기예요.",
      round: "원통으로 뜰 때는 4의 배수로 잡고 매 단 *겉2, 안2*만 반복해요.", chart: { rows: ["kkppkkppkk", "kkppkkppkk"] } }),
    seed: () => ({ m: [2, 1], rm: [2, 0], cast: "홀수 코 (예: 21코, 31코)", rows: [R("1단 (겉면)", "*겉1, 안1* 반복, 마지막 1코는 겉1"), R("2단 (안면)", "1단과 똑같이 *겉1, 안1* 반복, 마지막 1코는 겉1")],
      rcast: "짝수 코 (예: 80코)", rr: [R("1단", "*겉1, 안1* 반복"), R("2단", "*안1, 겉1* 반복")],
      tip: "V자 코 위에는 안뜨기, 오돌토돌한 코 위에는 겉뜨기가 오면 맞게 뜬 거예요.",
      chart: { rows: ["kpkpkpkpk", "pkpkpkpkp"] } }),
    basket: () => ({ m: [8, 0], rm: [8, 0], cast: "8의 배수 (예: 32코, 48코)",
      rows: [1, 2, 3, 4, 5, 6, 7, 8].map(i => R(`${i}단 (${i % 2 ? "겉면" : "안면"})`, i <= 4 ? "*겉4, 안4* 반복" : "*안4, 겉4* 반복")),
      rcast: "8의 배수 (예: 80코)", rr: [1, 2, 3, 4, 5, 6, 7, 8].map(i => R(`${i}단`, i <= 4 ? "*겉4, 안4* 반복" : "*안4, 겉4* 반복")),
      tip: "4단마다 블록이 바뀌어요. 겉면과 안면 모두 같은 순서로 뜨면 돼요.",
      chart: { rows: ["kkkkpppp", "kkkkpppp", "kkkkpppp", "kkkkpppp", "ppppkkkk", "ppppkkkk", "ppppkkkk", "ppppkkkk"] } }),
    waffle: () => ({ m: [3, 1], rm: [3, 0], cast: "3의 배수 + 1코 (예: 31코)",
      rows: [R("1단 (겉면)", "겉1, *안2, 겉1* 반복"), R("2단 (안면)", "안1, *겉2, 안1* 반복"), R("3단 (겉면)", "1단과 같게: 겉1, *안2, 겉1* 반복"), R("4단 (안면)", "모두 겉뜨기 (겉면에서 보면 가로 골이 생겨요)")],
      rcast: "3의 배수 (예: 84코)", rr: [R("1단", "*겉1, 안2* 반복"), R("2단", "*겉1, 안2* 반복"), R("3단", "*겉1, 안2* 반복"), R("4단", "모두 안뜨기")],
      chart: { rows: ["kppkppk", "kppkppk", "kppkppk", "ppppppp"] } }),
    cable: () => ({ m: [8, 2], rm: [8, 0], cast: "8의 배수 + 2코 (예: 34코, 42코). 꽈배기 바늘이 하나 필요해요.",
      rows: [R("1단 (겉면) · 꼬는 단", "*안2, 꽈배기 6코* 반복, 마지막 안2"), R("2단 (안면)", "*겉2, 안6* 반복, 마지막 겉2"), R("3단 (겉면)", "*안2, 겉6* 반복, 마지막 안2"),
             R("4단 (안면)", "*겉2, 안6* 반복, 마지막 겉2"), R("5단 (겉면)", "*안2, 겉6* 반복, 마지막 안2"), R("6단 (안면)", "*겉2, 안6* 반복, 마지막 겉2")],
      rcast: "8의 배수 (예: 모자 88코). 꽈배기 바늘이 하나 필요해요.",
      rr: [R("1단 · 꼬는 단", "*안2, 꽈배기 6코* 반복"), ...[2, 3, 4, 5, 6].map(i => R(`${i}단`, "*안2, 겉6* 반복"))],
      tip: "꽈배기 6코: 3코를 꽈배기 바늘에 옮겨 편물 뒤에 두고 겉3, 꽈배기 바늘의 3코를 겉3. 뒤에 두면 오른쪽으로, 앞에 두면 왼쪽으로 꼬여요.",
      chart: { rows: ["ppxxxxxxpp", "ppkkkkkkpp", "ppkkkkkkpp", "ppkkkkkkpp", "ppkkkkkkpp", "ppkkkkkkpp"] } }),
    lace: () => ({ m: [4, 3], rm: [4, 0], cast: "4의 배수 + 3코 (예: 23코, 43코)",
      rows: [R("1단 (겉면)", "겉1, *바늘비우기, 2코 모아 겉뜨기, 겉2* 반복, 마지막 2코는 겉2"), R("2단 (안면)", "모두 안뜨기"),
             R("3단 (겉면)", "겉3, *바늘비우기, 2코 모아 겉뜨기, 겉2*를 4코 남을 때까지 반복, 남은 4코는 겉뜨기"), R("4단 (안면)", "모두 안뜨기")],
      rcast: "4의 배수 (예: 80코)",
      rr: [R("1단", "*바늘비우기, 2코 모아 겉뜨기, 겉2* 반복"), R("2단", "모두 겉뜨기"), R("3단", "*겉2, 바늘비우기, 2코 모아 겉뜨기* 반복"), R("4단", "모두 겉뜨기")],
      tip: "바늘비우기는 실을 바늘에 한 번 걸어 구멍을 내는 것, 2코 모아 겉뜨기는 2코에 한 번에 바늘을 넣어 겉뜨기하는 것이에요. 구멍 단이 끝날 때마다 콧수가 그대로인지 세어 보세요.",
      chart: { rows: ["ko/kko/kkkk", "kkkkkkkkkkk", "kkko/kkkkkk", "kkkkkkkkkkk"] } }),
    brioche: () => ({ m: [2, 0], cast: "짝수 코 (예: 30코)", setup: [R("기초단 (안면)", "*바늘비우기 하며 1코 걸러뜨기, 겉1* 반복")],
      rows: [R("홀수 단", "*바늘비우기 하며 1코 걸러뜨기, 걸러 둔 코와 걸친 실을 함께 겉뜨기* 반복"),
             R("짝수 단", "*바늘비우기 하며 1코 걸러뜨기, 걸러 둔 코와 걸친 실을 함께 겉뜨기* 반복 (겉면에서 보면 앞 단과 한 칸씩 엇갈려요)")],
      chart: { rows: ["ybybybyb", "bybybyby"] },
      tip: "'바늘비우기 하며 걸러뜨기'는 실을 앞에 두고 1코를 안뜨기 방향으로 옮긴 뒤, 실을 바늘 위로 넘겨 뒤로 보내는 동작이에요. 기초단 다음부터는 매 단 똑같이 반복해요." }),
    stripe: () => {
      const s = []; for (let c = 0; c < n; c++) for (let k = 0; k < (c === 0 ? 4 : 2); k++) s.push(c);
      return { m: [1, 0], rm: [1, 0], cast: "아무 콧수나 괜찮아요. 메리야스뜨기로 색만 바꿔요.",
        rows: s.map((c, i) => R(`${i + 1}단 (${i % 2 ? "안면" : "겉면"})`, `${cn[c]} 실로 ${i % 2 ? "모두 안뜨기" : "모두 겉뜨기"}`)),
        rcast: "아무 콧수나 괜찮아요. 원통으로 이어 떠요.", rr: s.map((c, i) => R(`${i + 1}단`, `${cn[c]} 실로 모두 겉뜨기`)),
        tip: "색을 바꿀 때 실을 자르지 말고 옆선(원통이면 단 시작점)으로 올려 두면 실 끝 정리가 줄어요.",
        chart: { rows: s.map(() => "kkkkkkkk"), cols: s.map(c => String(c).repeat(8)) } };
    },
    slip: () => ({ m: [4, 3], rm: [4, 0], cast: `4의 배수 + 3코 (예: 27코). ${cn[0]} 실로 코를 잡고 안면 1단을 안뜨기로 뜬 뒤 시작해요.`,
      rows: [R(`1단 (겉면) · ${cn[1]}`, "*겉3, 1코 걸러뜨기(실은 뒤에)* 반복, 마지막 겉3"), R(`2단 (안면) · ${cn[1]}`, "*안3, 1코 걸러뜨기(실은 앞에)* 반복, 마지막 안3"),
             R(`3단 (겉면) · ${cn[0]}`, "모두 겉뜨기"), R(`4단 (안면) · ${cn[0]}`, "모두 안뜨기")],
      rcast: `4의 배수 (예: 80코). ${cn[0]} 실로 코를 잡고 1단을 겉뜨기로 뜬 뒤 시작해요.`,
      rr: [R(`1단 · ${cn[1]}`, "*겉3, 1코 걸러뜨기(실은 뒤에)* 반복"), R(`2단 · ${cn[1]}`, "*겉3, 1코 걸러뜨기(실은 뒤에)* 반복"), R(`3단 · ${cn[0]}`, "모두 겉뜨기"), R(`4단 · ${cn[0]}`, "모두 겉뜨기")],
      tip: "걸러뜨기는 코를 뜨지 않고 안뜨기 방향으로 오른쪽 바늘에 옮기기만 해요. 아래 단 색이 위로 길게 올라와 무늬가 돼요.",
      chart: { rows: ["kkkvkkk", "kkkvkkk", "kkkkkkk", "kkkkkkk"], cols: ["1110111", "1110111", "0000000", "0000000"] } }),
    fairisle: () => {
      const rowsC = [...Array(11)].map((_, r) => fiColors(r, n >= 3));
      return { m: [8, 0], rm: [8, 0], roundFirst: true, cast: "8의 배수 (예: 64코). 왕복으로 뜨면 안면 단은 안뜨기로 배색해요.",
        rows: rowsC.map((row, i) => i % 2 ? R(`${i + 1}단 (안면)`, "안뜨기로 " + rle(row.slice().reverse(), cn) + " (도안을 왼쪽에서 오른쪽으로)") : R(`${i + 1}단 (겉면)`, "겉뜨기로 " + rle(row, cn))),
        rcast: "8의 배수 (예: 모자 96코). 원통으로 뜨면 모든 단이 겉뜨기라 배색이 쉬워요.",
        rr: rowsC.map((row, i) => R(`${i + 1}단`, "겉뜨기로 " + rle(row, cn))),
        tip: "도안은 아래에서 위로, 오른쪽에서 왼쪽으로 읽어요. 안 쓰는 실은 뒤로 느슨하게 걸치고, 5코 넘게 걸칠 땐 중간에 한 번 꼬아 주세요.",
        chart: { rows: rowsC.map(() => "kkkkkkkk"), cols: rowsC.map(r => r.join("")) } };
    }
  };
  const C = {
    sc: () => ({ m: [1, 1], cast: "기초 사슬: 원하는 콧수 + 1코", setup: [R("1단", "바늘에서 두 번째 사슬부터 끝까지 짧은뜨기")],
      rows: [R("2단부터 매 단", "사슬 1, 뒤집어서 첫 코부터 끝까지 짧은뜨기")], tip: "단이 끝날 때마다 콧수를 세면 폭이 일정하게 유지돼요." }),
    dc: () => ({ m: [1, 2], cast: "기초 사슬: 원하는 콧수 + 2코", setup: [R("1단", "바늘에서 네 번째 사슬부터 끝까지 한길긴뜨기")],
      rows: [R("2단부터 매 단", "사슬 3(기둥코, 1코로 셈), 뒤집어 두 번째 코부터 한길긴뜨기, 마지막 코는 앞단 기둥코 맨 위 사슬에")],
      tip: "기둥코를 1코로 세기 때문에 첫 코는 건너뛰어요." }),
    moss: () => ({ m: [2, 0], cast: "기초 사슬: 짝수 코", setup: [R("1단", "바늘에서 네 번째 사슬에 짧은뜨기, *사슬 1, 1코 건너 짧은뜨기* 반복")],
      rows: [R("2단부터 매 단", "사슬 2, 뒤집어 앞단 사슬 구멍마다 *짧은뜨기, 사슬 1* 반복, 마지막은 기둥코 공간에 짧은뜨기")],
      tip: "짧은뜨기는 항상 아래 단의 사슬 구멍에 떠요. 코 머리에는 뜨지 않아요." }),
    granny: () => ({ cast: "사슬 4를 빼뜨기로 이어 고리를 만들어요 (매직링도 좋아요).", tail: true,
      rows: [R("1단", `${cn[0]}: 사슬 3(한길긴 1코로 셈), 고리에 한길긴 2, *사슬 2, 한길긴 3*을 3번, 사슬 2, 첫 코에 빼뜨기 (묶음 4개)`),
             R("2단", `${cn[n > 1 ? 1 : 0]}: 모서리 공간마다 (한길긴 3, 사슬 2, 한길긴 3), 모서리 사이엔 사슬 1, 끝은 빼뜨기`),
             R("3단부터 매 단", `${n > 1 ? `색을 바꿔 가며(${cn.slice(0, n).join(" → ")}) ` : ""}모서리에는 (한길긴 3, 사슬 2, 한길긴 3), 변의 사슬 1 공간마다 한길긴 3, 묶음 사이엔 사슬 1`)],
      tip: "색을 바꿀 땐 단 끝 빼뜨기 후 실을 자르고, 새 색을 모서리 공간에 걸어 시작해요. 한 장이 손바닥만 해지면 다음 장으로 넘어가요." }),
    shell: () => ({ m: [6, 2], cast: "기초 사슬: 6의 배수 + 2코", setup: [R("1단", "바늘에서 두 번째 사슬에 짧은뜨기, *2코 건너 다음 코에 한길긴 5(부채), 2코 건너 짧은뜨기* 반복")],
      rows: [R("짝수 단", "사슬 3, 뒤집어 첫 코에 한길긴 2(반쪽 부채), *부채 가운데 코에 짧은뜨기, 다음 짧은뜨기 위에 한길긴 5* 반복, 마지막 짧은뜨기 위에 한길긴 3"),
             R("홀수 단", "사슬 1, 뒤집어 첫 코에 짧은뜨기, *짧은뜨기 위에 한길긴 5, 부채 가운데 코에 짧은뜨기* 반복, 마지막은 기둥코 위에 짧은뜨기")] }),
    mesh: () => ({ m: [4, 2], cast: "기초 사슬: 4의 배수 + 2코", setup: [R("1단", "바늘에서 여섯 번째 사슬에 짧은뜨기, *사슬 5, 3코 건너 짧은뜨기* 반복")],
      rows: [R("2단부터 매 단", "사슬 5, 뒤집어 *앞단 사슬 고리 가운데에 짧은뜨기, 사슬 5* 반복, 마지막 고리 가운데에 짧은뜨기")],
      tip: "고리 가운데를 잘 찾아 뜨면 그물 칸이 마름모로 고르게 서요." }),
    popcorn: () => ({ m: [4, 2], cast: "기초 사슬: 4의 배수 + 2코", setup: [R("1단", "바늘에서 두 번째 사슬부터 끝까지 짧은뜨기")],
      rows: [R("팝콘 단", "사슬 1, 뒤집어 짧은 2, *팝콘 1, 짧은 3* 반복, 남은 코는 짧은뜨기"), R("쉬는 단", "사슬 1, 뒤집어 모두 짧은뜨기"),
             R("팝콘 단 (엇갈림)", "사슬 1, 뒤집어 짧은 4, *팝콘 1, 짧은 3* 반복, 남은 코는 짧은뜨기"), R("쉬는 단", "사슬 1, 뒤집어 모두 짧은뜨기")],
      tip: "팝콘: 한 코에 한길긴 5를 뜨고 바늘을 빼서 첫 한길긴 머리에 넣은 뒤, 놓았던 고리를 당겨 빼요. 팝콘 단은 편물 뒷면을 보고 떠야 앞으로 볼록 나와요." }),
    waffle: () => ({ m: [3, 2], cast: "기초 사슬: 3의 배수 + 2코", setup: [R("1단", "바늘에서 네 번째 사슬부터 끝까지 한길긴뜨기")],
      rows: [R("짝수 단", "사슬 2, 뒤집어 *다음 코에 앞걸어 한길긴 1, 다음 2코에 한길긴* 반복, 마지막 기둥코에 한길긴"),
             R("홀수 단", "사슬 2, 뒤집어 *앞걸어뜨기 위에는 한길긴 1, 한길긴 2코에는 앞걸어 한길긴 각 1* 반복, 마지막 기둥코에 한길긴")],
      tip: "앞걸어 한길긴뜨기는 코 머리 대신 아래 단 기둥을 앞에서 감싸듯 바늘을 넣어 떠요." }),
    c2c: () => ({ cast: "블록 1개 = 사슬 3 공간 + 한길긴 3코. 모서리에서 시작해 대각선으로 블록을 늘려요.", tail: true,
      setup: [R("1단", "사슬 6, 바늘에서 네 번째 사슬부터 한길긴 3 (블록 1개)")],
      rows: [R("늘리는 단", "사슬 6, 네 번째 사슬부터 한길긴 3(새 블록), 뒤집어 앞 블록의 사슬 3 공간에 빼뜨기, *사슬 3, 같은 공간에 한길긴 3, 다음 블록 공간에 빼뜨기*를 단 끝까지 (n단이면 블록 n개)")],
      tip: `도안의 칸 하나가 블록 하나예요. ${cn[0]} 바탕에 ${cn[1]}로 하트가 들어가요. 원하는 폭이 되면 사슬 6 대신 빼뜨기로 블록 위를 건너가며 줄여요.`,
      chart: { rows: HEART.slice().reverse().map(r => " ".repeat(r.length)), cols: HEART.slice().reverse() } }),
    stripe: () => {
      const s = []; for (let c = 0; c < n; c++) s.push(c, c);
      return { m: [1, 1], cast: "기초 사슬: 원하는 콧수 + 1코", setup: [R("1단", `${cn[0]}: 바늘에서 두 번째 사슬부터 짧은뜨기`)],
        rows: s.map((c, i) => R(`${i + 2}단`, `사슬 1, 뒤집어 ${cn[c]} 실로 모두 짧은뜨기`)),
        tip: "색을 바꿀 땐 앞 단의 마지막 코를 마무리하기 직전에 새 색 실을 걸어 빼면 깔끔해요." };
    },
    flower: () => ({ cast: "매직링 (또는 사슬 4를 빼뜨기로 이은 고리)", once: true,
      rows: [R("1단", "사슬 1, 고리에 짧은뜨기 10, 첫 코에 빼뜨기 (10코)"), R("2단 · 꽃잎", "*다음 코에 (긴뜨기 1, 한길긴 2, 긴뜨기 1), 다음 코에 빼뜨기*를 5번 → 꽃잎 5장")],
      tip: n > 1 ? `가운데를 다른 색으로 하려면 1단을 ${cn[1]}, 2단을 ${cn[0]}로 떠요.` : "한 장에 몇 g밖에 들지 않아서 자투리로 여러 장 떠 두기 좋아요." }),
    cat: () => ({ cast: "매직링. 모티브 한 장 기준이에요.", once: true,
      rows: CAT.rows.map(([t, d]) => R(t, d)),
      tip: "코 수와 코 종류는 '기호 도안' 탭의 원본 도안 이미지와 맞춰 보세요. 이 순서는 이미지에서 읽은 구조만 적은 거예요." }),
    amigu: () => ({ cast: "매직링으로 시작해 나선형으로 이어 떠요. 단 시작 코에 단수 표시핀을 꽂아 두세요.", once: true,
      rows: [R("1단", "매직링에 짧은 6 (6코)"), R("2단", "모든 코 늘리기 (12코)"), R("3단", "*짧은 1, 늘리기* 6번 (18코)"), R("4단", "*짧은 2, 늘리기* 6번 (24코)"),
             R("5단", "*짧은 3, 늘리기* 6번 (30코)"), R("6단", "늘림 없이 짧은 30"), R("7단", "늘림 없이 짧은 30"), R("8단", "늘림 없이 짧은 30"), R("9단", "늘림 없이 짧은 30"),
             R("10단", "늘림 없이 짧은 30"), R("11단", "*짧은 3, 줄이기* 6번 (24코)"), R("12단", "*짧은 2, 줄이기* 6번 (18코). 여기서 솜을 넣기 시작해요"),
             R("13단", "*짧은 1, 줄이기* 6번 (12코)"), R("14단", "줄이기 6번 (6코). 실을 넉넉히 남겨 자르고 남은 코를 꿰어 오므려요")],
      tip: "늘리기는 한 코에 짧은뜨기 2, 줄이기는 2코를 짧은뜨기 하나로 모으는 거예요. 이 공 모양에 귀를 달면 곰 머리, 늘림 없는 단을 늘리면 몸통이 돼요." }),
    lace: () => ({ m: [4, 2], cast: "기초 사슬: 4의 배수 + 2코", setup: [R("1단", "바늘에서 두 번째 사슬에 짧은뜨기, *사슬 5, 3코 건너 짧은뜨기* 반복")],
      rows: [R("짝수 단", "사슬 3, 뒤집어 *다음 사슬 고리에 짧은뜨기, 그다음 고리에 한길긴 7(부채)* 반복, 마지막 고리에 짧은뜨기"),
             R("홀수 단", "사슬 5, 뒤집어 *부채 가운데(4번째) 코에 짧은뜨기, 사슬 5, 짧은뜨기 위에 짧은뜨기, 사슬 5* 반복, 마지막 코에 짧은뜨기")],
      tip: "가는 실과 2~2.5mm 코바늘로 떠야 구멍이 예쁘게 살아요. 다 뜬 뒤 물에 적셔 핀으로 펴서 말리면 무늬가 또렷해져요." })
  };
  const f = (craft === "knit" ? K : C)[pid];
  const rx = f ? f() : { cast: "", rows: [] };
  if (mode === "round" && rx.rr) { rx.rows = rx.rr; rx.cast = rx.rcast || rx.cast; rx.mult = rx.rm || [1, 0]; rx.isRound = true; delete rx.round; }
  else rx.mult = rx.m || [1, 0];
  return rx;
}

// which row to work after n finished rows
function rowInfo(rx, n) {
  const S = rx.setup || [], L = rx.rows.length;
  if (!L) return { done: true };
  if (rx.once && n >= S.length + L) return { done: true };
  if (n < S.length) return { row: S[n], phase: "처음 한 번 뜨는 단", hi: -1 };
  const k = n - S.length;
  if (rx.once) return { row: rx.rows[k], phase: `${k + 1} / ${L}단`, hi: k };
  if (rx.tail) { const i = Math.min(k, L - 1); return { row: rx.rows[i], phase: k >= L - 1 ? "같은 방법으로 계속" : `${k + 1}번째 단`, hi: -1 }; }
  if (L === 1) return { row: rx.rows[0], phase: "매 단 같은 방법으로 떠요", hi: 0 };
  return { row: rx.rows[k % L], phase: `무늬 ${k % L + 1}/${L}단째 · ${Math.floor(k / L) + 1}번째 반복`, hi: k % L };
}

const SYM = { k: "│", p: "─", o: "○", "/": "⟋", v: "V", y: "V°", b: "Λ", " ": "" };
const SYM_DESC = { k: "겉면에서 겉뜨기 (안면 단에서는 안뜨기)", p: "겉면에서 안뜨기 (안면 단에서는 겉뜨기)", o: "바늘비우기", "/": "2코 모아 겉뜨기", v: "1코 걸러뜨기", x: "꽈배기 6코 교차", y: "바늘비우기 하며 1코 걸러뜨기 (sl1yo)", b: "걸러 둔 코와 걸친 실을 함께 겉뜨기 (brk)" };
function inkOn(hex) { const a = toArr(hex); return (.3 * a[0] + .59 * a[1] + .11 * a[2]) > 150 ? "#1D1A24" : "#FFFFFF"; }
function chartHTML(ch, hexes, hi, cn) {
  const w = ch.rows[0].length, used = new Set();
  let out = "";
  for (let r = ch.rows.length - 1; r >= 0; r--) {
    const s = ch.rows[r], cs = ch.cols && ch.cols[r];
    let cells = "", i = 0;
    while (i < s.length) {
      if (s[i] === "x") {
        let j = i; while (s[j] === "x") j++; used.add("x");
        cells += `<span class="cc cx" style="grid-column:span ${j - i}"><svg viewBox="0 0 60 12" preserveAspectRatio="none" aria-hidden="true"><path d="M3 11 L57 1 M3 1 L57 11"/></svg></span>`;
        i = j; continue;
      }
      const hex = cs ? (hexes[+cs[i]] || hexes[0]) : null;
      if (s[i] !== " ") used.add(s[i]);
      cells += `<span class="cc"${hex ? ` style="background:${hex};color:${inkOn(hex)}"` : ""}>${SYM[s[i]] || ""}</span>`;
      i++;
    }
    out += `<div class="crow${r === hi ? " hi" : hi >= 0 ? (r < hi ? " dn" : " up") : ""}" style="grid-template-columns:repeat(${w}, var(--cell)) 2.4em">${cells}<span class="rn">${hi >= 0 && r < hi ? "✓" : r + 1}</span></div>`;
  }
  const legend = [...used].map(k => `<span><b class="lg">${k === "x" ? "╳" : SYM[k]}</b>${SYM_DESC[k]}</span>`);
  if (ch.cols) [...new Set(ch.cols.join("").split(""))].sort().forEach(d => legend.push(`<span><i class="lgc" style="background:${hexes[+d] || hexes[0]}"></i>${esc(cn[+d])}</span>`));
  return `<div class="chart-wrap"><div class="chart" role="img" aria-label="기호 도안, 아래에서 위로 1단부터">${out}</div></div><div class="legend">${legend.join("")}</div>`;
}
function chartHexes(cols) { const h = cols.map(c => c.hex); while (h.length < 4) h.push(FALLBACK[h.length % 4]); return h; }
function recipeHTML(rx, cols, opts = {}) {
  const cn = labelsFor(cols);
  let h = `<section class="recipe" aria-labelledby="rx-h"><h4 id="rx-h">도안</h4>`;
  h += `<p class="rx-cast"><span class="label">코 잡기</span>${esc(rx.cast)}</p>`;
  if (rx.setup) h += `<p class="label">처음 한 번</p><ol class="rx-rows">${rx.setup.map(s => `<li><b>${esc(s.t)}</b>${esc(s.d)}</li>`).join("")}</ol>`;
  h += `<p class="label">${rx.once ? "순서대로" : rx.tail ? "이어서" : `${rx.rows.length}단마다 반복`}</p><ol class="rx-rows">${rx.rows.map((s, i) => `<li${i === opts.hi ? ' class="hi"' : ""}><b>${esc(s.t)}</b>${esc(s.d)}</li>`).join("")}</ol>`;
  if (rx.round) h += `<p class="rx-note">${esc(rx.round)}</p>`;
  if (rx.tip) h += `<p class="rx-note">${esc(rx.tip)}</p>`;
  if (rx.chart && !opts.noChart) h += `<p class="label">기호 도안 · 겉면에서 본 모양, 아래에서 위로 읽어요</p>` + chartHTML(rx.chart, chartHexes(cols), -1, cn);
  return h + `</section>`;
}
function sizeOf(p, g, have) {
  const gpa = GPA[g.use] * (state.craft === "crochet" ? 1.3 : 1) * p.f;
  const area = have / gpa * 100;
  return { side: Math.max(5, Math.round(Math.sqrt(area) / 5) * 5), len: Math.max(5, Math.round(area / 20 / 5) * 5) };
}
