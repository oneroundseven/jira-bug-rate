# jira-bug-rate

##### update Log
0.0.1
- 增加本地存储机制，已经发布版本数据存入data/product.json中 未发布版本数据存入 data/dev.json中

1.0.0
- 修改为mongogb存数方式
- 新增日终跑数据功能, 会重新跑昨天一天新建的新的版本号，并且已经设定过转测时间的版本 (每天晚上23点)
- 新增命令行跑数据方式
````aidl
npm link
bugs run command
bugs run -h
bugs run MICEN2_LV_2017.179 -t 2018-02-04 -p 2018-02-13 -r 2018-02-28
````
- 新增jira备注配置转测时间点方式
````aidl
#test:2018-02-03#
#prelease:2018-03-12#
#release:2018-04-13#
````
test:转测时间
prelease:P版发布时间
release:正式版发布时间
  