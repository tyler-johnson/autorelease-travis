BIN = ./node_modules/.bin
SRC = $(wildcard src/*)
SRC_OUT = $(SRC:src/%.js=%.js)

build: $(SRC_OUT)

%.js: src/%.js
	$(BIN)/rollup $< -c -f cjs > $@

clean:
	rm -f $(SRC_OUT)

.PHONY: build clean
