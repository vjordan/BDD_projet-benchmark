# EasyVirt - InfluxDB

## Benchmark des requêtes demandées

Pour les requêtes sur des périodes de temps, nous avons utilisé un jour, ou un mois dont nous étions sûr qu'il comportait des données.

Requête bash utilisée pour réaliser le benchmark :

```bash
# Commande time avec formatage custom
export TIME=" %C \n Temps ecoule : %E \n CPU : %P \n Memoire residente (physique) maximum (kb) : %M \n"
/usr/bin/time influx -database 'hydda2' -execute "Requete souhaité" > /dev/null
```

**Correction** : après découverte du mot clé `EXPLAIN ANALYZE`, nous l'avons utilisé pour déterminé la durée des réquêtes.

L'utilitaire `htop` était utilisé pour surveiller les ressources en temps réel.

Les mesure qui suivent ne sont valables que dans le contexte de la machine utilisée :

* CPU
  * Intel(R) Xeon(R) CPU E5-2676 v3 @ 2.40GHz
  * 2 unités de calcul dispo sur les 12 coeurs/24 threads
  * Superviseur Xen
* Mémoire
  * Ram : 8go
  * Swap : aucun (!)
* Disque : 214go, SSD

### A partir des measurements *_1h

Obtenir la moyennes de toutes les valeurs regroupées par uuid (Attention car requete sur environ 12 millions de lignes) :

```sql
SELECT MEAN(*) FROM cpu_1h GROUP BY uuid
-- 21 Fields, 7.9 millions de points
-- Durée : 1 min et 09 sec 
-- Equivalent MySQL : 3 min 19 sec
```

Otenir la moyenne, le min et le max de toutes les valeurs en une journée regroupées par uuid :

```sql
SELECT MEAN(*) FROM cpu_1h WHERE time > '2017-03-01T00:00:00Z' AND time < '2017-03-02T00:00:00Z' GROUP BY uuid
-- 21 Fields, 23 440 points
-- Durée : 0.85 sec
-- Equivalent MySQL : 0.15 sec

SELECT MIN(*) FROM cpu_1h WHERE time > '2017-03-01T00:00:00Z' AND time < '2017-03-02T00:00:00Z' GROUP BY uuid
-- Durée : 0.91 sec
-- Equivalent MySQL : 0.10 sec

SELECT MAX(*) FROM cpu_1h WHERE time > '2017-03-01T00:00:00Z' AND time < '2017-03-02T00:00:00Z' GROUP BY uuid
-- Durée : 0.86 sec
-- Equivalent MySQL : 0.10 sec

```

Pareil pour 1 mois :

```sql
SELECT MEAN(*) FROM cpu_1h WHERE time > '2017-03-01T00:00:00Z' AND time < '2017-04-01T00:00:00Z' GROUP BY uuid
-- 21 Fields, 64 0470 points
-- Durée : 4.83 sec
-- Equivalent MySQL : 6.23 sec

SELECT MIN(*)  FROM cpu_1h WHERE time > '2017-03-01T00:00:00Z' AND time < '2017-04-01T00:00:00Z' GROUP BY uuid
-- Durée : 5.01
-- Equivalent MySQL : 4.96 sec

SELECT MAX(*)  FROM cpu_1h WHERE time > '2017-03-01T00:00:00Z' AND time < '2017-04-01T00:00:00Z' GROUP BY uuid
-- Durée : 4.92 sec
-- Equivalent MySQL : 4.92 sec
```

### A partir des measurements *_threshold

Obtenir la somme de tous les points regroupées par uuid :

```sql
SELECT SUM(total) FROM cpu_thresholds GROUP BY uuid
-- 8 Fields, 7 958 350 points
-- Durée : 2.4 sec
```

Obtenir la somme de tous les points en une journée regroupées par uuid :

```sql
SELECT SUM(total) FROM cpu_thresholds WHERE time > '2017-03-01T00:00:00Z' AND time < '2017-03-02T00:00:00Z' GROUP BY uuid
-- 8 Fields, 23 400 points
-- Durée : 0.37 sec
```

Pareil pour 1 mois :

```sql
SELECT SUM(total) FROM cpu_thresholds WHERE time > '2017-03-01T00:00:00Z' AND time < '2017-04-01T00:00:00Z' GROUP BY uuid
-- 8 Fields, 640 000 points
-- Durée : 0.21 sec
```
