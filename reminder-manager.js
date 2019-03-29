const extract = (regex, input) => {
    const result = input.match(regex);
    if (result && result.length) {
        return result.length > 1 ? result.slice(1) : result;
    }
};

const toDate = (message, time, day, month, year) => {
    const d = new Date(`${month} ${day}, ${year} ${time}`);
    d.message = message;
    return d;
};

const extractLongDate = ( input ) => {
    return extract(/^(.*) (Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sept?|September|Oct|October|Nov|November|Dec|December) ?(\d+)?\s?(\d{4})?\s?a?t?\s?(\d{1,2}:?\d{2}?\s?[AMPamp]*)?/i, input);
};

const extractRelativeDate = ( input ) => {
    const hasDays = extract(/^(.*) (mon|monday|tues?|tuesday|wed|wednesday|thurs?|thursday|fri|friday|sat|saturday|sun|sunday)/i, input);
    if (hasDays) {
        const hasTime = extract(/\s?@?\s?(\d+:?\d{0,2})$/, input);
        if (hasTime) {
            hasDays.push(hasTime[0]);
        }
        return hasDays;
    }
};

const extractDelay = ( input ) => {
    return extract(/^(.*) in (\d+) (min|minutes?|sec|seconds?|hrs?|hours?|days?|mos?|months?|ye?a?rs?)/i, input);
};

const toRealDate = ( pieces ) => {
    if (pieces && pieces.length) {
        const message = pieces.shift();
        //const hasAll = !!pieces[3];
        const hasYear = !!pieces[2];
        const hasDay = !!pieces[1];

        let month = pieces[0];
        let day = pieces[1] || 1;
        let year = pieces[2] || new Date().getFullYear();
        let time;
        if (!pieces[3] || (pieces[3].length === 5 && pieces[3].split(':').shift() > 24)) {
            time = '08:00';
        } else {
            time = extract(/\d{1,2}:?\d{0,2}/, pieces[3]).shift();
            if (time.length < 5) {
                const isPm = /pm/i.test(pieces[3]) || (!/am/i.test(pieces[3]) && time.split(':').shift() < 8);
                time += isPm ? ' PM' : ' AM';
            }
        }
        let reminderDate = toDate(message, time, day, month, year);
        const now = new Date();

        if (now > reminderDate) {
            if (!hasYear) {
                reminderDate = toDate(message, time, day, month, ++year);
                if (reminderDate > now) {
                    return reminderDate;
                }
            }
            if (!hasDay) {
                reminderDate = toDate(message, time, ++day, month, year);
                if (reminderDate > now) {
                    return reminderDate;
                }
            }
        }
        return reminderDate;
    }

};

const toTimeout = ([message, count, unit]) => {
    const now = new Date().getTime();
    const date = new Date((+count * unitToMillis(unit)) + now);
    date.message = message;
    return date;
};

const unitToMillis = (unit) => {
    if (/^sec/i.test(unit)) {
        return 1000;
    }
    if (/^min/i.test(unit)) {
        return 60000;
    }
    if (/^ho?u?r/i.test(unit)) {
        return 3600000;
    }
    if (/^day/i.test(unit)) {
        return 86400000;
    }
    if (/^mon?t?h?/i.test(unit)) {
        return 2592000000;
    }
    if (/^ye?a?r/i.test(unit)) {
        return 31536000000;
    }
};

const toAbsoluteDate = ( dayPieces ) => {
    const message = dayPieces.shift();
    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    const dayCount = dayShardToId(dayPieces[0]);
    const thisDay = today.getDay();
    const dayShift = (dayCount <= thisDay ? 7 - thisDay - dayCount : dayCount - thisDay) * unitToMillis('day');
    const timeShift = timeStringToMilliseconds(dayPieces[1]);
    const day = new Date(today.getTime() + dayShift + timeShift);
    day.message = message;
    return day;
};

const timeStringToMilliseconds = ( time ) => {
    if (!time) {
        return 1000 * 60 * 60 * 8;
    }
    const isPm = /pm/i.test(time) || (!/am/i.test(time) && parseInt(time, 10) < 8);
    const padding = isPm * 12 * 60 * 60 * 1000;

    if (time.indexOf(':') !== -1) {
        return time.split(':')
            .map(str => parseInt(str, 10))
            .reduce((sum, count, i) => {
                if (i) {
                    return sum + (count * 60);
                }
                return sum + (count * 60 * 60);
            }, padding) * 1000;
    }

    return (parseInt(time, 10) * 60 * 60 * 1000) + padding;
};

const dayShardToId = ( day ) => {
    switch(day.toLowerCase()) {
    case 'sun':
    case 'sunday':
        return 0;
    case 'mon':
    case 'monday':
        return 1;
    case 'tue':
    case 'tues':
    case 'tuesday':
        return 2;
    case 'wed':
    case 'wednesday':
        return 3;
    case 'thur':
    case 'thurs':
    case 'thursday':
        return 4;
    case 'fri':
    case 'friday':
        return 5;
    case 'sat':
    case 'saturday':
        return 6;
    }
};

const extractDate = ( input ) => {
    let absoluteDate = extractLongDate(input);
    if (absoluteDate) {
        return toRealDate(absoluteDate);
    }
    let relativeDate = extractRelativeDate(input);
    if (relativeDate) {
        return toAbsoluteDate(relativeDate);
    }
    let delay = extractDelay(input);
    if (delay) {
        return toTimeout(delay);
    }
};

module.exports = {
    dayShardToId,
    extract,
    extractDate,
    extractLongDate,
    extractRelativeDate,
    toAbsoluteDate,
    toDate
};
