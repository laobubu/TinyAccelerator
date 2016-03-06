#!/bin/sh

PACKVER=`grep -Po '\d+\.\d+\.\d+' dist/manifest.json`

echo "Pack ${PACKVER}"
git tag -f "v${PACKVER}"

rm -f dist/libs/vue/vue.js
sed -i dist/config/config.html -e 's/vue.js/vue.min.js/'

for i in `find dist \( -name '*.js' ! -name '*.min.js' \)`
do
    uglifyjs -m -c drop_console $i -o $i
done

ZIPFILE="misc/v${PACKVER}.zip"
[ ! -d misc ] && mkdir misc
(cd dist && 7z a ../$ZIPFILE *)

echo "------------------------------"
echo "Done. file saved to ${ZIPFILE}"
