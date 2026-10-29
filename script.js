var KEY = "expenses-v1";
var items = load();

function load() {
  try {
    var raw = localStorage.getItem(KEY);
    var arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
}
function money(n) {
  return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function render() {
  var total = 0, byCat = {};
  items.forEach(function (x) {
    total += x.amount;
    byCat[x.category] = (byCat[x.category] || 0) + x.amount;
  });
  document.getElementById("total").textContent = money(total);

  var cats = Object.keys(byCat);
  document.getElementById("cats").innerHTML = cats.length
    ? cats.map(function (c) { return '<span class="cat">' + esc(c) + '<b>' + money(byCat[c]) + '</b></span>'; }).join("")
    : '<span class="empty" style="padding:0">No expenses yet.</span>';

  document.getElementById("list").innerHTML = items.length
    ? items.slice().reverse().map(function (x) {
        return '<li><div class="info"><div class="t">' + esc(x.title) + '</div><div class="c">' + esc(x.category) + '</div></div>' +
               '<span class="amt">' + money(x.amount) + '</span>' +
               '<button class="del" data-id="' + x.id + '" aria-label="Delete ' + esc(x.title) + '">Delete</button></li>';
      }).join("")
    : '<li class="empty">Add your first expense above.</li>';
}

document.getElementById("form").addEventListener("submit", function (e) {
  e.preventDefault();
  var title = document.getElementById("title").value.trim();
  var amount = parseFloat(document.getElementById("amount").value);
  if (!title || !(amount > 0)) return;
  items.push({ id: Date.now(), title: title, amount: amount, category: document.getElementById("category").value });
  save(); render();
  e.target.reset();
  document.getElementById("title").focus();
});

document.getElementById("list").addEventListener("click", function (e) {
  var btn = e.target.closest(".del");
  if (!btn) return;
  var id = Number(btn.getAttribute("data-id"));
  items = items.filter(function (x) { return x.id !== id; });
  save(); render();
});

document.getElementById("reset").addEventListener("click", function () {
  if (items.length && confirm("Delete all expenses?")) { items = []; save(); render(); }
});

render();
