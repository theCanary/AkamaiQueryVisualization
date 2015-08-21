Software used:
	1) HDFS
	2) Impala
	3) Impyla
	4) TornadoServer


HDFS:
Currently using Akamai's CDH5.4 version, installed using ANI.
All files stored in /ghostcache/<tag>

Any files starting with awang, usually in the form of awang_date, are randomly generated.

Impala:
SQL reference guide is here: http://www.cloudera.com/content/cloudera/en/documentation/core/latest/topics/impala_langref.html

Impyla:
https://github.com/cloudera/impyla#quickstart

TornadoServer:
Version 4.2.1
http://www.tornadoweb.org/en/stable/


--------------------------------------------------------------------


Main method is in tornadoserver.py
Each handler in tornadoserver.py is either a web page or a way to communicate (with the Impala Server or with POST/GET streaming requests) data.

Each web page handler has two components: an html page and a js page. The html page is described in the handler and located in the same folder as tornadoserver.py, and the js page (like tst.js) is in /static/query/


--------------------------------------------------------------------


For more information, see how-to.txt
