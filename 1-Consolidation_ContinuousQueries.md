# EasyVirt - InfluxDB

## Consolidation

Les scripts de consolidation sont fournis.  
Ce sont des scripts Node.js (v8 et +).

Les requêtes sont exécutées directement sur le serveur hébergant la base via la commande `influx`.  
Les scripts exécutent les requêtes de consolidation une à une pour un intervalle glissant de 1h.
Cela permet d'éviter de tomber à cours de mémoire.

La durée d'une consolidation dépend du nombre de points et field du measurement à traiter.
Pour donner un ordre d'idée, la consoliation d'un an de données, soit 7929 heures, de cpu (9 fields) en cpu_1h (21 fields) a pris entre 3 et 4 heures. 

## Continuous queries

Les continuous queries vont permettre d'implémenter la consolidation dynamiquement pour les données qui sont insérées dans la base de données. Elles réalisent le même travail que les requêtes décrites dans la section précédentes, mais c'est InfluxDB qui en gérera l'exécution.

### Continuous queries pour les measurements `*_1h`

- Consolidation pour le measurement `cpu`

```sql
CREATE CONTINUOUS QUERY cq_cpu_1h ON hydda2
BEGIN
 
	SELECT MIN("usage") AS "min_usage", MAX("usage") AS "max_usage", MEAN("usage") AS "avg_usage", MIN("usage_mhz") AS "min_usage_mhz", MAX("usage_mhz") AS "max_usage_mhz", MEAN("usage_mhz") AS "avg_usage_mhz", MIN("idle") AS "min_idle", MAX("idle") AS "max_idle", MEAN("idle") AS "avg_idle", MIN("demand") AS "min_demand", MAX("demand") AS "max_demand", MEAN("demand") AS "avg_demand", MIN("used") AS "min_used", MAX("used") AS "max_used", MEAN("used") AS "avg_used", MIN("ready") AS "min_ready", MAX("ready") AS "max_ready", MEAN("ready") AS "avg_ready", MIN("costop") AS "min_costop", MAX("costop") AS "max_costop", MEAN("costop") AS "avg_costop"
	INTO cpu_1h
	FROM cpu 
	GROUP BY time(1h), uuid
	
END

```


- Consolidation pour le measurement `ram`

```sql
CREATE CONTINUOUS QUERY cq_ram_1h ON hydda2
BEGIN

	SELECT MIN("usage") AS "min_usage", MAX("usage") AS "max_usage", MEAN("usage") AS "avg_usage", MIN("active") AS "min_active", MAX("active") AS "max_active", MEAN("active") AS "avg_active", MIN("consumed") AS "min_consumed", MAX("consumed") AS "max_consumed", MEAN("consumed") AS "avg_consumed" 
	INTO ram_1h 
	FROM ram 
	GROUP BY time(1h), uuid

END
```


- Consolidation pour le measurement `disk`

```sql
CREATE CONTINUOUS QUERY cq_disk_1h ON hydda2
BEGIN
	
	SELECT MIN("total_read_latency") AS "min_total_read_latency", MAX("total_read_latency") AS "max_total_read_latency", MEAN("total_read_latency") AS "avg_total_read_latency", MIN("total_write_latency") AS "min_total_write_latency", MAX("total_write_latency") AS "max_total_write_latency", MEAN("total_write_latency") AS "avg_total_write_latency", MIN("total_read_latency") + MIN("total_write_latency") AS "min_rw_lattency", MAX("total_read_latency") + MAX("total_write_latency") AS "max_rw_lattency", MEAN("total_read_latency") + MEAN("total_write_latency") AS "avg_rw_lattency", MIN("read") + MIN("write") AS "min_io", MAX("read") + MAX("write") AS "max_io", MEAN("read") + MEAN("write") AS "avg_io"
	INTO disk_1h 
	FROM disk 
	GROUP BY time(1h), uuid
	
END
```


- Consolidation pour le measurement `net` (2 requêtes nécessaires donc 2 CQ)

```sql
CREATE CONTINUOUS QUERY cq_net_1h ON hydda2
BEGIN

	SELECT MIN("droppedrx") + MIN("droppedtx") AS "min_dropped", MAX("droppedrx") + MAX("droppedtx") AS "max_dropped", MEAN("droppedrx") + MEAN("droppedtx") AS "avg_dropped", MIN("received") + MIN("transmitted") AS "min_io", MAX("received") + MAX("transmitted") AS "max_io", MEAN("received") + MEAN("transmitted") AS "avg_io" 
	INTO net_1h
	FROM net
	GROUP BY time(1h), uuid

END

```

- Consolidation pour le measurement `power`

```sql
CREATE CONTINUOUS QUERY cq_power_1h ON hydda2
BEGIN

	SELECT MIN("power") AS "min_power", MAX("power") AS "max_power", MEAN("power") AS "avg_power" 
	INTO power_1h 
	FROM power 
	GROUP BY time(1h), uuid

END
```

### Continuous queries pour les measurements `*_thresholds`

- consolidation pour les seuils sur `cpu`

La consolidation sur les seuils nécessite d'être écrite en plusieurs requêtes. En effet les CQ doivent comporter une fonction d'agrégation dans la clause `SELECT`, par conséquent il n'est pas possible de faire une seule CQ avec un `SELECT *` sur plusieurs sous-requêtes.

```sql
CREATE CONTINUOUS QUERY cq_cpu_threshold_total ON hydda2
BEGIN
	SELECT COUNT("usage") AS "total"
	INTO "cpu_thresholds"
	FROM "cpu"
	GROUP BY time(1h), uuid
END

CREATE CONTINUOUS QUERY cq_cpu_threshold_2 ON hydda2
BEGIN
	SELECT COUNT("usage") AS "cpu_2"
	INTO "cpu_thresholds"
	FROM "cpu"
	WHERE "usage" >= 2
	GROUP BY time(1h), uuid
END

CREATE CONTINUOUS QUERY cq_cpu_threshold_5 ON hydda2
BEGIN
	SELECT COUNT("usage") AS "cpu_5"
	INTO "cpu_thresholds"
	FROM "cpu"
	WHERE "usage" >= 5
	GROUP BY time(1h), uuid
END

CREATE CONTINUOUS QUERY cq_cpu_threshold_10 ON hydda2
BEGIN
	SELECT COUNT("usage") AS "cpu_10"
	INTO "cpu_thresholds"
	FROM "cpu"
	WHERE "usage" >= 10
	GROUP BY time(1h), uuid
END

CREATE CONTINUOUS QUERY cq_cpu_threshold_30 ON hydda2
BEGIN
	SELECT COUNT("usage") AS "cpu_30"
	INTO "cpu_thresholds"
	FROM "cpu"
	WHERE "usage" >= 30
	GROUP BY time(1h), uuid
END

CREATE CONTINUOUS QUERY cq_cpu_threshold_70 ON hydda2
BEGIN
	SELECT COUNT("usage") AS "cpu_70"
	INTO "cpu_thresholds"
	FROM "cpu"
	WHERE "usage" >= 70
	GROUP BY time(1h), uuid
END

CREATE CONTINUOUS QUERY cq_cpu_threshold_90 ON hydda2
BEGIN
	SELECT COUNT("usage") AS "cpu_90"
	INTO "cpu_thresholds"
	FROM "cpu"
	WHERE "usage" >= 90
	GROUP BY time(1h), uuid
END

CREATE CONTINUOUS QUERY cq_cpu_threshold_100 ON hydda2
BEGIN
	SELECT COUNT("usage") AS "cpu_100"
	INTO "cpu_thresholds"
	FROM "cpu"
	WHERE "usage" >= 100
	GROUP BY time(1h), uuid
END
```


- consolidation pour les seuils sur `net`

```sql
CREATE CONTINUOUS QUERY cq_net_threshold_1 ON hydda2
BEGIN
	SELECT COUNT("droppedrx") AS "net_dropped_1"
	INTO "net_thresholds" 
	FROM "net"
	WHERE ("droppedrx" + "droppedtx" >= 1)
	GROUP BY time(1h), uuid
END

CREATE CONTINUOUS QUERY cq_net_threshold_5 ON hydda2
BEGIN
	SELECT COUNT("droppedrx") AS "net_dropped_5"
	INTO "net_thresholds" 
	FROM "net"
	WHERE ("droppedrx" + "droppedtx" >= 5)
	GROUP BY time(1h), uuid
END
```


- consolidation pour les seuils sur `disk`

```sql
CREATE CONTINUOUS QUERY cq_disk_threshold_20 ON hydda2
BEGIN
	SELECT COUNT("total_read_latency") AS "disk_latency_20"
	INTO "disk_thresholds" 
	FROM "disk"
	WHERE ("total_read_latency" + "total_write_latency" >= 20)
	GROUP BY time(1h), uuid
END

CREATE CONTINUOUS QUERY cq_disk_threshold_30 ON hydda2
BEGIN
	SELECT COUNT("total_read_latency") AS "disk_latency_30"
	INTO "disk_thresholds" 
	FROM "disk" 
	WHERE ("total_read_latency" + "total_write_latency" >= 30) 
	GROUP BY time(1h), uuid
END
```


- consolidation pour les seuils sur `ram`

```sql
CREATE CONTINUOUS QUERY cq_ram_threshold_total ON hydda2
BEGIN
	SELECT COUNT("usage") AS "total"
	INTO "ram_thresholds" 
	FROM "ram"
	GROUP BY time(1h), uuid	
END

CREATE CONTINUOUS QUERY cq_ram_threshold_2 ON hydda2
BEGIN
	SELECT COUNT("usage") AS "ram_2"
	INTO "ram_thresholds" 
	FROM "ram"
	WHERE "usage" >= 5
	GROUP BY time(1h), uuid	
END

CREATE CONTINUOUS QUERY cq_ram_threshold_5 ON hydda2
BEGIN
	SELECT COUNT("usage") AS "ram_5"
	INTO "ram_thresholds" 
	FROM "ram"
	WHERE "usage" >= 5
	GROUP BY time(1h), uuid	
END

CREATE CONTINUOUS QUERY cq_ram_threshold_10 ON hydda2
BEGIN
	SELECT COUNT("usage") AS "ram_10"
	INTO "ram_thresholds" 
	FROM "ram"
	WHERE "usage" >= 10
	GROUP BY time(1h), uuid	
END

CREATE CONTINUOUS QUERY cq_ram_threshold_30 ON hydda2
BEGIN
	SELECT COUNT("usage") AS "ram_30"
	INTO "ram_thresholds" 
	FROM "ram"
	WHERE "usage" >= 30
	GROUP BY time(1h), uuid	
END

CREATE CONTINUOUS QUERY cq_ram_threshold_70 ON hydda2
BEGIN
	SELECT COUNT("usage") AS "ram_70"
	INTO "ram_thresholds" 
	FROM "ram"
	WHERE "usage" >= 70
	GROUP BY time(1h), uuid	
END

CREATE CONTINUOUS QUERY cq_ram_threshold_90 ON hydda2
BEGIN
	SELECT COUNT("usage") AS "ram_90"
	INTO "ram_thresholds" 
	FROM "ram"
	WHERE "usage" >= 90
	GROUP BY time(1h), uuid	
END

CREATE CONTINUOUS QUERY cq_ram_threshold_100 ON hydda2
BEGIN
	SELECT COUNT("usage") AS "ram_100"
	INTO "ram_thresholds" 
	FROM "ram"
	WHERE "usage" >= 10
	GROUP BY time(1h), uuid	
END
```

### Test des continous queries

Entre 8 et 11h (GMT+2), le jeudi 17 mai, le script de réinsertion des données se trouvant dans le dossier `fixtures` a été lancé.

Il a tournée un première fois à une cadence de 60s entre chaque réinsertion pendant plus d'une heure.

Plus tard dans la matiné, il fut relancé 4 fois, sur des périodes plus courtes, à des cadences de 1s à 3ms soit 345 à 115 000 écritures par secondes.

La [page de recommendation de dimenssionnement matériel](https://docs.influxdata.com/influxdb/v1.4/guides/hardware_sizing/) de la documentation indique pour notre configuration un plafond de :

- 5 000 écritures / secondes pour un cpu deux coeurs
- 250 000 écritures / secondes pour pour 8 go de ram

Or suite aux tests on constate que la machine est bien quelque part entre les deux, elle supporte sans 
problème les 11 500 écritures/sec mais a du mal pour 1125 000 écritures/sec.


### Conseils pour écrire des CQ

Comme indiqué précédemment les CQ doivent contenir une [fonction d'agrégation](https://docs.influxdata.com/influxdb/v1.4/query_language/functions#aggregations) dans la clause `SELECT`.

Si on insère une CQ avec une erreur, elle ne sera détectée qu'à l'exécution. Les erreurs sont indiquées dans les logs. Pour consulter les logs d'Influx, il faut utiliser la commande bash `journalctl -u influxdb.service` (il peut être nécessaire d'avoir les droits de super utilisateur)

