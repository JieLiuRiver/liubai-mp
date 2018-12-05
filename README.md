## 日期选择

### 在哪
美团首页 - 酒店住宿 - 日期选择

### 美团上

##### 美团小程序 & 美团App

<figure class="half">

<img src="https://note.youdao.com/yws/api/personal/file/WEBa77e9d1d7df2e4b3b70a5954a27881df?method=download&shareKey=cfc56189e59febce9cb9c2119936fb75"  width="300" style="margin-right:60px"/>
<img src="https://note.youdao.com/yws/api/personal/file/WEB16e8871be03585f238559225dca31ba0?method=download&shareKey=2caa36f8c6c23a4940a5f380fd76de1a" width="300"/>

</figure>


### 我的DEMO效果

##### 小程序(原生) & IOS(RN) & Android(RN)

<figure class="half">

<img src="https://note.youdao.com/yws/api/personal/file/WEBb821672ff7014224dc8ea46e1d1020aa?method=download&shareKey=efe52b91558d33ca832f914bfe01b3ed" width="280" style="margin-right:20px">

<img src="https://note.youdao.com/yws/api/personal/file/WEB8fffb5d454b1a29e6d942d92d9b8a2de?method=download&shareKey=d87ae6ab6484943ea894b05f39206a4d" width="280" style="margin-right:20px">

<img src="https://note.youdao.com/yws/api/personal/file/WEB9d2f3e51aa3e94378008c2e505a9a6d9?method=download&shareKey=c881a82fc1b043ed4e4983da5e605e7e" width="280" />

</figure>


### 为啥写

这几天没那么忙，偶然瞄到美团这个组件，觉得很舒服，就想写写

美团小程序这功能估计很可能是mpvue写的，我这里使用小程序原生的组件去写

美团App上的这个组件，我这里用React-Native去写

### 选择器

小程序这一块，是使用一个页面去完成这个选择的动作，而在App上的表现，是从底部弹出来的，好奇的我还去看了美团移动端页面这个组件的表现，也有一些差异。 整体上来说，功能是一样的，选日期，入店-离店日期。

### 咋写的

- 日历怎么生成？

```
问题拆分：
1. 怎么获取今天是星期几？
2. 当前月份1号是星期几？
3. 怎么获取上个月多余出来的，要显示在当前月置灰状态的日期？
4. 上个月多余的日期，怎么控制有些要显示出来，有些用不上？
5. 怎么获取到本月所有日期？
```

##### 使用[moment.js](http://momentjs.cn/docs/#/get-set/)日期处理库

##### 获取今天是星期几
```
# 若星期一则返回1， 即可能的值是[1,2,3,4,5,6,7]
moment().format('E')
```

##### 获取这个月1号的日期对象和1号是星期几
```
# 比如今天是12.05号，星期三
const m1 = moment().startOf('month')
const w1 = m1.format('E')
```

##### 获取上个月多余的日期数组

获取19年02月，上个月多余的日期，即如下图红色日期

![](https://note.youdao.com/yws/api/personal/file/WEB46dcd049575b2b14fe240ba46d76d4ae?method=download&shareKey=6d500939482117d9d70a72e692d38d1e)

其中从左到右分别为

```
['日', '一', '二', '三', '四', '五', '六']
```

1号星期5，我知道，那这周的星期天，也就是这周的第一天的日期是可以推算出来的。 

既然1号是星期五，那周日到周五，已经过了5天， 1号日期往后倒推5天就是周日那天的日期

```
firstDayTime.subtract(5, 'days')
```

从而获取到27 - 31号5天的一个日期数组


同样的思路， 19年02年月最后一行空缺的日期，也能算出来 

![](https://note.youdao.com/yws/api/personal/file/WEBa9d41e5bcaf7cbcc54b7bfe6b45bf5dd?method=download&shareKey=1e1ef8b78b374dc7f5bd7f3d7487dca4)

那也就是说，我每一个月的日期面板，都是完整的矩形，不存在空缺，把空缺的问题转化为，怎么去隐藏非本月的日期的显示？

注意并非所有这个月1号之前的日期都是不可见的状态，例如下图

![](https://note.youdao.com/yws/api/personal/file/WEBd60e62c8596cf807a2d702af0f229a85?method=download&shareKey=c9a6114947821aa9cd3ab94105aed315)

12月1号是不可见，也不需要显示的， 但2，3，4号是需要可见置灰状态的， 我们发现这种情况下，无非就是当前一周里，有过去了的日期，同时当月的1号也在这周里面，根据这样的条件，是不难去做出判断的

当本月日历列表出来后，那下一个月，下下个月的就变得简单了，因为当前月的情况会更多一些，未来月份的情况是固定的


##### 今天、明天、后天


App上体验好一些，今、明、后天是直接标出的

```
const DAY_MAP = {
  [moment().format(FORMAT_TYPE)]: '今天',
  [moment().add(1, 'days').format(FORMAT_TYPE)]: '明天',
  [moment().add(2, 'days').format(FORMAT_TYPE)]: '后天'
}
...
!!DAY_MAP[formatDay] ? DAY_MAP[formatDay] : date
...
```

#### 布局

flex布局

这里碰到一个问题，给每一个屏幕宽度一个七等分的处理，即每一个日期小框框宽度都是：（屏幕宽度 / 7）

```
750 / 7 
// 107.14285714285714
```

当每一个小框框都以这个宽度布局的时候， 肯定会有精度问题， 导致屏幕宽度没有完整铺满，还有一点小缝隙的空间，这小缝隙是每一个小框框误差累积出来的总和。 

解决方法， 可以不使用flex-wrap:wrap， 不换行，然后一行全铺满flex:1， 这样的话需要把数组切割， 分行渲染。 如果要换行的话，可以简单粗暴的判断第七个小框框，给他一个flex:1， 也就是 (index + 1) % 7 == 0的时候


#### 可供选择的日期
我看美团小程序和App上都一样， App上差不多半年日期可选，小程序上差不多是2个月，具体的算法不太清楚。 我这里是写死的。


### React-Native上

#### react-native-vector-icons

其中有一个关闭的图标， 使用了react-native-vector-icons

#### react-native-animatable
弹起的动画使用了react-native-animatable， 也可以自己写这个过渡的动画， 之前我已经安装了这个动画组件，也想着试用下

#### 冒泡问题
app上组件弹出来后，点击阴影区域是可以关闭的，点击日期区域不会关闭的，RN上没有冒泡机制配置，我这里是通过给可见阴影区域加上TouchableOpacity组件覆盖，加上专属的Press事件。 

其实发现是可以用一个TouchableOpacity组件在父标签与子标签之间再隔一层，达到不冒泡的效果。

#### ScrollView
如果使用TouchableOpacity组件包裹ScrollView组件，ScrollView会有问题，什么问题，滚不了

#### SectionList
使用了这个组件完成日期列表分类，同时在IOS下有一个效果，滚动到顶部时，header粘连在屏幕的顶端，stickySectionHeadersEnabled属性，默认true

##### 计算选取了多少晚
使用moment.js方法
```
eMoment.diff(sMonent, 'days')
```

### 问题

- App上日期上的节假日未实现
- App上‘请选择离店日期’的提示会出现被header盖住的情况，RN上没有zIndex设置，规律是后面的组件层级高于前面的组件。 这里使用了secondlist组件造成


### 源码

- [小程序版](https://github.com/stupidWall/liubai-mp/blob/laboratory/components/calendar/index.js)
- [React-Native版](https://github.com/stupidWall/rnShell/blob/master/components/DatePicker.js)


 欢迎Star！！！！
