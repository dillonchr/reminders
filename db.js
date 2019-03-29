const fs = require('fs');
const path = require('path');
const jsonPath = path.join(process.env.DATA_DIR, 'reminders.json');

const getPersistedReminders = (fn) => {
    fs.readFile(jsonPath, 'utf-8', (err, data) => {
        try {
            const reminders = JSON.parse(data);
            if (!reminders || !Object.keys(reminders).length) {
                throw new Error('empty');
            }
            fn(null, getForthcomingReminders(reminders));
        } catch (ignore) {
            fn(null, {});
        }
    });
};

const getForthcomingReminders = (reminders) => {
    const now = new Date().getTime();
    return Object.entries(reminders)
        .reduce((r, [userId, collection]) => {
            r[userId] = collection.filter(({date}) => new Date(date).getTime() > now);
            return r;
        }, {});
};

const saveReminders = (fn, data) => {
    fs.writeFile(jsonPath, JSON.stringify(data), 'utf-8', fn);
};

const addReminder = (userId, message, date, fn) => {
    getPersistedReminders((err, reminders) => {
        //  this doesn't appear to be possible, but leaving for fear of the unknown
        if (err) {
            return fn(err);
        }

        if (!reminders[userId]) {
            reminders[userId] = [];
        }

        reminders[userId].push({message, date});
        saveReminders(fn, reminders);
    });
};

module.exports = {
    addReminder,
    getForthcomingReminders,
    getPersistedReminders,
    saveReminders
};
