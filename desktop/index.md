- 2015-34-07 15:09:28
- 2015-34-07 15:09:25
- 未加标题笔记
# SASS用法指南

[](http://www.bshare.cn/share)

作者： [阮一峰](http://www.ruanyifeng.com/)

日期： [2012年6月19日](http://www.ruanyifeng.com/blog/2012/06/)

学过[CSS](http://zh.wikipedia.org/wiki/%E5%B1%82%E5%8F%A0%E6%A0%B7%E5%BC%8F%E8%A1%A8)的人都知道，它不是一种编程语言。

你可以用它开发网页样式，但是没法用它编程。也就是说，CSS基本上是设计师的工具，不是程序员的工具。在程序员眼里，CSS是一件很麻烦的东西。它没有变量，也没有条件语句，只是一行行单纯的描述，写起来相当费事。

![](file://d:/GitNote/3/img/ozYE.png)

很自然地，有人就开始为CSS加入编程元素，这被叫做["CSS预处理器"](http://www.catswhocode.com/blog/8-css-preprocessors-to-speed-up-development-time)（css preprocessor）。它的基本思想是，用一种专门的编程语言，进行网页样式设计，然后再编译成正常的CSS文件。

各种"CSS预处理器"之中，我自己最喜欢[SASS](http://sass-lang.com/)，觉得它有很多优点，打算以后都用它来写CSS。下面是我整理的用法总结，供自己开发时参考，相信对其他人也有用。

============================================

