/**
 * Created by liuhan on 2015/10/19.
 */


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
