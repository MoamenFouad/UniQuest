# Task 1 :
import threading
import time

def send_log(server_id):
    print(f"Sending log to Server {server_id}...")
    time.sleep(0.1)
    print(f"Log sent to Server {server_id} successfully.")

def run_sequential(num_servers):
    start = time.time()
    for i in range(num_servers):
        send_log(i)
    return time.time() - start

def run_threaded(num_servers):
    start = time.time()
    threads = []
    for i in range(num_servers):
        t = threading.Thread(target=send_log, args=(i,))
        threads.append(t)
        t.start()
    
    for t in threads:
        t.join()
    return time.time() - start


servers = 5
print(" Starting Sequential")
seq_time = run_sequential(servers)

print("Starting Threaded")
thr_time = run_threaded(servers)

print(f"Sequential Time: {seq_time:.2f}s")
print(f"Threaded Time: {thr_time:.2f}s")



# Task 2:

balance = 1000
lock = threading.Lock()

def withdraw_without_lock(amount):
    global balance
    if balance >= amount:
        temp = balance
        time.sleep(0.1)
        temp -= amount
        balance = temp
        print(f"Withdrew {amount}, Remaining Balance: {balance}")
    else:
        print(f"Insufficient balance to withdraw {amount}. Current Balance: {balance}")

def withdraw_with_lock(amount):
    global balance
    with lock:
        if balance >= amount:
            temp = balance
            time.sleep(0.1)
            temp -= amount
            balance = temp
            print(f"Withdrew {amount}, -> Remaining Balance: {balance}")
        else:
            print(f"Insufficient balance to withdraw {amount}. -> Current Balance: {balance}")

print("\nWithout Lock (Race Condition)")
balance = 1000
threads = []

for _ in range(5):
    t = threading.Thread(target=withdraw_without_lock, args=(300,))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

print(f"Final Balance (without lock): {balance}")

print("\nWith Lock (Synchronized)")
balance = 1000
threads = []

for _ in range(5):
    t = threading.Thread(target=withdraw_with_lock, args=(300,))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

print(f"Final Balance (with lock): {balance}")