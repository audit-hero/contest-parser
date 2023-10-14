#!/bin/bash
bash ~/.ssh/switch-github-user.sh slightscan
cd /Users/tonis/workspace/js/audit-hero/oss/contest 
gpsa
git rev-parse HEAD | pbcopy # git copy cp last commit sha ref
cd /Users/tonis/workspace/js/audit-hero/parsers
yw contest add "contest-parser@audit-hero/contest-parser#commit=$(pbpaste)" 

