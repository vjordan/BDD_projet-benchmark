const child_process = require('child_process');

const timestamp_debut = 1482469200;
const timestamp_fin   = 1511013810;
const offset_max = Math.floor((timestamp_fin - timestamp_debut) / 60 / 60);

const measurement = 'disk';
const measurement_target = 'disk_thresholds';

// Pour seuils : COUNT("usage") from "cpu" as "cpu_2" ... where usage > 2 group by uuid
const seuils = ["20", "30"];

// Requêtes
// Plusieurs requêtes séparées sont nécessaires pour faire les différents calculs.
// lors de l'insertion d'une donnée pour 1 timestamp et 1 tag set, le field est ajouté au field set (pas de suppression)
// group by time(1h) pour "lisser" les timestamps

for (let offset = 0; offset < offset_max; offset++) {
  if(offset % 24 === 0) console.log(`${offset}/${offset_max}`);

  const requetes = [];

  for (seuil of seuils) {
    const requete = `SELECT COUNT("total_read_latency") AS "disk_latency_${seuil}" INTO "${measurement_target}" FROM "${measurement}" WHERE ("total_read_latency" + "total_write_latency" >= ${seuil}) AND (time >= ${timestamp_debut}000000000 + ${offset}h AND time <= ${timestamp_debut}000000000 + ${offset + 1}h) GROUP BY uuid,time(1h)`;
    requetes.push(requete);
  }

  for (requete of requetes) {
    const command = `influx -database 'hydda2' -execute '${requete}'`;
    child_process.execSync(command);
  }
}
