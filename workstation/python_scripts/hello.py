import sys

input("enter: ")


for line in sys.stdin:
    if 'q' == line.rstrip():
        break
    print(f'Input : {line}')
