all:
	python -m SimpleHTTPServer 8000 &
	inliner http://0.0.0.0:8000/risky.html > minirisky.html
	pkill python

test:
	python -m SimpleHTTPServer 8000 &

kill:
	pkill python
