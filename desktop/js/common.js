/**
 * Created by liuhan on 2015/9/1.
 */

Date.prototype.format = function(fmt) {
    var o = {
        "M+" : this.getMonth()+1, //�·�
        "d+" : this.getDate(), //��
        "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //Сʱ
        "H+" : this.getHours(), //Сʱ
        "m+" : this.getMinutes(), //��
        "s+" : this.getSeconds(), //��
        "q+" : Math.floor((this.getMonth()+3)/3), //����
        "S" : this.getMilliseconds() //����
    };
    var week = {
        "0" : "/u65e5",
        "1" : "/u4e00",
        "2" : "/u4e8c",
        "3" : "/u4e09",
        "4" : "/u56db",
        "5" : "/u4e94",
        "6" : "/u516d"
    };
    if(/(y+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    if(/(E+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[this.getDay()+""]);
    }
    for(var k in o){
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}

function formatMoney(number, places, symbol, thousand, decimal) {
    number = number || 0;
    places = !isNaN(places = Math.abs(places)) ? places : 2;
    symbol = symbol !== undefined ? symbol : "��";
    thousand = (thousand=="")?"":",";
    decimal = decimal || ".";
    var negative = number < 0 ? "-" : "",
        i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
}

function randStr(len){
    var x="123456789poiuytrewqasdfghjklmnbvcxzQWERTYUIPLKJHGFDSAZXCVBNM";
    var tmp="";
    var ran = Math.random();
    for(var i=0;i< len;i++) {
        ran *=10;
        tmp += x.charAt(Math.ceil(ran)%x.length);
    }
    return tmp;
}


