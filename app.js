const KEY = "hackerxTideGame";
const letters = "АВЕКМНОРСТУХ";

const rarities = [
  { name: "Обычный", chance: 53.81, min: 1000, max: 1500, color: "#aeb5bf" },
  { name: "Необычный", chance: 37.96, min: 1500, max: 2500, color: "#65dca0" },
  { name: "Редкий", chance: 7.98, min: 2500, max: 5000, color: "#69a8ff" },
  { name: "Эпический", chance: 0.24, min: 5000, max: 8000, color: "#c69aff" },
  { name: "Легендарный", chance: 0.01, min: 8000, max: 10000, color: "#f1d85c" }
];

let state;
try {
  state = JSON.parse(localStorage.getItem(KEY));
} catch (e) {
  state = null;
}
if (!state || typeof state.balance !== "number") {
  state = { balance: 50000, opens: 0, collection: [], safe: [] };
}

const $ = id => document.getElementById(id);
const money = n => n.toLocaleString("ru-RU") + " ₽";
const random = n => Math.floor(Math.random() * n);

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function chooseRarity() {
  const roll = Math.random() * 100;
  let total = 0;
  for (const rarity of rarities) {
    total += rarity.chance;
    if (roll < total) return rarity;
  }
  return rarities[0];
}

function makeNumber(region) {
  const letter = () => letters[random(letters.length)];
  const digits = String(random(1000)).padStart(3, "0");
  const priceRarity = chooseRarity();
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    number: `${letter()} ${digits} ${letter()}${letter()}`,
    region,
    rarity: priceRarity.name,
    chance: priceRarity.chance,
    color: priceRarity.color,
    price: priceRarity.min + random(priceRarity.max - priceRarity.min + 1)
  };
}

function updateStats() {
  $("balance").textContent = money(state.balance);
  $("opens").textContent = state.opens;
  $("count").textContent = state.collection.length + state.safe.length;
}

function drawList(elementId, items, isSafe) {
  const root = $(elementId);
  root.replaceChildren();

  if (!items.length) {
    root.textContent = isSafe
      ? "В сейфе пока пусто."
      : "Пока пусто. Открой первый номер!";
    return;
  }

  items.forEach(item => {
    const card = document.createElement("article");
    card.className = "item";

    const rarity = document.createElement("div");
    rarity.style.color = item.color || "#aeb5bf";
    rarity.textContent = item.rarity;

    const number = document.createElement("div");
    number.className = "item-number";
    number.textContent = `${item.number} ${item.region}`;

    const price = document.createElement("div");
    price.className = "item-price";
    price.textContent = money(item.price);

    const meta = document.createElement("div");
    meta.className = "item-meta";
    meta.textContent = "Россия · игровой номер";

    const actions = document.createElement("div");
    actions.className = "actions";

    const sell = document.createElement("button");
    sell.className = "sell";
    sell.textContent = "Продать";
    sell.onclick = () => {
      state.balance += item.price;
      removeItem(item.id, isSafe);
      save();
      render();
    };

    const store = document.createElement("button");
    store.className = "store";
    store.textContent = isSafe ? "Вернуть" : "В сейф";
    store.onclick = () => {
      if (isSafe) {
        state.safe = state.safe.filter(x => x.id !== item.id);
        state.collection.unshift(item);
      } else {
        state.collection = state.collection.filter(x => x.id !== item.id);
        state.safe.unshift(item);
      }
      save();
      render();
    };

    actions.append(sell, store);
    card.append(rarity, number, price, meta, actions);
    root.append(card);
  });
}

function removeItem(id, isSafe) {
  if (isSafe) {
    state.safe = state.safe.filter(item => item.id !== id);
  } else {
    state.collection = state.collection.filter(item => item.id !== id);
  }
}

function render() {
  updateStats();
  drawList("collectionList", state.collection, false);
  drawList("safeList", state.safe, true);
}
$("openBtn").addEventListener("click", () => {
  const item = makeNumber($("region").value);

  state.opens++;
  state.balance += 100;
  state.collection.unshift(item);

  $("number").textContent = item.number;
  $("regionText").textContent = item.region;
  $("rarity").textContent = item.rarity;
  $("rarity").style.color = item.color;
  $("result").textContent =
    `В коллекции! Цена: ${money(item.price)} · +100 ₽ за открытие`;

  save();
  render();
});

render();
