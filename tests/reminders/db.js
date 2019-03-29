const test = require('tape');
process.env.DATA_DIR = '';
const d = require('../../db.js');
const now = new Date();

test('db loads up', t => {
    t.plan(1);
    t.equal(!!d, true);
});

test('db filters non-run reminders', t => {
    t.plan(3);
    const old = {a:[{message:"hey",date:""},{message:"new",date: new Date(now.getTime() + 460000).toString()}]};
    t.equal(old.a.length, 2);
    const clean = d.getForthcomingReminders(old);
    t.equal(clean.a.length, 1);
    t.equal(clean.a[0].message, 'new');
});
