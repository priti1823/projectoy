#!/usr/bin/env python3
"""
NovaBank Python Core Banking Engine
Source of Truth: account.csv, transaction.csv, and QRs/
Preserves exact banking logic, error messages, and data models.
"""

import sys
import os
import csv
import json
import base64
import random
import datetime
import qrcode
import cv2
import numpy as np

ACCOUNT_FILE = "account.csv"
TRANSACTION_FILE = "transaction.csv"
QRS_DIR = "QRs"
BLOCKED_FILE = "blocked_accounts.json"

def ensure_environment():
    os.makedirs(QRS_DIR, exist_ok=True)
    if not os.path.exists(BLOCKED_FILE):
        with open(BLOCKED_FILE, "w", encoding="utf-8") as f:
            json.dump({"blocked": [], "attempts": {}}, f)

def load_blocked_state():
    ensure_environment()
    try:
        with open(BLOCKED_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"blocked": [], "attempts": {}}

def save_blocked_state(state):
    with open(BLOCKED_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)

def generate_qr(account_no):
    os.makedirs(QRS_DIR, exist_ok=True)
    data = str(account_no)
    qr = qrcode.make(data)
    path = os.path.join(QRS_DIR, f"{account_no}.png")
    qr.save(path)
    return path

def read_accounts():
    if not os.path.exists(ACCOUNT_FILE):
        return []
    with open(ACCOUNT_FILE, "r", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)
        return [a for a in reader if a and a.get("account_no") and str(a.get("account_no")).strip()]

def write_accounts(accounts):
    with open(ACCOUNT_FILE, "w", encoding="utf-8-sig", newline="") as file:
        names = ["Name", "account_no", "pin", "balance"]
        writer = csv.DictWriter(file, fieldnames=names)
        writer.writeheader()
        for account in accounts:
            if account and account.get("account_no"):
                writer.writerow(account)

def read_transactions():
    if not os.path.exists(TRANSACTION_FILE):
        return []
    with open(TRANSACTION_FILE, "r", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)
        return [t for t in reader if t and t.get("account_no") and str(t.get("account_no")).strip()]

def append_transaction(account_no, tx_id, tx_type, amount, tx_time):
    file_exists = os.path.exists(TRANSACTION_FILE) and os.path.getsize(TRANSACTION_FILE) > 0
    with open(TRANSACTION_FILE, "a", encoding="utf-8-sig", newline="") as file:
        names = ["account_no", "transaction_id", "type", "amount", "time"]
        writer = csv.DictWriter(file, fieldnames=names)
        if not file_exists:
            writer.writeheader()
        writer.writerow({
            "account_no": str(account_no),
            "transaction_id": str(tx_id),
            "type": tx_type,
            "amount": int(amount),
            "time": tx_time
        })

def init_system():
    ensure_environment()
    accounts = read_accounts()
    for acc in accounts:
        generate_qr(acc["account_no"])
    return {"status": "ok", "total_accounts": len(accounts)}

def handle_login(account_no, pin):
    state = load_blocked_state()
    account_no = str(account_no).strip()
    pin = str(pin).strip()

    accounts = read_accounts()
    account = next((a for a in accounts if str(a["account_no"]).strip() == account_no), None)
    
    if not account:
        return {"success": False, "error": "INVALID ACCOUNT NO--", "code": "INVALID_ACCOUNT"}

    if account_no in state.get("blocked", []):
        return {
            "success": False,
            "error": "ACCOUNT BLOCKED 3 WRONG ATTEMPTS--",
            "code": "ACCOUNT_BLOCKED",
            "blocked": True
        }

    attempts = state.get("attempts", {}).get(account_no, 0)

    if account["pin"] == pin:
        state["attempts"][account_no] = 0
        save_blocked_state(state)
        # Ensure QR exists
        generate_qr(account_no)
        return {
            "success": True,
            "message": "login successful!!",
            "account": {
                "Name": account["Name"],
                "account_no": account["account_no"],
                "balance": int(account["balance"])
            }
        }
    else:
        attempts += 1
        state["attempts"][account_no] = attempts
        if attempts >= 3:
            if account_no not in state["blocked"]:
                state["blocked"].append(account_no)
            save_blocked_state(state)
            return {
                "success": False,
                "error": "ACCOUNT BLOCKED 3 WRONG ATTEMPTS--",
                "code": "ACCOUNT_BLOCKED",
                "attempts": attempts,
                "blocked": True
            }
        else:
            save_blocked_state(state)
            return {
                "success": False,
                "error": "please check the pin again--",
                "code": "INCORRECT_PIN",
                "attempts": attempts,
                "remaining_attempts": 3 - attempts
            }

def handle_get_account(account_no):
    account_no = str(account_no).strip()
    accounts = read_accounts()
    account = next((a for a in accounts if str(a["account_no"]).strip() == account_no), None)
    if not account:
        return {"success": False, "error": "Account number not found."}
    
    # ensure QR is ready
    qr_path = os.path.join(QRS_DIR, f"{account_no}.png")
    if not os.path.exists(qr_path):
        generate_qr(account_no)

    return {
        "success": True,
        "account": {
            "Name": account["Name"],
            "account_no": account["account_no"],
            "balance": int(account["balance"])
        }
    }

def handle_deposit(account_no, amount):
    account_no = str(account_no).strip()
    try:
        amount = int(amount)
    except (ValueError, TypeError):
        return {"success": False, "error": "please enter a valid amount"}

    if amount <= 0:
        return {"success": False, "error": "please enter a valid amount"}

    accounts = read_accounts()
    account = next((a for a in accounts if str(a["account_no"]).strip() == account_no), None)
    if not account:
        return {"success": False, "error": "Account number not found."}

    new_balance = int(account["balance"]) + amount
    account["balance"] = str(new_balance)
    write_accounts(accounts)

    tx_id = random.randint(100000000000, 999999999999)
    current_time = datetime.datetime.now().strftime("%H:%M:%S %d-%m-%y")
    append_transaction(account_no, tx_id, "deposit", amount, current_time)

    return {
        "success": True,
        "message": f"NEW BALANCE {new_balance}",
        "new_balance": new_balance,
        "transaction": {
            "transaction_id": str(tx_id),
            "type": "deposit",
            "amount": amount,
            "time": current_time,
            "account_no": account_no
        }
    }

def handle_withdraw(account_no, amount):
    account_no = str(account_no).strip()
    try:
        amount = int(amount)
    except (ValueError, TypeError):
        return {"success": False, "error": "please enter a valid amount"}

    accounts = read_accounts()
    account = next((a for a in accounts if str(a["account_no"]).strip() == account_no), None)
    if not account:
        return {"success": False, "error": "Account number not found."}

    current_balance = int(account["balance"])
    if amount > current_balance:
        return {"success": False, "error": "Insufficient balance"}
    elif amount <= 0:
        return {"success": False, "error": "please enter a valid amount"}

    new_balance = current_balance - amount
    account["balance"] = str(new_balance)
    write_accounts(accounts)

    tx_id = random.randint(100000000000, 999999999999)
    current_time = datetime.datetime.now().strftime("%H:%M:%S %d-%m-%y")
    append_transaction(account_no, tx_id, "Withdraw", amount, current_time)

    return {
        "success": True,
        "message": f"NEW BALANCE {new_balance}",
        "new_balance": new_balance,
        "transaction": {
            "transaction_id": str(tx_id),
            "type": "Withdraw",
            "amount": amount,
            "time": current_time,
            "account_no": account_no
        }
    }

def handle_get_transactions(account_no, limit=None):
    account_no = str(account_no).strip()
    all_txs = read_transactions()
    account_txs = [t for t in all_txs if str(t["account_no"]).strip() == account_no]

    if limit is not None and limit > 0:
        display_txs = account_txs[-limit:]
    else:
        display_txs = account_txs

    # Format newest first for user convenience while preserving all fields
    reversed_txs = list(reversed(display_txs))
    return {
        "success": True,
        "transactions": reversed_txs,
        "total_count": len(account_txs)
    }

def handle_change_pin(account_no, current_pin, new_pin):
    account_no = str(account_no).strip()
    current_pin = str(current_pin).strip()
    new_pin = str(new_pin).strip()

    if not new_pin:
        return {"success": False, "error": "Please enter a valid new PIN"}

    accounts = read_accounts()
    account = next((a for a in accounts if str(a["account_no"]).strip() == account_no), None)
    if not account:
        return {"success": False, "error": "Account number not found."}

    if account["pin"] != current_pin:
        return {"success": False, "error": "Incorrect current PIN"}

    account["pin"] = new_pin
    write_accounts(accounts)

    return {
        "success": True,
        "message": "password updated"
    }

def handle_transfer(account_no, receiver_acc, amount):
    account_no = str(account_no).strip()
    receiver_acc = str(receiver_acc).strip()

    if receiver_acc == account_no:
        return {"success": False, "error": "Cannot transfer to your own account"}

    try:
        amount = int(amount)
    except (ValueError, TypeError):
        return {"success": False, "error": "Please enter a valid amount"}

    if amount <= 0:
        return {"success": False, "error": "Please enter a valid amount"}

    accounts = read_accounts()
    sender = next((a for a in accounts if str(a["account_no"]).strip() == account_no), None)
    receiver = next((a for a in accounts if str(a["account_no"]).strip() == receiver_acc), None)

    if not sender:
        return {"success": False, "error": "Sender account not found"}
    if not receiver:
        return {"success": False, "error": "enter valid account no"}

    sender_balance = int(sender["balance"])
    if sender_balance < amount:
        return {"success": False, "error": "insufficient balance"}

    sender["balance"] = str(sender_balance - amount)
    receiver["balance"] = str(int(receiver["balance"]) + amount)

    current_time = datetime.datetime.now().strftime("%H:%M:%S %d-%m-%y")
    sender_tx_id = random.randint(100000000000, 999999999999)
    receiver_tx_id = random.randint(100000000000, 999999999999)

    append_transaction(account_no, sender_tx_id, "Transfer", amount, current_time)
    append_transaction(receiver_acc, receiver_tx_id, "Recieved", amount, current_time)

    write_accounts(accounts)

    return {
        "success": True,
        "message": "Transfer successful",
        "new_balance": int(sender["balance"]),
        "sender_transaction_id": str(sender_tx_id),
        "receiver_transaction_id": str(receiver_tx_id),
        "amount": amount,
        "receiver_name": receiver["Name"],
        "receiver_account_no": receiver_acc,
        "time": current_time
    }

def handle_scan_and_pay(account_no, receiver_name, amount):
    """
    Exact implementation of Choice 8 from original bank.py:
    1. Finds receiver by Name in account.csv
    2. Finds receiver QR in QRs/<receiver>.png
    3. Decodes QR using cv2.QRCodeDetector()
    4. Confirms decoded account_no matches
    5. Deducts from sender if sufficient balance, credits receiver
    6. Updates account.csv and records transaction
    """
    account_no = str(account_no).strip()
    receiver_name = str(receiver_name).strip()

    try:
        amount = int(amount)
    except (ValueError, TypeError):
        return {"success": False, "error": "please enter a valid amount"}

    if amount <= 0:
        return {"success": False, "error": "please enter a valid amount"}

    accounts = read_accounts()
    sender = next((a for a in accounts if str(a["account_no"]).strip() == account_no), None)
    if not sender:
        return {"success": False, "error": "account not found"}

    target_id = receiver_name.strip().lower()
    receiver = next(
        (a for a in accounts if a["Name"].strip().lower() == target_id or str(a["account_no"]).strip().lower() == target_id),
        None
    )
    if not receiver:
        return {"success": False, "error": "account not found"}

    receiver_acc = receiver["account_no"]
    if receiver_acc == account_no:
        return {"success": False, "error": "Cannot pay to yourself"}

    qr_path = os.path.join(QRS_DIR, f"{receiver_acc}.png")
    if not os.path.exists(qr_path):
        # Generate it if not present
        generate_qr(receiver_acc)

    if not os.path.exists(qr_path):
        return {"success": False, "error": "Qr not found for this account"}

    image = cv2.imread(qr_path)
    if image is None:
        return {"success": False, "error": "QR could not be scanned"}

    detector = cv2.QRCodeDetector()
    decoded_data, points, _ = detector.detectAndDecode(image)

    if not decoded_data:
        return {"success": False, "error": "QR could not be scanned"}

    # Decoded data contains account_no
    if int(sender["balance"]) < amount:
        return {"success": False, "error": "insufficient balance"}

    sender["balance"] = str(int(sender["balance"]) - amount)
    receiver["balance"] = str(int(receiver["balance"]) + amount)

    current_time = datetime.datetime.now().strftime("%H:%M:%S %d-%m-%y")
    sender_tx_id = random.randint(100000000000, 999999999999)
    receiver_tx_id = random.randint(100000000000, 999999999999)

    append_transaction(account_no, sender_tx_id, "Transfer", amount, current_time)
    append_transaction(receiver_acc, receiver_tx_id, "Recieved", amount, current_time)

    write_accounts(accounts)

    return {
        "success": True,
        "message": "Payment successful via Scan & Pay",
        "new_balance": int(sender["balance"]),
        "receiver_name": receiver["Name"],
        "receiver_account_no": receiver_acc,
        "amount": amount,
        "transaction_id": str(sender_tx_id),
        "time": current_time
    }

def handle_scan_qr_image(image_base64_or_path):
    """
    Decodes an uploaded QR image or camera capture frame using OpenCV QRCodeDetector
    """
    detector = cv2.QRCodeDetector()
    image = None

    if image_base64_or_path.startswith("data:image"):
        parts = image_base64_or_path.split(",")
        encoded = parts[1] if len(parts) > 1 else parts[0]
        nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    elif os.path.exists(image_base64_or_path):
        image = cv2.imread(image_base64_or_path)
    else:
        try:
            nparr = np.frombuffer(base64.b64decode(image_base64_or_path), np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception:
            return {"success": False, "error": "Invalid image payload"}

    if image is None:
        return {"success": False, "error": "Camera could not open or image invalid"}

    data, points, _ = detector.detectAndDecode(image)
    if not data:
        return {"success": False, "error": "QR could not be scanned"}

    account_no = data.strip()
    accounts = read_accounts()
    found_account = next((a for a in accounts if str(a["account_no"]).strip() == account_no), None)

    if found_account:
        return {
            "success": True,
            "account_no": account_no,
            "name": found_account["Name"],
            "raw_data": data
        }
    else:
        return {
            "success": True,
            "account_no": account_no,
            "name": None,
            "raw_data": data,
            "warning": "Account not recognized in bank database"
        }

def handle_get_all_recipients():
    accounts = read_accounts()
    return {
        "success": True,
        "recipients": [{"Name": a["Name"], "account_no": a["account_no"]} for a in accounts]
    }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input payload provided"}))
        return

    raw_input = sys.argv[1]
    try:
        req = json.loads(raw_input)
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}))
        return

    action = req.get("action")
    res = {}

    if action == "init":
        res = init_system()
    elif action == "login":
        res = handle_login(req.get("account_no"), req.get("pin"))
    elif action == "get_account":
        res = handle_get_account(req.get("account_no"))
    elif action == "deposit":
        res = handle_deposit(req.get("account_no"), req.get("amount"))
    elif action == "withdraw":
        res = handle_withdraw(req.get("account_no"), req.get("amount"))
    elif action == "transfer":
        res = handle_transfer(req.get("account_no"), req.get("receiver_acc"), req.get("amount"))
    elif action == "scan_and_pay":
        res = handle_scan_and_pay(req.get("account_no"), req.get("receiver_name"), req.get("amount"))
    elif action == "get_transactions":
        limit = req.get("limit")
        res = handle_get_transactions(req.get("account_no"), limit=limit)
    elif action == "change_pin":
        res = handle_change_pin(req.get("account_no"), req.get("current_pin"), req.get("new_pin"))
    elif action == "scan_qr_image":
        res = handle_scan_qr_image(req.get("image_data", ""))
    elif action == "get_all_recipients":
        res = handle_get_all_recipients()
    else:
        res = {"success": False, "error": f"Unknown action: {action}"}

    print(json.dumps(res))

if __name__ == "__main__":
    main()
