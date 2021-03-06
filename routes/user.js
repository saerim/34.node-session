const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { connect } = require('../modules/mysql');
const { alert } = require('../modules/util');

router.get('/signup', (req, res) => {
	let pugVals = {name: 'signup', user: req.session.user ? req.session.user : null};
	res.render('signup.pug', pugVals);
});

router.post('/join', async(req, res, next) => {
	let {userid, userpw, username, email } = req.body; 
	let sql, sqls, result, pugs; 
	sql = "INSERT INTO member SET userid=?, userpw=?, username=?, email=?"
/* 	userpw = crypto.createHash(sha512).update(userpw + process.env.passSalt).digest('base64'); */
	userpw = await bcrypt.hash(userpw + process.env.passSalt, 8)
	sqls = [userid, userpw, username, email]
	result = await connect.execute(sql, sqls);
	res.send(alert("회원가입이 정상처리되었습니다.", "/"));
})

router.post('/idchk', async(req, res) => {
	const userid = req.body.userid; 
	const sql = "SELECT userid FROM member WHERE userid=?"; //member테이블로부터 userid를 찾아옴
	const result = await connect.execute(sql, [userid]); //입력받은 userid를 받음 
	res.json(result[0]);
});

router.post("/login", async (req, res, next) => {
	let {userid, userpw} = req.body;
	let sql, sqls = [], result, compare = false;
	sql = "SELECT * FROM member WHERE userid=?"; 
	result = await connect.execute(sql, [userid]);
	if(result[0].length > 0) {
		compare = await bcrypt.compare(userpw + process.env.passSalt, result[0][0].userpw);
		if(compare) {
			req.session.user = {};
			req.session.user.id = result[0][0].id; 
			req.session.user.userid = result[0][0].userid; 
			req.session.user.username = result[0][0].username; 
			req.session.user.email = result[0][0].email;
			res.redirect("/");
		}
		else {
			res.send(alert("아이디 혹은 패스워드가 올바르지 않습니다.", "/"));
		}
	}
	else {
		res.send(alert("아이디 혹은 패스워드가 올바르지 않습니다.", "/"));
	}
});

router.get("/signout", (req, res, next) => {
	req.session.destroy();
	res.redirect("/");
});



module.exports = router; 
