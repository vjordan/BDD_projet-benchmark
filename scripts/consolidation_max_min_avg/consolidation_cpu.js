const child_process = require('child_process');

const timestamp_debut = 1482469200;
const timestamp_fin   = 1511017200;
const offset_max = Math.floor((timestamp_fin - timestamp_debut) / 60 / 60);
const measurement_from = "cpu"
const measurement_into = "cpu_1h"

const fields = [
    "usage",
    "usage_mhz",
    "idle",
    "demand",
    "used",
    "ready",
    "costop",
];

const fonctions = [
    ["MIN", "min_"],
    ["MAX", "max_"],
    ["MEAN", "avg_"]
];

const select_clause = fields.map(field => {
    return fonctions.map(fonction => {
        const [fname, fprefix] = fonction;
        return `${fname}("${field}") AS "${fprefix}${field}"`;
    }).join(', ');
}).join(', ');

for(let offset = 0; offset < offset_max; offset++){
    const request = `SELECT ${select_clause} INTO ${measurement_into} FROM ${measurement_from} WHERE  time >= ${timestamp_debut}000000000 + ${offset}h AND time <= ${timestamp_debut}000000000 + ${offset + 1}h GROUP BY uuid`;
    const command = `influx -database 'hydda2' -execute "${request}"`;
    child_process.execSync(command);

    if(offset === 0) console.log("requests offset 0 : "+request);
    if(offset % 24 === 0) console.log(`${offset}/${offset_max}`);
}
