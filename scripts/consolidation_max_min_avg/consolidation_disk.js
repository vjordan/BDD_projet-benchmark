const child_process = require('child_process');

const timestamp_debut = 1482469200;
const timestamp_fin   = 1511017200;
const offset_max = Math.floor((timestamp_fin - timestamp_debut) / 60 / 60);
const measurement_from = "disk"
const measurement_into = "disk_1h"

const fields = [
    "total_read_latency",
    "total_write_latency",
];

const fonctions = [
    ["MIN", "min_"],
    ["MAX", "max_"],
    ["MEAN", "avg_"]
];

const select_clause_read_write_latency = fields.map(field => {
    return fonctions.map(fonction => {
        const [fname, fprefix] = fonction;
        return `${fname}("${field}") AS "${fprefix}${field}"`;
    }).join(', ');
}).join(', ');

const select_clause_latency = fonctions.map(fonction => {
    const [fname, fprefix] = fonction;
    return `${fname}("total_read_latency") + ${fname}("total_write_latency") AS "${fprefix}lattency"`;
}).join(', ');

const select_clause_io = fonctions.map(fonction => {
    const [fname, fprefix] = fonction;
    return `${fname}("read") + ${fname}("write") AS "${fprefix}io"`;
}).join(', ');

for(let offset = 0; offset < offset_max; offset++){
    const request1 = `SELECT ${select_clause_read_write_latency} INTO ${measurement_into} FROM ${measurement_from} WHERE  time >= ${timestamp_debut}000000000 + ${offset}h AND time <= ${timestamp_debut}000000000 + ${offset + 1}h GROUP BY uuid`;
    const command1 = `influx -database 'hydda2' -execute "${request1}"`;
    
    const request2 = `SELECT ${select_clause_latency} INTO ${measurement_into} FROM ${measurement_from} WHERE  time >= ${timestamp_debut}000000000 + ${offset}h AND time <= ${timestamp_debut}000000000 + ${offset + 1}h GROUP BY uuid`;
    const command2 = `influx -database 'hydda2' -execute "${request2}"`;

    const request3 = `SELECT ${select_clause_io} INTO ${measurement_into} FROM ${measurement_from} WHERE  time >= ${timestamp_debut}000000000 + ${offset}h AND time <= ${timestamp_debut}000000000 + ${offset + 1}h GROUP BY uuid`;
    const command3 = `influx -database 'hydda2' -execute "${request3}"`;

    child_process.execSync(command1);
    child_process.execSync(command2);
    child_process.execSync(command3);

    if(offset === 0) console.log("requests offset 0 : "+request1+" ; "+request2+" ; "+request3);
    if(offset % 24 === 0) console.log(`${offset}/${offset_max}`);
}
