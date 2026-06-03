
#!/usr/bin/env bash
trap 'exit 130' INT
for f in .block/*.remote.json; do
  name="$(basename "$f" .remote.json)"
  echo -e "\n\033[33m⚡ Releasing $name...\033[0m"
  block release --remote "$name"
done