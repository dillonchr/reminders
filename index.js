const { extractDate } = require('./reminder-manager.js');
const { addReminder, getPersistedReminders } = require('./db.js');
const moment = require('moment');

const superSetTimeout = (fn, date) => {
    const diff = date.getTime() - (new Date().getTime());
    if (diff > 0x7FFFFFFF) {
        setTimeout(() => superSetTimeout(date, fn), 0x7FFFFFFF);
    } else {
        setTimeout(fn, diff);
    }
};

const add = ({command, userId, commandCallback, onRemind}) => {
    if (!command || !userId || !commandCallback || !onRemind) {
        return commandCallback ?
            commandCallback(`Missing one of required fields: command, userId, onRemind`) :
            console.error('Missing commandCallback');
    }
    const date = extractDate(command);
    if (!date) {
        return commandCallback({error: 'Couldn\'t find the date in the reminder.'});
    }

    addReminder(userId, date.message, date, (err) => {
        if (err) {
            return commandCallback({error: 'Failed to save reminder! Sorry man.', originalError: err});
        }
        superSetTimeout(() => {
            onRemind({userId, message: date.message});
        }, date);
        commandCallback(null, `Will remind you ${moment(date).fromNow()}`);
    });
};

const connect = (onRemind) => {
    getPersistedReminders((err, reminders) => {
        Object.keys(reminders)
            .forEach(userId => {
                reminders[userId]
                    .forEach(({date, message}) => {
                        superSetTimeout(() => onRemind({userId, message}), new Date(date));
                    });
            });
    });
};

module.exports = {
    add,
    connect
};
