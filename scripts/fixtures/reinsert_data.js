const child_process = require('child_process');
const request = require('request');

const timestamp_fin = 1511013810;
const pull_duration = "5m";
const measurement = "cpu";
const insertion_rate = 1000; // in ms
const db_write_url = "http://localhost:8086/write?db=hydda2";

const db_request = `SELECT * FROM "${measurement}" WHERE time >= ${timestamp_fin}000000000 - ${pull_duration} AND time <= ${timestamp_fin}000000000`;
const command = `influx -database 'hydda2' -format 'json' -execute "${db_request}"`;

console.log(`Querying one hour of data of measurement : ${measurement}`);
const data = child_process.execSync(command, {encoding: 'utf8'});

console.log("Query done, parsing response");
const parsed_data = JSON.parse(data);

const series = parsed_data
  .results
  .map(result => result.series)
  .reduce((acc, values) => acc.concat(values), []);

const columns = series[0].columns.slice(1); // slice to remove timestamp column label

const values = series
  .map(serie => serie.values)
  .reduce((acc, values) => acc.concat(values), []);

const moments = {};
const moments_timestamp = [];

values.forEach(value => {
  const timestamp = value[0];
  if(moments[timestamp] === undefined) {
    moments[timestamp] = [];
    moments_timestamp.push(timestamp);
  }
  moments[timestamp].push(value);  
});

moments_timestamp.sort();
console.log(`Got ${values.length} values for ${moments_timestamp.length} moments`);

let moment_index = 0;
let total_inserted = 0;

const insert = () => {
  const index = moment_index % moments_timestamp.length;
  const values_to_insert = moments[moments_timestamp[index]];

  const points = values_to_insert.map(v => {
    const uuid = v[v.length - 1];
    const fields = v
      .slice(1, v.length - 1) // slice to remove timestamp & uuid
      .map((d, i) => d !== null ? `${columns[i]}=${d}` : '')
      .filter(n => n)
      .join(',');
    return `${measurement}_test,uuid=${uuid} ${fields}`; // TO REMOVE ? measurement suffixed by _test
  }).join('\n');

  request({
    method: "POST",
    uri: db_write_url,
    body: points
  }, (error, response, body) => {
    if(error) {
      console.log('error:', error);
    }
    else {
      if(index === 0) console.log("----")
      total_inserted += values_to_insert.length;
      console.log(`${index} - ${values_to_insert.length} inserted (http ${response.statusCode}), total: ${total_inserted}`);
    }
  });

  moment_index++;
}

console.log(`\nStarted reinserting "${pull_duration}" of measurement "${measurement}" at a ${insertion_rate}ms rate\n`);
setInterval(insert, insertion_rate);
