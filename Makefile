JS_RUNTIME = node

SRC_DIR = src
DST_DIR = dist

SPECIAL_FILES = . _% %.scss

FILES := $(shell cd $(SRC_DIR) && find -name '*' )
FILES := $(subst ./,,$(FILES))
FILES := $(filter-out $(SPECIAL_FILES),$(FILES))

SCSS_FILES := $(shell find $(SRC_DIR) -name '_*.scss' )

SRC_FILES = $(addprefix $(SRC_DIR)/, $(FILES))
DST_FILES = $(addprefix $(DST_DIR)/, $(FILES))

.PHONY: all dist

all: dist

dist: $(DST_DIR)/_locales $(DST_DIR)/config/config.css $(DST_FILES)

$(DST_DIR)/_locales: $(SRC_DIR)/_locales.json
	@rm -rf $(DST_DIR)/_locales
	@mkdir -p $(DST_DIR)/_locales
	$(JS_RUNTIME) tools/generate_locales.js $(SRC_DIR)/_locales.json $(DST_DIR)/_locales

$(DST_DIR)/config/config.css: $(SCSS_FILES) $(SRC_DIR)/config/config.scss
	node-sass --output-style compressed $(SRC_DIR)/config/config.scss $(DST_DIR)/config/config.css

$(DST_DIR)/%: $(SRC_DIR)/%
	[ -f $< ] && cp -R $< $@ || mkdir -p $@
