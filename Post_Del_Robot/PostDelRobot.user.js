// ==UserScript==
// @name         Post Del Robot
// @namespace    http://blog.sylingd.com
// @version      5
// @description  ɾ��������
// @author       ShuangYa
// @match        http://tieba.baidu.com/f?*
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @run-at		 document-end
// @require		 http://libs.baidu.com/jquery/1.11.1/jquery.min.js
// @updateURL 	 https://github.com/FirefoxBar/userscript/raw/master/Post_Del_Robot/PostDelRobot.meta.js
// @downloadURL  https://github.com/FirefoxBar/userscript/raw/master/Post_Del_Robot/PostDelRobot.user.js
// ==/UserScript==
(function() {
	//�����б�
	var tielist = [],
	meinput = '',
	/*
	 * ���һЩ���нű��ı�Ҫ����
	 * @return boolean
	*/
	checkMe = function() {
		//����Ƿ��������б�ҳ
		if (typeof(unsafeWindow.PageData) === 'undefined') {
			alert('PageDataδ���壬�ű��޷�����');
			return false;
		}
		//����Ƿ�Ϊ����ͨ���Ҳࡰ��������̨���İ�ť���
		if ($('.tbAdminManage').length <= 0) {
			alert('�����Ǳ��ɰ���');
			return false;
		}
		return true;
	},
	/*
	 * ��ӵ�ɾ���б�
	 * @param string text �������ҳ��HTML
	 * @return boolean
	*/
	addToList = function(text) {
		//¥��¥����
		//��������
		var reply = text.match(/\/p\/(\d+)\?pid=(\d+)/gi);
		if (reply === null) reply = [];
		//�滻��ƥ�����ݣ������ظ�ƥ��
		text = text.replace(/\/p\/(\d+)\?pid=(\d+)/gi, '');
		var leng = reply.length - 1,
		i, one;
		for (i = 0; i <= leng; i++) {
			one = reply[i].match(/\/p\/(\d+)\?pid=(\d+)/i);
			tielist.push({
				"type": 1,
				"tid": one[1],
				"pid": one[2]
			});
		}
		//���ⲿ��
		var post = text.match(/\/p\/(\d+)/gi);
		if (post === null) post = [];
		leng = post.length - 1;
		for (i = 0; i <= leng; i++) {
			one = post[i].match(/\/p\/(\d+)/i);
			tielist.push({
				"type": 2,
				"tid": one[1]
			});
		}
		//�����Ƿ����ץȡ��һҳ
		return (reply.length > 0 || post.length > 0);
	},
	/*
	 * ͨ���û�ID����ɾ��
	 * @param string user �û�ID
	 * @param int page ҳ��
	*/
	delByUser = function(user, page) {
		logResult('���ڻ�ȡ�����б���' + page + 'ҳ��');
		GM_xmlhttpRequest({
			"method": 'GET',
			"url": 'http://tieba.baidu.com/f/search/ures?kw=' + unsafeWindow.PageData.forum.name_url + '&qw=&rn=10&un=' + encodeURIComponent(user) + '&sm=1&pn=' + page,
			"onload": function(response) {
				//ƥ��������������������
				var result = response.responseText;
				if (addToList(result) && page < 5) { //��ֹ��Ϊ����������ɵĿ���
					delByUser(user, page + 1); //�Ե��ã�������ȡ
				} else { //��ȡ��ϣ���ʼɾ��
					logResult('��ȡ�����б���ɣ�');
					if (tielist.length > 0) {
						delByList(0);
					} else {
						logResult('û���κ����ӣ�');
						Stop();
					}
				}
			}
		});
	},
	/*
	 * ͨ���ؼ��ֽ���ɾ��
	 * @param string keyword �ؼ���
	 * @param int page ҳ��
	*/
	delByKeyword = function(keyword, page) {
		logResult('���ڻ�ȡ�����б���' + page + 'ҳ��');
		GM_xmlhttpRequest({
			"method": 'GET',
			"url": 'http://tieba.baidu.com/f/search/res?kw=' + unsafeWindow.PageData.forum.name_url + '&qw=' + encodeURIComponent(keyword) + '&rn=10&un=&sm=1&pn=' + page,
			"onload": function(response) {
				//ƥ��������������������
				var result = response.responseText;
				if (addToList(result) && page < 5) { //��ֹ��Ϊ����������ɵĿ���
					delByKeyword(keyword, page + 1); //�Ե��ã�������ȡ
				} else { //��ȡ��ϣ���ʼɾ��
					logResult('��ȡ�����б���ɣ�');
					if (tielist.length > 0) {
						delByList(0);
					} else {
						logResult('û���κ����ӣ�');
						Stop();
					}
				}
			}
		});
	},
	/*
	 * ���ѽ������б�ɾ��
	 * @param int num ��Ӧ�б��е�Key
	*/
	delByList = function(num) {
		var fid = unsafeWindow.PageData.forum.forum_id,
		kw = unsafeWindow.PageData.forum.name,
		leng = tielist.length - 1,
		me = tielist[num],
		postdata = {
			"commit_fr": "pb",
			"ie": "utf-8",
			"kw": kw,
			"fid": fid,
			"tid": me.tid,
			"tbs": unsafeWindow.PageData.tbs
		}
		if (me.type == 1) { //����
			postdata.pid = me.pid;
		} else if (me.type == 2) { //����
		} else if (me.type == 3) { //¥��¥
		}
		//GM��ajax��֪��Ϊʲô�����ã�����jQuery�İ�
		$.ajax({
			"type": 'POST',
			"data": postdata,
			"url": '/f/commit/post/delete',
			"success": function(response) {
				// ȷ��ɾ�����
				result = eval('(' + response + ')');
				if (result.err_code == 0) {
					logResult('ɾ�����ӳɹ�������ID��' + me.tid);
					if (num != leng) { //��������
						delByList(num + 1);
					}
				} else {
					console.log(postdata);
					console.log(result);
					logResult('ɾ������ʧ�ܣ�����ID��' + me.tid);
					if (result.err_code == '224011') {
						logResult('������֤�룬ֹͣɾ��������취��ˢ�µ�ǰ��ҳ��');
						GM_setClipboard(meinput);
						logResult('��ʾ�������û�ID/�ؼ����Ѿ����Ƶ�������');
						Stop();
						$('#sy_del_reload').show();
					} else {
						if (num != leng) { //��������
							delByList(num + 1);
						} else {
							Stop();
						}
					}
				}

			}
		});
	},
	/*
	 * ��¼���
	 * @param string info ��Ϣ
	*/
	logResult = function(info) {
		var e = $('#sy_del_info');
		e.append('<p>' + info + '</p>');
	},
	/*
	 * ��������
	*/
	Stop = function() {
		var btn = $('#sy_del_close');
		btn.bind('click',
		function() {
			$('#sy_del_dialog').hide();
			$('#sy_del_full').hide();
		});
		btn.find('em').html('�ر�');
		tielist = [];
		logResult('�ѽ�������');
	},
	/*
	 * ��ʼ����
	 * @param int type ���ͣ�1Ϊ���û�ID
	*/
	Start = function(type) {
		var input;
		if (!checkMe()) return;
		//��ʾ�����
		if (type == 1) input = window.prompt('�������û�ID');
		else if (type == 2) input = window.prompt('������ؼ��ʣ���֧��ͨ�����������ʽ��');
		else return;
		if (input) {
			//����
			$('#sy_del_close').unbind('click');
			$('#sy_del_close').find('em').html('���Ժ�');
			$('#sy_del_reload').hide();
			$('#sy_del_dialog').show();
			$('#sy_del_full').show();
			meinput = input;
			if (type == 1) delByUser(input, 1);
			else if (type == 2) delByKeyword(input, 1);
			else return;
		}
	},
	Start_user = function() {
		Start(1);
	},
	Start_keyword = function() {
		Start(2);
	};
	//ע��˵�
	if (window.location.href.match(/f\?(.*?)kw=/) !== null) { //ȷ�����������б�ҳ
		GM_addStyle('#sy_del_full{position:fixed;background:rgba(0,0,0,0.6);width:100%;height:100%;top:0;left:0;color:white;z-index:99998;}#sy_del_dialog{position:fixed;z-index:99999;width:460px;height:400px;top:10px;left:50%;margin-left:-200px;}#sy_del_info{height:295px;padding:10px;}');
		$('body').append('<div id="sy_del_full"></div><div id="sy_del_dialog" class="dialogJ dialogJfix dialogJshadow ui-draggable m_dialog"><div class="uiDialogWrapper"><div style="-moz-user-select: none;" class="dialogJtitle"><span class="dialogJtxt">ɾ��������</span></div><div class="dialogJcontent"><div class="dialogJbody"><div id="sy_del_info"></div><div class="m_dialog_container j_m_dialog_container"><div class="m_button_panel clearfix"><a id="sy_del_close" class="ui_btn ui_btn_sub_m j_m_btn_cancel m_btn_cancel"><span><em>�ر�</em></span></a><a id="sy_del_reload" class="ui_btn ui_btn_m j_m_btn_insert m_btn_insert" onclick="window.location.reload();"><span><em>����ˢ��</em></span></a></div></div></div></div></div></div>');
		$('#sy_del_dialog').hide();
		$('#sy_del_full').hide();
		GM_registerMenuCommand('����ɾ�������û�ID��', Start_user);
		GM_registerMenuCommand('����ɾ�������ؼ��ʣ�', Start_keyword);
	}
})();