"use strict";
/* =========================================================================
   Основи JavaScript на даних MindCare.
   Кожен приклад записується в basicsLog і виводиться на сторінку
   (розділ «Основи JavaScript») та в консоль браузера.
   ========================================================================= */

const basicsLog = [];

/** Записує один приклад: розділ, вираз і його фактичний результат */
function note(section, expression, value) {
    basicsLog.push({ section, expression, value: formatValue(value) });
}

/** Перетворює будь-яке значення на рядок для таблиці */
function formatValue(value) {
    switch (typeof value) {
        case "string":   return `"${value}"`;
        case "bigint":   return `${value}n`;
        case "symbol":   return value.toString();
        case "function": return `function ${value.name}`;
        case "object":
            if (value === null) return "null";
            return JSON.stringify(value);
        default:         return String(value);
    }
}

/* ---------- 1. Типи даних і typeof ---------- */
function demoTypes() {
    const service = services[0];
    // елементарні (примітивні) типи
    note("Типи даних", "typeof service.price", typeof service.price);
    note("Типи даних", "typeof service.name", typeof service.name);
    note("Типи даних", "typeof isComplete(service)", typeof isComplete(service));
    note("Типи даних", "typeof service.discount", typeof service.discount);
    note("Типи даних", "typeof Symbol(\"id\")", typeof Symbol("id"));
    note("Типи даних", "typeof 10n", typeof 10n);
    note("Типи даних", "typeof null", typeof null);
    // об'єктні типи
    note("Типи даних", "typeof service", typeof service);
    note("Типи даних", "typeof services", typeof services);
    note("Типи даних", "Array.isArray(services)", Array.isArray(services));
    note("Типи даних", "typeof sortByPrice", typeof sortByPrice);
    note("Типи даних", "typeof new Date()", typeof new Date());
}

/* ---------- 2. Явне перетворення типів ---------- */
function demoConversion() {
    const fromForm = "950";              // значення з поля форми — завжди рядок
    note("Явне перетворення", "Number(\"950\")", Number(fromForm));
    note("Явне перетворення", "parseInt(\"50 хв\")", parseInt("50 хв", 10));
    note("Явне перетворення", "parseFloat(\"51.7 хв\")", parseFloat("51.7 хв"));
    note("Явне перетворення", "String(1400)", String(1400));
    note("Явне перетворення", "Boolean(\"\")", Boolean(""));
    note("Явне перетворення", "Boolean(\"Пропозиція\")", Boolean("Пропозиція"));
}

/* ---------- 3. Оператори ---------- */
function demoOperators() {
    const s = services[1];               // «Індивідуальна консультація»: 900 грн, 50 хв

    // арифметичні
    note("Арифметичні", "s.readsMonth1 - s.readsMonth2", s.readsMonth1 - s.readsMonth2);
    note("Арифметичні", "s.price * 3", s.price * 3);
    note("Арифметичні", "s.duration / 60", s.duration / 60);
    note("Арифметичні", "130 % 60", 130 % 60);

    // присвоєння
    let total = 0;
    note("Присвоєння", "let total = 0", total);
    total += s.price;
    note("Присвоєння", "total += s.price", total);
    total *= 2;
    note("Присвоєння", "total *= 2", total);
    total -= 300;
    note("Присвоєння", "total -= 300", total);

    // порівняння
    note("Порівняння", "s.readsMonth1 > s.readsMonth2", s.readsMonth1 > s.readsMonth2);
    note("Порівняння", "s.duration <= 45", s.duration <= 45);
    note("Порівняння", "s.price === 900", s.price === 900);
    note("Порівняння", "s.price == \"900\"", s.price == "900");
    note("Порівняння", "s.price === \"900\"", s.price === "900");
    note("Порівняння", "s.id !== \"SRV-02\"", s.id !== "SRV-02");
}

/* ---------- 4. Умовна конструкція, switch, цикли ---------- */

/** Категорія вартості: умовна конструкція if...else if...else */
function priceCategory(price) {
    if (price < 500) {
        return "доступна";
    } else if (price <= 1000) {
        return "середня";
    } else {
        return "преміум";
    }
}

/** Пріоритет обробки звернення: оператор switch */
function purposePriority(purpose) {
    switch (purpose) {
        case "Скарга на якість послуги":
            return "високий";
        case "Наявність помилки на сайті":
        case "Співпраця":
            return "середній";
        case "Пропозиція":
            return "звичайний";
        default:
            return "невідомий";
    }
}

function demoControlFlow() {
    note("if...else", "priceCategory(400)", priceCategory(400));
    note("if...else", "priceCategory(900)", priceCategory(900));
    note("if...else", "priceCategory(1400)", priceCategory(1400));
    note("switch", "purposePriority(\"Скарга на якість послуги\")", purposePriority("Скарга на якість послуги"));
    note("switch", "purposePriority(\"Пропозиція\")", purposePriority("Пропозиція"));

    // for — лічильний цикл: сума прочитань усіх послуг за місяць_1
    let reads = 0;
    for (let i = 0; i < services.length; i++) {
        reads += services[i].readsMonth1;
    }
    note("Цикл for", "сума readsMonth1 усіх послуг", reads);

    // while — цикл з передумовою: через скільки місяців ціна 900 грн подвоїться при +15 %
    let price = 900;
    let months = 0;
    while (price < 1800) {
        price *= 1.15;
        months++;
    }
    note("Цикл while", "місяців до подвоєння ціни 900 грн при +15 %", months);

    // do...while — цикл з постумовою: тіло виконується хоча б один раз
    let runs = 0;
    do {
        runs++;
    } while (runs < 0);
    note("Цикл do...while", "кількість виконань при хибній умові", runs);

    // for...of — перебір елементів колекції
    const lateTimes = [];
    for (const user of registry.all) {
        if (!user.isWorkingTime()) lateTimes.push(user.time);
    }
    note("Цикл for...of", "час звернень у неробочий час", lateTimes);
}

/* ---------- 5. Масиви: 8+ методів ---------- */
function demoArrays() {
    const prices = services.map((s) => s.price);
    note("Масиви", "prices = services.map(s => s.price)", prices);
    note("Масиви", "prices.filter(p => p >= 1000)", prices.filter((p) => p >= 1000));
    note("Масиви", "services.find(s => s.id === \"SRV-06\").name", services.find((s) => s.id === "SRV-06").name);
    note("Масиви", "prices.includes(400)", prices.includes(400));
    note("Масиви", "prices.indexOf(1400)", prices.indexOf(1400));
    note("Масиви", "services.some(s => s.duration > 80)", services.some((s) => s.duration > 80));
    note("Масиви", "prices.slice(0, 3)", prices.slice(0, 3));

    const doctors = [...new Set(services.map((s) => s.doctor))];
    note("Масиви", "doctors.join(\"; \")", doctors.join("; "));

    const queue = ["SRV-02"];
    queue.push("SRV-05", "SRV-09");
    note("Масиви", "queue.push(\"SRV-05\", \"SRV-09\")", [...queue]);
    queue.unshift("SRV-01");
    note("Масиви", "queue.unshift(\"SRV-01\")", [...queue]);
    const firstInQueue = queue.shift();
    note("Масиви", "queue.shift()", firstInQueue);
    const lastInQueue = queue.pop();
    note("Масиви", "queue.pop()", lastInQueue);
    note("Масиви", "queue після shift і pop", queue);
}

/* ---------- 6. Функції: три способи оголошення і область видимості ---------- */

// Function Declaration — піднімається (hoisting), можна викликати до оголошення
function discountDeclaration(price, percent) {
    return price - (price * percent) / 100;
}

// Function Expression — функція як значення змінної
const discountExpression = function (price, percent) {
    return price - (price * percent) / 100;
};

// Стрілкова функція — короткий запис, без власного this
const discountArrow = (price, percent) => price - (price * percent) / 100;

// Замикання: внутрішня функція «пам'ятає» змінну count зі своєї області видимості
function makeBookingCounter() {
    let count = 0;                       // локальна змінна функції
    return () => ++count;
}

function demoFunctions() {
    note("Функції", "discountDeclaration(1000, 10)", discountDeclaration(1000, 10));
    note("Функції", "discountExpression(1000, 10)", discountExpression(1000, 10));
    note("Функції", "discountArrow(1000, 10)", discountArrow(1000, 10));

    const nextBooking = makeBookingCounter();
    nextBooking();
    nextBooking();
    note("Функції", "лічильник після трьох викликів", nextBooking());

    if (true) {
        const blockScoped = "видно лише в блоці";
        var functionScoped = "видно в усій функції";
        note("Функції", "blockScoped всередині блоку", blockScoped);
    }
    note("Функції", "typeof blockScoped поза блоком", typeof blockScoped);
    note("Функції", "functionScoped поза блоком", functionScoped);
}

/* ---------- 7. Об'єктно-орієнтований код ---------- */
function demoObjects() {
    const visitor = new User({
        surname: "Павленко", name: "Катерина", age: 20, education: "неповна вища",
        purpose: "Пропозиція", date: "2026-11-14", time: "18:30"
    });
    note("ООП", "visitor instanceof User", visitor instanceof User);
    note("ООП", "Object.keys(visitor)", Object.keys(visitor));
    note("ООП", "visitor.fullName (гетер)", visitor.fullName);
    note("ООП", "visitor.isWorkingTime() (метод)", visitor.isWorkingTime());

    const copy = new UserRegistry(usersData).add(visitor);
    note("ООП", "new UserRegistry(usersData).add(visitor).size", copy.size);
}

/* ---------- 8. Date, Math, String ---------- */
function demoBuiltIns() {
    const user = registry.all[0];
    const contact = new Date(`${user.date}T${user.time}`);
    const reportDay = new Date("2026-11-14T12:00");

    note("Date", "contact.getFullYear()", contact.getFullYear());
    note("Date", "contact.getMonth() + 1", contact.getMonth() + 1);
    note("Date", "contact.getDay()  (0 — неділя)", contact.getDay());
    note("Date", "contact.toLocaleDateString(\"uk-UA\")", contact.toLocaleDateString("uk-UA"));
    note("Date", "днів від звернення до 14.11.2026", Math.floor((reportDay - contact) / 86_400_000));

    const prices = services.map((s) => s.price);
    note("Math", "Math.max(...prices)", Math.max(...prices));
    note("Math", "Math.min(...prices)", Math.min(...prices));
    note("Math", "Math.round(1034.99)", Math.round(1034.99));
    note("Math", "Math.ceil(51.67)", Math.ceil(51.67));
    note("Math", "Math.abs(380 - 515)", Math.abs(380 - 515));

    const title = services[2].name;          // «Робота з тривогою»
    note("String", "title.toUpperCase()", title.toUpperCase());
    note("String", "title.includes(\"тривог\")", title.includes("тривог"));
    note("String", "title.split(\" \")", title.split(" "));
    note("String", "\"SRV-3\".replace(\"-\", \"-0\")", "SRV-3".replace("-", "-0"));
    note("String", "\"7\".padStart(3, \"0\")", "7".padStart(3, "0"));
    note("String", "title.charAt(0)", title.charAt(0));
}

/* ---------- 9. Неявне перетворення типів ---------- */
function demoImplicit() {
    note("Неявне перетворення", "\"Ціна: \" + 900", "Ціна: " + 900);
    note("Неявне перетворення", "\"900\" * 2", "900" * 2);
    note("Неявне перетворення", "\"1400\" > 900", "1400" > 900);
    note("Неявне перетворення", "1 + true", 1 + true);
    note("Неявне перетворення", "\"\" ? \"є текст\" : \"порожньо\"", "" ? "є текст" : "порожньо");
}

/* ---------- 10. Hoisting (піднімання) ---------- */
function demoHoisting() {
    // var піднімається разом з оголошенням, але без значення → undefined
    note("Hoisting", "hoistedVar до оголошення (var)", hoistedVar);
    var hoistedVar = "MindCare";
    note("Hoisting", "hoistedVar після присвоєння", hoistedVar);

    // Function Declaration піднімається повністю
    note("Hoisting", "hoistedGreeting() до оголошення", hoistedGreeting());
    function hoistedGreeting() {
        return "Вітаємо в MindCare!";
    }

    // let/const піднімаються, але до оголошення перебувають у «мертвій зоні» (TDZ)
    let tdzError;
    try {
        tdzError = notYetDeclared;
    } catch (error) {
        tdzError = error.name;
    }
    const notYetDeclared = 1;
    note("Hoisting", "звернення до const до оголошення", tdzError);

    // Function Expression у const теж не можна викликати до оголошення
    let expressionError;
    try {
        lateArrow();
    } catch (error) {
        expressionError = error.name;
    }
    const lateArrow = () => "готово";
    note("Hoisting", "виклик стрілкової функції до оголошення", expressionError);
}

/* ---------- Запуск усіх прикладів ---------- */
[demoTypes, demoConversion, demoOperators, demoControlFlow, demoArrays,
 demoFunctions, demoObjects, demoBuiltIns, demoImplicit, demoHoisting].forEach((demo) => demo());

console.table(basicsLog);
