const child_process = require('child_process');

const timestamp_debut = 1482469200;
const timestamp_fin   = 1511017200;
const offset_max = Math.floor((timestamp_fin - timestamp_debut) / 60 / 60);
const measurement_from = "net"
const measurement_into = "net_1h"

const fonctions = [
    ["MIN", "min_"],
    ["MAX", "max_"],
    ["MEAN", "avg_"]
];

const select_clause_dropped = fonctions.map(fonction => {
    const [fname, fprefix] = fonction;
    return `${fname}("droppedrx") + ${fname}("droppedtx") AS "${fprefix}dropped"`;
}).join(', ');

const select_clause_io = fonctions.map(fonction => {
    const [fname, fprefix] = fonction;
    return `${fname}("received") + ${fname}("transmitted") AS "${fprefix}io"`;
}).join(', ');

for(let offset = 0; offset < offset_max; offset++){
    const request1 = `SELECT ${select_clause_dropped} INTO ${measurement_into} FROM ${measurement_from} WHERE  time >= ${timestamp_debut}000000000 + ${offset}h AND time <= ${timestamp_debut}000000000 + ${offset + 1}h GROUP BY uuid`;
    const command1 = `influx -database 'hydda2' -execute "${request1}"`;

    const request2 = `SELECT ${select_clause_io} INTO ${measurement_into} FROM ${measurement_from} WHERE  time >= ${timestamp_debut}000000000 + ${offset}h AND time <= ${timestamp_debut}000000000 + ${offset + 1}h GROUP BY uuid`;
    const command2 = `influx -database 'hydda2' -execute "${request2}"`;
    
    child_process.execSync(command1);
    child_process.execSync(command2);

    if(offset === 0) console.log("requests offset 0 : "+request1+" ; "+request2);
    if(offset % 24 === 0) console.log(`${offset}/${offset_max}`);
}
