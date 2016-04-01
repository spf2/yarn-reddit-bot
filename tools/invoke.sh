#!/bin/sh


curl -v \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"mention": {"message": {"text": "@reddit aww"}}}'\
  http://localhost:3000

echo
