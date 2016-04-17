#!/usr/bin/env bash

set -eu

FILES=`find . -name \*.haml -print`
for haml in $FILES; do
    dest=build/`basename ${haml} haml`html
    haml $haml $dest
done

