JS_RUNTIME = node

SRC_DIR = src
DST_DIR = dist

SPECIAL_FILES = . _% %.scss

FILES := $(shell cd $(SRC_DIR) && find -name '*' )
FILES := $(subst ./,,$(FILES))

FILES_SCSS := $(filter %.scss, $(FILES))
FILES := $(filter-out $(SPECIAL_FILES),$(FILES))

SRC_FILES := $(addprefix $(SRC_DIR)/, $(FILES))
DST_FILES := $(addprefix $(DST_DIR)/, $(FILES))

SRC_FILES_SCSS := $(addprefix $(SRC_DIR)/, $(FILES_SCSS))
DST_FILES_SCSS := $(addprefix $(DST_DIR)/, $(FILES_SCSS:.scss=.css))

define dynamic-bind
$(2): $(1)
endef

.PHONY: all clean dist pack i18n scss normal_files

all: dist

dist: i18n scss normal_files
i18n: $(DST_DIR)/_locales
normal_files: $(DST_FILES)
scss: $(DST_FILES_SCSS)

clean:
	rm -rf $(DST_DIR)

pack: dist
	@$(SHELL) tools/pack.sh

$(DST_DIR)/_locales: $(wildcard $(SRC_DIR)/_locales/*)
	-rm -rf $(DST_DIR)/_locales
	-mkdir -p $(DST_DIR)/_locales
	$(JS_RUNTIME) tools/generate_locales.js $(SRC_DIR)/_locales $(DST_DIR)/_locales

$(foreach scss, $(FILES_SCSS), $(eval $(call dynamic-bind, $(SRC_DIR)/$(scss), $(DST_DIR)/$(scss:.scss=.css) )))
$(DST_FILES_SCSS): 
	node-sass --output-style compressed $< $@

$(DST_DIR)/%.html: $(SRC_DIR)/%.html
	>$@ grep -vP '^<!--discard-->' $<

$(DST_DIR)/%: $(SRC_DIR)/%
	@[ -f $< ] && cp -R $< $@ || mkdir -p $@
