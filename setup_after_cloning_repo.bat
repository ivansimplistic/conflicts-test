git config core.hooksPath .githooks

REM Disabled because subtree is being pushed to the main repo, and this is not wanted.
REM git remote add -f uno-cursor-rules https://github.com/Simplistic-GE/uno-cursor-rules
REM git merge -s ours --no-commit --allow-unrelated-histories uno-cursor-rules/main
REM git read-tree --prefix= -u uno-cursor-rules/main
REM git commit -m "Subtree merged in uno-cursor-rules"
REM git subtree pull --prefix=.cursor/rules/ uno-cursor-rules main

pause
