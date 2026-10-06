import csv
import os
import qrcode
import cv2

account_no=input("enter your account no: ")
account_found=False
attempts=0
flag=0
def generate_qr(account_no):
     os.makedirs("QRs",exist_ok=True)
     data=str(account_no)
     qr= qrcode.make(data)
     qr.save('QRs/'+str(account_no)+".png")
def scan_qr():
     camera=cv2.VideoCapture(0)
     detector=cv2.QRCodeDetector()
     while True:
          ret,frame=camera.read()
          if not ret:
               print("camera could not open")
               break
          data,points,_=detector.detectAndDecode(frame)
          cv2.imshow("scan qr -press Q to exit",frame)
          if data:
               print(("QR scanned :",data))
               camera.release()
               cv2.destroyAllWindows()
               return data
          if cv2.waitKey(1)& 0XFF==ord("q"):
               break
          camera.release()
          cv2.destroyAllWindows()
          return None
     print(scan_qr())



with open("account.csv","r",encoding="utf-8-sig") as file:
    reader=csv.DictReader(file)
    accounts=list(reader)
    for account in accounts:
         generate_qr(account['account_no'])
    for account in accounts:
         if(account['account_no']==account_no):
              account_found=True
              while(attempts!=3 and flag==0):   
                pin=input("enter your pin: ")
                attempts=attempts+1
                if(account['pin']==pin):
                   flag=1
                   print("login successful!!")
                elif (flag==0 and attempts==3):
                     print("ACCOUNT BLOCKED 3 WRONG ATTEMPTS--")
                else:
                     print("please check the pin again--")
       
    
              if flag==1:
                        print("====BANKING MENU=====")
                        print("1.Check Balance")
                        print("2.Deposit")
                        print("3.Withdraw")
                        print("4.Transaction history")
                        print("5.Change PIN")
                        print("6.Account Details")
                        print("7.Money Transfer")
                        print("8.Scan and Pay")
                        print("9.EXIT")

                        while(True):
                            choice=int(input("enter your choice: "))
                            if choice==1:
                                print(account['balance'])
                            elif choice ==2:
                                amount=int(input("enter the ammount you want to deposit: "))
                                if(amount<0 or amount==0):
                                     print("please enter a valid amount")
                                else:
                                     
                                    for accountt in accounts:
                                        if accountt['account_no']==account_no:
                                            accountt['balance']=int(accountt['balance'])+amount
                                            print(f"NEW BALANCE {accountt['balance']}")
                                    with open("account.csv","w",encoding='utf-8-sig') as file:
                                        names=["Name","account_no","pin","balance"]
                                        writer=csv.DictWriter(file,fieldnames=names)
                                        import os
                                        if os.path.getsize("account.csv")==0:
                                            writer.writeheader()
                                        for accountt in accounts:
                                            writer.writerow(accountt)
                                        import random
                                        transaction_id=random.randint(100000000000,999999999999)
                                        import datetime
                                        current_time=datetime.datetime.now()
                                        current_time=current_time.strftime("%H:%M:%S %d-%m-%y")
                                        with open("transaction.csv","a",encoding="utf-8-sig") as fole:
                                            names=["account_no", "transaction_id", "type", "amount", "time"]
                                            writer=csv.DictWriter(fole,fieldnames=names)
                                            import os
                                            if os.path.getsize("transaction.csv")==0:
                                                    writer.writeheader()
                                            writer.writerow({
                                                "account_no":account_no,
                                                "transaction_id":transaction_id,
                                                "type":"deposit",
                                                "amount":amount,
                                                "time":current_time,
                                            })
                                     
                                
                                          
                                
                            elif choice==3:
                                amount=int(input("enter the ammount you want to withdraw: "))
                                if(amount>int(account['balance'])):
                                     print("Insufficient balance")
                                elif(amount<0 or amount==0):
                                    print("please enter a valid amount")
                                else:
                                   for accountt in accounts:
                                      if accountt['account_no']==account_no:
                                          accountt['balance']=int(accountt['balance'])-amount
                                          print(f"NEW BALANCE {accountt['balance']}")
                                   with open("account.csv","w",encoding='utf-8-sig') as file:
                                        names=["Name","account_no","pin","balance"]
                                        writer=csv.DictWriter(file,fieldnames=names)
                                        import os
                                        if os.path.getsize("account.csv")==0:
                                            writer.writeheader()
                                        for accountt in accounts:
                                            writer.writerow(accountt)
                                import random
                                transaction_id=random.randint(100000000000,999999999999)
                                import datetime
                                current_time=datetime.datetime.now()
                                current_time=current_time.strftime("%H:%M:%S %d-%m-%y")
                                with open("transaction.csv","a",encoding="utf-8-sig") as fole:
                                        names=["account_no", "transaction_id", "type", "amount", "time"]
                                        writer=csv.DictWriter(fole,fieldnames=names)
                                        import os
                                        if os.path.getsize("transaction.csv")==0:
                                              writer.writeheader()
                                        writer.writerow({
                                          "account_no":account_no,
                                          "transaction_id":transaction_id,
                                          "type":"Withdraw",
                                          "amount":amount,  
                                         "time":current_time,
                                           })
                            elif choice==4:
                                 transactions=[]
                                 with open("transaction.csv","r",encoding="utf-8-sig") as file:
                                      reader=csv.DictReader(file)
                                      for transaction in reader:
                                            if(transaction["account_no"]==account_no):
                                                 transactions.append(transaction)
                                      for transaction in transactions[-5:]:
                                            print(f"Transaction ID:{transaction['transaction_id']}")
                                            print(f"Type:{transaction['type']}")
                                            print(f"Amount:{transaction['amount']}")
                                            print(f"Time:{transaction['time']}")
                                 choose=input("enter yes to see more / no")
                                 if(choose=="yes"):
                                      for transaction in transactions:
                                        print(f"Transaction ID:{transaction['transaction_id']}")
                                        print(f"Type:{transaction['type']}")
                                        print(f"Amount:{transaction['amount']}")
                                        print(f"Time:{transaction['time']}")
                                      
                            elif choice==5:
                                 password=input("enter current PIN: ")
                                 for accountt in accounts:
                                      
                                    if(accountt['account_no']==account_no):
                                         if(accountt['pin']==password):
                                              new_pass=input("enter your new password: ")
                                              accountt['pin']=new_pass
                                              print("password updated")
                                 with open("account.csv","w",encoding='utf-8-sig') as file:
                                    names=["Name","account_no","pin","balance"]
                                    writer=csv.DictWriter(file,fieldnames=names)
                                    import os
                                    if os.path.getsize("account.csv")==0:
                                       writer.writeheader()
                                    for accountt in accounts:
                                        writer.writerow(accountt)
                            elif choice==6:
                                 for accountt in accounts:
                                      if accountt['account_no']==account_no:
                                           print(f"Name {accountt['Name']}")
                                           print(f"account_no {accountt['account_no']}")
                                           print(f"Balance {accountt['balance']}")
                            elif choice==7:
                                 reciever_acc=input("enter reciever's account no: ")
                                 found=0
                                 success=0
                                 import datetime
                                 current_time=datetime.datetime.now()
                                 current_time=current_time.strftime("%H:%M:%S %d-%m-%y")
                                 for accountt in accounts:
                                      if(accountt['account_no']==reciever_acc):
                                           found=1
                                 if found==0:
                                      print("enter valid account no")
                                 else:
                                      money=int(input("enter the money you want to transfer"))
                                      for accountt in accounts:
                                           if(accountt["account_no"]==account_no):
                                                if(int(accountt['balance'])<money):
                                                     print("insufficient balance")
                                                else:
                                                     accountt['balance']=int(accountt['balance'])-money
                                                     success=1
                                                     import random
                                                     transaction_id=random.randint(100000000000,999999999999)
                                                     with open("transaction.csv","a",encoding="utf-8-sig") as fole:
                                                        names=["account_no", "transaction_id", "type", "amount", "time"]
                                                        writer=csv.DictWriter(fole,fieldnames=names)
                                                        import os
                                                        if os.path.getsize("transaction.csv")==0:
                                                            writer.writeheader()
                                                        writer.writerow({
                                                            "account_no":account_no,
                                                            "transaction_id":transaction_id,
                                                            "type":"Transfer",
                                                            "amount":money,  
                                                            "time":current_time,})
                                      if(success==1):
                                           
                                        for accountt in accounts:
                                                if(accountt["account_no"]==reciever_acc):
                                                    accountt['balance']=int(accountt['balance'])+money
                                                    import random
                                                    transaction_id=random.randint(100000000000,999999999999)
                                                    with open("transaction.csv","a",encoding="utf-8-sig") as fole:
                                                        names=["account_no", "transaction_id", "type", "amount", "time"]
                                                        writer=csv.DictWriter(fole,fieldnames=names)
                                                        import os
                                                        if os.path.getsize("transaction.csv")==0:
                                                         writer.writeheader()
                                                        writer.writerow({
                                                        "account_no":reciever_acc,
                                                        "transaction_id":transaction_id,
                                                        "type":"Recieved",
                                                        "amount":money,  
                                                        "time":current_time,})
                                        with open("account.csv",'w',encoding='utf-8-sig') as file:
                                            names=["Name","account_no","pin","balance"]
                                            writer=csv.DictWriter(file,fieldnames=names)
                                            import os
                                            if os.path.getsize("account.csv")==0:
                                                writer.writeheader()
                                            for accountt in accounts:
                                                writer.writerow(accountt)
                                           
                            elif choice==8:
                                 name=input("enter reciever's name: ")
                                 money=int(input("enter the amount you want to transfer: "))
                                 with open("account.csv",'r',encoding='utf-8-sig')  as file:
                                      reader=csv.DictReader(file)
                                      reciever_=None
                                      for account in reader:
                                           if (account['Name']==name):
                                                reciever_=account['account_no']
                                                break
                                      if reciever_==None:
                                           print("account not found")
                                      else:
                                           qr_path=None
                                           for file in os.listdir("QRs"):
                                                if file==reciever_+".png":
                                                     qr_path=os.path.join("QRs",file)
                                           if qr_path==None:
                                                 print("Qr not found for this account")
                                           else:
                                                image=cv2.imread(qr_path)
                                                detector=cv2.QRCodeDetector()
                                                data,points,_=detector.detectAndDecode(image)
                                           if data:
                                                with open("account.csv",'r',encoding='utf-8-sig') as file:
                                                     reader=csv.DictReader(file)
                                                     accounnt=list(reader)
                                                     for account in accounnt:
                                                          if account['account_no']==data:
                                                               account['balance']=int(account['balance'])+money
                                                     for account in accounnt:
                                                             if account['account_no']==account_no:
                                                                 if(int(account['balance'])<money):
                                                                        print("insufficient balance")
                                                                 else:
                                                                        account['balance']=int(account['balance'])-money
                                                with open("account.csv",'w',encoding='utf-8-sig') as file:
                                                      names=["Name","account_no","pin","balance"]
                                                      writer=csv.DictWriter(file,fieldnames=names)
                              
                                                      writer.writeheader()
                                                      for accounts in accounnt:
                                                            writer.writerow(accounts)
                                                     
                                                

                                           else:

                                                 print("QR could not be scanned")
                                           
                                       


                                
                            elif choice==9:
                                print("EXIT")
                                break
    if not account_found:
           print("INVALID ACCOUNT NO--")
