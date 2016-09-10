#!/bin/bash

date > ./run.log
nohup nodejs ./listener.js >> ./run.log 2>&1  &
