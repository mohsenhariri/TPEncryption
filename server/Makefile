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


clean:
		rm -rf $(DIST)/*


dev-server:
		node main
