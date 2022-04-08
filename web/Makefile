PATH := node_modules/.bin:${PATH}
.PHONY: all dev clean dev
include .env.dev
export

SRC := ./src
DIST := ./dist

ifeq ($(SSL), true)
PROTOCOL := HTTPS
else
PROTOCOL := HTTP
endif
URL := $(PROTOCOL)://$(HOST):$(PORT)

cert:
		openssl req -x509 -new -config ./certs/openssl.conf -out ./certs/cert.pem -keyout ./certs/key.pem

clean:
		rm -rf $(DIST)/*

manifest:
		cp -r $(SRC)/manifest/* $(DIST)

dev-server:
		node server/main

dev-disk:
		export writeToDisk="true" && webpack serve --config webpack.dev.js

build-dev: clean manifest
		webpack --config webpack.dev.js

build-prod: clean manifest
		webpack --config webpack.prod.js
		

nodeserve:
		http-server $(DIST) -p $(PORT)

nodeserve-https:
		http-server $(DIST) -S -C ./certs/cert.pem  -K ./certs/key.pem -p $(PORT)

chrome:
		./chrome-linux/chrome \
		--incognito\
		--user-data-dir=./chrome-data-temp\
		--ignore-urlfetcher-cert-requests\
		--unsafely-treat-insecure-origin-as-secure=$(URL)\
		"$(URL)"

twa:
		bubblewrap init --manifest $(URL)/twa-manifest.json