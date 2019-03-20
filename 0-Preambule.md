# EasyVirt - InfluxDB

## Préambule

### TSDB : Time Series Database, Base de données de séries temporelles

#### Série temporelle

- série temporelle = évolution d'une donnée au cours du temps
- valeurs toujours indexées par le temps (abscisse : temps, date ; ordonnée : valeur)

- exemples : relevé de température au cours de la journée, relevé du cours d'une bourse, relevé de la charge CPU au cours du temps

#### Base de données de séries temporelles

- une donnée : un timestamp, une ou des valeurs pour décrire la mesure, des méta-données

- base de données optimisée pour manipuler de telles séries
- requêtes se font toujours selon le temps
- utile pour mesurer les évolutions au cours du temps

- fonctionnalités particulières :
  + analyse en temps réel des données : traitement de flux de données
  + traitement de grands volumes de données
  + fonctions d'agrégation (sommes, moyennes, médiane, …) très efficaces
  + gestion de la durée de conservation des données

- les premières TSDB étaient faites pour analyser des données sur les marchés financiers

Évolution des besoins : pourquoi y a-t-il besoin de TSDB ?
- aujourd'hui émission de flux de données importants car on ne gère plus une machine centrale (mainframe) mais un nombre conséquent de machines virtuelles, + développement de l'internet des objets. Il faut être en capacité de stocker et analyser en temps réel ces grands volumes de données pour effectuer un monitoring efficace.
- avoir des données détaillées pour une courte période de temps (analyse en temps réel, lever des alertes), puis agréger ces données pour conserver un historique (pas besoin de beaucoup de détails sur d'anciennes données)

### InfluxDB : implémentation moderne d'une TSDB

#### Présentation d'InfluxDB

- Développée par l'entreprise InfluxData
- écrit en Go
- distribué sous licence MIT
- Près de 300 contributeurs, 13K commits : projet actif
- Fait partie d'une plateforme (4 composants dont InfluxDB) permettant la collecte des données, la visualisation et la gestion d'alertes
- langage de requêtage : InfluxQL, syntaxe ressemblant à SQL

#### Particularités

- stockage des données --> montrer schéma du measurement disk
  + schéma de données : measurement, tags, fields. Fields non indexés, tags oui. dans un measurement on peut insérer des données avec des fields/set en plus ou en moins --> pas de schéma strict comme en SQL
  + measurement = table en SQL
  + série : EXPLIQUER
  + timestamps en nanosecondes
  + stockage des données par "paquets" (shards) qui regroupent les données de *tous* les measurements pour un intervalle de temps & pour une RP

- CLI, API HTTP pour insérer des données depuis un programme

- Retention policies (RP, politiques de conservation)
  + détermine la durée de conservation des données d'un measurement (1h, 1 an, …).
  + Quand une donnée est insérée, elle restera dans le measurement le temps déterminé par la RP, puis est supprimé par InfluxDB (suppression d'un shard en entier)
  + par défaut : pas de suppression des anciennes données

- Continuous Queries (CQ)
  + requêtes écrites en InfluxQL, exécutées automatiquement par InfluxDB, de manière périodique
  + requêtes s'appliquent aux nouvelles données insérées sur la base
  + Principe : faire des calculs sur les nouvelles données, insérer les données issues de ces calculs dans un nouveau measurement = agrégation en temps réel


### Avantages & inconvénients

#### Avantages

- manipulation de gros volumes de données
- performance importante en écriture
- gestion de la durée de vie des données simple
- fonctions d'agrégation à disposition, efficaces

#### Inconvénients



