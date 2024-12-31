# script used to help cleanup the latex reference

import json
import re
import sys


def add_brackets(cmd):
    name = cmd["name"]
    description = cmd["description"]

    stripped_name = name.replace("\\", "")

    max_arg = 0
    for i in range(1, 10):
        pattern = rf"{re.escape(stripped_name)}\s*#{i}"
        if re.search(pattern, description):
            max_arg = i
            print(f"found {i} in {pattern}")

    if max_arg > 0:
        cmd["name"] = name + "{}" * max_arg


def dedupe_examples(cmd):
    cmd["examples"] = list(set(cmd["examples"]))


def process_latex_commands(filename):
    with open(filename, "r", encoding="utf-8") as f:
        commands = json.load(f)

    for cmd in commands["symbols"]:
        # operation goes here
        dedupe_examples(cmd)

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(commands, f, indent=4, ensure_ascii=False)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python process_latex.py <filename>")
        sys.exit(1)

    filename = sys.argv[1]
    process_latex_commands(filename)
    print(f"Processed {filename} successfully.")
