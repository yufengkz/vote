//把方法封装在此对象里
//取首页数据的偏移量
let offset = 0;
let limit = 10;
let total = 0;
//当前浏览器URL中的路径
let url = window.location.href;
let indexReg = /\/vote\/index/;//首页的正则
let registerReg = /\/vote\/register/;//注册页报名页的正则
let detailReg = /\/vote\/detail/;//注册页报名页的正则
const USER_KEY = 'user';
let voteFn = {
    //把用户数组转成li字符串
    formatUsers(users){
        //把对象数组转成li数组
        return users.map(user => (
            `
                    <li>        
                        <div class="head">
                           <a href="/vote/detail/${user.id}">
                              <img src="${user.head_icon}" alt="">
                           </a>
                        </div>
                        <div class="up">
                           <div class="vote">
                              <span>${user.vote}票</span>
                           </div>
                           <div data-id="${user.id}" class="btn">
                              投TA一票
                           </div>
                        </div>
                        <div class="descr">
                           <a href="/vote/detail/${user.id}">
                             <div>
                                <span>${user.username}</span>
                                <span>|</span>
                                <span>编号#${user.id}</span>
                              </div>
                              <p>${user.description}</p>
                           </a>
                        </div>     
                    </li>
                `
        )).join('');//最后拼接成一个大的字符串
    },

    //个人详情页
    formatUser(user){
        return `<div class="pl">
					<div class="head">
						<img src="${user.head_icon}" alt="">
					</div>
					<div class="p_descr">
						<p>${user.username}</p>
						<p>编号#${user.id}</p>
					</div>
				</div>
				<div class="pr">
					<div class="p_descr pr_descr">
						<p>${user.rank}名</p>
						<p>${user.vote}票</p>
					</div>
				</div>
				<div class="motto">
					谁能比我美？谁能比我美？
				</div>`
    },

    //个人详情list
    formatList(users){
        return users.map(function (user) {
            console.log(user)
             `<li>
				    <div class="head">
				        <a href="#"><img src="${user.head_icon}" alt=""></a>
				    </div>
				    <div class="up">
				    	<div class="vote">
				    		<span>投了一票</span>
				    	</div>
				    </div>
				    <div class="descr">
				        <h3>${user.username}</h3>
				        <p>编号#${user.vote}</p>
				    </div>
				</li>	`
        }).join('')
    },

    //向服务器发起ajax请求
    request({url, type = 'GET', data = {}, dataType = 'json', success}){
        $.ajax({url, type, data, dataType, success})
    },
    //初始化首页数据
    initIndexData(){
        //向服务器发起请求首页的用户列表
        voteFn.request({
            url: `/vote/index/data?limit=${limit}&offset=${offset}`,
            success(result){
                //最新的偏移量应该加等于limit
                offset += limit;
                //总条数
                total = result.data.total;
                let users = result.data.objects;
                let html = voteFn.formatUsers(users);
                $('.coming').html(html);
            }
        });
        loadMore({
            //当拉到底部的时候会执行callback
            callback: function (load) {
                if (offset >= total) {
                    load.complete();
                    /*延时是为了更好的演示效果*/
                    setTimeout(function () {
                        load.reset();
                    }, 1000)
                } else {//如果偏移量小于最大条数，则需要继续加载
                    voteFn.request({
                        url: `/vote/index/data?limit=${limit}&offset=${offset}`,
                        success(result){
                            //最新的偏移量应该加等于limit
                            offset += limit;
                            let users = result.data.objects;
                            let html = voteFn.formatUsers(users);
                            setTimeout(function () {
                                $('.coming').append(html);
                                load.reset();
                            }, 1000)
                        }
                    });
                }
            }
        });
        let user = voteFn.getStorage(USER_KEY);
        user = JSON.parse(user);
        if(user){
            $('.register a').text('个人主页');
            $('.username').text(user.username);
            $('.no_signed').hide();
            $('.register a').attr('href','/vote/detail/'+user.id);
        }
        // 退出登录
        $('.dropout').click(function(){
            voteFn.clearStorage(USER_KEY);
            location.reload();
        });
        $('.mask').click(function(event){
            if(event.target.className == 'mask')
                $(this).hide();
        });
        $('.sign_in').click(function () {
            $('.mask').show();
        });
        $('.subbtn').click(function(){
            let id = $('input[name=username]').val();
            let password = $('input[name=password]').val();
            if(!id || !password){
                alert('用户名或密码不能为空');
                return;
            }
            voteFn.request({
                url:'/vote/index/info',
                type:'POST',
                data:{id,password},
                success(result){
                    if(result.errno==0){
                        alert(result.msg)
                        voteFn.setStorage(USER_KEY,JSON.stringify(result.user));
                        location.reload();
                    }else{
                        alert(result.msg);
                    }
                }
            })
        });
        //投票
        $('.coming').on('click', '.btn', function () {
            var vote = $(this).siblings('.vote').children('span')
            var user = JSON.parse(voteFn.getStorage('user'))
            if(user){
                var voteId = user.id
                var  id= $(this).attr('data-id')
                voteFn.request({
                    url: `/vote/index/poll?id=${id}&voterId=${voteId}`,
                    success: function (res) {
                        if(res.errno == 0){
                            alert(res.msg);
                            vote.html(parseInt(vote.text()) + 1 + '票')
                        }else{
                            alert(res.msg)
                        }
                    }
                })
            }else{
                $('.mask').show()
            }
        })

    },
    setStorage(key,value){
        localStorage.setItem(key,value);
    },
    getStorage(key){
        return localStorage.getItem(key);
    },
    getUser(){
        return voteFn.getStorage('USER_KEY') ? JSON.parse(voteFn.getStorage('USER_KEY')) : null
    },
    clearStorage(key){
        localStorage.removeItem(key);
    },
    //初始化报名页
    initRegister(){
        $('.rebtn').click(function () {
            let username = $('input[name=username]').val();
            if(!username){
                alert('用户名不能为空');
                return;
            }
            let initial_password = $('input[name=password]').val();
            let confirm_password = $('input[name=password]').val();
            if(!initial_password || !confirm_password || initial_password!=confirm_password|| !/^[0-9a-zA-Z]{1,10}$/.test(initial_password)){
                alert('密码不合法');
                return;
            }
            let mobile = $('input[name=mobile]').val();
            if(!mobile || !/^1\d{10}$/.test(mobile)){
                alert('手机号不正确');
                return;
            }
            let description = $('input[name=description]').val();
            if(!description || description.length>20){
                alert('自我描述不正确');
                return;
            }
            let gender = $('input[name="gender"]:checked').val();
            let user = {username,
                password:initial_password,
                mobile,
                description,
                gender
            }
            voteFn.request({
                url:'/vote/register/data',
                type:'POST',
                data:user,
                success(result){
                    if(result.errno == 0){
                        alert(result.msg);
                        user.id = result.id;
                        voteFn.setStorage(USER_KEY,JSON.stringify(user));
                        location = '/vote/index';
                    }
                }
            })
        });
    },

    //初始化首页
    initDetail(){
        let reg = /\/vote\/detail\/(\d+)/
        let result = url.match(reg)
        let id = result[1]
        voteFn.request({
            url: `/vote/all/detail/data?id=${id}`,
            success: function (res) {
                $('.personal').html(voteFn.formatUser(res.data))
                $('.coming').html(voteFn.formatUser(res.data.vfriend))
            }
        })
    }
}
$(function () {
    //如果是首页
    if(indexReg.test(url)){
        voteFn.initIndexData();
        //则当前是报名页
    }else if(registerReg.test(url)){
        voteFn.initRegister();
    }else if(detailReg.test(url)){
        console.log('xx');
        voteFn.initDetail()
    }
})