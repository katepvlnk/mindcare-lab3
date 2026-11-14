"use strict";
/* =========================================================================
   Тестування завдань 1 і 2.
   Працює і в браузері (результати виводяться на сторінку та в консоль),
   і в Node.js:  node js/tests.js
   ========================================================================= */

const lib = (typeof require !== "undefined")
    ? { ...require("./services.js"), ...require("./users.js") }
    : {
        services, sortByPrice, averageDurationByPrice, findMostRead, isComplete,
        addService, priceCoefficient, nextMonthPrice, updatedPriceList,
        User, UserRegistry, usersData
    };

/* ---------- Мінімальний тестовий фреймворк ---------- */
const testCases = [];
function test(group, name, fn) {
    testCases.push({ group, name, fn });
}
function assertEqual(actual, expected, message = "") {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) throw new Error(`${message} очікувалось ${e}, отримано ${a}`);
}
function assertTrue(value, message = "умова не виконалась") {
    if (!value) throw new Error(message);
}
function runTests() {
    return testCases.map(({ group, name, fn }) => {
        try {
            fn();
            return { group, name, ok: true };
        } catch (error) {
            return { group, name, ok: false, error: error.message };
        }
    });
}

/* ---------- Тестові дані ---------- */
const sample = [
    { id: "A", name: "A", doctor: "Лікар 1", readsMonth1: 10, readsMonth2: 20, price: 500, duration: 30 },
    { id: "B", name: "B", doctor: "Лікар 2", readsMonth1: 50, readsMonth2: 40, price: 300, duration: 60 },
    { id: "C", name: "C", doctor: "Лікар 3", readsMonth1: 30, readsMonth2: 30, price: 500, duration: 50 }
];
const full = (over = {}) => ({ id: "NEW", name: "Нова", doctor: "Лікар", readsMonth1: 1, readsMonth2: 1, price: 700, duration: 40, ...over });

/* ================= Завдання 1 ================= */
const G1 = "Завдання 1. Послуги";

test(G1, "Записів послуг рівно 10", () => {
    assertEqual(lib.services.length, 10);
});
test(G1, "sortByPrice: за зростанням, вихідний масив не змінюється", () => {
    const sorted = lib.sortByPrice(sample);
    assertEqual(sorted.map((s) => s.price), [300, 500, 500]);
    assertEqual(sample.map((s) => s.id), ["A", "B", "C"], "оригінал змінено:");
});
test(G1, "sortByPrice: за спаданням", () => {
    assertEqual(lib.sortByPrice(sample, "desc").map((s) => s.price), [500, 500, 300]);
});
test(G1, "Середня тривалість для однакової вартості: (30 + 50) / 2 = 40", () => {
    const groups = lib.averageDurationByPrice(sample);
    assertEqual(groups.map((g) => [g.price, g.count, g.avgDuration]), [[300, 1, 60], [500, 2, 40]]);
});
test(G1, "Середня тривалість на реальних даних: 900 грн → (50 + 45 + 60) / 3 ≈ 51.7 хв", () => {
    const g900 = lib.averageDurationByPrice(lib.services).find((g) => g.price === 900);
    assertEqual([g900.count, g900.avgDuration], [3, 51.7]);
});
test(G1, "Максимум прочитань за місяць_1 — SRV-03 (735)", () => {
    assertEqual(lib.findMostRead(lib.services).id, "SRV-03");
});
test(G1, "findMostRead для порожнього масиву повертає null", () => {
    assertEqual(lib.findMostRead([]), null);
});
test(G1, "isComplete: повний запис — true, без лікаря / з порожньою назвою / з NaN — false", () => {
    assertTrue(lib.isComplete(full()));
    assertTrue(!lib.isComplete(full({ doctor: undefined })), "без лікаря");
    assertTrue(!lib.isComplete(full({ name: "  " })), "порожня назва");
    assertTrue(!lib.isComplete(full({ price: NaN })), "NaN у вартості");
});
test(G1, "Неповний запис додається в кінець списку", () => {
    const result = lib.addService(sample, full({ id: "X", price: undefined }));
    assertEqual(result.at(-1).id, "X");
    assertEqual(result.length, 4);
});
test(G1, "Повний запис з найбільшою вартістю стає першим", () => {
    assertEqual(lib.addService(sample, full({ id: "TOP", price: 9999 }))[0].id, "TOP");
});
test(G1, "Повний запис стає між дорожчими і дешевшими (порядок спадання)", () => {
    const ids = lib.addService(sample, full({ id: "MID", price: 400 })).map((s) => s.id);
    assertEqual(ids, ["A", "C", "MID", "B"]);
});
test(G1, "Повний запис з найменшою вартістю — перед неповними записами", () => {
    const withBroken = [...sample, { id: "BROKEN", name: "" }];
    const ids = lib.addService(withBroken, full({ id: "CHEAP", price: 1 })).map((s) => s.id);
    assertEqual(ids, ["A", "C", "B", "CHEAP", "BROKEN"]);
});
test(G1, "Коефіцієнт вартості: місяць_1 < місяць_2 → 1.15; = → 1; > → 0.95", () => {
    assertEqual(sample.map(lib.priceCoefficient), [1.15, 0.95, 1]);
});
test(G1, "Нова вартість: 500 × 1.15 = 575; 300 × 0.95 = 285; 500 без змін", () => {
    assertEqual(sample.map(lib.nextMonthPrice), [575, 285, 500]);
});
test(G1, "Оновлений список містить назву, вартість і лікаря для всіх 10 послуг", () => {
    const list = lib.updatedPriceList(lib.services);
    assertEqual(list.length, 10);
    assertTrue(list.every((r) => r.name && r.doctor && Number.isFinite(r.newPrice)), "неповний рядок");
});

/* ================= Завдання 2 ================= */
const G2 = "Завдання 2. Користувачі";
const reg = new lib.UserRegistry(lib.usersData);

test(G2, "Облікових записів рівно 10, кожен — екземпляр класу User", () => {
    assertEqual(reg.size, 10);
    assertTrue(reg.all.every((u) => u instanceof lib.User));
});
test(G2, "Жовтень 2026 о 10:30 — Шевченко і Ковальчук", () => {
    assertEqual(reg.byMonthAndTime("2026-10", "10:30").map((u) => u.surname), ["Шевченко", "Ковальчук"]);
});
test(G2, "Без часу повертається весь місяць (жовтень — 5 звернень)", () => {
    assertEqual(reg.byMonthAndTime("2026-10").length, 5);
});
test(G2, "Місяць без звернень — порожній список", () => {
    assertEqual(reg.byMonthAndTime("2026-01", "10:30"), []);
});
test(G2, "Наймолодший користувач — Софія, 17 років, неповна освіта", () => {
    assertEqual(reg.youngest(), { age: 17, education: "неповна", name: "Софія", fullName: "Ткачук Софія" });
});
test(G2, "youngest() для порожнього реєстру повертає null", () => {
    assertEqual(new lib.UserRegistry().youngest(), null);
});
test(G2, "Межі робочого часу: 09:00 і 16:59 — робочий; 08:45 і 17:00 — неробочий", () => {
    const at = (time) => new lib.User({ surname: "Т", name: "Т", age: 1, education: "", purpose: "", date: "2026-01-01", time }).isWorkingTime();
    assertEqual(["09:00", "16:59", "08:45", "17:00"].map(at), [true, true, false, false]);
});
test(G2, "Класи за часом: 6 у робочий (сер. вік 173/6 ≈ 28.8), 4 у неробочий (159/4 ≈ 39.8)", () => {
    const { working, nonWorking } = reg.splitByWorkingTime();
    assertEqual([working.count, working.avgAge, nonWorking.count, nonWorking.avgAge], [6, 28.8, 4, 39.8]);
});
test(G2, "Сортування за алфавітом враховує українські літери (Є, І, Ї) і однакові прізвища", () => {
    const names = reg.sortedAlphabetically().map((u) => u.fullName);
    assertEqual(names.slice(0, 5), ["Бойко Андрій", "Бойко Анна", "Єременко Тарас", "Ігнатенко Дмитро", "Їжакевич Катерина"]);
});
test(G2, "Метод add() додає запис і перетворює об'єкт на User", () => {
    const r = new lib.UserRegistry(lib.usersData);
    r.add({ surname: "Нова", name: "Особа", age: 40, education: "вища", purpose: "Пропозиція", date: "2026-11-20", time: "11:00" });
    assertEqual(r.size, 11);
    assertTrue(r.all.at(-1) instanceof lib.User);
});

/* ---------- Запуск ---------- */
const testResults = runTests();
const passed = testResults.filter((r) => r.ok).length;

if (typeof console !== "undefined") {
    testResults.forEach((r) => console.log(`${r.ok ? "✔" : "✘"} [${r.group}] ${r.name}${r.ok ? "" : " — " + r.error}`));
    console.log(`Пройдено ${passed} з ${testResults.length}`);
}
if (typeof module !== "undefined") {
    module.exports = { testResults };
    if (passed !== testResults.length) process.exitCode = 1;
}
