const test = require('tape');
const r = require('../../reminder-manager.js');
const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const now = new Date();

test('reminder manager', t => {
    t.plan(1);
    t.equal(!!r, true);
});

test('reminder manager date parsing', t => {
    t.plan(4);
    const result = r.extractDate(`haircut ${months[now.getMonth()]} ${now.getDate() + 1}`);
    t.equal(result.getMonth(), now.getMonth());
    t.equal(result.getDate(), now.getDate() + 1);
    t.equal(result.getMinutes(), 0);
    t.equal(result.getHours(), 8);
});

test('should handle just a month as time', t => {
    t.plan(2);
    const nextMo = Math.min(11, now.getMonth() + 1);
    const result = r.extractDate(`mow lawn ${months[nextMo]}`);
    t.equal(result.getMonth(), nextMo);
    t.equal(result.getDate(), 1);
});

test('should handle times that already passed', t => {
    t.plan(2);
    const result = r.extractDate(`amz prime ${months[now.getMonth()]} ${now.getDate()} 00:00`);
    t.equal(result.getFullYear(), now.getFullYear() + 1);
    t.equal(result.getHours(), 0);
});

test('should handle times that already passed with times', t => {
    t.plan(1);
    const result = r.extractDate(`amz prime ${months[now.getMonth()]} ${now.getDate()} 1:00am`);
    t.equal(result.getHours(), 1);
});

test('should handle times that already passed with times', t => {
    t.plan(2);
    const result = r.extractDate(`amz prime ${months[now.getMonth()]} ${now.getDate()} 01:00`);
    t.equal(result.getHours(), 1);
    t.equal('amz prime', result.message);
});

test('reminder manager date parse days of the week', t => {
    t.plan(1);
    const date = r.extractRelativeDate('crash bandicoot Sunday @ 6');
    t.deepLooseEqual(date, ['crash bandicoot', 'Sun', '6']);
});

test('should default to 8 on relative dates', t => {
    t.plan(3);
    const date = r.extractDate('crash bandicoot Sunday');
    t.equals(date.getMonth() >= new Date().getMonth(), true);
    t.equals(date.getHours(), 8);
    t.equals(date.message, 'crash bandicoot');
});

test('should handle relative dates automagically', t => {
    t.plan(2);
    const date = r.extractDate('crash bandicoot Sunday 8');
    t.equals(date.getMonth() >= new Date().getMonth(), true);
    t.equals(date.getHours(), 8);
});

test('should handle relative units of time', t => {
    t.plan(1);
    const now = new Date();
    const result = r.extractDate('remind haircut in 2 hours');
    t.equals(result.getTime() - now.getTime() > 1000 * 60 * 59, true);
});

test('should handle relative units of days', t => {
    t.plan(2);
    const result = r.extractDate('haircut in 2 days');
    t.equals(result.getTime() - now.getTime() > 1000 * 60 * 60 * 47, true);
    t.equals(result.message, 'haircut');
});

test('should handle relative units of days in raw extract', t => {
    t.plan(1);
    const result = r.extractDate('remind haircut in 2 days');
    t.equals(result.getTime() - now.getTime() > 1000 * 60 * 60 * 47, true);
});

test('should handle relative time with no am/pm', t => {
    const result = r.extractDate('text so-and-so at 5');
    t.equals(result.getTime() > now.getTime(), true);
    const moment = require('moment');
    console.log(moment(result).format('LLL'));
    t.equals(result.getHours(), 17);
    t.end();
});

