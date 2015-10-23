
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


var logger = (function(console) {
    function log(msg) {
        console.log(msg);
    }
    return {
        log: log,
        error: log,
        info: log,
        debug: log
    };
}(console));


var Dialog = (function($) {

    function showAlert(msg) {
        alert(msg);
    }

    function showConfirm(msg, yes, no) {
        if (confirm(msg)) {
            if (yes) {
                yes();
            }
        } else {
            if (no) {
                no();
            }
        }
    }

    return {
        alert: showAlert,
        confirm: showConfirm
    }
}($));


var StringUtils = (function() {
    function randomStr(len) {
        var x="123456789poiuytrewqasdfghjklmnbvcxzQWERTYUIPLKJHGFDSAZXCVBNM";
        var tmp="";
        var ran = Math.random();
        for(var i=0;i< len;i++) {
            ran *=10;
            tmp += x.charAt(Math.ceil(ran)%x.length);
        }
        return tmp;
    }

    var FILE_NAME_REGEX = '(?!((^(con)$)|^(con)/..*|(^(prn)$)|^(prn)/..*|(^(aux)$)|^(aux)/..*|(^(nul)$)|^(nul)/..*|(^(com)[1-9]$)|^(com)[1-9]/..*|(^(lpt)[1-9]$)|^(lpt)[1-9]/..*)|^/s+|.*/s$)(^[^/////:/*/?/"/</>/|]{1,255}$)';

    function isFileName(name) {
        return name.match(FILE_NAME_REGEX);
    }

    String.prototype.between = function(sa, so) {
        var sfr = this.indexOf(sa);
        if (sfr==-1) return "";

        var sfo = this.indexOf(so, sfr + sa.length);

        if (sfo>-1) {
            return this.substring(sfr+sa.length, sfo);
        } else {
            return "";
        }
    };

    String.prototype.getFileExt = function() {
        var li = this.lastIndexOf(".");
        if (li===-1) return "";
        return this.substring(li+1);
    };

    String.prototype.getFileName = function () {
        return this.substring(this.lastIndexOf("/")+1);
    };

    return {
        randomStr: randomStr,
        isFileName: isFileName
    };
}());


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
            var lines = md.split("\r\n");
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
                .replace(/\([^\)]*\)/g, "").replace(/\\n\\r/g, "");
            return raw;
        },

        getMdPics: function(md) {
            var ls =  md.match(/!\[\]\([^\)]*\)/g);
            if (ls==null) return [];
            var rs = [];
            for(var i=0; i<ls.length; i++) {
                rs.push(ls[i].between("](", ")"));
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

        /**将外链资源部分转换为本地数据*/
        shortenMd: function(md) {
            var pics = this.getMdPics(md);
            for(var i=0; i<pics.length; i++) {
                if (pics.indexOf("http")===-1) {
                    //local image
                }
            }
        },

        md2Html: function(md) {
            return marked(md);
        }
    };
    return mu;
}());