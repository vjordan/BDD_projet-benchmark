# Innovez avec les startups: EasyVirt - InfluxDB

## Nom startup :
EasyVirt

## Nom sujet :

Comparatif de bases de données pour les systèmes de surveillance
## Objectif :

Evaluer une solution de base de données de séries temporelles (InfluxDB) dans le contexte d'une application de monitoring d'infrastructures Cloud virtualisées afin de pouvoir la comparer avec une base de données relationnelle (MySQL).

## Contexte, problématique, description du sujet :
La société EasyVirt offre des solutions de pilotage des serveurs virtualisés. Pour cela ils récoltent, stockent de grandes quantités de métriques sous la forme de séries temporelles, puis effectuent divers calculs dessus. Ils utilisent à l'heure actuelle des bases de données relationnelles (MySQL), une solution robuste et mature, cependant celles-ci ne sont pas adaptées aux nouveaux besoins de granularité plus fine et donc de l'explosion des quantités récoltées.
Récemment des systèmes de bases de données plus appropriées aux séries temporelles sont apparus, des TSDB (Base de données de séries temporelles en anglais), qui semblent prometteurs mais moins matures.
L'objectif est donc de tester cette solution avec les données de la société afin d'analyser les performances et de pouvoir les comparer aux bases de données relationnelles en vigueur afin d'envisager une migration vers cette solution.

## Livrables, réalisation code, doc techniques :
* Prise en main d'InfluxDB et de la base de données fournis
* Scripts de consolidation de la base de données
* Démarche et résultats de benchmarks
* Implémentation des continuous queries
* Comparaison des performances de stockage, lecture et écriture

## Environnement technologique :
* Linux (Ubuntu 16.04)
* Git
* MySQL 5.x
* InfluxDB 1.4
* Bash
* NodeJS 8.x

