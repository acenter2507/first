prefix_1="Commited from "
current_user="$(whoami)"
prefix_2=" at "
current_time="$(date)"

commit_msg=$prefix_1$current_user$prefix_2$current_time
git add -A && git commit -m  "$commit_msg"
git push origin master