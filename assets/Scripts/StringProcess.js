
module.exports = {

    getQueryString:
    // dir 为 从 compoHanZi 指向 targetHanZi 的方向
    function(dir,compoHanZi,targetHanZi){
        var dirString=this.dir2String(dir);
        var queryStrings=[];
        // dirStirng 如果 为 对角线方向 那么 就是有两个元素 
            // 所以 判断length
        for(let i=0;i<dirString.length;i++){
            if(dirString[i]=='u'){
                queryStrings[i]= JSON.stringify([[targetHanZi],[compoHanZi]]);
            }else if(dirString[i]=='l'){
                queryStrings[i]= JSON.stringify([[targetHanZi,compoHanZi]]);
            }else if(dirString[i]=='b'){
                queryStrings[i]= JSON.stringify([[compoHanZi],[targetHanZi]]);
            }else if(dirString[i]=='r'){
                queryStrings[i]= JSON.stringify([[compoHanZi,targetHanZi]]);
            }
        }
        return queryStrings;
    },
    // getQueryString:
    // // dir 指的是  从 compoHanZi 指向 targetHanZi 的方向
    // //compoHanZi即 从原汉字上 反射出来的汉字
    // //targetHanZi 则是反射目标位置 上的 原来的汉字
    // function (dir,compoHanZi,targetHanZi){
    //     var dirString=this.dir2String(dir);
    //     var queryStrings=[];
    //     // dirStirng 如果 为 对角线方向 那么 就是有两个元素 
    //         // 所以 判断length
    //     for(let i=0;i<dirString.length;i++){
    //         if(dirString[i]=='u'||dirString[i]=='l')
    //         {
    //             queryStrings[i]=this.string2Query[dirString[i]]+targetHanZi+compoHanZi; 
    //         }
    //         else {
    //             queryStrings[i]=this.string2Query[dirString[i]]+compoHanZi+targetHanZi; 
    //         }
            
    //     }
    //     return queryStrings;
    // },
    CheckHanZi:function(hanZi){
        if(hanZi==null)
        return false;
        //TODO 检查 字符的大小，unicode 中的范围
    },
    
    Dir2Query:function(dir){
        return string2Query[this.dir2String(dir)];
    },
    dir2String:function (dir){
        var dirString="";
        switch(dir.x){
            //上
            case -1:
                dirString +='u';
                break;
            //中
            case 0:
                break;
            //下
            case 1:
                dirString +='b';
                break;       
        }
        switch(dir.y){
            //右
            case 1:
                dirString +='r';
                break;
            //正
            case 0:
                break;
            //左
            case -1:
                dirString +='l';
                break;
        }
        return dirString;   
    },
    string2Query:{
        u:'_v',
        b:'_v',
        r:'_h',
        l:'_h',
        ur:'_hv',
        ul:'_hv',
        br:'_hv',
        bl:'_hv',
    },
    
};
