This github repository is for uploading hacksingapore 2024 x DBS attempt for track


<h1>Smart Contract</h1>
Factory Contract:
0x4B6772a737eCC47326911b7073d7D079A94D80F8

Example poap:
0x32ebd51365C4591b2c300f6C76074910E876fdf1


to deploy the contracts:
'yarn hardhat deploy --network sepolia'

<h1>Backend settings</h1>
<h3>Node Requirements:</h3>
cd /frontend
npm install

<h3>Environment File (.env)</h3>
DB_DBHOST=localhost
DB_USER=<user>
DB_PASS=<secret>
DB_DBNAME=<database name>
INFURA_API_KEY=<key>
INFURA_KEY_SECRET=<secret>
JIGSAWSTACK_API_KEY=<key>

<h3>MySQL Requirements:</h3>

CREATE DATABASE <database name>

CREATE TABLE EVENTS (
  EID int NOT NULL AUTO_INCREMENT,
  NAME varchar(256) NOT NULL,
  INFO text NOT NULL,
  PLACE text NOT NULL,
  START date NOT NULL,
  END date DEFAULT NULL,
  POAP varchar(40) NOT NULL,
  POSTER longblob DEFAULT NULL,
  PRIMARY KEY (EID)
);
