# Reminders
Don't forget! 

## Fitting Room
```javascript
process.env.DATA_DIR = __dirname;
const r = require('@dillonchr/reminders');

const localOnRemind = ({userId, message}) => {
    console.log(`Hey, ${userId}, it's time to ${message}`);
};

//  connect to send off forthcoming persisted reminders
r.connect(localOnRemind);

//  add new reminder and schedule its delivery (in memory right now)
r.add({
    command: 'enhance readme in 30 days',
    userId: 'arbitrary_user_id',
    commandCallback: (cmdErr, cmdRes) => {
        if (cmdErr) {
            return console.error(`Couldn't save your reminder, because:`, cmdErr);
        }
        console.log(`OK`, cmdRes);
    },
    onRemind: localOnRemind
});

//  in 30 days
//  >> Hey, arbitrary_user_id, it's time to enhance readme
```
