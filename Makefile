bundle:
	./node_modules/.bin/jshint src/*; ./node_modules/.bin/browserify src/index.js --standalone index > build/index.js
