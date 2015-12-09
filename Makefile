all: chromium

chromium: inject.js endarken.css
	cp $^ $@/
	@touch $@

