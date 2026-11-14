"use strict";
/* =========================================================================
   Завдання 2. Звернення користувачів MindCare
   Підхід: об'єктно-орієнтований — клас User (один запис) і клас
   UserRegistry (колекція записів та операції над нею).
   ========================================================================= */

class User {
    /**
     * @param {object} data
     * @param {string} data.surname   прізвище
     * @param {string} data.name      ім'я
     * @param {number} data.age       вік
     * @param {string} data.education освіта
     * @param {string} data.purpose   мета зворотного зв'язку
     * @param {string} data.date      дата звернення, "РРРР-ММ-ДД"
     * @param {string} data.time      час звернення, "ГГ:ХХ"
     */
    constructor({ surname, name, age, education, purpose, date, time }) {
        this.surname = surname;
        this.name = name;
        this.age = age;
        this.education = education;
        this.purpose = purpose;
        this.date = date;
        this.time = time;
    }

    /** Прізвище та ім'я */
    get fullName() {
        return `${this.surname} ${this.name}`;
    }

    /** Місяць звернення у форматі "РРРР-ММ" */
    get month() {
        return this.date.slice(0, 7);
    }

    /** Час звернення у хвилинах від початку доби */
    get minutes() {
        return User._toMinutes(this.time);
    }

    /** Чи припадає звернення на робочий час 09:00–17:00 (17:00 вже неробочий) */
    isWorkingTime() {
        return this.minutes >= UserRegistry.WORK_START && this.minutes < UserRegistry.WORK_END;
    }

    /** Внутрішній допоміжний метод: "ГГ:ХХ" → кількість хвилин */
    static _toMinutes(time) {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
    }
}

class UserRegistry {
    static WORK_START = 9 * 60;    // 09:00
    static WORK_END = 17 * 60;     // 17:00

    constructor(users = []) {
        this._users = users.map((u) => (u instanceof User ? u : new User(u)));
    }

    get size() {
        return this._users.length;
    }

    get all() {
        return [...this._users];
    }

    add(user) {
        this._users.push(user instanceof User ? user : new User(user));
        return this;
    }

    /* 2.1 Користувачі, що звернулися протягом місяця в заданий момент часу.
       month — "РРРР-ММ"; time — "ГГ:ХХ" (якщо не вказано — увесь місяць). */
    byMonthAndTime(month, time) {
        return this._users.filter((u) => u.month === month && (time === undefined || time === "" || u.time === time));
    }

    /* 2.2 Наймолодший користувач: вік, освіта, ім'я */
    youngest() {
        if (this._users.length === 0) return null;
        const user = this._users.reduce((min, u) => (u.age < min.age ? u : min));
        return { age: user.age, education: user.education, name: user.name, fullName: user.fullName };
    }

    /* 2.3 Два класи за часом звернення: кількість і середній вік у кожному */
    splitByWorkingTime() {
        const working = this._users.filter((u) => u.isWorkingTime());
        const nonWorking = this._users.filter((u) => !u.isWorkingTime());
        return {
            working: UserRegistry._summary("Робочий час (09:00–17:00)", working),
            nonWorking: UserRegistry._summary("Неробочий час", nonWorking)
        };
    }

    /* 2.4 Сортування за алфавітом (прізвище, потім ім'я) з метою звернення */
    sortedAlphabetically() {
        return [...this._users]
            .sort((a, b) => a.surname.localeCompare(b.surname, "uk") || a.name.localeCompare(b.name, "uk"))
            .map((u) => ({ fullName: u.fullName, purpose: u.purpose }));
    }

    /** Внутрішній метод: підсумок для одного класу користувачів */
    static _summary(title, users) {
        const count = users.length;
        const avgAge = count === 0 ? 0 : Math.round((users.reduce((s, u) => s + u.age, 0) / count) * 10) / 10;
        return { title, count, avgAge, users };
    }
}

/** 10 облікових записів користувачів */
const usersData = [
    { surname: "Шевченко",  name: "Олена",    age: 34, education: "вища",        purpose: "Співпраця",                  date: "2026-10-03", time: "10:30" },
    { surname: "Бойко",     name: "Андрій",   age: 19, education: "неповна",     purpose: "Пропозиція",                 date: "2026-10-07", time: "21:15" },
    { surname: "Ковальчук", name: "Ірина",    age: 45, education: "професійна",  purpose: "Скарга на якість послуги",   date: "2026-10-12", time: "10:30" },
    { surname: "Єременко",  name: "Тарас",    age: 27, education: "вища",        purpose: "Наявність помилки на сайті", date: "2026-10-18", time: "08:45" },
    { surname: "Олійник",   name: "Марія",    age: 22, education: "повна",       purpose: "Пропозиція",                 date: "2026-10-21", time: "16:59" },
    { surname: "Ігнатенко", name: "Дмитро",   age: 52, education: "вища",        purpose: "Скарга на якість послуги",   date: "2026-11-02", time: "17:00" },
    { surname: "Ткачук",    name: "Софія",    age: 17, education: "неповна",     purpose: "Наявність помилки на сайті", date: "2026-11-05", time: "13:20" },
    { surname: "Бойко",     name: "Анна",     age: 30, education: "професійна",  purpose: "Співпраця",                  date: "2026-11-09", time: "09:00" },
    { surname: "Мороз",     name: "Віктор",   age: 61, education: "вища",        purpose: "Пропозиція",                 date: "2026-11-11", time: "23:40" },
    { surname: "Їжакевич",  name: "Катерина", age: 25, education: "повна",       purpose: "Співпраця",                  date: "2026-11-14", time: "12:05" }
];

const registry = new UserRegistry(usersData);

if (typeof module !== "undefined") {
    module.exports = { User, UserRegistry, usersData, registry };
}
