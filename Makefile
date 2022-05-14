


clean:
		rm -rf ./* -v Makefile
		git checkout main ./web/dist
		mv ./web/dist/* ./

