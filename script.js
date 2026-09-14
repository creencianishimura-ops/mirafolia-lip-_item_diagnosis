// ==========================================================
// LIP診断 - Mirafolia
// ==========================================================

// ---- 商品データ（変更する場合はここだけ編集すればOK） ----
var results = {
  A: {
    code: "C01",
    name: "ラナンキュラス",
    description: "肌になじむ、\nやわらかなヌードカラー。",
    productImage: "images/c01_lip.png",
    lipImage: "images/c01_l.jpg",
    color: "#E89A85"
  },
  B: {
    code: "R01",
    name: "ポピー",
    description: "顔まわりをパッと明るく、\n軽やかで親しみやすいカラー。",
    productImage: "images/r01_lip.png",
    lipImage: "images/r01_p.jpg",
    color: "#E86B58"
  },
  C: {
    code: "P02",
    name: "ダスティーローズ",
    description: "自然な血色感と上品さを両立。\n使いやすいきれいめカラー。",
    productImage: "images/p02lip.png",
    lipImage: "images/p02_d.jpg",
    color: "#B96F70"
  },
  D: {
    code: "R02",
    name: "ダークダリア",
    description: "深みのある色合いで、\nいつものメイクを洗練された印象に。",
    productImage: "images/dark.png",
    lipImage: "images/r02_dark.jpg", 
    color: "#8D3940"
  },
  E: {
    code: "P01",
    name: "コスモス",
    description: "ぱっと華やぐ、\n透明感のあるピンクカラー。",
    productImage: "images/p01_lip.png",
    lipImage: "images/p01_c.jpg",
    color: "#D95B80"
  },
  F: {
    code: "",
    name: "Natur lipserum",
    description: "素の唇をきれいに見せながら、\nふっくらとやわらかなツヤ感へ。",
    productImage: "images/serum.png",
    lipImage: "images/serum.jpg",
    color: "#F3EFD9"
  }
};

// ---- 質問ごとの重み ----
const WEIGHTS = { q1: 3, q2: 2, q3: 4 };

// ---- 同点時の優先順位（Q3 → Q1 → Q2） ----
const TIE_BREAK_ORDER = ["q3", "q1", "q2"];

// ---- 状態 ----
const answers = { q1: null, q2: null, q3: null };

const screens = {
  q1: document.getElementById("screen-q1"),
  q2: document.getElementById("screen-q2"),
  q3: document.getElementById("screen-q3"),
  result: document.getElementById("screen-result")
};

function showScreen(name) {
  Object.values(screens).forEach((el) => el.classList.remove("active"));
  screens[name].classList.add("active");
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

// 各質問カードに、既存の回答があれば選択状態を復元する
function restoreSelection(questionKey) {
  const group = document.querySelector(`.options[data-question="${questionKey}"]`);
  if (!group) return;
  group.querySelectorAll(".option-btn").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.type === answers[questionKey]);
  });
}

function nextScreenAfter(questionKey) {
  if (questionKey === "q1") return "q2";
  if (questionKey === "q2") return "q3";
  return "result";
}

function handleOptionClick(e) {
  const btn = e.currentTarget;
  const group = btn.closest(".options");
  const questionKey = group.dataset.question;
  const type = btn.dataset.type;

  // 回答を保存（変更の場合は上書き）
  answers[questionKey] = type;
  restoreSelection(questionKey);

  if (questionKey === "q3") {
    showResult();
  } else {
    const next = nextScreenAfter(questionKey);
    restoreSelection(next === "q2" ? "q2" : next === "q3" ? "q3" : questionKey);
    showScreen(next);
  }
}

function handleBackClick(e) {
  const target = e.currentTarget.dataset.back; // 'screen-q1' or 'screen-q2'
  const key = target.replace("screen-", "");
  restoreSelection(key);
  showScreen(key);
}

// ---- スコア計算 ----
function calculateResultType() {
  const scores = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };

  Object.keys(WEIGHTS).forEach((q) => {
    const chosen = answers[q];
    if (chosen && scores.hasOwnProperty(chosen)) {
      scores[chosen] += WEIGHTS[q];
    }
  });

  const maxScore = Math.max(...Object.values(scores));
  const topTypes = Object.keys(scores).filter((t) => scores[t] === maxScore);

  if (topTypes.length === 1) {
    return topTypes[0];
  }

  // 同点処理：Q3 → Q1 → Q2 の順に、その質問で選ばれたTYPEを優先
  for (const q of TIE_BREAK_ORDER) {
    const chosen = answers[q];
    if (chosen && topTypes.includes(chosen)) {
      return chosen;
    }
  }

  // 念のためのフォールバック
  return topTypes[0];
}

function showResult() {
  const type = calculateResultType();
  const item = results[type];

  document.getElementById("result-product-img").src = item.productImage;
  document.getElementById("result-product-img").alt = item.name;
  document.getElementById("result-lip-img").src = item.lipImage;
  document.getElementById("result-lip-img").alt = item.name + "を塗った唇";
  document.getElementById("result-swatch").style.setProperty("--swatch-color", item.color);
  document.getElementById("result-code").textContent = item.code;
  document.getElementById("result-name").textContent = item.name;
  document.getElementById("result-desc").textContent = item.description;

  showScreen("result");
}

function resetQuiz() {
  answers.q1 = null;
  answers.q2 = null;
  answers.q3 = null;
  document.querySelectorAll(".option-btn").forEach((btn) => btn.classList.remove("selected"));
  showScreen("q1");
}

// ---- イベント登録 ----
document.querySelectorAll(".option-btn").forEach((btn) => {
  btn.addEventListener("click", handleOptionClick);
});

document.querySelectorAll(".back-link").forEach((btn) => {
  btn.addEventListener("click", handleBackClick);
});

document.getElementById("retry-btn").addEventListener("click", resetQuiz);

// ---- 初期表示 ----
showScreen("q1");
