
/**
 * Created by liuhan on 2015/9/1.
 */

function showMask() {
    $(".mask").show();
    $(".mask").css("opacity", "1");
}

function hideMask() {
    $(".mask").css("opacity", 0);
    setTimeout(function() {
        $(".mask").hide();
    }, 500);
}

$(function() {
    $(".mask").click(function() {
    closeEditTag();
    });

    $("textarea").on('keydown',function(e){
        if(e.keyCode == 9){
            e.preventDefault();
            var indent = '    ';
            var start = this.selectionStart;
            var end = this.selectionEnd;
            var selected = window.getSelection().toString();
            selected = indent + selected.replace(/\n/g,'\n'+indent);
            this.value = this.value.substring(0,start) + selected + this.value.substring(end);
            this.setSelectionRange(start+indent.length,start+selected.length);
        }
    });

    $("[contenteditable='true']").on("keydown", function(e) {
        if(e.keyCode == 9){
            e.preventDefault();
        }
    });
});




Date.prototype.format = function(fmt) {
    var o = {
        "M+" : this.getMonth()+1, //月份
        "d+" : this.getDate(), //日
        "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时
        "H+" : this.getHours(), //小时
        "m+" : this.getMinutes(), //分
        "s+" : this.getSeconds(), //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S" : this.getMilliseconds() //毫秒
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
};

function formatMoney(number, places, symbol, thousand, decimal) {
    number = number || 0;
    places = !isNaN(places = Math.abs(places)) ? places : 2;
    symbol = symbol !== undefined ? symbol : "￥";
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

//自己写的md 解析器。
function traverse(dom) {
    $(dom).contents().each(function() {
        if (3===this.typeName) {
            md += $(this).text() + "\n";
        } else {
            if ("LI"===$(this).tagName()) {
                if ($(this).parents("blockquote").length>-1) {
                    md += "> ";
                }
                if ("OL"===$(this).parent().tagName()) {
                    md += $(this).sibling().index($(this)) + ". " + $(this).text() + "\n";
                }
                if ("UL"===$(this).parent().tagName()) {
                    md +=  "- " + $(this).text() + "\n";
                }
                return;
            }

            if ("PRE"===$(this).tagName()) {
                md += "    " + $(this).text().replace( new RegExp( "\\n", "g" ), "\n    ");
                return;
            }

            if ("H1"===$(this).tagName()) {
                md += "\r# " + $(this).text() + "\n";
                return;
            }
            if ("H2"===$(this).tagName()) {
                md += "\r## " + $(this).text() + "\n";
                return;
            }
            if ("H3"===$(this).tagName()) {
                md += "\r### " + $(this).text() + "\n";
                return;
            }
            if ("H4"===$(this).tagName()) {
                md += "\r#### " + $(this).text() + "\n";
                return;
            }
            if ("H5"===$(this).tagName()) {
                md += "\r##### " + $(this).text() + "\n";
                return;
            }


            if ($(this).children().length>0) {
                traverse($(this));
            } else {
                if ("BLOCKQUOTE"===$(this).tagName()) {
                    md += "> " + $(this).text() + "\n";
                    return;
                }

                md += "\r" + $(this).text() + "\n";
            }
        }
    });
}


function moveAnimate(element, newParent){
    //Allow passing in either a jQuery object or selector
    element = $(element);
    newParent= $(newParent);

    var oldOffset = element.offset();
    element.appendTo(newParent);
    var newOffset = element.offset();

    var temp = element.clone().appendTo('body');
    temp.css({
        'position': 'absolute',
        'left': oldOffset.left,
        'top': oldOffset.top,
        'z-index': 9999
    });
    element.hide();
    temp.animate({'top': newOffset.top, 'left': newOffset.left}, 'fast', function(){
        element.show();
        temp.remove();
    });
}



var MdUtils = (function () {
    var mu = {
        //plat line object to md
        object2Md: function(o) {
            var md = "";
            for(k in o) {
                md += k + ":" + o[k] + "\r\n";
            }
            return md;
        },

        md2Object: function(md) {
            var lines = md.split("\n");
            var o = {};
            for(var i=0;i<lines.length; i++) {
                var sep = lines[i].indexOf(":");
                if (sep>-1) {
                    o[lines[i].substring(0, sep)] = lines[i].substring(sep+1);
                }
            }
            return o;
        },

        md2RawText: function(md) {
            var raw = md.replace(/ *#{1,6}/g, "").replace(/!\[\]\([^\)]*\)/g, "")
                .replace(/\([^\)]*\)/g, "");
            return raw;
        },

        getMdPics: function(md) {
            var ls =  md.match(/!\[\]\([^\)]*\)/g);
            if (ls==null) return null;
            var rs = [];
            for(var i=0; i<ls.length; i++) {
                rs.push(ls[i].substring(ls[i].lastIndexOf("/") + 1, ls[i].length-1));
            }
            return rs;
        },

        getMeta: function(md) {
            var lines = md.split("\n");

            var metas = {};
            for(var i=0;i<lines.length; i++) {
                if (lines[i].indexOf(MdUtils.metaEnd)>-1) {
                    break;
                } else {
                    if (lines[i].indexOf(":")>-1) {
                        var splits = lines[i].split(":");
                        metas[splits[0]] = splits[1];
                    }
                }
            }
            return metas;
        },

        html2Md: function(html) {
            return toMarkdown(html);
        },

        md2Html: function(md) {
            return marked(md);
        }
    };
    return mu;
}());

