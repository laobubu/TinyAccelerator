JS_RUNTIME = node

SRC_DIR = src
DST_DIR = dist

SPECIAL_FILES = _locales.json

FILES := $(shell cd $(SRC_DIR) && find -name '*' )
FILES := $(subst ./,,$(FILES))
FILES := $(filter-out $(SPECIAL_FILES),$(FILES))

SRC_FILES = $(addprefix $(SRC_DIR)/, $(FILES))
DST_FILES = $(addprefix $(DST_DIR)/, $(FILES))

.PHONY: all dist

all: dist

dist: $(DST_DIR)/_locales $(DST_FILES)

$(DST_DIR)/_locales: $(SRC_DIR)/_locales.json
	@rm -rf $(DST_DIR)/_locales
	@mkdir -p $(DST_DIR)/_locales
	$(JS_RUNTIME) tools/generate_locales.js $(SRC_DIR)/_locales.json $(DST_DIR)/_locales

$(DST_DIR)/%: $(SRC_DIR)/%
	cp -R $< $@
