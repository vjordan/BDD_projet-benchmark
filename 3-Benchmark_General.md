# EasyVirt - InfluxDB

## Benchmark général

* [InfluxDB requires as much virtual memory as it's 'data' set size](https://github.com/influxdata/influxdb/issues/9221)

### Gestion de la mémoire

Le point de départ pour ce qui suit est la réquête suivante :

```sql
SELECT MEAN(*) FROM cpu_1h GROUP BY uuid
```

Cette requête nous a amené à nous interroger sur comment InfluxDB gère la mémoire pour la raison qui suit.  
Exécutez la une première fois et après un peu plus d'une minute vous aurez le résultat.  
Exécutez la une deuxième et l'on **consomera toute la ram disponible** sur la machine, vous êtes bon pour tuer la requête et redémarer InfluxDB.

Il semble que InfluxDB ne libère pas immédiatement la mémoire des éléments chargés pour une réquête qui a été traitée et réutilise pas non plus ces données pour la même requête.

Cette requête doit passer en revue un peu moins de **8 millions de points**.

Depuis la version 1.4 on peut en apprendre plus sur les réquêtes avec les mots clé `EXPLAIN` et `EXPLAIN ANALYZE` de la façon suivante :

`EXPLAIN` seul détaillera l'ensemble des expréssions à évaluer pour répondre à la requête et le nombre de shards, series, fichiers et blocks impliqués
pour chacune d'elles.

```
EXPLAIN SELECT MEAN(*) FROM cpu_1h GROUP BY uuid

QUERY PLAN
----------
EXPRESSION: mean(avg_costop::float)
NUMBER OF SHARDS: 51
NUMBER OF SERIES: 50998
CACHED VALUES: 0
NUMBER OF FILES: 13011
NUMBER OF BLOCKS: 13011
SIZE OF BLOCKS: 1920608

EXPRESSION: mean(avg_demand::float)
NUMBER OF SHARDS: 51
NUMBER OF SERIES: 50998
CACHED VALUES: 0
NUMBER OF FILES: 50988
NUMBER OF BLOCKS: 50988
SIZE OF BLOCKS: 58011155

// ...
```

`EXPLAIN ANALYZE` éxécutera la requête et détaillera sous forme d'arbre le temps total d'éxécution en plus de tout les détails liés aux opérations réalisées.

```
EXPLAIN ANALYZE SELECT MEAN(*) FROM cpu_1h GROUP BY uuid

EXPLAIN ANALYZE
---------------
.
└── select
    ├── execution_time: 1.928125286s
    ├── planning_time: 7.994043479s
    ├── total_time: 9.922168765s
    └── field_iterators
        ├── labels
        │   └── statement: SELECT mean(avg_costop::float) AS mean_avg_costop, // ...
        ├── expression
        │   ├── labels
        │   │   └── expr: mean(avg_costop::float)
        │   ├── create_iterator
        │   │   ├── labels
        │   │   │   ├── measurement: cpu_1h
        │   │   │   └── shard_id: 18
        │   │   ├── cursors_ref: 1091
        │   │   ├── cursors_aux: 0
        │   │   ├── cursors_cond: 0
        │   │   ├── float_blocks_decoded: 278
        │   │   ├── float_blocks_size_bytes: 47970
        │   │   ├── integer_blocks_decoded: 0
        │   │   ├── integer_blocks_size_bytes: 0
        │   │   ├── unsigned_blocks_decoded: 0
        │   │   ├── unsigned_blocks_size_bytes: 0
        │   │   ├── string_blocks_decoded: 0
        │   │   ├── string_blocks_size_bytes: 0
        │   │   ├── boolean_blocks_decoded: 0
        │   │   ├── boolean_blocks_size_bytes: 0
        │   │   └── planning_time: 340.270485ms
        │   ├── create_iterator
        │   │   ├── labels
        │   │   │   ├── measurement: cpu_1h
        │   │   │   └── shard_id: 19
        │   │   ├── cursors_ref: 1064
        // ...
```

* Au lancement de InfluxDB, un peu moins d'un giga de mémoire est occupé.
* Après éxécution de la requête, 6.5 giga de mémoire sur les 7.8 sont occupés.
* Après plus d'une dizaine de minute la mémoire est occupé à 3.4 giga, une partie à donc été libérée.

Les **questions posées** sont les suivantes :

* Peut empêcher les requêtes nécessitants plus de mémoire que disponible ?
* Peut on faire en sorte que InfluxDB évite de laisser des éléments apparements inutiles en mémoire ?

Solutions :

Pour empêcher les requêtes on peut définir dans la configuration un nombre de points maximum, au dela les requêtes ne seront pas éxécutées.
Cependant cela n'empêche pas que la mémoire puisse se remplir jusqu'a épuisement.

#### Comparaison avec mysql

Cette requête est l'équivalent de :

```sql
SELECT uuid, AVG(avg_costop), AVG(avg_demand), AVG(avg_idle), AVG(avg_ready), AVG(avg_usage), AVG(avg_usage_mhz), AVG(avg_used), AVG(max_costop), AVG(max_demand), AVG(max_idle), AVG(max_ready), AVG(max_usage), AVG(max_usage_mhz), AVG(max_used), AVG(min_costop), AVG(min_demand), AVG(min_idle), AVG(min_ready), AVG(min_usage), AVG(min_usage_mhz), AVG(min_used) 
FROM cpu_1h 
GROUP BY uuid;
```

C'est tout de suite un peu plus verbeux.

La requête ne provoque aucune augmentation dans l'occupation de la ram et prend un peu plus de 6 min la première fois et 2min30 les fois suivantes.
