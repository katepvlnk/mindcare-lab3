"use strict";
/* =========================================================================
   Завдання 1. Послуги MindCare
   Підхід: масив об'єктів + функції (методи масивів sort, reduce, map,
   filter, findIndex, splice). Вихідний масив ніколи не змінюється —
   функції повертають нові масиви.
   ========================================================================= */

/** 10 записів послуг */
const services = [
    { id: "SRV-01", name: "Перша зустріч-знайомство",        doctor: "Коваленко О. В.", readsMonth1: 420, readsMonth2: 515, price: 300,  duration: 20 },
    { id: "SRV-02", name: "Індивідуальна консультація",       doctor: "Мельник А. С.",   readsMonth1: 610, readsMonth2: 580, price: 900,  duration: 50 },
    { id: "SRV-03", name: "Робота з тривогою",                doctor: "Бондар І. П.",    readsMonth1: 735, readsMonth2: 790, price: 1000, duration: 50 },
    { id: "SRV-04", name: "Сімейна та парна терапія",         doctor: "Бондар І. П.",    readsMonth1: 380, readsMonth2: 380, price: 1400, duration: 80 },
    { id: "SRV-05", name: "Дитячий психолог",                 doctor: "Ткаченко Ю. М.",  readsMonth1: 295, readsMonth2: 340, price: 900,  duration: 45 },
    { id: "SRV-06", name: "Кризова підтримка",                doctor: "Лисенко М. Р.",   readsMonth1: 510, readsMonth2: 470, price: 800,  duration: 50 },
    { id: "SRV-07", name: "Профілактика вигорання",           doctor: "Мельник А. С.",   readsMonth1: 260, readsMonth2: 260, price: 1000, duration: 90 },
    { id: "SRV-08", name: "Групова підтримка",                doctor: "Лисенко М. Р.",   readsMonth1: 190, readsMonth2: 240, price: 400,  duration: 90 },
    { id: "SRV-09", name: "Підлітковий психолог",             doctor: "Ткаченко Ю. М.",  readsMonth1: 330, readsMonth2: 300, price: 900,  duration: 60 },
    { id: "SRV-10", name: "Консультація з питань сну",        doctor: "Коваленко О. В.", readsMonth1: 450, readsMonth2: 520, price: 1400, duration: 60 }
];

/** Поля, які обов'язково має містити повний запис послуги */
const REQUIRED_FIELDS = ["id", "name", "doctor", "readsMonth1", "readsMonth2", "price", "duration"];
const NUMERIC_FIELDS = ["readsMonth1", "readsMonth2", "price", "duration"];

/* -------------------------------------------------------------------------
   1.1 Впорядкування за вартістю + середня тривалість для однакової вартості
   ------------------------------------------------------------------------- */

/**
 * Повертає НОВИЙ масив, впорядкований за вартістю.
 * @param {Array} list
 * @param {"asc"|"desc"} order — за зростанням (за замовчуванням) або спаданням
 */
function sortByPrice(list, order = "asc") {
    const direction = order === "desc" ? -1 : 1;
    return [...list].sort((a, b) => (a.price - b.price) * direction);
}

/**
 * Групує послуги за вартістю і рахує середню тривалість у кожній групі.
 * @returns {Array<{price:number, count:number, avgDuration:number, names:string[]}>}
 */
function averageDurationByPrice(list) {
    const groups = list.reduce((acc, service) => {
        const group = acc[service.price] ?? { price: service.price, count: 0, total: 0, names: [] };
        group.count += 1;
        group.total += service.duration;
        group.names.push(service.name);
        acc[service.price] = group;
        return acc;
    }, {});

    return Object.values(groups)
        .map(({ price, count, total, names }) => ({
            price,
            count,
            avgDuration: Math.round((total / count) * 10) / 10,
            names
        }))
        .sort((a, b) => a.price - b.price);
}

/* -------------------------------------------------------------------------
   1.2 Послуга з максимальною кількістю прочитань за місяць_1
   ------------------------------------------------------------------------- */

/**
 * Знаходить послугу з найбільшим значенням поля key (за замовчуванням readsMonth1).
 * @returns {object|null} — null для порожнього масиву
 */
function findMostRead(list, key = "readsMonth1") {
    if (list.length === 0) return null;
    return list.reduce((best, service) => (service[key] > best[key] ? service : best));
}

/* -------------------------------------------------------------------------
   1.3 Додавання нової послуги
   ------------------------------------------------------------------------- */

/** Перевіряє, чи заповнені всі поля запису */
function isComplete(service) {
    return REQUIRED_FIELDS.every((field) => {
        const value = service[field];
        if (value === undefined || value === null) return false;
        if (NUMERIC_FIELDS.includes(field)) return Number.isFinite(value) && value >= 0;
        return String(value).trim() !== "";
    });
}

/**
 * Додає послугу до списку і повертає НОВИЙ масив.
 * - неповний запис — у кінець списку;
 * - повний запис — на своє місце в порядку СПАДАННЯ вартості
 *   (серед повних записів; неповні завжди залишаються в кінці).
 * Список спершу впорядковується: повні записи за спаданням вартості, потім неповні.
 */
function addService(list, newService) {
    const complete = sortByPrice(list.filter(isComplete), "desc");
    const incomplete = list.filter((s) => !isComplete(s));
    const result = [...complete, ...incomplete];

    if (!isComplete(newService)) {
        result.push(newService);
        return result;
    }

    // перша позиція, де вартість менша за нову, або де починаються неповні записи
    let index = result.findIndex((s) => !isComplete(s) || s.price < newService.price);
    if (index === -1) index = result.length;
    result.splice(index, 0, newService);
    return result;
}

/* -------------------------------------------------------------------------
   1.4 Оновлена вартість на наступний місяць
   ------------------------------------------------------------------------- */

/** Коефіцієнт зміни вартості залежно від динаміки прочитань */
function priceCoefficient(service) {
    if (service.readsMonth1 < service.readsMonth2) return 1.15;   // інтерес зростає
    if (service.readsMonth1 > service.readsMonth2) return 0.95;   // інтерес спадає
    return 1;                                                     // без змін
}

/** Нова вартість, округлена до копійок */
function nextMonthPrice(service) {
    return Math.round(service.price * priceCoefficient(service) * 100) / 100;
}

/** Оновлений список: назва послуги, нова вартість, ім'я лікаря/психолога */
function updatedPriceList(list) {
    return list.map((service) => ({
        name: service.name,
        oldPrice: service.price,
        coefficient: priceCoefficient(service),
        newPrice: nextMonthPrice(service),
        doctor: service.doctor
    }));
}

/* Експорт для запуску тестів у Node.js (у браузері функції глобальні) */
if (typeof module !== "undefined") {
    module.exports = {
        services, sortByPrice, averageDurationByPrice, findMostRead,
        isComplete, addService, priceCoefficient, nextMonthPrice, updatedPriceList
    };
}
