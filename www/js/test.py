import hashlib

def main():
	posted={}
	posted['key'] = "iaomiM3O"
	posted['txnid'] = "Zm7jhsrRbrVly99Kbn8XxKUTBTZ2:24/11/2017 @ 12:31:46-Friday"
	posted['amount'] = 35
	posted['productinfo'] = "Masala Dosa"
	posted['firstname'] = "Manoj S Hegde"
	posted['email'] = "shegdemanoj@gmail.com"

	hashSequence = "key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10"
	hash_string=''
	hashVarsSeq=hashSequence.split('|')
	for i in hashVarsSeq:
		try:
			hash_string+=str(posted[i])
		except Exception:
			hash_string+=''
		hash_string+='|'
	hash_string+="BbcwaIDm8J"
	hashh=hashlib.sha512(hash_string).hexdigest().lower()
	
	print(hash_string)

	hashAns = "8984f07890e835aab919d55ed04f6a0c8f1fd3bf74bd973a43fc4295961ef8828037fa9bb6a48bd7bece34d55428d4a65402042859b89addfa8d1ea4b75a1d2a"
	print(hashAns)
	print(hashh)
	if(hashh == hashAns):
		print("True");

main()