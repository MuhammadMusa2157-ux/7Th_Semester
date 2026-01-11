print("hello word ")

n=int(input("Enter the  number  : "))
s=int(input("Enter the  end number  : "))

m=int(input(" Enter the divisor number  : "))

for i in range(n, s):
    if i%m ==0:
        print(i)
        i+1

