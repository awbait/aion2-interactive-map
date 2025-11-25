#!/bin/sh
echo "Injecting runtime env variables..."
for i in $(env | grep A2_APP_)
do
	key=$(echo $i | cut -d '=' -f 1)
	value=$(echo $i | cut -d '=' -f 2-)
	echo "Replacing $key -> $value"
	# Вставить во все .js и .css
	find /usr/share/angie/html -type f \( -name '*.js' -o -name '*.css' \) -exec sed -i "s|${key}|${value}|g" '{}' +
done
echo "Injecting completed."
exec "$@"
