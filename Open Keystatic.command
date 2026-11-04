#!/bin/zsh
# Double-click this file in Finder to open the Elyon site editor (Keystatic).
# It starts the local dev server if it isn't already running, then opens the editor.

cd "$(dirname "$0")"
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

URL="http://localhost:4321/keystatic"

if ! curl -s -o /dev/null "$URL"; then
	echo "Starting the Elyon dev server..."
	npx astro dev --background

	for i in {1..60}; do
		curl -s -o /dev/null "$URL" && break
		sleep 1
	done
fi

open "$URL"
echo "Keystatic is open at $URL"
echo "To stop the server later, run: npx astro dev stop"
