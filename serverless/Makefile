build:
	npx webpack --config webpack.config.js
	rm -f build/execute-update-request.zip
	cd execute-update-request && zip -r ../build/execute-update-request.zip .

.PHONY: build
