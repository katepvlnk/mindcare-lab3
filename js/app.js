"use strict";
/* =========================================================================
   Відображення результатів на сторінці (DOM). Уся логіка — у services.js
   та users.js; тут лише виклики функцій і побудова таблиць.
   ========================================================================= */

const $ = (selector) => document.querySelector(selector);
const money = (value) => (value === undefined || value === null || Number.isNaN(value) ? "—" : `${value.toLocaleString("uk-UA")} грн`);
const show = (value) => (value === undefined || value === null || value === "" || Number.isNaN(value) ? "—" : value);

/**
 * Будує таблицю.
 * @param {Array<{title:string, value:Function, num?:boolean}>} columns
 * @param {Array} rows
 * @param {Function} [isHighlighted] — рядки, які треба підсвітити
 */
function renderTable(container, columns, rows, isHighlighted = () => false) {
    const table = document.createElement("table");
    const head = table.createTHead().insertRow();
    columns.forEach((col) => {
        const th = document.createElement("th");
        th.textContent = col.title;
        head.appendChild(th);
    });
    const body = table.createTBody();
    rows.forEach((row, index) => {
        const tr = body.insertRow();
        if (isHighlighted(row)) tr.classList.add("highlight");
        columns.forEach((col) => {
            const td = tr.insertCell();
            const value = col.value(row, index);
            if (value instanceof Node) td.appendChild(value); else td.textContent = value;
            if (col.num) td.classList.add("num");
        });
    });
    if (rows.length === 0) {
        const td = body.insertRow().insertCell();
        td.colSpan = columns.length;
        td.textContent = "Немає записів";
    }
    container.replaceChildren(table);
}

/* ===================== Завдання 1 ===================== */

const serviceColumns = [
    { title: "№", value: (_, i) => i + 1, num: true },
    { title: "ID", value: (s) => show(s.id) },
    { title: "Назва послуги", value: (s) => show(s.name) },
    { title: "Лікар / психолог", value: (s) => show(s.doctor) },
    { title: "Прочитань, міс. 1", value: (s) => show(s.readsMonth1), num: true },
    { title: "Прочитань, міс. 2", value: (s) => show(s.readsMonth2), num: true },
    { title: "Вартість", value: (s) => money(s.price), num: true },
    { title: "Тривалість, хв", value: (s) => show(s.duration), num: true }
];

renderTable($("#services-source"), serviceColumns, services);

// 1.1
function renderSorted(order) {
    renderTable($("#services-sorted"), serviceColumns, sortByPrice(services, order));
}
renderSorted("asc");
$("#sort-form").addEventListener("change", (event) => renderSorted(event.target.value));

renderTable($("#services-avg"), [
    { title: "Вартість", value: (g) => money(g.price), num: true },
    { title: "Кількість послуг", value: (g) => g.count, num: true },
    { title: "Середня тривалість, хв", value: (g) => g.avgDuration, num: true },
    { title: "Послуги", value: (g) => g.names.join(", ") }
], averageDurationByPrice(services));

// 1.2
const mostRead = findMostRead(services);
$("#most-read").innerHTML =
    `Найбільше прочитань за місяць_1 (<b>${mostRead.readsMonth1}</b>) має послуга «${mostRead.name}». ` +
    `Її внутрішній id: <b>${mostRead.id}</b>.`;

// 1.3
let currentServices = sortByPrice(services, "desc"); // стартовий список — за спаданням вартості
renderTable($("#services-added"), serviceColumns, currentServices);

$("#add-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const text = (field) => data.get(field).trim();
    const number = (field) => (data.get(field) === "" ? undefined : Number(data.get(field)));

    const newService = {
        id: text("id"),
        name: text("name"),
        doctor: text("doctor"),
        readsMonth1: number("readsMonth1"),
        readsMonth2: number("readsMonth2"),
        price: number("price"),
        duration: number("duration")
    };

    currentServices = addService(currentServices, newService);
    const position = currentServices.indexOf(newService) + 1;
    $("#add-message").textContent = isComplete(newService)
        ? `Усі поля заповнені — послугу «${newService.name}» вставлено на позицію ${position} з ${currentServices.length} за спаданням вартості.`
        : `Заповнені не всі поля — послугу «${newService.name || "без назви"}» додано в кінець списку (позиція ${position}).`;
    renderTable($("#services-added"), serviceColumns, currentServices, (s) => s === newService);
});

// 1.4
renderTable($("#services-updated"), [
    { title: "Назва послуги", value: (r) => r.name },
    { title: "Поточна вартість", value: (r) => money(r.oldPrice), num: true },
    { title: "Коефіцієнт", value: (r) => {
        const span = document.createElement("span");
        span.textContent = `× ${r.coefficient}`;
        if (r.coefficient > 1) span.className = "up";
        if (r.coefficient < 1) span.className = "down";
        return span;
    }, num: true },
    { title: "Нова вартість", value: (r) => money(r.newPrice), num: true },
    { title: "Лікар / психолог", value: (r) => r.doctor }
], updatedPriceList(services));

/* ===================== Завдання 2 ===================== */

const formatDate = (iso) => iso.split("-").reverse().join(".");

renderTable($("#users-source"), [
    { title: "№", value: (_, i) => i + 1, num: true },
    { title: "Прізвище", value: (u) => u.surname },
    { title: "Ім'я", value: (u) => u.name },
    { title: "Вік", value: (u) => u.age, num: true },
    { title: "Освіта", value: (u) => u.education },
    { title: "Мета звернення", value: (u) => u.purpose },
    { title: "Дата", value: (u) => formatDate(u.date) },
    { title: "Час", value: (u) => u.time }
], registry.all);

// 2.1
function renderMonth(month, time) {
    renderTable($("#users-month"), [
        { title: "Прізвище та ім'я", value: (u) => u.fullName },
        { title: "Дата", value: (u) => formatDate(u.date) },
        { title: "Час", value: (u) => u.time },
        { title: "Мета звернення", value: (u) => u.purpose }
    ], registry.byMonthAndTime(month, time));
}
renderMonth("2026-10", "10:30");
$("#month-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    renderMonth(data.get("month"), data.get("time"));
});

// 2.2
const young = registry.youngest();
$("#users-youngest").innerHTML =
    `Мінімальний вік — <b>${young.age}</b> років. Ім'я: <b>${young.name}</b> (${young.fullName}), освіта: <b>${young.education}</b>.`;

// 2.3
const classes = registry.splitByWorkingTime();
$("#users-classes").innerHTML = [classes.working, classes.nonWorking].map((c) => `
    <div class="card">
        <h4>${c.title}</h4>
        <div class="big">${c.count}</div>
        <p>користувачів, середній вік — <b>${c.avgAge}</b></p>
        <p class="hint">${c.users.map((u) => `${u.fullName} (${u.time})`).join(", ")}</p>
    </div>`).join("");

// 2.4
renderTable($("#users-sorted"), [
    { title: "№", value: (_, i) => i + 1, num: true },
    { title: "Прізвище та ім'я", value: (u) => u.fullName },
    { title: "Мета зворотнього зв'язку", value: (u) => u.purpose }
], registry.sortedAlphabetically());

/* ===================== Тести ===================== */

const passedCount = testResults.filter((r) => r.ok).length;
$("#tests-summary").textContent = `Пройдено ${passedCount} з ${testResults.length} тестів`;
$("#tests-summary").style.color = passedCount === testResults.length ? "hsl(140, 55%, 32%)" : "hsl(0, 65%, 45%)";
$("#tests-list").innerHTML = testResults.map((r) => `
    <li class="${r.ok ? "ok" : "fail"}">
        ${r.ok ? "✔" : "✘"} ${r.name}
        <div class="group">${r.group}${r.ok ? "" : " — " + r.error}</div>
    </li>`).join("");
