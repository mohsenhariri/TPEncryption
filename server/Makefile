PATH := node_modules/.bin:${PATH}
.PHONY: all dev clean dev
#!/usr/bin/env node
NODE := /usr/bin/node

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


%: # https://www.gnu.org/software/make/manual/make.html#Automatic-Variables 
		@:

clean:
		rm -rf $(DIST)/*

npmid:
		npm i

npmip:
		npm ci

setup:
		if [ ! -d $(path_input_img) ]; then mkdir $(path_input_img); fi
		# if [ ! -d $(path_out_encrypted) ]; then mkdir $(path_out_encrypted); fi

dev-server:
		$(NODE) main


